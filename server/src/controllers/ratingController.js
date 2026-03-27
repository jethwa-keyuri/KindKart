import { db } from "../db/db.js";
import { ratings, users } from "../db/schema.js";
import { eq, and, desc, count, avg } from "drizzle-orm";

// POST — Donor submits a rating/review for an NGO
export const submitRating = async (req, res) => {
  try {
    const donorId = req.user.id;
    const ngoId = parseInt(req.params.ngoId);
    const { rating, comment } = req.body;

    // Validate rating range
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Verify the target user is actually an NGO
    const [ngo] = await db.select().from(users).where(eq(users.id, ngoId));
    if (!ngo || ngo.role !== "NGO") {
      return res.status(404).json({ message: "NGO not found." });
    }

    // Check if donor already reviewed this NGO
    const [existing] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.donorId, donorId), eq(ratings.ngoId, ngoId)));

    if (existing) {
      // Update existing review
      const [updated] = await db
        .update(ratings)
        .set({ rating, comment: comment || "", createdAt: new Date() })
        .where(eq(ratings.id, existing.id))
        .returning();

      return res.status(200).json({
        message: "Review updated successfully.",
        rating: updated,
      });
    }

    // Create new review
    const [newRating] = await db
      .insert(ratings)
      .values({
        donorId,
        ngoId,
        rating,
        comment: comment || "",
      })
      .returning();

    return res.status(201).json({
      message: "Review submitted successfully.",
      rating: newRating,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET — Get all reviews for an NGO
export const getNgoRatings = async (req, res) => {
  try {
    const ngoId = parseInt(req.params.ngoId);

    const reviews = await db
      .select({
        id: ratings.id,
        rating: ratings.rating,
        comment: ratings.comment,
        createdAt: ratings.createdAt,
        donorId: ratings.donorId,
        donorName: users.name,
      })
      .from(ratings)
      .leftJoin(users, eq(ratings.donorId, users.id))
      .where(eq(ratings.ngoId, ngoId))
      .orderBy(desc(ratings.createdAt));

    // Compute aggregate stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

    // Rating distribution (1-5)
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
    });

    return res.status(200).json({
      reviews,
      stats: {
        totalReviews,
        averageRating,
        distribution,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// DELETE — Donor deletes their own review
export const deleteRating = async (req, res) => {
  try {
    const donorId = req.user.id;
    const ratingId = parseInt(req.params.id);

    const [existing] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.id, ratingId), eq(ratings.donorId, donorId)));

    if (!existing) {
      return res.status(404).json({ message: "Review not found or unauthorized." });
    }

    await db.delete(ratings).where(eq(ratings.id, ratingId));

    return res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET — Get average rating for an NGO (lightweight, for cards)
export const getNgoAverageRating = async (req, res) => {
  try {
    const ngoId = parseInt(req.params.ngoId);

    const [result] = await db
      .select({
        avgRating: avg(ratings.rating),
        totalReviews: count(),
      })
      .from(ratings)
      .where(eq(ratings.ngoId, ngoId));

    return res.status(200).json({
      averageRating: result?.avgRating ? Math.round(parseFloat(result.avgRating) * 10) / 10 : 0,
      totalReviews: result?.totalReviews || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
