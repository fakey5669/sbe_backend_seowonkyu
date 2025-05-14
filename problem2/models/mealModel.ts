import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL, MEAL_SERVICE_PATH } from '../constants/Paths';

/**
 * 급식 API 파라미터 인터페이스
 */
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

/**
 * 급식 정보 인터페이스
 */
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

/**
 * API 응답 인터페이스
 */
export interface MealResponse {
  mealServiceDietInfo: Array<{
    head: Array<{
      list_total_count: number;
      RESULT: Array<{
        CODE: string;
        MESSAGE: string;
      }>;
    }>;
    row?: MealInfo[];
  }>;
}

/**
 * API 에러 응답 인터페이스
 */
export interface ApiErrorResponse {
  RESULT: {
    CODE: string;
    MESSAGE: string;
  };
}

/**
 * 메뉴 항목 인터페이스
 */
export interface MenuItem {
  type: string;
  menu: string[];
  allergies: string[];
}

/**
 * 주간 급식 알레르기 정보 인터페이스
 */
export interface WeeklyMealWithAllergy {
  date: string;
  dayOfWeek: string;
  meals: MenuItem[];
}

/**
 * 요일 타입 정의
 */
export type DayOfWeek = '일' | '월' | '화' | '수' | '목' | '금' | '토';

/**
 * 알레르기 코드 매핑
 */
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
  '18': '조개류',
  '19': '잣',
};

/**
 * 급식 정보를 가져오는 함수
 * @param params API 요청 파라미터
 * @returns 급식 정보 배열
 */
export const getMealInfo = async (params: MealApiParams): Promise<MealInfo[]> => {
  try {
    // 날짜 범위 검색을 위한 파라미터 조정
    const adjustedParams: MealApiParams = { ...params };
    
    if (adjustedParams.MLSV_FROM_YMD && adjustedParams.MLSV_TO_YMD) {
      // 날짜 범위 검색 시 MLSV_YMD 제거
      delete adjustedParams.MLSV_YMD;
    } else if (adjustedParams.MLSV_YMD && !adjustedParams.MLSV_FROM_YMD && !adjustedParams.MLSV_TO_YMD) {
      // 단일 날짜 검색 시 시작일과 종료일을 동일하게 설정
      adjustedParams.MLSV_FROM_YMD = adjustedParams.MLSV_YMD;
      adjustedParams.MLSV_TO_YMD = adjustedParams.MLSV_YMD;
      delete adjustedParams.MLSV_YMD;
    }

    console.log('API 요청 파라미터:', adjustedParams);
    
    const response: AxiosResponse<MealResponse | ApiErrorResponse> = await axios.get(
      `${API_BASE_URL}${MEAL_SERVICE_PATH}`,
      { params: adjustedParams }
    );
    
    console.log('API 응답 상태:', response.status);
    
    // 에러 응답 처리
    if ('RESULT' in response.data) {
      const errorResponse = response.data as ApiErrorResponse;
      if (errorResponse.RESULT.CODE !== 'INFO-000') {
        console.log(`API 오류: ${errorResponse.RESULT.CODE} - ${errorResponse.RESULT.MESSAGE}`);
        return [];
      }
    }
    
    const mealResponse = response.data as MealResponse;
    
    // 응답 구조 확인 및 데이터 존재 여부 검증
    if (!mealResponse.mealServiceDietInfo || 
        !Array.isArray(mealResponse.mealServiceDietInfo) || 
        mealResponse.mealServiceDietInfo.length === 0) {
      console.log('API 응답에 mealServiceDietInfo가 없거나 비어있습니다.');
      return [];
    }
    
    // 결과 코드 확인
    const mealServiceInfo = mealResponse.mealServiceDietInfo;
    const resultCode = mealServiceInfo[1]?.head?.[0]?.RESULT?.[0]?.CODE || 
                      mealServiceInfo[0]?.head?.[0]?.RESULT?.[0]?.CODE;
    
    // 정상 응답이 아닌 경우
    if (resultCode && resultCode !== 'INFO-000') {
      const resultMessage = mealServiceInfo[1]?.head?.[0]?.RESULT?.[0]?.MESSAGE || 
                           mealServiceInfo[0]?.head?.[0]?.RESULT?.[0]?.MESSAGE || 
                           '알 수 없는 오류';
      console.log(`API 오류: ${resultCode} - ${resultMessage}`);
      return [];
    }
    
    // 데이터 행이 있는지 확인
    const rows = mealServiceInfo[1]?.row;
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

/**
 * 알레르기 정보 추출 함수
 * @param menuText 메뉴 텍스트
 * @returns 알레르기 코드 배열
 */
export const extractAllergies = (menuText: string): string[] => {
  const allergyRegex = /\(([0-9\.]+)\)/g;
  const matches = menuText.match(allergyRegex) || [];
  
  return matches
    .map(match => match.replace(/[()]/g, ''))
    .filter(Boolean);
};

/**
 * 메뉴 항목에서 알레르기 번호 제거 함수
 * @param menuText 메뉴 텍스트
 * @returns 알레르기 정보가 제거된 메뉴 텍스트
 */
export const cleanMenuText = (menuText: string): string => {
  return menuText.replace(/\([0-9\.]+\)/g, '').trim();
};

/**
 * 메뉴 텍스트를 개별 메뉴 항목으로 분리하는 함수
 * @param menuText 메뉴 텍스트
 * @returns 메뉴 항목 및 알레르기 정보
 */
export const parseMenuItems = (menuText: string): {menu: string[], allergies: string[]} => {
  const menuItems: string[] = menuText.split('<br/>');
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

/**
 * 날짜에 해당하는 요일을 반환하는 함수
 * @param dateString YYYYMMDD 형식의 날짜 문자열
 * @returns 요일 문자열
 */
export const getDayOfWeek = (dateString: string): DayOfWeek => {
  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6)) - 1;
  const day = parseInt(dateString.substring(6, 8));
  
  const date = new Date(year, month, day);
  const days: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'];
  
  return days[date.getDay()];
};

/**
 * 알레르기 코드를 이름으로 변환하는 함수
 * @param code 알레르기 코드
 * @returns 알레르기 이름
 */
export const getAllergyName = (code: string): string => {
  return ALLERGY_CODES[code] || `알 수 없음(${code})`;
}; 