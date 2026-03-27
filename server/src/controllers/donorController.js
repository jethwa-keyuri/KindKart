import { db } from "../db/db.js";
import { donations, requests, users, ngoRequests, ratings } from "../db/schema.js";
import { eq, desc, count, countDistinct, and, sql, avg } from "drizzle-orm";

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

// GET — Browse all NGOs (for Donor)
export const browseNgos = async (req, res) => {
  try {
    const search = req.query.search?.toLowerCase() || "";
    const donorLat = parseFloat(req.query.lat);
    const donorLng = parseFloat(req.query.lng);
    const hasDonorLocation = !isNaN(donorLat) && !isNaN(donorLng);

    // Haversine formula — distance in km
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth radius in km
      const toRad = (deg) => (deg * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Fetch all NGO users (now including lat/lng)
    const allNgos = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        address: users.address,
        latitude: users.latitude,
        longitude: users.longitude,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "NGO"))
      .orderBy(desc(users.createdAt));

    // For each NGO, compute stats, distance, and recent requests
    const ngoList = await Promise.all(
      allNgos.map(async (ngo) => {
        // Total requests
        const [totalReq] = await db
          .select({ total: count() })
          .from(ngoRequests)
          .where(eq(ngoRequests.ngoId, ngo.id));

        // Active (PENDING) requests
        const [activeReq] = await db
          .select({ total: count() })
          .from(ngoRequests)
          .where(and(eq(ngoRequests.ngoId, ngo.id), eq(ngoRequests.status, "PENDING")));

        // Fulfilled requests
        const [fulfilledReq] = await db
          .select({ total: count() })
          .from(ngoRequests)
          .where(and(eq(ngoRequests.ngoId, ngo.id), eq(ngoRequests.status, "ACCEPTED")));

        // Recent active requests from this NGO (max 3)
        const recentRequests = await db
          .select({
            id: ngoRequests.id,
            title: ngoRequests.title,
            description: ngoRequests.description,
            urgency: ngoRequests.urgency,
            quantity: ngoRequests.quantity,
            status: ngoRequests.status,
            createdAt: ngoRequests.createdAt,
          })
          .from(ngoRequests)
          .where(and(eq(ngoRequests.ngoId, ngo.id), eq(ngoRequests.status, "PENDING")))
          .orderBy(desc(ngoRequests.createdAt))
          .limit(3);

        // Compute distance if both donor and NGO have coordinates
        let distance = null;
        if (hasDonorLocation && ngo.latitude != null && ngo.longitude != null) {
          distance = Math.round(haversineDistance(donorLat, donorLng, ngo.latitude, ngo.longitude) * 10) / 10;
        }

        // Compute average rating
        const [ratingResult] = await db
          .select({
            avgRating: avg(ratings.rating),
            totalReviews: count(),
          })
          .from(ratings)
          .where(eq(ratings.ngoId, ngo.id));

        return {
          ...ngo,
          distance,
          stats: {
            totalRequests: totalReq?.total || 0,
            activeRequests: activeReq?.total || 0,
            fulfilledRequests: fulfilledReq?.total || 0,
          },
          ratingInfo: {
            averageRating: ratingResult?.avgRating ? Math.round(parseFloat(ratingResult.avgRating) * 10) / 10 : 0,
            totalReviews: ratingResult?.totalReviews || 0,
          },
          recentRequests,
        };
      })
    );

    // Filter by search term (name or address)
    let filtered = search
      ? ngoList.filter(
          (ngo) =>
            ngo.name.toLowerCase().includes(search) ||
            (ngo.address && ngo.address.toLowerCase().includes(search))
        )
      : ngoList;

    // Sort by nearest if requested
    if (req.query.sortBy === "nearest" && hasDonorLocation) {
      filtered = filtered.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return res.status(200).json({ ngos: filtered });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
