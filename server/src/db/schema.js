import {pgTable,serial,text,timestamp,integer,pgEnum,} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["DONOR", "NGO", "ADMIN"]);

export const donationStatusEnum = pgEnum("donation_status", [
  "PENDING",
  "ASSIGNED",
  "ACCEPTED",
  "PICKED_UP",
  "COMPLETED",
]);


// USERS TABLE
export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  role: roleEnum("role").notNull(),

  phone: text("phone"),
  address: text("address"),

  createdAt: timestamp("created_at").defaultNow(),
});


//  DONATIONS TABLE
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),

  donorId: integer("donor_id")
    .references(() => users.id)
    .notNull(),

  foodType: text("food_type").notNull(),
  quantity: text("quantity").notNull(),

  description: text("description"),

  expiryTime: timestamp("expiry_time").notNull(),

  location: text("location").notNull(),

  status: donationStatusEnum("status").default("PENDING"),

  createdAt: timestamp("created_at").defaultNow(),
});


// 🤝 REQUESTS 
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),

  donationId: integer("donation_id")
    .references(() => donations.id)
    .notNull(),

  ngoId: integer("ngo_id")
    .references(() => users.id)
    .notNull(),

  status: donationStatusEnum("status").default("ASSIGNED"),

  createdAt: timestamp("created_at").defaultNow(),
});


//  RATINGS 
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),

  donorId: integer("donor_id").references(() => users.id),
  ngoId: integer("ngo_id").references(() => users.id),

  rating: integer("rating"),
  comment: text("comment"),

  createdAt: timestamp("created_at").defaultNow(),
});

