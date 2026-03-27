import { db } from "../db/db.js";
import { donations, requests, users, ngoRequests } from "../db/schema.js";
import { eq, desc, count, countDistinct } from "drizzle-orm";

export const createDonation = async (req, res) => {
  try {
    const donorId = req.user.id;
    const { foodType, quantity, description, expiryTime, location } = req.body;

    const [newDonation] = await db
      .insert(donations)
      .values({
        donorId,
        foodType,
        quantity,
        description,
        expiryTime: new Date(expiryTime),
        location,
        status: "PENDING",
      })
      .returning();

    // Fetch all NGOs
    const allNGOs = await db.select().from(users).where(eq(users.role, "NGO"));

    // Broadcast request to all NGOs
    if (allNGOs.length > 0) {
      const requestRecords = allNGOs.map((ngo) => ({
        donationId: newDonation.id,
        ngoId: ngo.id,
        status: "PENDING"
      }));
      await db.insert(requests).values(requestRecords);
    }

    return res.status(201).json({
      message: "Donation broadcasted to all NGOs successfully.",
      donation: newDonation,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getMyDonations = async (req, res) => {
  try {
    const list = await db
      .select()
      .from(donations)
      .where(eq(donations.donorId, req.user.id))
      .orderBy(desc(donations.createdAt));
    return res.status(200).json({ donations: list });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getNgoRequests = async (req, res) => {
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
      })
      .from(ngoRequests)
      .leftJoin(users, eq(ngoRequests.ngoId, users.id))
      .orderBy(desc(ngoRequests.createdAt));

    return res.status(200).json({ requests: list });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PATCH — Donor fulfills an NGO request (status → ACCEPTED)
export const fulfillNgoRequest = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);

    const [ngoReq] = await db
      .select()
      .from(ngoRequests)
      .where(eq(ngoRequests.id, requestId));

    if (!ngoReq) {
      return res.status(404).json({ message: "NGO request not found." });
    }

    const [updated] = await db
      .update(ngoRequests)
      .set({ status: "ACCEPTED" })
      .where(eq(ngoRequests.id, requestId))
      .returning();

    return res.status(200).json({
      message: "Request fulfilled successfully! The NGO has been notified.",
      request: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PATCH — Update donation status (Donor can mark as picked up or completed)
export const updateDonationStatus = async (req, res) => {
  try {
    const donationId = parseInt(req.params.id);
    const { status } = req.body;
    const donorId = req.user.id;

    const validStatuses = ["PENDING", "ASSIGNED", "ACCEPTED", "PICKED_UP", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    // Verify the donation belongs to this donor
    const [donation] = await db
      .select()
      .from(donations)
      .where(eq(donations.id, donationId));

    if (!donation || donation.donorId !== donorId) {
      return res.status(404).json({ message: "Donation not found." });
    }

    const [updated] = await db
      .update(donations)
      .set({ status })
      .where(eq(donations.id, donationId))
      .returning();

    return res.status(200).json({
      message: `Donation status updated to ${status}.`,
      donation: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const donorId = req.user.id;

    // Total donations count
    const [donationCount] = await db
      .select({ total: count() })
      .from(donations)
      .where(eq(donations.donorId, donorId));

    // Parse numeric parts from quantity text to sum "meals"
    const allDonations = await db
      .select({ quantity: donations.quantity })
      .from(donations)
      .where(eq(donations.donorId, donorId));

    let totalMeals = 0;
    allDonations.forEach(d => {
      const num = parseInt(d.quantity);
      if (!isNaN(num)) totalMeals += num;
    });

    // Count unique NGOs this donor helped (via requests table)
    const [ngoCount] = await db
      .select({ total: countDistinct(requests.ngoId) })
      .from(requests)
      .innerJoin(donations, eq(requests.donationId, donations.id))
      .where(eq(donations.donorId, donorId));

    // Recent 5 donations for activity feed
    const recentDonations = await db
      .select()
      .from(donations)
      .where(eq(donations.donorId, donorId))
      .orderBy(desc(donations.createdAt))
      .limit(5);

    return res.status(200).json({
      stats: {
        totalDonations: donationCount?.total || 0,
        totalMeals,
        ngosHelped: ngoCount?.total || 0
      },
      recentActivity: recentDonations
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
