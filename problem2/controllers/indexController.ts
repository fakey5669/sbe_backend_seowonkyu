import { Request, Response, NextFunction } from 'express';
import * as mealController from './mealController';
import { ALLERGY_CODES } from '../models/mealModel';

// 메인 페이지 렌더링
export const renderMainPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 경기도교육청 코드와 경기도 소재 고등학교 코드 (수원고등학교)
    const officeCode = 'J10';
    const schoolCode = '7530336';
    
    // 날짜 범위 설정 (2023년 5월 첫째 주)
    const startDate = '20230501'; // 2023년 5월 1일 (월)
    const endDate = '20230505';   // 2023년 5월 5일 (금)
    
    // 주간 급식 정보 가져오기
    const weeklyMealData = await mealController.getWeeklyMealDataForMain(officeCode, schoolCode, startDate, endDate);
    
    res.render('index', { 
      title: '학교 급식 주간 알레르기 정보 서비스', 
      weeklyMealData,
      schoolInfo: {
        name: '수원고등학교',
        officeCode,
        schoolCode
      },
      dateRange: {
        start: formatDisplayDate(startDate),
        end: formatDisplayDate(endDate)
      },
      ALLERGY_CODES
    });
  } catch (error) {
    console.error('메인 페이지 로딩 중 오류 발생:', error);
    res.render('index', { 
      title: '학교 급식 주간 알레르기 정보 서비스',
      error: '급식 정보를 불러오는데 실패했습니다.',
      ALLERGY_CODES
    });
  }
};

// YYYY-MM-DD 형식으로 표시용 날짜 포맷팅
function formatDisplayDate(dateString: string): string {
  return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
} 