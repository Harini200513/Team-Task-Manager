import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment
} from '../controllers/taskController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, admin, createTask);

router.route('/:id')
  .put(protect, admin, updateTask)
  .delete(protect, admin, deleteTask);

router.route('/status/:id')
  .patch(protect, updateTaskStatus);

router.route('/:id/comments')
  .post(protect, addComment);

export default router;
