const $=id=>document.getElementById(id),fmt=t=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'medium',timeStyle:'short'}).format(new Date(t)),num=(n,u='')=>typeof n==='number'&&Number.isFinite(n)?n.toFixed(1)+u:'미확인',escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=c=>({0:'맑음',1:'대체로 맑음',2:'구름 조금',3:'흐림',45:'안개',48:'착빙 안개',51:'약한 이슬비',53:'이슬비',55:'강한 이슬비',56:'어는 이슬비',57:'어는 이슬비',61:'약한 비',63:'비',65:'강한 비',66:'어는 비',67:'어는 비',71:'약한 눈',73:'눈',75:'강한 눈',77:'싸락눈',80:'약한 소나기',81:'소나기',82:'강한 소나기',85:'눈 소나기',86:'강한 눈 소나기',95:'뇌우',96:'우박 동반 뇌우',99:'강한 우박 동반 뇌우'}[c]||'상태 미확인');
let warningData=null, selectedRegion='계룡시';
const regions={
 '계룡시':['계룡','충청남도','충남'],
 '서울특별시':['서울'], '부산광역시':['부산'], '대구광역시':['대구','군위'], '인천광역시':['인천','강화','옹진'], '광주광역시':['광주광역시','광주'], '대전광역시':['대전'], '울산광역시':['울산'], '세종특별자치시':['세종'],
 '경기도':['경기','수원','성남','의정부','안양','부천','광명','평택','동두천','안산','고양','과천','구리','남양주','오산','시흥','군포','의왕','하남','용인','파주','이천','안성','김포','화성','광주시','양주','포천','여주','연천','가평','양평'],
 '강원특별자치도':['강원','춘천','원주','강릉','동해','태백','속초','삼척','홍천','횡성','영월','평창','정선','철원','화천','양구','인제','고성','양양'],
 '충청북도':['충청북도','충북','청주','충주','제천','보은','옥천','영동','증평','진천','괴산','음성','단양'],
 '충청남도':['충청남도','충남','천안','공주','보령','아산','서산','논산','계룡','당진','금산','부여','서천','청양','홍성','예산','태안'],
 '전북특별자치도':['전북','전라북도','전주','군산','익산','정읍','남원','김제','완주','진안','무주','장수','임실','순창','고창','부안'],
 '전라남도':['전남','전라남도','목포','여수','순천','나주','광양','담양','곡성','구례','고흥','보성','화순','장흥','강진','해남','영암','무안','함평','영광','장성','완도','진도','신안'],
 '경상북도':['경북','경상북도','포항','경주','김천','안동','구미','영주','영천','상주','문경','경산','의성','청송','영양','영덕','청도','고령','성주','칠곡','예천','봉화','울진','울릉','독도'],
 '경상남도':['경남','경상남도','창원','진주','통영','사천','김해','밀양','거제','양산','의령','함안','창녕','고성','남해','하동','산청','함양','거창','합천'],
 '제주특별자치도':['제주','서귀포'], '전국':[]
};
function renderWarnings(){
 $('selectedRegion').textContent=selectedRegion+' 관련 특보';
 document.querySelectorAll('[data-region]').forEach(el=>{const yes=el.dataset.region===selectedRegion;el.setAttribute('aria-pressed',String(yes));el.classList.toggle('selected',yes)});
 $('region').value=selectedRegion;
 if(!warningData){$('warnings').textContent='특보 조회 중 · 유무 미확인';return}
 if(warningData.status!=='ok'){$('warnings').innerHTML='<p class="error">특보 자동 조회 실패 · 특보 유무 미확인</p>';return}
 const items=selectedRegion==='전국'?warningData.items:warningData.items.filter(x=>/전국/.test(x.area)||regions[selectedRegion].some(n=>x.area.includes(n)));
 $('warnings').innerHTML='<p class="fine">관련 후보 '+items.length+'건 / 전국 표 '+warningData.items.length+'건</p>'+(items.length?items.map(x=>'<article class="warning"><h3>'+escape(x.kind+' '+x.level)+'</h3><p>'+escape(x.area)+'</p><p>발표 '+escape(x.announced)+' / 발효 '+escape(x.effective)+'</p>'+(x.end?'<p>'+escape(x.end)+'</p>':'')+'</article>').join(''):'<p>현재 특보 표에서 관련 명칭을 포함한 항목을 찾지 못했습니다. 특보 없음의 확정은 아니며 공식 현황을 확인하세요.</p>');
}
function selectRegion(name){if(!Object.hasOwn(regions,name))return;selectedRegion=name;renderWarnings()}
async function initMap(){
 $('region').innerHTML=Object.keys(regions).map(n=>'<option>'+n+'</option>').join('');$('region').onchange=e=>selectRegion(e.target.value);
 $('scopes').onclick=e=>{if(e.target.dataset.region)selectRegion(e.target.dataset.region)};
 try{const r=await fetch('assets/korea.svg');if(!r.ok)throw Error();$('map').innerHTML=await r.text();$('map').onclick=e=>{const p=e.target.closest('[data-region]');if(p)selectRegion(p.dataset.region)};$('map').onkeydown=e=>{if(['Enter',' '].includes(e.key)&&e.target.dataset.region){e.preventDefault();selectRegion(e.target.dataset.region)}}}catch{$('map').textContent='지도를 불러오지 못했습니다. 아래 지역 선택을 사용하세요.'}renderWarnings();
}
async function loadTides(){
 $('tideRefresh').disabled=true;$('tideStatus').textContent='보령 기준 조석 조회 중…';$('tides').replaceChildren();
 try{const r=await fetch('/.netlify/functions/tides',{cache:'no-store',signal:AbortSignal.timeout(23000)});if(!r.ok)throw Error();const t=await r.json();if(t.status!=='ok')throw Error();
 const events=(day,type)=>day.events.filter(e=>e.type===type).map(e=>escape(e.time)+' / '+escape(e.height)+'cm').join('<br>')||'해당일 예보 없음';
 $('tides').innerHTML=t.days.map(d=>'<tr><td>'+escape(d.date)+'</td><td>'+escape(d.mool)+'</td><td>'+events(d,'high')+'</td><td>'+events(d,'low')+'</td></tr>').join('');$('tideStatus').textContent='보령 기준 · '+fmt(t.retrievedAt)+' 조회';
 }catch{$('tideStatus').textContent='조석 자동 조회 실패 · 아래 공식 조석예보 또는 대천항 물때표를 확인하세요.'}finally{$('tideRefresh').disabled=false}
}

