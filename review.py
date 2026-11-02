"""Approve a manually checked report, then rebuild public/."""
import argparse,json
from watch import ROOT,now,render
p=argparse.ArgumentParser();p.add_argument('id');p.add_argument('--editor',required=True);p.add_argument('--fields',required=True,help='검토한 항목 JSON 파일');a=p.parse_args()
path=ROOT/'data/records.json';records=json.loads(path.read_text());r=records[a.id]
if r.get('demo'):raise SystemExit('가상 예시 기사는 승인할 수 없습니다.')
fields=json.loads(open(a.fields,encoding='utf-8').read())
if not fields.get('title') or not fields.get('location'):raise SystemExit('검토한 title과 location은 필수입니다.')
r['verified']=fields;r['review_status']='approved';r['reviewed_by']=a.editor;r['reviewed_at']=now().isoformat(timespec='seconds')
path.write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8');render(records,ROOT/'preview');render(records,ROOT/'public',True)
print('승인본 생성 완료: public/')
