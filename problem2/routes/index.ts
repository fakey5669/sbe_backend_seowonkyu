import express from 'express';
import * as indexController from '../controllers/indexController';

const router = express.Router();

/* GET home page. */
router.get('/', indexController.renderMainPage);

export default router; 