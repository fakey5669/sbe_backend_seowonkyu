import axios from 'axios';
import { API_BASE_URL, MEAL_SERVICE_PATH } from '../constants/Paths';

// 급식 API 파라미터 인터페이스
export interface MealApiParams {
  KEY: string;
  Type: string;
  pIndex: number;
  pSize: number;
  ATPT_OFCDC_SC_CODE: string;
  SD_SCHUL_CODE: string;
  MMEAL_SC_CODE?: string;
  MLSV_YMD?: string;
  MLSV_FROM_YMD?: string;
  MLSV_TO_YMD?: string;
}

// 급식 정보 인터페이스
export interface MealInfo {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  MMEAL_SC_CODE: string;
  MMEAL_SC_NM: string;
  MLSV_YMD: string;
  MLSV_FGR: string;
  DDISH_NM: string;
  ORPLC_INFO: string;
  CAL_INFO: string;
  NTR_INFO: string;
  MLSV_FROM_YMD: string;
  MLSV_TO_YMD: string;
  LOAD_DTM: string;
}

// API 응답 인터페이스
export interface MealResponse {
  mealServiceDietInfo: {
    head: {
      list_total_count: number;
      RESULT: {
        CODE: string;
        MESSAGE: string;
      }[];
    }[];
    row?: MealInfo[];
  }[];
}

// 주간 급식 알레르기 정보 인터페이스
export interface WeeklyMealWithAllergy {
  date: string;
  dayOfWeek: string;
  meals: {
    type: string;
    menu: string[];
    allergies: string[];
  }[];
}

// 알레르기 코드 매핑
export const ALLERGY_CODES: Record<string, string> = {
  '1': '난류',
  '2': '우유',
  '3': '메밀',
  '4': '땅콩',
  '5': '대두',
  '6': '밀',
  '7': '고등어',
  '8': '게',
  '9': '새우',
  '10': '돼지고기',
  '11': '복숭아',
  '12': '토마토',
  '13': '아황산염',
  '14': '호두',
  '15': '닭고기',
  '16': '쇠고기',
  '17': '오징어',
  '18': '조개류'
};

// 원본 API 응답을 가져오는 함수 (Postman 테스트용)
export const getRawMealApiResponse = async (params: MealApiParams): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}${MEAL_SERVICE_PATH}`, {
      params
    });
    
    return response.data;
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
    throw new Error('API 호출에 실패했습니다.');
  }
};

// 급식 정보를 가져오는 함수
export const getMealInfo = async (params: MealApiParams): Promise<MealInfo[]> => {
  try {
    // MLSV_YMD와 MLSV_FROM_YMD, MLSV_TO_YMD 처리
    // 날짜 범위 검색을 위해 파라미터 조정
    if (params.MLSV_FROM_YMD && params.MLSV_TO_YMD) {
      // 날짜 범위 검색 시 MLSV_YMD 제거
      delete params.MLSV_YMD;
    } else if (params.MLSV_YMD && !params.MLSV_FROM_YMD && !params.MLSV_TO_YMD) {
      // 단일 날짜 검색 시 시작일과 종료일을 동일하게 설정
      params.MLSV_FROM_YMD = params.MLSV_YMD;
      params.MLSV_TO_YMD = params.MLSV_YMD;
      delete params.MLSV_YMD;
    }

    console.log('API 요청 파라미터:', params);
    
    const response = await axios.get<MealResponse | any>(`${API_BASE_URL}${MEAL_SERVICE_PATH}`, {
      params
    });
    
    console.log('API 응답 상태:', response.status);
    console.log('API 응답 데이터:', JSON.stringify(response.data, null, 2));
    
    // 에러 응답 처리
    if (response.data.RESULT && response.data.RESULT.CODE !== 'INFO-000') {
      console.log(`API 오류: ${response.data.RESULT.CODE} - ${response.data.RESULT.MESSAGE}`);
      return [];
    }
    
    // 응답 구조 확인 및 데이터 존재 여부 검증
    if (!response.data.mealServiceDietInfo || 
        !Array.isArray(response.data.mealServiceDietInfo) || 
        response.data.mealServiceDietInfo.length === 0) {
      console.log('API 응답에 mealServiceDietInfo가 없거나 비어있습니다.');
      return [];
    }
    
    // 결과 코드 확인
    const resultCode = response.data.mealServiceDietInfo[1]?.RESULT?.CODE || 
                      response.data.mealServiceDietInfo[0]?.head?.[1]?.RESULT?.CODE;
    
    // 정상 응답이 아닌 경우
    if (resultCode && resultCode !== 'INFO-000') {
      const resultMessage = response.data.mealServiceDietInfo[1]?.RESULT?.MESSAGE || 
                           response.data.mealServiceDietInfo[0]?.head?.[1]?.RESULT?.MESSAGE || 
                           '알 수 없는 오류';
      console.log(`API 오류: ${resultCode} - ${resultMessage}`);
      return [];
    }
    
    // 데이터 행이 있는지 확인
    const rows = response.data.mealServiceDietInfo[1]?.row;
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      console.log('API 응답에 데이터 행이 없습니다.');
      return [];
    }
    
    return rows;
  } catch (error) {
    console.error('급식 정보를 가져오는 중 오류 발생:', error);
    throw new Error('급식 정보를 가져오는데 실패했습니다.');
  }
};

// 알레르기 정보 추출 함수
export const extractAllergies = (menuText: string): string[] => {
  const allergyRegex = /\(([0-9\.]+)\)/g;
  const matches = menuText.match(allergyRegex) || [];
  
  return matches
    .map(match => match.replace(/[()]/g, ''))
    .filter(Boolean);
};

// 메뉴 항목에서 알레르기 번호 제거 함수
export const cleanMenuText = (menuText: string): string => {
  return menuText.replace(/\([0-9\.]+\)/g, '').trim();
};

// 메뉴 텍스트를 개별 메뉴 항목으로 분리하는 함수
export const parseMenuItems = (menuText: string): {menu: string[], allergies: string[]} => {
  const menuItems = menuText.split('<br/>');
  const allAllergies = new Set<string>();
  
  const cleanedMenuItems = menuItems.map(item => {
    const itemAllergies = extractAllergies(item);
    itemAllergies.forEach(allergy => allAllergies.add(allergy));
    return cleanMenuText(item);
  }).filter(Boolean);
  
  return {
    menu: cleanedMenuItems,
    allergies: Array.from(allAllergies)
  };
};

// 날짜에 해당하는 요일을 반환하는 함수
export const getDayOfWeek = (dateString: string): string => {
  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6)) - 1;
  const day = parseInt(dateString.substring(6, 8));
  
  const date = new Date(year, month, day);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  
  return days[date.getDay()];
};

// 알레르기 코드를 이름으로 변환하는 함수
export const getAllergyName = (code: string): string => {
  return ALLERGY_CODES[code] || `알 수 없음(${code})`;
}; 