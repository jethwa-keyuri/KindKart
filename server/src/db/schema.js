import {pgTable,serial,text,timestamp,integer,pgEnum,doublePrecision,} from "drizzle-orm/pg-core";

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

  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),

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

// NGO Needs (Requests by NGOs)
export const ngoRequests = pgTable("ngo_requests", {
  id: serial("id").primaryKey(),
  ngoId: integer("ngo_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  urgency: text("urgency"),
  quantity: text("quantity"),
  status: donationStatusEnum("status").default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fulfillment Logs — tracks each status transition of a donation
export const fulfillmentLogs = pgTable("fulfillment_logs", {
  id: serial("id").primaryKey(),
  donationId: integer("donation_id").references(() => donations.id),
  ngoRequestId: integer("ngo_request_id").references(() => ngoRequests.id),
  action: text("action").notNull(),         // e.g. "CREATED", "ACCEPTED", "PICKED_UP", "COMPLETED"
  performedBy: integer("performed_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
