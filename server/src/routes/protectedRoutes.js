import { Router } from "express";
import { getProfile, getAdminData } from "../controllers/protectedController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Any authenticated user can access their profile
router.get("/profile", authenticate, getProfile);

// Only ADMIN role can access this route
router.get("/admin", authenticate, authorize("ADMIN"), getAdminData);

export default router;
