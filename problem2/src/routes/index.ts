import { Router } from 'express';

import Paths from '../common/constants/Paths';
import MealRoutes from './MealRoutes';


/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();


// ** Add MealRouter ** //

// Init router
const mealRouter = Router();

// Set meal routes
mealRouter.get(Paths.Meals.Get, MealRoutes.getAll);
mealRouter.get(Paths.Meals.WeeklySummary, MealRoutes.getWeeklySummary);

// Add MealRouter
apiRouter.use(Paths.Meals.Base, mealRouter);


/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
