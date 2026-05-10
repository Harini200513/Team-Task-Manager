import express from 'express';
import {
  getUsers,
  getUserProfile,
  updateUserProfile,
  updateUserRole,
  deleteUser
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getUsers);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/:id').delete(protect, admin, deleteUser);
router.route('/:id/role')
  .put(protect, admin, updateUserRole);

export default router;
