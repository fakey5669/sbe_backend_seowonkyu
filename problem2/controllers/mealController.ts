import { Request, Response } from 'express';
import axios from 'axios';
import * as mealModel from '../models/mealModel';

// API 키와 기본 파라미터
const API_KEY = 'b75bf16a842a41d9b78cf30644ea3259'; // 실제 운영 시 환경 변수에서 가져오는 것이 좋습니다

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

// 학교 이름으로 주간 급식 정보 조회 (통합 기능)
export const getMealsBySchoolName = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schoolName, startDate, endDate } = req.query;
    
    // 필수 파라미터 검증
    if (!schoolName) {
      res.status(400).json({ 
        success: false, 
        message: '학교 이름은 필수 항목입니다.' 
      });
      return;
    }
    
    // 날짜 기본값 설정 (startDate와 endDate가 없는 경우 현재 월의 전체 기간으로 설정)
    let queryStartDate = startDate as string;
    let queryEndDate = endDate as string;
    
    if (!queryStartDate || !queryEndDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      // 현재 월의 첫날
      const firstDay = new Date(year, month - 1, 1);
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
    
    const schoolResponse = await axios.get(schoolInfoUrl, { params: schoolParams });
    
    // 학교 검색 결과 확인
    if (schoolResponse.data.RESULT && schoolResponse.data.RESULT.CODE === 'INFO-200') {
      res.status(200).json({
        success: true,
        message: '검색 결과가 없습니다.',
        data: []
      });
      return;
    }
    
    // 학교 정보 추출
    const schools = schoolResponse.data.schoolInfo[1].row;
    
    if (!schools || schools.length === 0) {
      res.status(200).json({
        success: true,
        message: '검색된 학교가 없습니다.',
        data: []
      });
      return;
    }
    
    // 고등학교만 필터링
    const highSchools = schools.filter((school: any) => school.SCHUL_KND_SC_NM === '고등학교');
    
    if (highSchools.length === 0) {
      res.status(200).json({
        success: true,
        message: '검색된 고등학교가 없습니다.',
        data: []
      });
      return;
    }
    
    // 첫 번째 고등학교 선택 (여러 개가 검색될 경우)
    const selectedSchool = highSchools[0];
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
        const { menu, allergies } = mealModel.parseMenuItems(meal.DDISH_NM);
        
        // 알레르기 정보를 코드에서 이름으로 변환
        const allergyNames = allergies.map(code => {
          const codes = code.split('.');
          return codes.map(c => mealModel.getAllergyName(c));
        }).flat();
        
        return {
          type: meal.MMEAL_SC_NM,
          menu,
          allergies: allergyNames
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
      schoolInfo: {
        name: selectedSchool.SCHUL_NM,
        code: schoolCode,
        officeCode: officeCode,
        officeName: selectedSchool.ATPT_OFCDC_SC_NM,
        address: selectedSchool.ORG_RDNMA
      },
      data: weeklyMeals
    });
  } catch (error) {
    console.error('학교 이름으로 급식 정보 조회 중 오류 발생:', error);
    res.status(500).json({
      success: false,
      message: '급식 정보를 가져오는데 실패했습니다.'
    });
  }
}; 