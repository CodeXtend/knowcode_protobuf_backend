import express from "express";
import * as wasteController from "../controllers/wasteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// // Public routes
// router.get('/search', wasteController.searchWaste);
// router.get('/:id', wasteController.getWaste);

// // Protected routes
// router.use(checkJwt);

// // Seller only routes - requires both authentication and seller role
// router.use(checkRole('seller'));

router.post("/add", authMiddleware, wasteController.createWasteEntry);
// router.get('/my-listings', wasteController.getMyWaste);
// router.patch('/:id', wasteController.updateWaste);
// router.delete('/:id', wasteController.deleteWaste);

export default router;
