import express from "express";
import * as wasteController from "../controllers/wasteController.js";

const router = express.Router();

// Analytics and stats routes (place these BEFORE the :id route)
router.get('/stats', wasteController.getWasteStats);
router.get('/analytics/monthly', wasteController.getMonthlyAnalytics);
router.get('/analytics/locations', wasteController.getLocationStats);

// Public routes
router.get('/search', wasteController.searchWaste);
router.post('/add', wasteController.createWasteEntry);
router.get('/all', wasteController.getAllWaste);
router.get('/impact', wasteController.getEnvironmentalImpact);
router.get('/map', wasteController.getMapData);

// Farmer specific routes
router.get('/farmer/:farmerId', wasteController.getFarmerWaste);
router.get('/my-waste', wasteController.getFarmerWaste); // For authenticated farmer's own waste

// Detail routes
router.get('/detail/:id', wasteController.getDetailedWaste);

// Waste management routes
router.patch('/:id/status', wasteController.updateWasteStatus);

// Parameter route should be last
router.get('/:id', wasteController.getWaste);

export default router;
