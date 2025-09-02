import {
  users,
  pins,
  expenses,
  journal,
  people,
  routineItems,
  routineChecks,
  packingItems,
  packingCategories,
  mealLogs,
  waterLogs,
  transportLogs,
  stayLogs,
  emergencyContacts,
  moodLogs,
  wishlist,
  barterLogs,
  type User,
  type UpsertUser,
  type Pin,
  type InsertPin,
  type Expense,
  type InsertExpense,
  type Journal,
  type InsertJournal,
  type Person,
  type InsertPerson,
  type RoutineItem,
  type InsertRoutineItem,
  type PackingItem,
  type InsertPackingItem,
  type MealLog,
  type InsertMealLog,
  type WaterLog,
  type InsertWaterLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Travel operations
  getPins(userId: string): Promise<Pin[]>;
  createPin(pin: InsertPin): Promise<Pin>;
  updatePin(id: string, userId: string, updates: Partial<InsertPin>): Promise<Pin>;
  
  getExpenses(userId: string, date?: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  
  getJournalEntries(userId: string): Promise<Journal[]>;
  createJournalEntry(entry: InsertJournal): Promise<Journal>;
  
  getPeople(userId: string): Promise<Person[]>;
  createPerson(person: InsertPerson): Promise<Person>;
  searchPeople(userId: string, query: string): Promise<Person[]>;
  
  getRoutineItems(userId: string): Promise<RoutineItem[]>;
  createRoutineItem(item: InsertRoutineItem): Promise<RoutineItem>;
  markRoutineDone(userId: string, routineId: string, date: string): Promise<void>;
  getRoutineChecks(userId: string, date: string): Promise<any[]>;
  
  getPackingItems(userId: string, region?: string): Promise<PackingItem[]>;
  createPackingItem(item: InsertPackingItem): Promise<PackingItem>;
  togglePackingItem(id: string, userId: string, packed: boolean): Promise<PackingItem>;
  
  getMealLogs(userId: string, date: string): Promise<MealLog[]>;
  createMealLog(log: InsertMealLog): Promise<MealLog>;
  
  getWaterLogs(userId: string, date: string): Promise<WaterLog[]>;
  createWaterLog(log: InsertWaterLog): Promise<WaterLog>;
  
  getTodayStats(userId: string): Promise<{
    routineCompletion: string;
    waterGlasses: number;
    mealsCompleted: string[];
    totalExpenses: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Travel operations
  async getPins(userId: string): Promise<Pin[]> {
    return await db.select().from(pins).where(eq(pins.userId, userId)).orderBy(desc(pins.createdAt));
  }

  async createPin(pin: InsertPin): Promise<Pin> {
    const [newPin] = await db.insert(pins).values(pin).returning();
    return newPin;
  }

  async updatePin(id: string, userId: string, updates: Partial<InsertPin>): Promise<Pin> {
    const [updatedPin] = await db
      .update(pins)
      .set(updates)
      .where(and(eq(pins.id, id), eq(pins.userId, userId)))
      .returning();
    return updatedPin;
  }

  async getExpenses(userId: string, date?: string): Promise<Expense[]> {
    const query = db.select().from(expenses).where(eq(expenses.userId, userId));
    if (date) {
      query.where(and(eq(expenses.userId, userId), eq(expenses.spentAt, date)));
    }
    return await query.orderBy(desc(expenses.spentAt));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async getJournalEntries(userId: string): Promise<Journal[]> {
    return await db.select().from(journal).where(eq(journal.userId, userId)).orderBy(desc(journal.taggedAt));
  }

  async createJournalEntry(entry: InsertJournal): Promise<Journal> {
    const [newEntry] = await db.insert(journal).values(entry).returning();
    return newEntry;
  }

  async getPeople(userId: string): Promise<Person[]> {
    return await db.select().from(people).where(eq(people.userId, userId)).orderBy(desc(people.metOn));
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    const [newPerson] = await db.insert(people).values(person).returning();
    return newPerson;
  }

  async searchPeople(userId: string, query: string): Promise<Person[]> {
    return await db.select().from(people)
      .where(and(
        eq(people.userId, userId),
        sql`(${people.name} ILIKE ${`%${query}%`} OR ${people.whereMet} ILIKE ${`%${query}%`})`
      ))
      .orderBy(desc(people.metOn));
  }

  async getRoutineItems(userId: string): Promise<RoutineItem[]> {
    return await db.select().from(routineItems).where(eq(routineItems.userId, userId));
  }

  async createRoutineItem(item: InsertRoutineItem): Promise<RoutineItem> {
    const [newItem] = await db.insert(routineItems).values(item).returning();
    return newItem;
  }

  async markRoutineDone(userId: string, routineId: string, date: string): Promise<void> {
    await db.insert(routineChecks).values({
      userId,
      routineId,
      doneOn: date,
      done: true,
    });
  }

  async getRoutineChecks(userId: string, date: string): Promise<any[]> {
    return await db.select().from(routineChecks)
      .where(and(eq(routineChecks.userId, userId), eq(routineChecks.doneOn, date)));
  }

  async getPackingItems(userId: string, region?: string): Promise<PackingItem[]> {
    const query = db.select().from(packingItems).where(eq(packingItems.userId, userId));
    if (region && region !== "All") {
      query.where(and(eq(packingItems.userId, userId), eq(packingItems.region, region)));
    }
    return await query;
  }

  async createPackingItem(item: InsertPackingItem): Promise<PackingItem> {
    const [newItem] = await db.insert(packingItems).values(item).returning();
    return newItem;
  }

  async togglePackingItem(id: string, userId: string, packed: boolean): Promise<PackingItem> {
    const [updatedItem] = await db
      .update(packingItems)
      .set({ packed })
      .where(and(eq(packingItems.id, id), eq(packingItems.userId, userId)))
      .returning();
    return updatedItem;
  }

  async getMealLogs(userId: string, date: string): Promise<MealLog[]> {
    return await db.select().from(mealLogs)
      .where(and(eq(mealLogs.userId, userId), eq(mealLogs.eatenAt, date)));
  }

  async createMealLog(log: InsertMealLog): Promise<MealLog> {
    const [newLog] = await db.insert(mealLogs).values(log).returning();
    return newLog;
  }

  async getWaterLogs(userId: string, date: string): Promise<WaterLog[]> {
    return await db.select().from(waterLogs)
      .where(and(eq(waterLogs.userId, userId), sql`DATE(${waterLogs.loggedAt}) = ${date}`));
  }

  async createWaterLog(log: InsertWaterLog): Promise<WaterLog> {
    const [newLog] = await db.insert(waterLogs).values(log).returning();
    return newLog;
  }

  async getTodayStats(userId: string): Promise<{
    routineCompletion: string;
    waterGlasses: number;
    mealsCompleted: string[];
    totalExpenses: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get routine completion
    const routineItems = await this.getRoutineItems(userId);
    const routineChecks = await this.getRoutineChecks(userId, today);
    const routineCompletion = `${routineChecks.length}/${routineItems.length}`;
    
    // Get water intake
    const waterLogs = await this.getWaterLogs(userId, today);
    const waterGlasses = Math.floor(waterLogs.reduce((sum, log) => sum + (log.quantityMl || 0), 0) / 250);
    
    // Get meals completed
    const mealLogs = await this.getMealLogs(userId, today);
    const mealsCompleted = mealLogs.map(log => log.meal);
    
    // Get total expenses
    const todayExpenses = await this.getExpenses(userId, today);
    const totalExpenses = todayExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    return {
      routineCompletion,
      waterGlasses,
      mealsCompleted,
      totalExpenses,
    };
  }
}

export const storage = new DatabaseStorage();
