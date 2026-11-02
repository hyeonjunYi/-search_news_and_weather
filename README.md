# 계룡소방서 현장대응단 — 화재 뉴스 수집·보고서 초안

네이버 뉴스 API에서 최근 기사를 수집하고 사망·대응 2~3단계 관련 후보를 선별해 인쇄 가능한 1장 HTML 보고서 초안을 만듭니다. **초기 버전으로 제목·검색 요약 기반 규칙 선별만 수행합니다. AI 본문 분석, 피해 인원 확정, 사건 단위 통합, 사진 수집, 알림 발송은 구현하지 않았습니다.** 누락·오탐이 있으며 긴급 상황 전파 수단을 대체하지 않습니다.

## 처음 설정 (순서대로)
1. GitHub에 새 저장소를 만들고 ZIP의 **내용 전체**를 최상위에 올립니다. `.github/workflows/collect.yml`도 포함해야 합니다. 업로드 화면에서 숨김 폴더가 빠지면 Git 또는 GitHub Desktop으로 올리세요.
2. 네이버 개발자센터에서 애플리케이션을 등록하고 검색 API 사용을 신청합니다.
3. GitHub 저장소 Settings → Secrets and variables → Actions → New repository secret에 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`을 각각 등록합니다. 키를 코드나 HTML에 입력하지 마세요.
4. 저장소 Settings → Actions → General에서 워크플로 실행과 GITHUB_TOKEN의 쓰기 권한을 허용합니다. 조직 정책·브랜치 보호가 쓰기를 막으면 관리자가 허용한 방식으로 조정해야 합니다.
5. Actions → ‘화재 뉴스 수집 및 초안 생성’ → Run workflow로 첫 수집을 시험합니다.
6. 완료된 실행의 Artifacts에서 `fire-report-drafts`를 내려받아 압축을 풀고 index.html을 엽니다.

## 자동 실행
기본 브랜치의 워크플로가 약 10분 간격(매시 7·17·27·37·47·57분 UTC)에 실행되도록 설정했습니다. 정확한 10분 주기나 즉시 수집은 보장되지 않습니다. GitHub 실행 지연·사용량·비활성화 정책·네이버 검색 반영 지연의 영향을 받습니다. 항상 실행 상태를 확인하세요. 하루 약 432회 검색 요청(검색어 3개 기준), 월 최대 약 4,320회 워크플로 실행이므로 계정별 Actions 사용량을 확인하고 필요하면 cron을 `7 * * * *`로 바꿔 1시간 주기로 줄이세요.

## 직접 실행 / 가상 예시
Python 3.11 이상, 외부 패키지 불필요.
```
python watch.py --demo
```
가상 예시로 preview/index.html이 생성됩니다. 가상 예시는 실제 기사로 게시·승인할 수 없습니다. 실제 수집 전 data/records.json에서 가상 항목을 제거하거나 내용을 `{}`로 초기화하세요.

실제 수집은 환경변수에 네이버 키를 설정한 뒤 `python watch.py`로 실행합니다. 키를 출력하거나 공유하지 마세요.

## 담당자 검토 및 게시
1. preview/reports의 원문 링크로 기사를 확인합니다. 날짜가 오래된 사건·국외 사건·재판·오탐을 제거하고, 같은 사건의 다른 기사를 비교합니다. **기사 제공시각은 화재 발생시각이 아닙니다.**
2. review-fields.example.json을 복사해 확인한 필드를 입력합니다. 원문 출처·보도시각을 각 필드에 함께 적으세요. 미확인 필드는 빈 문자열로 두면 미확인으로 표시됩니다. 인명피해나 원인을 자동 추정하지 않습니다.
3. 수집 데이터의 16자리 ID를 사용해 로컬에서 승인합니다.
```
python review.py 기사ID --editor "검토자" --fields 검토내용.json
```
4. data/records.json과 public/ 변경을 GitHub에 올립니다. Netlify에서 저장소를 연결하고 **Publish directory를 public**으로 설정합니다. 빌드 명령은 비웁니다. 승인본만 public/에 들어갑니다. 최초 public/은 빈 목록입니다.

주의: 승인 처리는 검토자의 수동 명령으로 동작하며 별도 로그인·전자결재 기능이 아닙니다. 기사 제목 변경 시 승인을 해제하지만 본문 변경은 API 메타데이터로 감지하지 못하므로 주기적 원문 재확인이 필요합니다. 원문 URL로 중복을 제거하며 서로 다른 언론사의 같은 사건은 별도 초안으로 남습니다. 재산피해·인원 등의 자동 추출은 하지 않습니다. 한 장 인쇄는 기본 분량 기준이며 긴 수동 입력은 여러 장이 될 수 있습니다.

## 데이터와 공개 범위
검토용 HTML은 워크플로 Artifact에, 수집 목록은 data/records.json에 저장됩니다. 공개 저장소에서는 수집·검토 정보가 공개될 수 있습니다. 초안의 접근 제한이 필요하면 비공개 저장소와 적절한 게시 권한을 사용하세요. Netlify 게시 대상이 public/인지 확인하세요. 사망자 개인정보·내부 작전자료·인증키는 입력하지 않습니다. 사진은 자동 수집하지 않습니다.

## 파일 구성
- watch.py: API 수집·후보 선별·초안/승인본 HTML 생성
- review.py: 담당자 확인사항 반영 및 승인
- config.json: 검색어·최근 기사 조회기간
- .github/workflows/collect.yml: 예약 실행
- data/records.json: 누적 수집·검토 이력
- public/: 승인본 사이트, Netlify 게시 대상
- demo-preview/: 키 없이 확인하는 **가상자료** 화면

## 공식 문서
https://developers.naver.com/docs/serviceapi/search/news/news.md
https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

이 ZIP을 올리는 것만으로 API 키 발급·자동 실행·사이트 게시가 완료되지는 않습니다. 위 설정이 필요합니다.
