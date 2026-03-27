import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { createDonation, getMyDonations, getNgoRequests, getDashboardStats, fulfillNgoRequest, updateDonationStatus } from "../controllers/donorController.js";
import { getDonorRequests, createNgoRequest, getMyNgoRequests, getNgoDashboardStats, acceptDonation, denyDonation, markPickedUp, markDonationCompleted } from "../controllers/ngoController.js";
import { getAllUsers, getAdminDashboardStats, getAllDonations, getAllNgoRequests, deleteUser, adminUpdateDonationStatus, adminUpdateNgoRequestStatus } from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createDonationSchema } from "../schemas/donorSchema.js";
import { createNgoRequestSchema } from "../schemas/ngoSchema.js";
import { updateProfileSchema } from "../schemas/profileSchema.js";

const router = Router();

// Profile API: basic info & role-specific data
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, validate(updateProfileSchema), updateProfile);

// ─── Donor API ───
router.post(
  "/donor/request", 
  authenticate, 
  authorize("DONOR"), 
  validate(createDonationSchema), 
  createDonation
);
router.get("/donor/my-donations", authenticate, authorize("DONOR"), getMyDonations);
router.get("/donor/ngo-requests", authenticate, authorize("DONOR"), getNgoRequests);
router.get("/donor/dashboard-stats", authenticate, authorize("DONOR"), getDashboardStats);
router.patch("/donor/fulfill-request/:id", authenticate, authorize("DONOR"), fulfillNgoRequest);
router.patch("/donor/donation-status/:id", authenticate, authorize("DONOR"), updateDonationStatus);

// ─── NGO API ───
router.get("/ngo/donor-requests", authenticate, authorize("NGO"), getDonorRequests);
router.post(
  "/ngo/create-request",
  authenticate,
  authorize("NGO"),
  validate(createNgoRequestSchema),
  createNgoRequest
);
router.get("/ngo/my-requests", authenticate, authorize("NGO"), getMyNgoRequests);
router.get("/ngo/dashboard-stats", authenticate, authorize("NGO"), getNgoDashboardStats);
router.patch("/ngo/accept-donation/:id", authenticate, authorize("NGO"), acceptDonation);
router.patch("/ngo/deny-donation/:id", authenticate, authorize("NGO"), denyDonation);
router.patch("/ngo/pickup-donation/:id", authenticate, authorize("NGO"), markPickedUp);
router.patch("/ngo/complete-donation/:id", authenticate, authorize("NGO"), markDonationCompleted);

// ─── Admin API ───
router.get("/admin/users", authenticate, authorize("ADMIN"), getAllUsers);
router.get("/admin/dashboard-stats", authenticate, authorize("ADMIN"), getAdminDashboardStats);
router.get("/admin/donations", authenticate, authorize("ADMIN"), getAllDonations);
router.get("/admin/ngo-requests", authenticate, authorize("ADMIN"), getAllNgoRequests);
router.delete("/admin/users/:id", authenticate, authorize("ADMIN"), deleteUser);
router.patch("/admin/donation-status/:id", authenticate, authorize("ADMIN"), adminUpdateDonationStatus);
router.patch("/admin/ngo-request-status/:id", authenticate, authorize("ADMIN"), adminUpdateNgoRequestStatus);

export default router;
