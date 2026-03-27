CREATE TYPE "public"."donation_status" AS ENUM('PENDING', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('DONOR', 'NGO', 'ADMIN');--> statement-breakpoint
CREATE TABLE "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_id" integer NOT NULL,
	"food_type" text NOT NULL,
	"quantity" text NOT NULL,
	"description" text,
	"expiry_time" timestamp NOT NULL,
	"location" text NOT NULL,
	"status" "donation_status" DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_id" integer,
	"ngo_id" integer,
	"rating" integer,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"donation_id" integer NOT NULL,
	"ngo_id" integer NOT NULL,
	"status" "donation_status" DEFAULT 'ASSIGNED',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "role" NOT NULL,
	"phone" text,
	"address" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_users_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_donor_id_users_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ngo_id_users_id_fk" FOREIGN KEY ("ngo_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_ngo_id_users_id_fk" FOREIGN KEY ("ngo_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;