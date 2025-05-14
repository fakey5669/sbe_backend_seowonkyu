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

NEIS OpenAPI를 활용한 학교 급식 정보 제공 API 서비스입니다. 이 서비스는 학교 이름을 기반으로 급식 정보와 알레르기 정보를 제공합니다.

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

학교 이름으로 급식 정보와 알레르기 정보를 조회합니다.

- **URL**: `/api/meals/highSchoolMealAndAllergy`
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
          ]
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
 "http://localhost:3000/api/meals/highSchoolMealAndAllergy?schoolName=한일고등학교"

