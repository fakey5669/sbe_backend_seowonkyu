import { Request, Response, NextFunction } from 'express';
import * as mealController from './mealController';
import { ALLERGY_CODES } from '../models/mealModel';

// 메인 페이지 렌더링
export const renderMainPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.render('index', { 
      title: '고등학교 급식 정보 조회',
      ALLERGY_CODES
    });
  } catch (error) {
    console.error('메인 페이지 로딩 중 오류 발생:', error);
    next(error);
  }
};