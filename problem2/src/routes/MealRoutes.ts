import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import mealService from '../services/mealService';
import HttpException from '../models/HttpException';

/**
 * 주간 급식 요약 정보 API
 */
function getWeeklySummary(req: Request, res: Response, next: NextFunction) {
  (async () => {
    try {
      const { educationCode, schoolCode, startDate, endDate } = req.query;
      
      // 필수 파라미터 검증
      if (!educationCode || !schoolCode) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST, 
          '시도교육청코드(educationCode)와 학교코드(schoolCode)는 필수 입력값입니다.'
        );
      }

      // 날짜 파라미터가 없는 경우 이번 주 월요일부터 금요일까지로 설정
      const params: {
        educationCode: string;
        schoolCode: string;
        startDate?: string;
        endDate?: string;
      } = {
        educationCode: educationCode as string,
        schoolCode: schoolCode as string
      };

      if (startDate) {
        params.startDate = startDate as string;
      } else {
        // 이번 주 월요일 계산
        const today = new Date();
        const day = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
        const diff = day === 0 ? -6 : 1 - day; // 월요일로 설정
        
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        
        params.startDate = monday.toISOString().slice(0, 10).replace(/-/g, '');
      }

      if (endDate) {
        params.endDate = endDate as string;
      } else if (!endDate && !startDate) {
        // 시작일이 주어지지 않았을 때만 이번 주 금요일 계산
        const today = new Date();
        const day = today.getDay();
        const diff = day === 0 ? -2 : 5 - day; // 금요일로 설정
        
        const friday = new Date(today);
        friday.setDate(today.getDate() + diff);
        
        params.endDate = friday.toISOString().slice(0, 10).replace(/-/g, '');
      }

      // 주간 급식 요약 정보 조회
      const weeklyMealSummary = await mealService.getWeeklyMealSummary(params);

      // 응답
      return res.status(StatusCodes.OK).json({
        success: true,
        data: weeklyMealSummary
      });
    } catch (error) {
      next(error);
    }
  })();
}

/**
 * 급식 정보 조회 API
 */
function getAll(req: Request, res: Response, next: NextFunction) {
  (async () => {
    try {
      const { educationCode, schoolCode, date, startDate, endDate, mealType } = req.query;
      
      // 필수 파라미터 검증
      if (!educationCode || !schoolCode) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST, 
          '시도교육청코드(educationCode)와 학교코드(schoolCode)는 필수 입력값입니다.'
        );
      }

      // 날짜 파라미터 검증
      if (!date && !startDate && !endDate) {
        // 기본값으로 오늘 날짜 설정
        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, '');
        
        const mealData = await mealService.getMealInfo({
          educationCode: educationCode as string,
          schoolCode: schoolCode as string,
          date: formattedDate,
          mealType: mealType as string
        });

        return res.status(StatusCodes.OK).json({
          success: true,
          data: mealData
        });
      }

      // 파라미터 설정
      const params = {
        educationCode: educationCode as string,
        schoolCode: schoolCode as string,
        date: date as string,
        startDate: startDate as string,
        endDate: endDate as string,
        mealType: mealType as string
      };

      // 급식 정보 조회
      const mealData = await mealService.getMealInfo(params);

      if (mealData.length === 0) {
        return res.status(StatusCodes.OK).json({
          success: true,
          message: '해당 조건에 맞는 급식 정보가 없습니다.',
          data: []
        });
      }

      // 응답
      return res.status(StatusCodes.OK).json({
        success: true,
        data: mealData
      });
    } catch (error) {
      next(error);
    }
  })();
}

// Export default
export default {
  getAll,
  getWeeklySummary,
} as const; 