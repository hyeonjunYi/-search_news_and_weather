# 계룡시 오늘 날씨·기상특보 조회
계룡소방서 현장대응단 업무 참고용. 페이지를 열거나 ‘지금 조회하기’를 누르면 새로 조회합니다. API 키·네이버 계정·GitHub Actions 설정은 필요 없습니다. 화면을 닫으면 감시·알림이 작동하지 않습니다.

## GitHub → Netlify
1. ZIP을 풀어 public, netlify, netlify.toml, README.md를 저장소 최상위에 올립니다. 기존 뉴스 수집 저장소와 혼동하지 않도록 **새 저장소·새 Netlify 프로젝트** 사용을 권합니다.
2. Netlify → Import an existing project → GitHub 저장소 선택.
3. Base directory 비움 / Publish directory public. 빌드 명령은 netlify.toml의 명령을 사용합니다. Hugo는 사용하지 않습니다.
4. 배포 주소를 엽니다. 서버 함수가 함께 배포돼야 하므로 index.html을 PC에서 직접 여는 방법이나 GitHub Pages만으로는 조회가 작동하지 않습니다.

## 동작
- 날씨: Open-Meteo 비상업 공개 API, 계룡시 대표좌표 36.274 / 127.249. 기상청 관측값이 아닌 모델 기반 현재값·예보. 한국시간, 풍속 m/s.
- 특보: 기상청 공개 웹페이지가 이용하는 현재 특보 표를 서버에서 조회해 전국 항목을 수신하고 계룡시·충청남도·전국 탭 및 시도 지도로 관련 명칭 포함 항목을 선별. 별도 보장된 API가 아니므로 원문 구조 변경·접속 제한 시 실패할 수 있습니다. 예비특보 자동 판별과 지역 제외조건 해석은 하지 않습니다. 미검출은 특보 없음 확정이 아닙니다.
- 날씨·특보 실패는 각각 표시하며, 이전 성공 값을 최신처럼 유지하지 않습니다.
- 요약문 복사 및 인쇄/PDF 제공.
- 키 없이 이용하는 데이터 경로를 사용하지만 Netlify 서버 함수·배포에는 계정별 무료 제공량/과금 정책이 적용됩니다. 사용량을 확인하세요. 대규모·상업적 사용은 Open-Meteo 이용조건을 별도 확인하세요.

## 출처
https://open-meteo.com/en/docs
https://open-meteo.com/en/terms
https://www.weather.go.kr/w/special-report/overall.do
https://www.weather.go.kr/w/wnuri-fct2021/weather/warning.do
날씨 자료는 Open-Meteo CC BY 4.0 출처 표기를 유지하세요. 특보 최종 확인 및 현장 의사결정에는 기상청 공식 발표를 이용하세요.

## 이번 업데이트
- 오늘 00:00~23:00 전체 시간대 날씨, 기온, 강수확률, 강수량, 풍속. 지난 시간도 모델 자료이며 관측 기록이 아닙니다.
- 계룡시 / 충청남도 / 전국 특보 탭, 시도 지도와 지역 선택 목록. 지도 색은 선택 상태이며 특보 발효 상태가 아닙니다.
- 지역명·시군명으로 관련 후보를 선별합니다. 제외지역 문구나 고성·광주처럼 동명이 있는 지역은 정확히 판별하지 않으며 원문 확인이 필요합니다. 해상 특보는 전국 탭에서 확인하세요.
- 대천항 인근 참고용 보령(DT_0025) 기준 7일 조석·물때(7물식), 만조/간조 시각·높이(cm). 대천항 자체 수치가 아니므로 대천항 물때표 외부 링크도 제공합니다. 예보 높이는 수심이 아닙니다.
- 조석 자료는 국립해양조사원 공개 화면의 조회 경로를 사용합니다. 별도 API 키가 필요하지 않지만 공개 화면 변경/장애 시 자동 조회가 실패할 수 있고, 실패 시 공식 페이지 링크를 이용해야 합니다.

## 기존 사이트 업데이트
ZIP의 public/ 와 netlify/ 폴더 및 netlify.toml을 기존 저장소 동일 위치에 덮어쓴 뒤 커밋하세요. Netlify 자동 배포 완료 후 새로고침합니다. Hugo 명령이 남아 있으면 빌드 명령을 netlify.toml 설정으로 변경하세요.

## 추가 출처와 지도 고지
- 조석: https://www.khoa.go.kr/swtc/main.do
- 대천항 별도 물때표: https://www.badatime.com/126.html (외부 링크, 자료 재배포 없음)
- 지도: https://github.com/southkorea/southkorea-maps 의 KOSTAT 2013 skorea_provinces_geo_simple.json을 SVG로 변환. 저장소 라이선스: KOSTAT Free to share or remix.
- 지도는 지역 선택 약도이며 2013년 경계입니다. 전북·강원 표시명은 변경했지만 이후 행정경계 변경(군위의 대구 편입 등)은 도형에 반영되지 않았습니다. 최신 경계 및 특보구역 지도 용도로 사용하지 마세요.
