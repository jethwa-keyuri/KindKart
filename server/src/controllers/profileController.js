import { db } from "../db/db.js";
import { users, donations, requests } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getProfile = async (req, res) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        address: users.address,
        latitude: users.latitude,
        longitude: users.longitude,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let roleData = {};

    // Include role-specific fields/data
    if (user.role === "DONOR") {
      const myDonations = await db.select().from(donations).where(eq(donations.donorId, user.id));
      roleData = { totalDonations: myDonations.length, donations: myDonations };
    } else if (user.role === "NGO") {
      const myRequests = await db.select().from(requests).where(eq(requests.ngoId, user.id));
      roleData = { totalRequests: myRequests.length, requests: myRequests };
    }

    return res.status(200).json({ 
      message: "Profile fetched successfully.", 
      user, 
      roleData 
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, latitude, longitude } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, req.user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        address: users.address,
        latitude: users.latitude,
        longitude: users.longitude,
      });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
