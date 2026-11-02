"""Python 3.11+, standard library only. News metadata -> review drafts."""
import argparse, datetime as dt, hashlib, html, json, os, re, sys
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen
ROOT=Path(__file__).resolve().parent
KST=dt.timezone(dt.timedelta(hours=9))
def now(): return dt.datetime.now(KST)
def clean(s): return html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()
def safe_url(s):
 p=urlsplit(s or '')
 return urlunsplit((p.scheme,p.netloc,p.path,p.query,'')) if p.scheme in ('http','https') and p.netloc else ''
def candidate(title,description):
 text=title+' '+description
 if not re.search('화재|불이|불로|불길',text): return False
 if re.search('추모|주기|재판|선고|징역|기소|과거|훈련|가상|예방|캠페인',title): return False
 fatal=bool(re.search(r'(?:[1-9]\d*\s*명(?:이|이상|가량|이나)?\s*(?:사망|숨)|(?:사망자?|숨진)[^。.!?]{0,12}[1-9]\d*\s*명)',text))
 # Avoid treating 'no deaths' alone as a fatal fire.
 return fatal or bool(re.search(r'대응\s*[23이삼]\s*단계',text))
def fetch(config):
 cid=os.environ.get('NAVER_CLIENT_ID');secret=os.environ.get('NAVER_CLIENT_SECRET')
 if not cid or not secret: raise RuntimeError('GitHub Secrets에 NAVER_CLIENT_ID / NAVER_CLIENT_SECRET을 등록하세요.')
 items=[]
 for q in config['queries']:
  url='https://openapi.naver.com/v1/search/news.json?'+urlencode({'query':q,'display':config['display'],'sort':'date'})
  req=Request(url,headers={'X-Naver-Client-Id':cid,'X-Naver-Client-Secret':secret})
  with urlopen(req,timeout=30) as r: items.extend(json.load(r).get('items',[]))
 return items
CSS='''*{box-sizing:border-box}body{font:16px/1.65 system-ui,"Malgun Gothic",sans-serif;color:#1d1d1f;background:#f5f5f7;margin:0}header{background:#000;color:white;padding:18px 24px}main{max-width:1000px;margin:40px auto;padding:0 22px}h1{font-size:32px;line-height:1.3}h2{font-size:21px}a{color:#0066cc}article,.sheet{background:white;border:1px solid #ddd;border-radius:18px;padding:28px;margin:20px 0}.badge{color:#0066cc;font-size:13px;font-weight:600}small,.muted{color:#6e6e73}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;text-align:left;padding:10px;vertical-align:top}th{width:140px}button{background:#0066cc;color:white;border:0;border-radius:999px;padding:10px 20px;cursor:pointer}.notice{background:#eef5fc;padding:16px;border-radius:12px}footer{font-size:12px;color:#6e6e73;margin-top:24px}@media print{body{background:white}header,button,.back{display:none}.sheet{border:0;padding:0;margin:0}main{margin:0;padding:0}h1{font-size:24px}article{break-inside:avoid}@page{size:A4;margin:16mm}}'''
def page(title,content):
 return '<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(title)+'</title><style>'+CSS+'</style><header>계룡소방서 현장대응단 · 화재 뉴스 브리핑</header><main>'+content+'</main></html>'
