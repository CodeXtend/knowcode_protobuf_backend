import express from "express";
import * as userController from "../controllers/userController.js";
const router = express.Router();

router.post(
  "/register/complete",
  userController.registerAfterAuth0
);
router.get('/profile', userController.getUserProfile);

export default router;
