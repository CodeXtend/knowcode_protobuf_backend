import express from 'express';
import * as userController from '../controllers/userController.js';
import { checkJwt } from '../config/auth0Config.js';

const router = express.Router();

// Public routes (if any)

// Protected routes - require Auth0 authentication
router.use(checkJwt);

router.post('/register/complete', userController.registerAfterAuth0);
router.get('/profile', userController.getUserProfile);
router.patch('/profile', userController.updateUserProfile);
router.delete('/profile', userController.deleteUserProfile);

export default router;
