import express from "express";
import * as wasteController from "../controllers/wasteController.js";

const router = express.Router();

// Public routes
router.get('/search', wasteController.searchWaste);
router.get('/:id', wasteController.getWaste);
router.post('/add', wasteController.createWasteEntry);

// Analytics routes
router.get('/analytics/overview', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { message: 'Analytics endpoint' }
  });
});

export default router;
