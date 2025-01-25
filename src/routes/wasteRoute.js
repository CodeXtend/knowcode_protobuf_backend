import express from "express";
import * as wasteController from "../controllers/wasteController.js";

const router = express.Router();

// // Public routes
// router.get('/search', wasteController.searchWaste);
// router.get('/:id', wasteController.getWaste);

// // Protected routes
// router.use(checkJwt);

// // Seller only routes - requires both authentication and seller role
// router.use(checkRole('seller'));

router.post("/add", wasteController.createWasteEntry);
// router.get('/my-listings', wasteController.getMyWaste);
// router.patch('/:id', wasteController.updateWaste);
// router.delete('/:id', wasteController.deleteWaste);

export default router;
