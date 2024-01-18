// src/routes/assignmentRoutes.ts

import { Router } from 'express';
import AssignmentController from '../controllers/AssignmentController';



const assignmentRoutes: Router = Router();
const assignmentController = new AssignmentController();

assignmentRoutes.post('/send', assignmentController.send);
assignmentRoutes.get('/mycreated', assignmentController.getMySent);
assignmentRoutes.get('/myreceived', assignmentController.getMyReceived);






export default assignmentRoutes;
