import { z } from "zod";

export const createNgoRequestSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(1, "Title cannot be empty"),
  description: z.string().optional(),
  urgency: z.enum(["High", "Medium", "Low"], { required_error: "Urgency level is required" }),
  quantity: z.string({ required_error: "Quantity is required" }).min(1, "Quantity cannot be empty"),
});
