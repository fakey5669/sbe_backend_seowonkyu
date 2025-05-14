import express, { Router } from 'express';
import * as mealController from '../controllers/mealController';

/**
 * 급식 라우터 인터페이스
 */
interface MealRouterInterface {
  getMealAndAllergy(): Router;
}

/**
 * 급식 라우터 클래스
 */
class MealRouter implements MealRouterInterface {
  private router: Router;

  /**
   * 라우터 초기화
   */
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  /**
   * 라우트 초기화
   */
  private initializeRoutes(): void {
    this.getMealAndAllergy();
  }

  /**
   * 급식 및 알레르기 정보 조회 라우트
   * @route   GET /api/meals/highSchoolMealAndAllergy
   * @desc    학교 이름으로 급식 정보 조회 (통합 기능)
   * @params  schoolName, [startDate], [endDate]
   * @access  Public
   */
  public getMealAndAllergy(): Router {
    this.router.get('/highSchoolMealAndAllergy', mealController.getMealsBySchoolName);
    return this.router;
  }

  /**
   * 라우터 반환
   */
  public getRouter(): Router {
    return this.router;
  }
}

// 라우터 인스턴스 생성 및 내보내기
const mealRouter = new MealRouter();
export default mealRouter.getRouter(); 