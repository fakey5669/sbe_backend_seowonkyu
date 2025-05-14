import express from 'express';
import * as mealController from '../controllers/mealController';

const router = express.Router();

/**
 * @route   GET /api/meals/mealAndAllergy
 * @desc    학교 이름으로 급식 정보 조회 (통합 기능)
 * @params  schoolName, [startDate], [endDate]
 * @access  Public
 */
router.get('/mealAndAllergy', mealController.getMealsBySchoolName);

export default router; 