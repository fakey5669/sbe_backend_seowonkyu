# Problem 1: 이 프로그램은 주어진 숫자 배열([1, 3, 5, 7, 9])에서 숫자들을 두 그룹으로 나누어 각 그룹의 숫자를 조합하여 만든 두 수의 곱이 최대가 되는 조합을 찾는 알고리즘입니다.

## 실행 방법

```bash
npm install
npm start
```

## 알고리즘 단계별 설명

1. **순열 생성**: 주어진 숫자 배열에서 가능한 모든 순열을 생성합니다.
2. **숫자 그룹 분할**: 숫자들을 두 그룹으로 나누어 각각 하나의 숫자로 조합합니다.
3. **최대 곱 계산**: 두 숫자의 곱을 계산하고 최대값을 찾습니다.

## 핵심 함수

1. **getPermutations**: 재귀 방식으로 특정 길이의 모든 순열을 생성합니다.
2. **arrayToNumber**: 숫자 배열을 하나의 정수로 변환합니다 (예: [1,3,5] → 135).
3. **makeMaxNumber**: 주어진 숫자들로 만들 수 있는 가장 큰 수를 생성합니다.
4. **findMaxProduct**: 가능한 모든 조합을 시도하여 최대 곱을 찾습니다.

## 최적화 전략

5개 숫자를 두 그룹으로 나누는 경우:
- 1자리:4자리, 2자리:3자리, 3자리:2자리, 4자리:1자리

첫 번째 숫자를 1자리 또는 2자리로 제한하고, 나머지 숫자들은 항상 내림차순으로 정렬하여 최대값을 만들어 계산량을 줄였습니다.

이 방법으로 모든 가능한 조합을 효율적으로 탐색하여 최대 곱을 가진 두 수의 조합을 찾아냅니다.

# Problem 2: 학교 급식 정보 API 서비스

NEIS OpenAPI를 활용한 학교 급식 정보 제공 API 서비스입니다. 이 서비스는 학교 이름을 기반으로 급식 정보, 알레르기 정보, 칼로리, 영양정보, 원산지 정보를 제공합니다.

## 기술 스택

- Node.js
- TypeScript
- Express.js
- EJS (템플릿 엔진)

## 설치 방법

```bash
# 프로젝트 디렉토리로 이동
cd problem2

# 의존성 설치
npm install
```

## 실행               

