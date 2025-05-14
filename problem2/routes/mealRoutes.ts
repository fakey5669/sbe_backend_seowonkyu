import express from 'express';
import * as mealController from '../controllers/mealController';

const router = express.Router();

/**
 * @route   GET /api/meals/school
 * @desc    학교 코드 검색 API
 * @params  schoolName
 * @access  Public
 */
router.get('/school', mealController.findSchoolCode);

/**
 * @route   GET /api/meals/weekly
 * @desc    주간 급식 정보 조회 (알레르기 정보 포함)
 * @params  schoolCode, officeCode, startDate, endDate
 * @access  Public
 */
router.get('/weekly', mealController.getWeeklyMealWithAllergy);

export default router; 