import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";
import { eq } from "drizzle-orm";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    //console.log(name);
    // this is a simple validation, you can enhance it as needed
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, role, phone, address })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    return res.status(201).json({
      message: "User registered successfully.",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const logout = (req, res) => {
  // Since we use JWT in local storage, actual logout happens client-side.
  // We provide this endpoint to fulfill the typical logout API contract cleanly.
  return res.status(200).json({ message: "Logout successful." });
};
