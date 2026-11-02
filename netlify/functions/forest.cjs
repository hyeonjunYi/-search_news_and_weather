const SOURCE='https://www.forest.go.kr/kfsweb/kfs/idx/Index.do?mainType=01&mn=NKFS_01';
const clean=s=>s.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
function parseForest(html){
 const table=[...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].map(m=>m[1]).find(t=>/발령일시/.test(clean(t))&&/경보단계/.test(clean(t))&&/발령지역/.test(clean(t)));
 if(!table)throw Error('산불위기경보 발령표 확인 불가');
 const rows=[...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>[...m[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>clean(x[1]))).filter(r=>r.length>=3);
 const items=rows.filter(r=>/\d{4}[.\-/년]/.test(r[0])&&/^(관심|주의|경계|심각)$/.test(r[1])&&r[2]).map(r=>({announced:r[0],stage:r[1],area:r[2]}));
 if(!items.length)throw Error('발령일시가 있는 공식 경보 자료 확인 불가');
 return {status:'ok',items,source:SOURCE,retrievedAt:new Date().toISOString()};
}
exports.parseForest=parseForest;
exports.handler=async()=>{let data;try{const r=await fetch(SOURCE,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error();data=parseForest(await r.text())}catch{data={status:'error',source:SOURCE,retrievedAt:new Date().toISOString(),message:'공식 산불위기경보 자동 확인 불가'}}return {statusCode:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(data)}};
