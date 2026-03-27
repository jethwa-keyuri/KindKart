import { db } from "../db/db.js";
import { users, donations, ngoRequests, requests } from "../db/schema.js";
import { eq, count, desc, and } from "drizzle-orm";

// GET all users
export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        address: users.address,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return res.status(200).json({
      message: "Users fetched successfully.",
      totalUsers: allUsers.length,
      users: allUsers,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET admin dashboard stats
export const getAdminDashboardStats = async (req, res) => {
  try {
    // Count donors
    const [donorCount] = await db
      .select({ total: count() })
      .from(users)
      .where(eq(users.role, "DONOR"));

    // Count NGOs
    const [ngoCount] = await db
      .select({ total: count() })
      .from(users)
      .where(eq(users.role, "NGO"));

    // Total donations
    const [donationCount] = await db
      .select({ total: count() })
      .from(donations);

    // Pending donations
    const [pendingDonationCount] = await db
      .select({ total: count() })
      .from(donations)
      .where(eq(donations.status, "PENDING"));

    // Total NGO requests
    const [ngoReqCount] = await db
      .select({ total: count() })
      .from(ngoRequests);

    // Pending NGO requests
    const [pendingNgoReqCount] = await db
      .select({ total: count() })
      .from(ngoRequests)
      .where(eq(ngoRequests.status, "PENDING"));

    // Total users
    const [totalUserCount] = await db
      .select({ total: count() })
      .from(users);

    return res.status(200).json({
      stats: {
        totalUsers: totalUserCount?.total || 0,
        totalDonors: donorCount?.total || 0,
        totalNgos: ngoCount?.total || 0,
        totalDonations: donationCount?.total || 0,
        pendingDonations: pendingDonationCount?.total || 0,
        totalNgoRequests: ngoReqCount?.total || 0,
        pendingNgoRequests: pendingNgoReqCount?.total || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET all donations (admin view)
export const getAllDonations = async (req, res) => {
  try {
    const list = await db
      .select({
        id: donations.id,
        foodType: donations.foodType,
        quantity: donations.quantity,
        description: donations.description,
        expiryTime: donations.expiryTime,
        location: donations.location,
        status: donations.status,
        createdAt: donations.createdAt,
        donorName: users.name,
        donorEmail: users.email,
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .orderBy(desc(donations.createdAt));

    return res.status(200).json({ donations: list });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET all NGO requests (admin view)
export const getAllNgoRequests = async (req, res) => {
  try {
    const list = await db
      .select({
        id: ngoRequests.id,
        title: ngoRequests.title,
        description: ngoRequests.description,
        urgency: ngoRequests.urgency,
        quantity: ngoRequests.quantity,
        status: ngoRequests.status,
        createdAt: ngoRequests.createdAt,
        ngoName: users.name,
        ngoEmail: users.email,
      })
      .from(ngoRequests)
      .leftJoin(users, eq(ngoRequests.ngoId, users.id))
      .orderBy(desc(ngoRequests.createdAt));

    return res.status(200).json({ requests: list });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// DELETE user by id (admin only)
export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account." });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete related ngo_requests if NGO
    if (user.role === "NGO") {
      await db.delete(ngoRequests).where(eq(ngoRequests.ngoId, userId));
      await db.delete(requests).where(eq(requests.ngoId, userId));
    }

    // Delete related donations & requests if DONOR
    if (user.role === "DONOR") {
      // Get donation IDs first
      const donorDonations = await db.select({ id: donations.id }).from(donations).where(eq(donations.donorId, userId));
      const donationIds = donorDonations.map(d => d.id);
      
      // Delete requests linked to these donations
      for (const dId of donationIds) {
        await db.delete(requests).where(eq(requests.donationId, dId));
      }
      await db.delete(donations).where(eq(donations.donorId, userId));
    }

    // Delete the user
    await db.delete(users).where(eq(users.id, userId));

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PATCH update donation status (admin)
export const adminUpdateDonationStatus = async (req, res) => {
  try {
    const donationId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ["PENDING", "ASSIGNED", "ACCEPTED", "PICKED_UP", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const [updated] = await db
      .update(donations)
      .set({ status })
      .where(eq(donations.id, donationId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Donation not found." });
    }

    return res.status(200).json({
      message: `Donation status updated to ${status}.`,
      donation: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PATCH update NGO request status (admin)
export const adminUpdateNgoRequestStatus = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ["PENDING", "ASSIGNED", "ACCEPTED", "PICKED_UP", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const [updated] = await db
      .update(ngoRequests)
      .set({ status })
      .where(eq(ngoRequests.id, requestId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Request not found." });
    }

    return res.status(200).json({
      message: `Request status updated to ${status}.`,
      request: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
