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

## 실행 방법

```bash
# problem2 디렉토리로 이동
cd problem2

# 개발 모드로 실행
npm run dev

# 또는 빌드 후 실행
npm run build
npm start
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

