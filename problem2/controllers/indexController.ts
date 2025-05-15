import { Request, Response, NextFunction } from 'express';
import { ALLERGY_CODES } from '../models/mealModel';

/**
 * 인덱스 페이지 데이터 인터페이스
 */
interface IndexPageData {
  title: string;
  ALLERGY_CODES: Record<string, string>;
}

/**
 * 인덱스 컨트롤러 클래스
 */
class IndexController {
  /**
   * 메인 페이지 렌더링
   * @param req Express 요청 객체
   * @param res Express 응답 객체
   * @param next Express 다음 미들웨어 함수
   */
  public renderMainPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pageData: IndexPageData = {
        title: '학교 급식 정보 조회',
        ALLERGY_CODES
      };
      
      res.render('index', pageData);
    } catch (error) {
      console.error('메인 페이지 로딩 중 오류 발생:', error);
      next(error);
    }
  };
}

// 컨트롤러 인스턴스 생성 및 메서드 내보내기
const indexController = new IndexController();
export const renderMainPage = indexController.renderMainPage;