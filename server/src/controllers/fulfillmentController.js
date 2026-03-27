import { db } from "../db/db.js";
import { fulfillmentLogs, users } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

// Write a fulfillment log entry
export const writeLog = async ({ donationId, ngoRequestId, action, performedBy, notes }) => {
  try {
    await db.insert(fulfillmentLogs).values({
      donationId: donationId || null,
      ngoRequestId: ngoRequestId || null,
      action,
      performedBy: performedBy || null,
      notes: notes || null,
    });
  } catch (e) {
    console.error("Failed to write fulfillment log:", e.message);
  }
};

// GET — Fetch logs for a specific donation
export const getDonationLogs = async (req, res) => {
  try {
    const donationId = parseInt(req.params.id);

    const logs = await db
      .select({
        id: fulfillmentLogs.id,
        action: fulfillmentLogs.action,
        notes: fulfillmentLogs.notes,
        createdAt: fulfillmentLogs.createdAt,
        performedByName: users.name,
        performedByRole: users.role,
      })
      .from(fulfillmentLogs)
      .leftJoin(users, eq(fulfillmentLogs.performedBy, users.id))
      .where(eq(fulfillmentLogs.donationId, donationId))
      .orderBy(desc(fulfillmentLogs.createdAt));

    return res.status(200).json({ logs });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET — Fetch logs for an NGO request
export const getNgoRequestLogs = async (req, res) => {
  try {
    const ngoRequestId = parseInt(req.params.id);

    const logs = await db
      .select({
        id: fulfillmentLogs.id,
        action: fulfillmentLogs.action,
        notes: fulfillmentLogs.notes,
        createdAt: fulfillmentLogs.createdAt,
        performedByName: users.name,
        performedByRole: users.role,
      })
      .from(fulfillmentLogs)
      .leftJoin(users, eq(fulfillmentLogs.performedBy, users.id))
      .where(eq(fulfillmentLogs.ngoRequestId, ngoRequestId))
      .orderBy(desc(fulfillmentLogs.createdAt));

    return res.status(200).json({ logs });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