```bash
# problem2 디렉토리로 이동
cd problem2

# 개발 모드로 실행
npm run dev
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 명세서

### 급식 및 알레르기 정보 조회 API

학교 이름으로 급식 정보, 알레르기 정보, 칼로리, 영양정보, 원산지 정보를 조회합니다.

- **URL**: `/api/meals/schoolMealAndAllergy`
- **Method**: `GET`
- **인증**: 필요 없음

#### 요청 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| schoolName | String | 예 | 학교 이름 |
| startDate | String | 아니오 | 조회 시작 날짜 (YYYYMMDD 형식, 미입력 시 현재 월의 1일) |
| endDate | String | 아니오 | 조회 종료 날짜 (YYYYMMDD 형식, 미입력 시 현재 월의 마지막 날) |

#### 응답

##### 성공 응답 (200 OK)

```json
{
  "success": true,
  "schoolInfo": {
    "name": "학교명",
    "code": "학교코드",
    "officeCode": "교육청코드",
    "officeName": "교육청명",
    "address": "학교주소"
  },
  "data": [
    {
      "date": "2023-05-01",
      "dayOfWeek": "월",
      "meals": [
        {
          "type": "중식",
          "menu": [
            "흰쌀밥",
            "미역국",
            "불고기",
            "김치"
          ],
          "allergies": [
            "난류",
            "우유",
            "대두",
            "밀"
          ],
          "calInfo": "721.9 Kcal",
          "ntrInfo": "탄수화물(g) 108.5 단백질(g) 28.6 지방(g) 23.1 비타민A(R.E) 281.3 티아민(mg) 0.4 리보플라빈(mg) 0.5 비타민C(mg) 12.9 칼슘(mg) 217.9 철분(mg) 3.5",
          "orplcInfo": "쌀 : 국내산 김치류 : 국내산 고춧가루(김치류) : 국내산 쇠고기(종류) : 국내산(한우)"
        }
      ]
    }
  ]
}
```

##### 에러 응답 (400 Bad Request)

```json
{
  "success": false,
  "message": "학교 이름은 필수 항목입니다."
}
```

##### 에러 응답 (500 Internal Server Error)

```json
{
  "success": false,
  "message": "급식 정보를 가져오는데 실패했습니다."
}
```

#### 검색 결과가 없는 경우 (200 OK)

```json
{
  "success": true,
  "message": "검색 결과가 없습니다.",
  "data": []
}
```

## API 사용 예시
 "http://localhost:3000/api/meals/schoolMealAndAllergy?schoolName=한일고등학교"

# Problem 3: 다단계 결재 시스템 데이터베이스 설계

여러 단계의 승인 및 반려가 가능한 결재 시스템을 위한 데이터베이스 설계와 쿼리 구현입니다.

## 설계 특징

이 결재 시스템은 최소한의 테이블로 다단계 결재 프로세스를 구현했습니다. 일반적인 기업 결재 시스템에서는 직책/직급별 권한 관리 등의 추가 테이블이 필요할 것 같지만, 이 구현에서는 최소한의 테이블이라는 핵심 기능에 집중하여
결재 문서를 만들 때 사용자 중에 직접 지정할 수 있도록 설계

## 데이터베이스 구조

### 1. 사용자 테이블 (users)
- 사용자의 기본 정보를 저장합니다.
- 결재 요청자와 승인자를 모두 관리합니다.
- 부서, 직급 등 조직 내 정보를 포함하여 결재 권한 제어에 활용합니다.

### 2. 결재 문서 테이블 (approval_documents)
- 결재 문서의 기본 정보를 저장합니다.
- 제목, 내용, 요청 날짜 등 결재에 필요한 정보를 담고 있습니다.
- 요청자 정보와 전체 결재 상태를 관리합니다.

### 3. 결재 단계 테이블 (approval_steps)
- 결재 프로세스의 각 단계를 관리합니다.
- 어떤 사용자가 어떤 순서로 결재해야 하는지 정의합니다.
- 각 단계별 상태(대기 중, 승인됨, 반려됨)를 추적합니다.

## 주요 기능

1. **결재 요청 생성**: 사용자가 결재 문서를 생성하고 결재 라인을 지정합니다.
2. **결재 처리**: 결재자는 문서를 승인하거나 반려할 수 있습니다.
3. **결재 상태 추적**: 각 결재 문서의 전체 상태와 개별 결재 단계의 상태를 모두 추적합니다.
4. **반려 처리**: 결재가 반려될 경우, 해당 단계와 문서 전체의 상태가 변경되고 프로세스가 중단됩니다.

## 구현된 쿼리

### 테이블 정의 (table_definition.sql)
- 사용자, 결재 문서, 결재 단계를 위한 테이블 구조를 정의합니다.
- 각 테이블 간의 관계를 외래 키로 설정합니다.

### 결재 대기 문서 조회 (pending_approvals_query.sql)
- 특정 사용자가 처리해야 할 결재 문서를 조회하는 쿼리입니다.
- 현재 처리 순서에 해당하는 문서만 조회합니다 (첫 번째 단계이거나 이전 단계가 모두 승인된 경우).

## 결재 프로세스 흐름

1. **결재 요청 생성**: 사용자가 결재 문서를 작성하고 결재 라인을 설정합니다.
2. **결재자의 문서 조회**: 결재자는 자신이 처리해야 할 문서 목록을 확인합니다.
3. **결재 처리**: 결재자는 문서를 승인하거나 반려합니다.
4. **다음 단계 진행**: 승인 시 다음 결재자에게 문서가 전달됩니다.
5. **결재 완료 또는 반려**: 모든 단계가 승인되면 결재가 완료되고, 중간에 반려되면 프로세스가 중단됩니다.
6. **반려 후 처리**: 반려된 문서는 요청자가 확인 후 수정하여 재신청할 수 있습니다.

