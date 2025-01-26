import express from "express";
import * as wasteController from "../controllers/wasteController.js";

const router = express.Router();

// Analytics and stats routes (place these BEFORE the :id route)
router.get('/stats', wasteController.getWasteStats);
router.get('/analytics/monthly', wasteController.getMonthlyAnalytics);

// Public routes
router.get('/search', wasteController.searchWaste);
router.post('/add', wasteController.createWasteEntry);
router.get('/all', wasteController.getAllWaste);
router.get('/impact', wasteController.getEnvironmentalImpact);
router.get('/map', wasteController.getMapData);

// Parameter route should be last
router.get('/:id', wasteController.getWaste);

export default router;
