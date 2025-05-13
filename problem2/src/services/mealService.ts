import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import HttpException from '../models/HttpException';

// API 요청 타입 정의
interface MealRequestParams {
  schoolCode: string;
  educationCode: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  mealType?: string;
}

// API 응답 타입 정의
interface NeisApiResponse {
  mealServiceDietInfo: Array<{
    head: Array<{
      list_total_count?: number;
      RESULT?: {
        CODE: string;
        MESSAGE: string;
      };
    }>;
    row?: Array<{
      ATPT_OFCDC_SC_CODE: string; // 시도교육청코드
      ATPT_OFCDC_SC_NM: string; // 시도교육청명
      SD_SCHUL_CODE: string; // 학교코드
      SCHUL_NM: string; // 학교명
      MMEAL_SC_CODE: string; // 식사코드
      MMEAL_SC_NM: string; // 식사명
      MLSV_YMD: string; // 급식일자
      MLSV_FGR: string; // 급식인원수
      DDISH_NM: string; // 요리명
      ORPLC_INFO: string; // 원산지정보
      CAL_INFO: string; // 칼로리정보
      NTR_INFO: string; // 영양정보
      LOAD_DTM: string; // 수정일자
    }>;
  }>;
}

// 응답 데이터 타입 정의
export interface MealData {
  schoolName: string;
  schoolCode: string;
  educationOfficeName: string;
  date: string;
  mealType: string;
  mealName: string;
  menuItems: string[];
  allergies: string[];
  nutrition: {
    calories: string;
    nutrients: Record<string, string>;
  };
  origin: Record<string, string>;
}

// 알레르기 정보 매핑
const allergyMapping: Record<string, string> = {
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
  '13': '아황산류',
  '14': '호두',
  '15': '닭고기',
  '16': '쇠고기',
  '17': '오징어',
  '18': '조개류(굴, 전복, 홍합 포함)',
  '19': '잣'
};

class MealService {
  private readonly API_KEY = 'b75bf16a842a41d9b78cf30644ea3259'; // 인증키
  private readonly API_URL = 'https://open.neis.go.kr/hub/mealServiceDietInfo';

