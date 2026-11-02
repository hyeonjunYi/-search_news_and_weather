const SOURCE='https://www.forest.go.kr/kfsweb/kfs/idx/Index.do?mainType=01&mn=NKFS_01';
const DATA='https://www.forest.go.kr/kfsweb/kfi/dummy/dmmyAjax.do?type=fdms_issue&intv=30';
function parseForest(data){
 const levels=['','관심','주의','경계','심각'];
 if(!data||!Number.isInteger(data.level_F)||!levels[data.level_F]||data.phase_F!==levels[data.level_F]||!Array.isArray(data.list_F))throw Error('산불경보 데이터 형식 확인 불가');
 const items=data.list_F.map(x=>{if(!x||!levels.includes(x.phase)||!x.phase||typeof x.dstrt!=='string'||!x.dstrt.trim()||typeof x.dtm!=='string'||!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(x.dtm))throw Error('산불 발령 항목 오류');return {announced:x.dtm+' KST',stage:x.phase,area:x.dstrt}});
 if(!items.length)throw Error('발령 항목 없음 · 확인 필요');
 return {status:'ok',stage:data.phase_F,items,source:SOURCE,dataSource:DATA,retrievedAt:new Date().toISOString()};
}
exports.parseForest=parseForest;
exports.handler=async()=>{let data;try{const r=await fetch(DATA,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(20000),cache:'no-store'});if(!r.ok)throw Error();data=parseForest(await r.json())}catch{data={status:'error',source:SOURCE,retrievedAt:new Date().toISOString(),message:'공식 산불위기경보 자동 확인 불가'}}return {statusCode:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(data)}};
