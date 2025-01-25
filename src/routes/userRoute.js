import express from 'express';
import { registerAfterAuth0, getUserProfile, verifyUserExists, getUserData } from '../controllers/userController.js';

const router = express.Router();

router.post('/verify', verifyUserExists);
router.post(
  "/register/complete",
  registerAfterAuth0
);
router.get('/profile', getUserProfile);
router.get('/data/:auth0Id', getUserData);

export default router;
