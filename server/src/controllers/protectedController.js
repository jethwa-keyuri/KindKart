import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Accessible by any authenticated user
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
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "Welcome to your profile!", user });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Accessible by ADMIN only
export const getAdminData = async (req, res) => {
  try {
    const allUsers = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(users);
    
    return res.status(200).json({
      message: "Admin access granted.",
      totalUsers: allUsers.length,
      users: allUsers,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