  /**
   * 급식 정보를 가져오는 함수
   */
  public async getMealInfo(params: MealRequestParams): Promise<MealData[]> {
    try {
      // API 요청 파라미터 설정
      const queryParams = {
        KEY: this.API_KEY,
        Type: 'json',
        pIndex: 1,
        pSize: 100,
        ATPT_OFCDC_SC_CODE: params.educationCode,
        SD_SCHUL_CODE: params.schoolCode,
        MLSV_YMD: params.date,
        MLSV_FROM_YMD: params.startDate,
        MLSV_TO_YMD: params.endDate,
        MMEAL_SC_CODE: params.mealType
      };

      // 불필요한 파라미터 제거
      Object.keys(queryParams).forEach(key => {
        const typedKey = key as keyof typeof queryParams;
        if (!queryParams[typedKey]) {
          delete queryParams[typedKey];
        }
      });

      // API 호출
      const response = await axios.get<NeisApiResponse>(this.API_URL, { params: queryParams });
      const data = response.data;

      // API 에러 처리
      if (data.mealServiceDietInfo?.[0]?.head?.[1]?.RESULT?.CODE !== 'INFO-000') {
        const errorMessage = data.mealServiceDietInfo?.[0]?.head?.[1]?.RESULT?.MESSAGE || '급식 정보를 조회할 수 없습니다.';
        throw new HttpException(StatusCodes.BAD_REQUEST, errorMessage);
      }

      // 데이터가 없는 경우
      const rows = data.mealServiceDietInfo?.[1]?.row;
      if (!rows || rows.length === 0) {
        return [];
      }

      // 데이터 변환
      return rows.map(row => this.formatMealData(row));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      console.error('급식 정보 조회 중 오류 발생:', error);
      throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, '급식 정보를 가져오는 중 오류가 발생했습니다.');
    }
  }

  /**
   * 주간 급식 요약 정보를 가져오는 함수
   */
  public async getWeeklyMealSummary(params: MealRequestParams): Promise<{
    schoolInfo: {
      name: string;
      code: string;
      educationOffice: string;
    };
    period: {
      start: string;
      end: string;
    };
    mealCount: number;
    menuAnalysis: {
      mostFrequentMenuItems: { name: string; count: number }[];
      averageMenuItemsPerMeal: number;
      allergyInfo: { allergyType: string; count: number }[];
    };
    nutritionAverage: Record<string, string>;
  }> {
    // 급식 정보 가져오기
    const mealData = await this.getMealInfo(params);
    
    if (mealData.length === 0) {
      throw new HttpException(StatusCodes.NOT_FOUND, '해당 기간에 급식 정보가 없습니다.');
    }

    // 학교 정보
    const schoolInfo = {
      name: mealData[0].schoolName,
      code: mealData[0].schoolCode,
      educationOffice: mealData[0].educationOfficeName
    };

    // 기간 정보
    const period = {
      start: params.startDate || mealData[0].date,
      end: params.endDate || mealData[mealData.length - 1].date
    };

    // 메뉴 빈도수 계산
    const menuCounts: Record<string, number> = {};
    mealData.forEach(meal => {
      meal.menuItems.forEach(item => {
        menuCounts[item] = (menuCounts[item] || 0) + 1;
      });
    });

    // 가장 자주 등장하는 메뉴 아이템
    const mostFrequentMenuItems = Object.entries(menuCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 알레르기 정보 집계
    const allergyCounts: Record<string, number> = {};
    mealData.forEach(meal => {
      meal.allergies.forEach(allergy => {
        allergyCounts[allergy] = (allergyCounts[allergy] || 0) + 1;
      });
    });

    const allergyInfo = Object.entries(allergyCounts)
      .map(([allergyType, count]) => ({ allergyType, count }))
      .sort((a, b) => b.count - a.count);

    // 영양소 평균 계산
    const nutritionSum: Record<string, number> = {};
    const nutritionCount: Record<string, number> = {};

    mealData.forEach(meal => {
      Object.entries(meal.nutrition.nutrients).forEach(([key, value]) => {
        // 숫자만 추출 (예: '5.2g' -> 5.2)
        const numValue = parseFloat(value.replace(/[^\d.]/g, ''));
        if (!isNaN(numValue)) {
          nutritionSum[key] = (nutritionSum[key] || 0) + numValue;
          nutritionCount[key] = (nutritionCount[key] || 0) + 1;
        }
      });
    });

    // 영양소 평균 계산
    const nutritionAverage: Record<string, string> = {};
    Object.keys(nutritionSum).forEach(key => {
      const avg = nutritionSum[key] / nutritionCount[key];
      const unit = key.includes('탄수화물') || key.includes('단백질') || key.includes('지방') ? 'g' : '';
      nutritionAverage[key] = `${avg.toFixed(1)}${unit}`;
    });

    // 평균 메뉴 아이템 수
    const totalMenuItems = mealData.reduce((sum, meal) => sum + meal.menuItems.length, 0);
    const averageMenuItemsPerMeal = parseFloat((totalMenuItems / mealData.length).toFixed(1));

    return {
      schoolInfo,
      period,
      mealCount: mealData.length,
      menuAnalysis: {
        mostFrequentMenuItems,
        averageMenuItemsPerMeal,
        allergyInfo
      },
      nutritionAverage
    };
  }

  /**
   * 급식 데이터 포맷팅
   */
  private formatMealData(row: {
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
    LOAD_DTM: string;
  }): MealData {
    // 메뉴와 알레르기 정보 추출
    const { menuItems, allergies } = this.extractMenuAndAllergies(row.DDISH_NM);
    
    // 날짜 포맷 변환 (YYYYMMDD -> YYYY-MM-DD)
    const formattedDate = row.MLSV_YMD.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    
    return {
      schoolName: row.SCHUL_NM,
      schoolCode: row.SD_SCHUL_CODE,
      educationOfficeName: row.ATPT_OFCDC_SC_NM,
      date: formattedDate,
      mealType: row.MMEAL_SC_CODE,
      mealName: row.MMEAL_SC_NM,
      menuItems,
      allergies,
      nutrition: {
        calories: row.CAL_INFO,
        nutrients: this.parseNutritionInfo(row.NTR_INFO)
      },
      origin: this.parseOriginInfo(row.ORPLC_INFO)
    };
  }

  /**
   * 메뉴와 알레르기 정보 추출
   */
  private extractMenuAndAllergies(dishName: string): { menuItems: string[]; allergies: string[] } {
    if (!dishName) {
      return { menuItems: [], allergies: [] };
    }
    
    const allergySet = new Set<string>();
    
    // 알레르기 정보(숫자) 추출
    const menuItems = dishName.split('<br/>').map(item => {
      return item.replace(/\d+\./g, (match) => {
        const num = match.replace('.', '');
        if (allergyMapping[num]) {
          allergySet.add(allergyMapping[num]);
        }
        return '';
      }).trim();
    }).filter(Boolean);
    
    return { 
      menuItems, 
      allergies: Array.from(allergySet)
    };
  }

  /**
   * 영양 정보 파싱
   */
  private parseNutritionInfo(nutritionInfo: string): Record<string, string> {
    if (!nutritionInfo) {
      return {};
    }
    
    const result: Record<string, string> = {};
    const items = nutritionInfo.split(' ');
    
    items.forEach(item => {
      const match = item.match(/([^(]+)\(([^)]+)\)/);
      if (match) {
        result[match[1].trim()] = match[2].trim();
      }
    });
    
    return result;
  }

  /**
   * 원산지 정보 파싱
   */
  private parseOriginInfo(originInfo: string): Record<string, string> {
    if (!originInfo) {
      return {};
    }
    
    const result: Record<string, string> = {};
    const items = originInfo.split(' ');
    
    items.forEach(item => {
      const match = item.match(/([^(]+)\(([^)]+)\)/);
      if (match) {
        result[match[1].trim()] = match[2].trim();
      }
    });
    
    return result;
  }
}

export default new MealService(); 