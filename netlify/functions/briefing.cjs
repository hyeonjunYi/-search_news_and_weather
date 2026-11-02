const WEATHER='https://api.open-meteo.com/v1/forecast?latitude=36.274&longitude=127.249&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&wind_speed_unit=ms&timezone=Asia%2FSeoul&forecast_days=2';
const WARN='https://www.weather.go.kr/w/wnuri-fct2021/weather/warning.do';
const OFFICIAL='https://www.weather.go.kr/w/special-report/overall.do';
function text(s){return s.replace(/<!--[\s\S]*?-->/g,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim()}
function parseWarnings(html){
 const table=html.match(/<table\b[^>]*id=["']current-warnings["'][^>]*>([\s\S]*?)<\/table>/i);
 if(!table)throw Error('기상청 현황 표 형식 확인 불가');
 const rows=[...table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>[...m[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(v=>text(v[1]))).filter(r=>r.length>=5);
 if(!rows.length&&!/없|발효.*않/.test(text(table[1])))throw Error('특보 표 내용 확인 불가');
 const related=rows.filter(r=>/계룡|충청남도|충남/.test(r[2])).map(r=>({kind:r[0],level:r[1],area:r[2],announced:r[3],effective:r[4],end:r[5]||'',match:r[2].includes('계룡')?'계룡 명칭 포함':'충남 관련 · 계룡 포함 여부 확인'}));
 return {status:'ok',items:related,nationalCount:rows.length,source:OFFICIAL,notice:'현재 특보 표의 계룡·충남 명칭으로 선별한 항목입니다. 제외지역·발효 예정·예비특보는 기상청 원문에서 확인하세요.'};
}
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'Gyeryong-Weather-Briefing/1.0'}});if(!r.ok)throw Error('원본 응답 '+r.status);return r}
exports.handler=async()=>{
 const [w,a]=await Promise.allSettled([get(WEATHER).then(r=>r.json()).then(d=>{if(!d.current||!d.daily||!d.hourly)throw Error('날씨 응답 형식 오류');return d}),get(WARN).then(r=>r.text()).then(parseWarnings)]);
 const body={retrievedAt:new Date().toISOString(),location:{name:'계룡시',latitude:36.274,longitude:127.249},weather:w.status==='fulfilled'?{status:'ok',data:w.value}:{status:'error',message:'날씨를 가져오지 못했습니다. 다시 조회해 주세요.'},warnings:a.status==='fulfilled'?a.value:{status:'error',items:[],source:OFFICIAL,message:'특보 자동 조회 실패 · 특보 없음으로 판단할 수 없습니다.'}};
 return {statusCode:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(body)};
};
exports.parseWarnings=parseWarnings;
