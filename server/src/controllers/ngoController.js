import { db } from "../db/db.js";
import { donations, users, ngoRequests } from "../db/schema.js";
import { eq, desc, count, and } from "drizzle-orm";

// GET all donor donations (visible to NGOs)
export const getDonorRequests = async (req, res) => {
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
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .orderBy(desc(donations.createdAt));

    return res.status(200).json({ requests: list });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PATCH — NGO accepts a donation offer
export const acceptDonation = async (req, res) => {
  try {
    const donationId = parseInt(req.params.id);

    const [donation] = await db
      .select()
      .from(donations)
      .where(eq(donations.id, donationId));

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    const [updated] = await db
      .update(donations)
      .set({ status: "ACCEPTED" })
      .where(eq(donations.id, donationId))
      .returning();

    return res.status(200).json({
      message: "Donation accepted successfully.",
      donation: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PATCH — NGO denies a donation offer
export const denyDonation = async (req, res) => {
  try {
    const donationId = parseInt(req.params.id);

    const [donation] = await db
      .select()
      .from(donations)
      .where(eq(donations.id, donationId));

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    const [updated] = await db
      .update(donations)
      .set({ status: "COMPLETED" })
      .where(eq(donations.id, donationId))
      .returning();

    return res.status(200).json({
      message: "Donation denied.",
      donation: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PATCH — NGO marks a donation as picked up
export const markPickedUp = async (req, res) => {
  try {
    const donationId = parseInt(req.params.id);

    const [updated] = await db
      .update(donations)
      .set({ status: "PICKED_UP" })
      .where(eq(donations.id, donationId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Donation not found." });
    }

    return res.status(200).json({
      message: "Donation marked as picked up.",
      donation: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PATCH — NGO marks a donation as completed
export const markDonationCompleted = async (req, res) => {
  try {
    const donationId = parseInt(req.params.id);

    const [updated] = await db
      .update(donations)
      .set({ status: "COMPLETED" })
      .where(eq(donations.id, donationId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Donation not found." });
    }

    return res.status(200).json({
      message: "Donation completed.",
      donation: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// POST — NGO creates a new request
export const createNgoRequest = async (req, res) => {
  try {
    const ngoId = req.user.id;
    const { title, description, urgency, quantity } = req.body;

    const [newRequest] = await db
      .insert(ngoRequests)
      .values({
        ngoId,
        title,
        description: description || "",
        urgency,
        quantity,
        status: "PENDING",
      })
      .returning();

    return res.status(201).json({
      message: "Request created successfully.",
      request: newRequest,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET — NGO fetches its own requests
export const getMyNgoRequests = async (req, res) => {
  try {
    const ngoId = req.user.id;

    const list = await db
      .select()
      .from(ngoRequests)
      .where(eq(ngoRequests.ngoId, ngoId))
      .orderBy(desc(ngoRequests.createdAt));

    return res.status(200).json({ requests: list });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET — NGO dashboard stats
export const getNgoDashboardStats = async (req, res) => {
  try {
    const ngoId = req.user.id;

    // Total requests posted by this NGO
    const [requestCount] = await db
      .select({ total: count() })
      .from(ngoRequests)
      .where(eq(ngoRequests.ngoId, ngoId));

    // Pending (active) requests only
    const [pendingCount] = await db
      .select({ total: count() })
      .from(ngoRequests)
      .where(and(eq(ngoRequests.ngoId, ngoId), eq(ngoRequests.status, "PENDING")));

    // Total available donations from all donors (PENDING ones)
    const [donationCount] = await db
      .select({ total: count() })
      .from(donations)
      .where(eq(donations.status, "PENDING"));

    // Recent requests for activity feed
    const recentRequests = await db
      .select()
      .from(ngoRequests)
      .where(eq(ngoRequests.ngoId, ngoId))
      .orderBy(desc(ngoRequests.createdAt))
      .limit(5);

    return res.status(200).json({
      stats: {
        totalRequests: requestCount?.total || 0,
        activeRequests: pendingCount?.total || 0,
        availableDonations: donationCount?.total || 0,
      },
      recentActivity: recentRequests,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