def render(records,dest,approved_only=False):
 dest.mkdir(parents=True,exist_ok=True)
 reports=dest/'reports';reports.mkdir(exist_ok=True)
 for f in reports.glob('*.html'):f.unlink()
 cards=[]
 for r in sorted(records.values(),key=lambda r:r['published_at'],reverse=True):
  if approved_only and r.get('review_status')!='approved':continue
  e=lambda v:html.escape(str(v))
  approved=r.get('review_status')=='approved';label='담당자 검토본' if approved else '자동 생성 초안 · 담당자 확인 전'
  fields=r.get('verified',{})
  rows=''.join('<tr><th>'+name+'</th><td>'+e(fields.get(key) or '미확인 · 기사 원문 확인 필요')+'</td></tr>' for key,name in [('occurred_at','발생일시'),('location','발생장소'),('casualties','인명피해'),('response','소방 대응'),('cause','화재원인'),('support','우리 서 지원')])
  title=fields.get('title') or r['title']
  content='<a class="back" href="../index.html">← 목록</a><div class="sheet"><span class="badge">'+label+'</span><h1>'+e(title)+'</h1><p class="muted">기사 제공시각 '+e(r['published_at'])+'</p><table>'+rows+'</table><h2>수집 기사</h2><p>'+e(r['title'])+'</p><p><a href="'+e(r['url'])+'" target="_blank" rel="noopener">기사 원문 확인 ↗</a></p><p class="notice">검색 결과의 제목·제공시각·원문 링크를 수집한 자료입니다. 기사 본문을 읽거나 서로 다른 기사 정보를 검증한 결과가 아닙니다. 사진·사망자 개인정보는 자동 수집하지 않습니다.</p><footer>최초 수집 '+e(r['collected_at'])+' / 최근 확인 '+e(r['last_seen'])+(' / 검토 '+e(r.get('reviewed_by',''))+' '+e(r.get('reviewed_at','')) if approved else '')+'</footer></div><button onclick="window.print()">인쇄 / PDF</button>'
  (reports/(r['id']+'.html')).write_text(page(title,content),encoding='utf-8')
  cards.append('<article><span class="badge">'+label+'</span><h2><a href="reports/'+r['id']+'.html">'+e(title)+'</a></h2><small>'+e(r['published_at'])+' · '+e(urlsplit(r['url']).hostname or '')+' · ID '+r['id']+'</small></article>')
 intro='<h1>대형·인명피해 화재 뉴스</h1><p>계룡소방서 현장대응단 · '+('승인된 보고서만 표시' if approved_only else '담당자 검토 대기 목록')+'</p><p class="notice">자동 선별에는 누락·오탐이 있습니다. 기사별 초안이 생성되며 같은 사건의 다른 기사는 담당자가 대조해야 합니다.</p>'
 (dest/'index.html').write_text(page('화재 뉴스 보고서',intro+(''.join(cards) or '<article>표시할 보고서가 없습니다.</article>')),encoding='utf-8')
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--demo',action='store_true');ap.add_argument('--build-only',action='store_true');args=ap.parse_args()
 cfg=json.loads((ROOT/'config.json').read_text());path=ROOT/'data/records.json'
 records=json.loads(path.read_text()) if path.exists() else {}
 if not args.build_only:
  items=[{'title':'[가상 예시] 예시시 창고 화재 1명 사망','description':'','originallink':'https://example.com/fire-demo','pubDate':now().strftime('%a, %d %b %Y %H:%M:%S %z')}] if args.demo else fetch(cfg)
  stamp=now().isoformat(timespec='seconds')
  for it in items:
   title=clean(it.get('title'));description=clean(it.get('description'))
   try:published=parsedate_to_datetime(it['pubDate']).astimezone(KST)
   except (ValueError,KeyError,TypeError):continue
   age=now()-published
   if age<dt.timedelta(minutes=-10) or age>dt.timedelta(hours=cfg['lookback_hours']):continue
   if not args.demo and not candidate(title,description):continue
   url=safe_url(it.get('originallink')) or safe_url(it.get('link'))
   if not url:continue
   rid=hashlib.sha256(url.encode()).hexdigest()[:16]
   if rid in records:
    r=records[rid]
    if r['title']!=title:
     r.setdefault('history',[]).append({'title':r['title'],'at':stamp});r['title']=title;r['review_status']='pending'
    r['last_seen']=stamp
   else:records[rid]={'id':rid,'title':title,'url':url,'published_at':published.isoformat(timespec='seconds'),'collected_at':stamp,'last_seen':stamp,'review_status':'pending','verified':{},'demo':args.demo}
  path.parent.mkdir(exist_ok=True);path.write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
 render(records,ROOT/'preview');render(records,ROOT/'public',True)
 print(f'생성 완료: {len(records)} articles; preview/ = drafts, public/ = approved only')
if __name__=='__main__':
 try:main()
 except Exception as e:print(f'실행 실패: {type(e).__name__}: {e}',file=sys.stderr);sys.exit(1)
