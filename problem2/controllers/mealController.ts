import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import * as mealModel from '../models/mealModel';

/**
 * 환경 변수 설정
 */
const API_KEY = 'b75bf16a842a41d9b78cf30644ea3259'; // 공개되도 상관없고 git엔 .env올리기를 지양해 하드코딩. 만약 운영이라면 환경변수나 secret key로 관리

/**
 * 학교 정보 인터페이스
 */
interface SchoolInfo {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  SCHUL_KND_SC_NM: string;
  ORG_RDNMA: string;
  [key: string]: string;
}

/**
 * 학교 API 응답 인터페이스
 */
interface SchoolApiResponse {
  schoolInfo?: Array<{
    head: Array<{
      list_total_count: number;
      RESULT: Array<{
        CODE: string;
        MESSAGE: string;
      }>;
    }>;
    row?: SchoolInfo[];
  }>;
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

/**
 * 학교 정보 결과 인터페이스
 */
interface SchoolInfoResult {
  name: string;
  code: string;
  officeCode: string;
  officeName: string;
  address: string;
}

/**
 * API 응답 인터페이스
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  schoolInfo?: SchoolInfoResult;
  data?: T;
}

/**
 * 학교 이름으로 주간 급식 정보 조회 (통합 기능)
 * @param req Express 요청 객체
 * @param res Express 응답 객체
 */
export const getMealsBySchoolName = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schoolName, startDate, endDate } = req.query;
    
    // 필수 파라미터 검증
    if (!schoolName) {
      const errorResponse: ApiResponse<null> = { 
        success: false, 
        message: '학교 이름은 필수 항목입니다.' 
      };
      res.status(400).json(errorResponse);
      return;
    }
    
    // 날짜 기본값 설정 (startDate와 endDate가 없는 경우 현재 월의 전체 기간으로 설정)
    let queryStartDate = startDate as string;
    let queryEndDate = endDate as string;
    
    if (!queryStartDate || !queryEndDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      // 현재 월의 마지막날
      const lastDay = new Date(year, month, 0);
      
      queryStartDate = `${year}${month.toString().padStart(2, '0')}01`;
      queryEndDate = `${year}${month.toString().padStart(2, '0')}${lastDay.getDate().toString().padStart(2, '0')}`;
    }
    
    // 1. 학교 코드 검색
    const schoolInfoUrl = 'https://open.neis.go.kr/hub/schoolInfo';
    const schoolParams = {
      KEY: API_KEY,
      Type: 'json',
      pIndex: 1,
      pSize: 100,
      SCHUL_NM: schoolName
    };
    
    const schoolResponse: AxiosResponse<SchoolApiResponse> = await axios.get(schoolInfoUrl, { params: schoolParams });
    
    // 학교 검색 결과 확인
    if (schoolResponse.data.RESULT && schoolResponse.data.RESULT.CODE === 'INFO-200') {
      const emptyResponse: ApiResponse<mealModel.WeeklyMealWithAllergy[]> = {
        success: true,
        message: '검색 결과가 없습니다.',
        data: []
      };
      res.status(200).json(emptyResponse);
      return;
    }
    
    // 학교 정보 추출
    const schoolInfo = schoolResponse.data.schoolInfo;
    if (!schoolInfo || !Array.isArray(schoolInfo) || schoolInfo.length < 2) {
      const errorResponse: ApiResponse<mealModel.WeeklyMealWithAllergy[]> = {
        success: true,
        message: '학교 정보를 가져오는데 실패했습니다.',
        data: []
      };
      res.status(200).json(errorResponse);
      return;
    }
    
    const schools = schoolInfo[1].row;
    
    if (!schools || schools.length === 0) {
      const emptyResponse: ApiResponse<mealModel.WeeklyMealWithAllergy[]> = {
        success: true,
        message: '검색된 학교가 없습니다.',
        data: []
      };
      res.status(200).json(emptyResponse);
      return;
    }
    
    // 첫 번째 학교 선택 (여러 개가 검색될 경우)
    const selectedSchool = schools[0];
    const schoolCode = selectedSchool.SD_SCHUL_CODE;
    const officeCode = selectedSchool.ATPT_OFCDC_SC_CODE;
    
    // 2. 급식 정보 조회
    const params: mealModel.MealApiParams = {
      KEY: API_KEY,
      Type: 'json',
      pIndex: 1,
      pSize: 100,
      ATPT_OFCDC_SC_CODE: officeCode,
      SD_SCHUL_CODE: schoolCode,
      MLSV_FROM_YMD: queryStartDate,
      MLSV_TO_YMD: queryEndDate
    };
    
    const mealData = await mealModel.getMealInfo(params);
    
    // 주간 급식 정보 가공
    const weeklyMeals: mealModel.WeeklyMealWithAllergy[] = [];
    
    // 날짜별로 그룹화
    const mealsByDate = mealData.reduce<Record<string, mealModel.MealInfo[]>>((acc, meal) => {
      const date = meal.MLSV_YMD;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(meal);
      return acc;
    }, {});
    
    // 날짜별로 가공
    Object.entries(mealsByDate).forEach(([date, meals]) => {
      const dayOfWeek = mealModel.getDayOfWeek(date);
      
      const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
      
      const processedMeals = meals.map(meal => {
        const { menu, allergies } = mealModel.parseMenuItems(
          meal.DDISH_NM,
          meal.CAL_INFO,    // 칼로리 정보 추가
          meal.NTR_INFO,    // 영양 정보 추가
          meal.ORPLC_INFO   // 원산지 정보 추가
        );
        
        // 원본 알레르기 코드를 그대로 유지 (이름으로 변환하지 않음)
        return {
          type: meal.MMEAL_SC_NM,
          menu,
          allergies: allergies,
          calInfo: meal.CAL_INFO,    // 칼로리 정보 추가
          ntrInfo: meal.NTR_INFO,    // 영양 정보 추가
          orplcInfo: meal.ORPLC_INFO // 원산지 정보 추가
        };
      });
      
      weeklyMeals.push({
        date: formattedDate,
        dayOfWeek,
        meals: processedMeals
      });
    });
    
    // 날짜순으로 정렬
    weeklyMeals.sort((a, b) => a.date.localeCompare(b.date));
    
    // 응답 데이터 구성
    const schoolInfoResult: SchoolInfoResult = {
      name: selectedSchool.SCHUL_NM,
      code: schoolCode,
      officeCode: officeCode,
      officeName: selectedSchool.ATPT_OFCDC_SC_NM,
      address: selectedSchool.ORG_RDNMA
    };
    
    const successResponse: ApiResponse<mealModel.WeeklyMealWithAllergy[]> = {
      success: true,
      schoolInfo: schoolInfoResult,
      data: weeklyMeals
    };
    
    res.status(200).json(successResponse);
  } catch (error) {
    console.error('학교 이름으로 급식 정보 조회 중 오류 발생:', error);
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: '급식 정보를 가져오는데 실패했습니다.'
    };
    
    res.status(500).json(errorResponse);
  }
}; 