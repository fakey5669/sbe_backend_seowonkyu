# 학교 급식 식단 정보 API 서비스

나이스 교육정보 개방 포털의 급식식단정보 OpenAPI를 활용한 학교 가정통신문용 급식 정보 API 서비스입니다.

## 주요 기능

1. **급식 정보 조회** - 학교와 날짜에 따른 급식 정보를 조회할 수 있습니다.
2. **주간 급식 요약 정보** - 일정 기간의 급식 정보를 분석하여 메뉴 데이터를 통계적으로 요약하고 제공합니다.

## API 사용 방법

### 1. 급식 정보 조회 API

```
GET /api/meals
```

#### 요청 파라미터

| 파라미터 | 설명 | 필수 여부 |
|--------|------|----------|
| educationCode | 시도교육청코드 | Y |
| schoolCode | 학교코드 | Y |
| date | 급식일자 (YYYYMMDD 형식) | N |
| startDate | 급식시작일자 (YYYYMMDD 형식) | N |
| endDate | 급식종료일자 (YYYYMMDD 형식) | N |
| mealType | 식사코드 (1: 조식, 2: 중식, 3: 석식) | N |

#### 응답 예시

```json
{
  "success": true,
  "data": [
    {
      "schoolName": "OO초등학교",
      "schoolCode": "7531234",
      "educationOfficeName": "서울특별시교육청",
      "date": "2023-11-20",
      "mealType": "2",
      "mealName": "중식",
      "menuItems": [
        "현미밥",
        "미역국",
        "돈육불고기",
        "깍두기",
        "배"
      ],
      "allergies": [
        "돼지고기",
        "대두"
      ],
      "nutrition": {
        "calories": "569.0 Kcal",
        "nutrients": {
          "탄수화물": "77.6g",
          "단백질": "28.0g",
          "지방": "15.1g"
        }
      },
      "origin": {
        "쌀": "국내산",
        "돼지고기": "국내산"
      }
    }
  ]
}
```

### 2. 주간 급식 요약 정보 API

```
GET /api/meals/weekly-summary
```

#### 요청 파라미터

| 파라미터 | 설명 | 필수 여부 |
|--------|------|----------|
| educationCode | 시도교육청코드 | Y |
| schoolCode | 학교코드 | Y |
| startDate | 시작일 (YYYYMMDD 형식) | N |
| endDate | 종료일 (YYYYMMDD 형식) | N |

> 참고: startDate와 endDate를 지정하지 않으면 자동으로 이번 주 월요일부터 금요일까지의 기간으로 설정됩니다.

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "schoolInfo": {
      "name": "OO초등학교",
      "code": "7531234",
      "educationOffice": "서울특별시교육청"
    },
    "period": {
      "start": "20231120",
      "end": "20231124"
    },
    "mealCount": 5,
    "menuAnalysis": {
      "mostFrequentMenuItems": [
        {
          "name": "쌀밥",
          "count": 3
        },
        {
          "name": "김치",
          "count": 3
        },
        {
          "name": "미역국",
          "count": 2
        },
        {
          "name": "돈육불고기",
          "count": 1
        },
        {
          "name": "배",
          "count": 1
        }
      ],
      "averageMenuItemsPerMeal": 5.2,
      "allergyInfo": [
        {
          "allergyType": "대두",
          "count": 3
        },
        {
          "allergyType": "우유",
          "count": 2
        },
        {
          "allergyType": "돼지고기",
          "count": 1
        }
      ]
    },
    "nutritionAverage": {
      "탄수화물": "76.5g",
      "단백질": "26.8g",
      "지방": "14.2g"
    }
  }
}
```

## 시도교육청코드 참고 정보

- B10: 서울특별시교육청
- C10: 부산광역시교육청
- D10: 대구광역시교육청
- E10: 인천광역시교육청
- F10: 광주광역시교육청
- G10: 대전광역시교육청
- H10: 울산광역시교육청
- I10: 세종특별자치시교육청
- J10: 경기도교육청
- K10: 강원도교육청
- M10: 충청북도교육청
- N10: 충청남도교육청
- P10: 전라북도교육청
- Q10: 전라남도교육청
- R10: 경상북도교육청
- S10: 경상남도교육청
- T10: 제주특별자치도교육청

## About

This project was created with [express-generator-typescript](https://github.com/seanpmaxwell/express-generator-typescript).

**IMPORTANT** for demo purposes I had to disable `helmet` in production. In any real world app you should change these 3 lines of code in `src/server.ts`:
```ts
// eslint-disable-next-line n/no-process-env
if (!process.env.DISABLE_HELMET) {
  app.use(helmet());
}
```

To just this:
```ts
app.use(helmet());
```


## Available Scripts

### `npm run clean-install`

Remove the existing `node_modules/` folder, `package-lock.json`, and reinstall all library modules.


### `npm run dev` or `npm run dev:hot` (hot reloading)

Run the server in development mode.<br/>

**IMPORTANT** development mode uses `swc` for performance reasons which DOES NOT check for typescript errors. Run `npm run type-check` to check for type errors. NOTE: you should use your IDE to prevent most type errors.


### `npm test` or `npm run test:hot` (hot reloading)

Run all unit-tests.


### `npm test -- "name of test file" (i.e. users).`

Run a single unit-test.


### `npm run lint`

Check for linting errors.


### `npm run build`

Build the project for production.


### `npm start`

Run the production build (Must be built first).


### `npm run type-check`

Check for typescript errors.


## Additional Notes

- If `npm run dev` gives you issues with bcrypt on MacOS you may need to run: `npm rebuild bcrypt --build-from-source`. 
