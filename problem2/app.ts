import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { HttpError } from 'http-errors';

import indexRouter from './routes/index';
import mealRoutes from './routes/mealRoutes';

/**
 * API 에러 응답 인터페이스
 */
interface ApiErrorResponse {
  success: boolean;
  message: string;
}

/**
 * Express 애플리케이션 생성
 */
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 설정
app.use('/', indexRouter);
app.use('/api/meals', mealRoutes);

/**
 * 404 에러 핸들러
 */
app.use((req: Request, res: Response, next: NextFunction): void => {
  next(createError(404));
});

/**
 * 글로벌 에러 핸들러
 */
app.use((err: HttpError, req: Request, res: Response, next: NextFunction): void => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // API 오류 응답
  const errorResponse: ApiErrorResponse = {
    success: false,
    message: err.message || '서버 오류가 발생했습니다.'
  };
  
  res.status(err.status || 500).json(errorResponse);
});

export default app; 