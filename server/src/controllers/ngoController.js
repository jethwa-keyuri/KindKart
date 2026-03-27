import { db } from "../db/db.js";
import { donations, users, ngoRequests } from "../db/schema.js";
import { eq, desc, count, and, gte, lte, ilike, or } from "drizzle-orm";
import { writeLog } from "./fulfillmentController.js";

// GET all donor donations (visible to NGOs) — with filtering
export const getDonorRequests = async (req, res) => {
  try {
    const { search, foodType, status, timeWindow, location } = req.query;
    const conditions = [];

    // Food type filter
    if (foodType) {
      conditions.push(ilike(donations.foodType, `%${foodType}%`));
    }

    // Status filter
    if (status) {
      conditions.push(eq(donations.status, status));
    }

    // Time window filter (based on expiry)
    const now = new Date();
    if (timeWindow === 'active') {
      conditions.push(gte(donations.expiryTime, now));
    } else if (timeWindow === 'expiring') {
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      conditions.push(gte(donations.expiryTime, now));
      conditions.push(lte(donations.expiryTime, in24h));
    } else if (timeWindow === 'expired') {
      conditions.push(lte(donations.expiryTime, now));
    }

    // Location filter
    if (location) {
      conditions.push(ilike(donations.location, `%${location}%`));
    }

    // Search filter (food type or description or donor name)
    if (search) {
      conditions.push(
        or(
          ilike(donations.foodType, `%${search}%`),
          ilike(donations.description, `%${search}%`),
          ilike(donations.location, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
      .where(whereClause)
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

    await writeLog({
      donationId,
      action: "ACCEPTED",
      performedBy: req.user.id,
      notes: `Donation accepted by NGO.`,
    });

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

    await writeLog({
      donationId,
      action: "DENIED",
      performedBy: req.user.id,
      notes: `Donation denied by NGO.`,
    });

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

    await writeLog({
      donationId,
      action: "PICKED_UP",
      performedBy: req.user.id,
      notes: `Donation marked as picked up by NGO.`,
    });

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

    await writeLog({
      donationId,
      action: "COMPLETED",
      performedBy: req.user.id,
      notes: `Donation marked as completed by NGO.`,
    });

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
