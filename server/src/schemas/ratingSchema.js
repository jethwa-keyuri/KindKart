import { z } from "zod";

export const submitRatingSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().max(500, "Comment must be under 500 characters").optional(),
});