$('date').textContent=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'full'}).format(new Date());
async function load(){
 warningData=null;renderWarnings();$('refresh').disabled=true;$('status').textContent='최신 자료 조회 중…';$('warnings').textContent='기상특보 조회 중 · 이전 특보 상태를 사용하지 않습니다.';$('summary').value='조회 중';$('temperature').innerHTML='—<small>℃</small>';$('condition').textContent='조회 중';$('weatherTime').textContent='자료 기준시각 —';$('metrics').replaceChildren();$('hourly').innerHTML='<tr><td colspan="6">조회 중</td></tr>';
 try{const r=await fetch('/.netlify/functions/briefing',{cache:'no-store',signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('서버 응답 오류');const b=await r.json();let lines=['계룡시 기상 상황 (참고용)','조회: '+fmt(b.retrievedAt)];
 if(b.weather.status==='ok'){const d=b.weather.data,c=d.current,k=c.time.slice(0,10),i=d.daily.time.indexOf(k),day=d.daily;const items=[['체감온도',num(c.apparent_temperature,'℃')],['습도',num(c.relative_humidity_2m,'%')],['풍속',num(c.wind_speed_10m,'m/s')],['순간풍속',num(c.wind_gusts_10m,'m/s')],['오늘 최저 / 최고',num(day.temperature_2m_min[i])+' / '+num(day.temperature_2m_max[i])+'℃'],['오늘 예상 강수',num(day.precipitation_sum[i],'mm')]];
 $('temperature').innerHTML=escape(num(c.temperature_2m))+'<small>℃</small>';$('condition').textContent=label(c.weather_code);$('weatherTime').textContent='모델 자료 기준 '+c.time.replace('T',' ')+' KST';$('metrics').innerHTML=items.map(([t,v])=>'<div class="metric"><span>'+t+'</span><strong>'+escape(v)+'</strong></div>').join('');
 const times=d.hourly.time;let rows=[];times.forEach((t,j)=>{if(t.slice(0,10)===k)rows.push('<tr><td>'+escape(t.slice(11))+'</td><td>'+escape(label(d.hourly.weather_code?.[j]))+'</td><td>'+num(d.hourly.temperature_2m[j],'℃')+'</td><td>'+num(d.hourly.precipitation_probability[j],'%')+'</td><td>'+num(d.hourly.precipitation[j],'mm')+'</td><td>'+num(d.hourly.wind_speed_10m[j],'m/s')+'</td></tr>')});$('hourly').innerHTML=rows.join('')||'<tr><td colspan="6">오늘 시간대 자료 없음</td></tr>';lines.push('날씨: '+label(c.weather_code)+', '+num(c.temperature_2m,'℃')+', 습도 '+num(c.relative_humidity_2m,'%')+', 풍속 '+num(c.wind_speed_10m,'m/s'),'날씨 기준: '+c.time+' KST / Open-Meteo 모델 기반');
 }else{$('condition').textContent='날씨 조회 실패';$('hourly').innerHTML='<tr><td colspan="6">날씨 조회 실패</td></tr>';lines.push('날씨: 조회 실패');}
 const a=b.warnings;warningData=a;renderWarnings();lines.push('기상특보 조회: '+(a.status==='ok'?'전국 현재 특보 표 '+a.items.length+'건 수신 · 지역별 탭에서 확인':'조회 실패 · 유무 미확인'));
 lines.push('특보 원문: https://www.weather.go.kr/w/special-report/overall.do');$('summary').value=lines.join('\n');$('status').textContent='조회 '+fmt(b.retrievedAt)+' · '+(b.weather.status==='ok'?'날씨 수신':'날씨 실패')+' / '+(a.status==='ok'?'특보 표 수신':'특보 실패');
 }catch(e){$('status').textContent='자료 조회 실패. Netlify에 전체 파일을 배포했는지 확인하고 다시 시도하세요.';$('warnings').innerHTML='<p class="error">특보 유무 미확인 · 기상청 공식 현황을 확인하세요.</p>';$('condition').textContent='조회 실패';$('hourly').innerHTML='<tr><td colspan="6">날씨 조회 실패</td></tr>';$('summary').value='자료 조회 실패 · 기상특보 유무 미확인';}finally{$('refresh').disabled=false;}
}
$('refresh').onclick=()=>{load();loadTides()};$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('summary').value);$('copy').textContent='복사 완료';setTimeout(()=>$('copy').textContent='요약 복사',1500)}catch{$('summary').focus();$('summary').select();$('status').textContent='요약문을 선택했습니다. Ctrl+C로 복사하세요.'}};initMap();load();loadTides();

$('tideRefresh').onclick=loadTides;
