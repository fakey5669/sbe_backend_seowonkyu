import express, { Router } from 'express';
import * as indexController from '../controllers/indexController';

/**
 * 인덱스 라우터 인터페이스
 */
interface IndexRouterInterface {
  getHomePage(): Router;
}

/**
 * 인덱스 라우터 클래스
 */
class IndexRouter implements IndexRouterInterface {
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
    this.getHomePage();
  }

  /**
   * 홈페이지 라우트
   * @route   GET /
   * @desc    메인 페이지 렌더링
   * @access  Public
   */
  public getHomePage(): Router {
    this.router.get('/', indexController.renderMainPage);
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
const indexRouter = new IndexRouter();
export default indexRouter.getRouter(); 