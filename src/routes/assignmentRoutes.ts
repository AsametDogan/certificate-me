// src/routes/assignmentRoutes.ts

import { Router } from 'express';
import AssignmentController from '../controllers/AssignmentController';
import { authMiddleware } from '../middlewares/authMiddleware';



const assignmentRoutes: Router = Router();
const assignmentController = new AssignmentController();

assignmentRoutes.post('/', authMiddleware(["1"]), assignmentController.send);
assignmentRoutes.get('/mySent', authMiddleware(["1"]), assignmentController.getMySent);
assignmentRoutes.get('/myReceived', authMiddleware(["0"]), assignmentController.getMyReceived);






export default assignmentRoutes;
