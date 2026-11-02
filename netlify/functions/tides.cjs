const SOURCE='https://www.khoa.go.kr/swtc/main.do';
function parseTides(data,today){
 const raw=data.weeklyData||data.getWeeklyData?.weeklyData;
 if(!Array.isArray(raw))throw Error('조석 응답 형식 오류');
 const days=raw.filter(x=>x.flgView==='Y'&&x.obsPostName==='보령'&&/^\d{4}-\d{2}-\d{2}$/.test(x.searchDate)).map(x=>({date:x.searchDate,mool:x.mool7||'미확인',events:[1,2,3,4].map(i=>{const [time,type,,height]=String(x['lvl'+i]||'').split('/');return {time,type,height:Number(height)}}).filter(e=>/^\d{2}:\d{2}$/.test(e.time)&&['high','low'].includes(e.type)&&Number.isFinite(e.height))}));
 if(!days.some(x=>x.date===today&&x.events.length))throw Error('오늘 조석 자료 없음');
 return {status:'ok',station:'보령',stationId:'DT_0025',days,source:SOURCE,retrievedAt:new Date().toISOString()};
}
exports.parseTides=parseTides;
exports.handler=async()=>{
 let body;
 try{
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
 const r=await fetch('https://www.khoa.go.kr/swtc/getWeeklyData.do',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams({stDate:today.replaceAll('-',''),obsPostId:'DT_0025'}),signal:AbortSignal.timeout(18000)});
 if(!r.ok)throw Error('조석 원본 응답 오류');body=parseTides(await r.json(),today);
 }catch{body={status:'error',source:SOURCE,message:'조석 자동 조회 실패 · 공식 조석예보에서 보령 또는 대천항 인근 지점을 확인하세요.'};}
 return {statusCode:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(body)};
};
