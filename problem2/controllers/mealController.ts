import { Request, Response } from 'express';
import axios from 'axios';
import * as mealModel from '../models/mealModel';

// API 키와 기본 파라미터
const API_KEY = 'b75bf16a842a41d9b78cf30644ea3259'; // 실제 운영 시 환경 변수에서 가져오는 것이 좋습니다

// 학교 급식 정보 가져오기
export const getMealInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      schoolCode, 
      officeCode, 
      mealCode, 
      date 
    } = req.query;
    
    // 필수 파라미터 검증
    if (!schoolCode || !officeCode) {
      res.status(400).json({ 
        success: false, 
        message: '학교 코드와 교육청 코드는 필수 항목입니다.' 
      });
      return;
    }
    
    const params: mealModel.MealApiParams = {
      KEY: API_KEY,
      Type: 'json',
      pIndex: 1,
      pSize: 100,
      ATPT_OFCDC_SC_CODE: officeCode as string,
      SD_SCHUL_CODE: schoolCode as string
    };
    
    // 선택적 파라미터 추가
    if (mealCode) params.MMEAL_SC_CODE = mealCode as string;
    if (date) params.MLSV_YMD = date as string;
    
    const mealData = await mealModel.getMealInfo(params);
    
    res.status(200).json({
      success: true,
      data: mealData
    });
  } catch (error) {
    console.error('급식 정보 조회 중 오류 발생:', error);
    res.status(500).json({
      success: false,
      message: '급식 정보를 가져오는데 실패했습니다.'
    });
  }
};

// 학교 코드 검색 API
export const findSchoolCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schoolName } = req.query;
    
    if (!schoolName) {
      res.status(400).json({ 
        success: false, 
        message: '학교 이름은 필수 항목입니다.' 
      });
      return;
    }
    
    // 학교 정보 API URL (나이스 학교 정보 API)
    const schoolInfoUrl = 'https://open.neis.go.kr/hub/schoolInfo';
    
    // API 요청 파라미터
    const params = {
      KEY: API_KEY,
      Type: 'json',
      pIndex: 1,
      pSize: 100,
      SCHUL_NM: schoolName
    };
    
    const response = await axios.get(schoolInfoUrl, { params });
    
    // 응답 데이터 확인
    if (response.data.RESULT && response.data.RESULT.CODE === 'INFO-200') {
      // 검색 결과가 없는 경우
      res.status(200).json({
        success: true,
        message: '검색 결과가 없습니다.',
        data: []
      });
      return;
    }
    
    // 학교 정보 추출
    const schools = response.data.schoolInfo[1].row.map((school: any) => ({
      schoolCode: school.SD_SCHUL_CODE,
      schoolName: school.SCHUL_NM,
      officeCode: school.ATPT_OFCDC_SC_CODE,
      officeName: school.ATPT_OFCDC_SC_NM,
      schoolType: getSchoolType(school.SCHUL_KND_SC_NM),
      address: school.ORG_RDNMA
    }));
    
    res.status(200).json({
      success: true,
      data: schools
    });
  } catch (error) {
    console.error('학교 코드 검색 중 오류 발생:', error);
    res.status(500).json({
      success: false,
      message: '학교 코드를 검색하는데 실패했습니다.'
    });
  }
};

// 학교 유형 한글명을 코드로 변환
function getSchoolType(schoolTypeName: string): string {
  switch (schoolTypeName) {
    case '초등학교':
      return 'elementary';
    case '중학교':
      return 'middle';
    case '고등학교':
      return 'high';
    case '특수학교':
      return 'special';
    default:
      return 'other';
  }
}

// 주간 급식 정보 가져오기 (알레르기 정보 포함)
export const getWeeklyMealWithAllergy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      schoolCode, 
      officeCode, 
      startDate, 
      endDate 
    } = req.query;
    
    // 필수 파라미터 검증
    if (!schoolCode || !officeCode || !startDate || !endDate) {
      res.status(400).json({ 
        success: false, 
        message: '학교 코드, 교육청 코드, 시작일, 종료일은 필수 항목입니다.' 
      });
      return;
    }
    
    // 미래 날짜 검증 (2025년 이후 날짜는 현재 데이터가 없음)
    const currentYear = new Date().getFullYear();
    const requestYear = parseInt((startDate as string).substring(0, 4));
    
    if (requestYear > currentYear + 1) {
      console.log(`미래 날짜 요청 감지: ${startDate} ~ ${endDate} (현재 년도: ${currentYear})`);
      res.status(200).json({
        success: true,
        message: '해당 날짜의 급식 정보가 아직 등록되지 않았습니다.',
        data: []
      });
      return;
    }
    
    const params: mealModel.MealApiParams = {
      KEY: API_KEY,
      Type: 'json',
      pIndex: 1,
      pSize: 100,
      ATPT_OFCDC_SC_CODE: officeCode as string,
      SD_SCHUL_CODE: schoolCode as string,
      MLSV_FROM_YMD: startDate as string,
      MLSV_TO_YMD: endDate as string
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
        const { menu, allergies } = mealModel.parseMenuItems(meal.DDISH_NM);
        
        return {
          type: meal.MMEAL_SC_NM,
          menu,
          allergies
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
    
    res.status(200).json({
      success: true,
      data: weeklyMeals
    });
  } catch (error) {
    console.error('주간 급식 정보 조회 중 오류 발생:', error);
    res.status(500).json({
      success: false,
      message: '주간 급식 정보를 가져오는데 실패했습니다.'
    });
  }
};

// 메인 페이지용 주간 급식 알레르기 정보 가져오기
export const getWeeklyMealDataForMain = async (
  officeCode: string, 
  schoolCode: string, 
  startDate: string, 
  endDate: string
): Promise<mealModel.WeeklyMealWithAllergy[]> => {
  try {
    const params: mealModel.MealApiParams = {
      KEY: API_KEY,
      Type: 'json',
      pIndex: 1,
      pSize: 100,
      ATPT_OFCDC_SC_CODE: officeCode,
      SD_SCHUL_CODE: schoolCode,
      MLSV_FROM_YMD: startDate,
      MLSV_TO_YMD: endDate
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
        const { menu, allergies } = mealModel.parseMenuItems(meal.DDISH_NM);
        
        return {
          type: meal.MMEAL_SC_NM,
          menu,
          allergies
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
    
    return weeklyMeals;
  } catch (error) {
    console.error('주간 급식 정보 조회 중 오류 발생:', error);
    throw new Error('주간 급식 정보를 가져오는데 실패했습니다.');
  }
}; 