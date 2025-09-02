import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  numeric,
  boolean,
  date,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Travel-specific tables
export const pins = pgTable("pins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: varchar("status", { enum: ["planned", "visited"] }).notNull().default("planned"),
  lat: numeric("lat"),
  lng: numeric("lng"),
  address: text("address"),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  scheduledOn: date("scheduled_on"),
  visitedOn: date("visited_on"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const packingCategories = pgTable("packing_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const packingItems = pgTable("packing_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => packingCategories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  region: text("region"), // South, North, East, West, All
  packed: boolean("packed").default(false),
  notes: text("notes"),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  spentAt: date("spent_at").notNull().default(sql`current_date`),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  category: varchar("category", { enum: ["food", "transport", "stay", "gear", "misc"] }).default("misc"),
  note: text("note"),
  pinId: uuid("pin_id").references(() => pins.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journal = pgTable("journal", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  body: text("body"),
  photoUrls: text("photo_urls").array(),
  audioUrl: text("audio_url"),
  pinId: uuid("pin_id").references(() => pins.id, { onDelete: "set null" }),
  taggedAt: timestamp("tagged_at").defaultNow(),
});

export const mapSnapshots = pgTable("map_snapshots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  pinId: uuid("pin_id").references(() => pins.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const learningItems = pgTable("learning_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { enum: ["course", "skill"] }).default("skill"),
  name: text("name").notNull(),
  progress: integer("progress").default(0),
  link: text("link"),
});

export const routineItems = pgTable("routine_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isDaily: boolean("is_daily").default(true),
});

export const routineChecks = pgTable("routine_checks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  routineId: uuid("routine_id").notNull().references(() => routineItems.id, { onDelete: "cascade" }),
  doneOn: date("done_on").notNull().default(sql`current_date`),
  done: boolean("done").default(true),
});

export const mealLogs = pgTable("meal_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eatenAt: date("eaten_at").notNull().default(sql`current_date`),
  meal: varchar("meal", { enum: ["breakfast", "lunch", "dinner", "snack"] }).notNull(),
  note: text("note"),
});

export const waterLogs = pgTable("water_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  loggedAt: timestamp("logged_at").defaultNow(),
  quantityMl: integer("quantity_ml").default(250),
});

export const people = pgTable("people", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  photoUrl: text("photo_url"),
  whereMet: text("where_met"),
  lat: numeric("lat"),
  lng: numeric("lng"),
  metOn: date("met_on").default(sql`current_date`),
  notes: text("notes"),
});

export const transportLogs = pgTable("transport_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").default(sql`current_date`),
  mode: varchar("mode", { enum: ["walk", "bus", "train", "hitchhike", "auto", "cab", "bike", "other"] }).default("other"),
  fromPlace: text("from_place"),
  toPlace: text("to_place"),
  distanceKm: numeric("distance_km", { precision: 8, scale: 2 }),
  cost: numeric("cost", { precision: 12, scale: 2 }),
  pinId: uuid("pin_id").references(() => pins.id, { onDelete: "set null" }),
  note: text("note"),
});

export const stayLogs = pgTable("stay_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  checkIn: date("check_in").default(sql`current_date`),
  checkOut: date("check_out"),
  placeName: text("place_name"),
  hostContact: text("host_contact"),
  costPerNight: numeric("cost_per_night", { precision: 12, scale: 2 }),
  rating: integer("rating"),
  note: text("note"),
  pinId: uuid("pin_id").references(() => pins.id, { onDelete: "set null" }),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label"),
  name: text("name"),
  phone: text("phone"),
  note: text("note"),
});

export const moodLogs = pgTable("mood_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").default(sql`current_date`),
  mood: varchar("mood", { enum: ["😃", "🙂", "😐", "😔", "😤", "😴"] }).default("🙂"),
  energy: integer("energy").default(5),
  note: text("note"),
});

export const wishlist = pgTable("wishlist", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { enum: ["place", "food", "skill", "person", "other"] }).default("place"),
  text: text("text").notNull(),
  done: boolean("done").default(false),
});

export const barterLogs = pgTable("barter_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").default(sql`current_date`),
  skill: text("skill"),
  exchangedWith: text("exchanged_with"),
  value: text("value"),
  note: text("note"),
});

// Insert schemas
export const insertPinSchema = createInsertSchema(pins).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export const insertJournalSchema = createInsertSchema(journal).omit({ id: true, taggedAt: true });
export const insertPersonSchema = createInsertSchema(people).omit({ id: true });
export const insertRoutineItemSchema = createInsertSchema(routineItems).omit({ id: true });
export const insertPackingItemSchema = createInsertSchema(packingItems).omit({ id: true });
export const insertMealLogSchema = createInsertSchema(mealLogs).omit({ id: true });
export const insertWaterLogSchema = createInsertSchema(waterLogs).omit({ id: true, loggedAt: true });

// Types
export type Pin = typeof pins.$inferSelect;
export type InsertPin = z.infer<typeof insertPinSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Journal = typeof journal.$inferSelect;
export type InsertJournal = z.infer<typeof insertJournalSchema>;
export type Person = typeof people.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type RoutineItem = typeof routineItems.$inferSelect;
export type InsertRoutineItem = z.infer<typeof insertRoutineItemSchema>;
export type PackingItem = typeof packingItems.$inferSelect;
export type InsertPackingItem = z.infer<typeof insertPackingItemSchema>;
export type MealLog = typeof mealLogs.$inferSelect;
export type InsertMealLog = z.infer<typeof insertMealLogSchema>;
export type WaterLog = typeof waterLogs.$inferSelect;
export type InsertWaterLog = z.infer<typeof insertWaterLogSchema>;
