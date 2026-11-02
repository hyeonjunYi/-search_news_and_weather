# 계룡시 오늘 날씨·기상특보 조회
계룡소방서 현장대응단 업무 참고용. 페이지를 열거나 ‘지금 조회하기’를 누르면 새로 조회합니다. API 키·네이버 계정·GitHub Actions 설정은 필요 없습니다. 화면을 닫으면 감시·알림이 작동하지 않습니다.

## GitHub → Netlify
1. ZIP을 풀어 public, netlify, netlify.toml, README.md를 저장소 최상위에 올립니다. 기존 뉴스 수집 저장소와 혼동하지 않도록 **새 저장소·새 Netlify 프로젝트** 사용을 권합니다.
2. Netlify → Import an existing project → GitHub 저장소 선택.
3. Base directory 비움 / Publish directory public. 빌드 명령은 netlify.toml의 명령을 사용합니다. Hugo는 사용하지 않습니다.
4. 배포 주소를 엽니다. 서버 함수가 함께 배포돼야 하므로 index.html을 PC에서 직접 여는 방법이나 GitHub Pages만으로는 조회가 작동하지 않습니다.

## 동작
- 날씨: Open-Meteo 비상업 공개 API, 계룡시 대표좌표 36.274 / 127.249. 기상청 관측값이 아닌 모델 기반 현재값·예보. 한국시간, 풍속 m/s.
- 특보: 기상청 공개 웹페이지가 이용하는 현재 특보 표를 서버에서 조회해 계룡·충남 명칭 포함 항목을 선별. 별도 보장된 API가 아니므로 원문 구조 변경·접속 제한 시 실패할 수 있습니다. 예비특보 자동 판별과 지역 제외조건 해석은 하지 않습니다. 미검출은 특보 없음 확정이 아닙니다.
- 날씨·특보 실패는 각각 표시하며, 이전 성공 값을 최신처럼 유지하지 않습니다.
- 요약문 복사 및 인쇄/PDF 제공.
- 키 없이 이용하는 데이터 경로를 사용하지만 Netlify 서버 함수·배포에는 계정별 무료 제공량/과금 정책이 적용됩니다. 사용량을 확인하세요. 대규모·상업적 사용은 Open-Meteo 이용조건을 별도 확인하세요.

## 출처
https://open-meteo.com/en/docs
https://open-meteo.com/en/terms
https://www.weather.go.kr/w/special-report/overall.do
https://www.weather.go.kr/w/wnuri-fct2021/weather/warning.do
날씨 자료는 Open-Meteo CC BY 4.0 출처 표기를 유지하세요. 특보 최종 확인 및 현장 의사결정에는 기상청 공식 발표를 이용하세요.
