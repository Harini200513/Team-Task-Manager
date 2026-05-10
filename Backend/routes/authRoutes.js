import express from 'express';
import { loginUser, registerUser, logoutUser, forgotPassword, resetPassword, verifyOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/verify-otp', verifyOTP);

export default router;
