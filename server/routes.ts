import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPinSchema, insertExpenseSchema, insertJournalSchema, insertPersonSchema, insertRoutineItemSchema, insertPackingItemSchema, insertMealLogSchema, insertWaterLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Natural language command processing
  app.post('/api/command', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { command } = req.body;
      
      // Parse command using simple keyword matching (can be enhanced with OpenAI later)
      const result = await parseAndExecuteCommand(command, userId);
      res.json(result);
    } catch (error) {
      console.error("Error processing command:", error);
      res.status(500).json({ message: "Failed to process command" });
    }
  });

  // Pins routes
  app.get('/api/pins', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pins = await storage.getPins(userId);
      res.json(pins);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pins" });
    }
  });

  app.post('/api/pins', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pinData = insertPinSchema.parse({ ...req.body, userId });
      const pin = await storage.createPin(pinData);
      res.json(pin);
    } catch (error) {
      res.status(400).json({ message: "Invalid pin data" });
    }
  });

  // Expenses routes
  app.get('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date as string;
      const expenses = await storage.getExpenses(userId, date);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenseData = insertExpenseSchema.parse({ ...req.body, userId });
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  // Journal routes
  app.get('/api/journal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post('/api/journal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertJournalSchema.parse({ ...req.body, userId });
      const entry = await storage.createJournalEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid journal entry data" });
    }
  });

  // People routes
  app.get('/api/people', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.search as string;
      
      let people;
      if (query) {
        people = await storage.searchPeople(userId, query);
      } else {
        people = await storage.getPeople(userId);
      }
      
      res.json(people);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });

  app.post('/api/people', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const personData = insertPersonSchema.parse({ ...req.body, userId });
      const person = await storage.createPerson(personData);
      res.json(person);
    } catch (error) {
      res.status(400).json({ message: "Invalid person data" });
    }
  });

  // Routine routes
  app.get('/api/routine', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getRoutineItems(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routine items" });
    }
  });

  app.post('/api/routine', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertRoutineItemSchema.parse({ ...req.body, userId });
      const item = await storage.createRoutineItem(itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid routine item data" });
    }
  });

  app.post('/api/routine/:id/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const routineId = req.params.id;
      const date = req.body.date || new Date().toISOString().split('T')[0];
      await storage.markRoutineDone(userId, routineId, date);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark routine done" });
    }
  });

  // Packing routes
  app.get('/api/packing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const region = req.query.region as string;
      const items = await storage.getPackingItems(userId, region);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packing items" });
    }
  });

  app.post('/api/packing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertPackingItemSchema.parse({ ...req.body, userId });
      const item = await storage.createPackingItem(itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid packing item data" });
    }
  });

  app.patch('/api/packing/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = req.params.id;
      const { packed } = req.body;
      const item = await storage.togglePackingItem(itemId, userId, packed);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update packing item" });
    }
  });

  // Food & Water routes
  app.post('/api/meals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mealData = insertMealLogSchema.parse({ ...req.body, userId });
      const meal = await storage.createMealLog(mealData);
      res.json(meal);
    } catch (error) {
      res.status(400).json({ message: "Invalid meal data" });
    }
  });

  app.post('/api/water', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const waterData = insertWaterLogSchema.parse({ ...req.body, userId });
      const water = await storage.createWaterLog(waterData);
      res.json(water);
    } catch (error) {
      res.status(400).json({ message: "Invalid water data" });
    }
  });

  // Dashboard stats
  app.get('/api/stats/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getTodayStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simple command parser (can be enhanced with OpenAI later)
async function parseAndExecuteCommand(command: string, userId: string) {
  const cmd = command.toLowerCase().trim();
  
  // Add person commands
  if (cmd.includes("add person") || cmd.includes("add contact")) {
    const nameMatch = cmd.match(/(?:add person|add contact)\s+(.+?)(?:,|\s+(?:phone|number|contact))/i);
    const phoneMatch = cmd.match(/(?:phone|number|contact)\s+([+\d\s-]+)/i);
    const locationMatch = cmd.match(/(?:at|in|met at)\s+([^,]+)/i);
    
    if (nameMatch) {
      const person = await storage.createPerson({
        userId,
        name: nameMatch[1].trim(),
        phone: phoneMatch ? phoneMatch[1].trim() : null,
        whereMet: locationMatch ? locationMatch[1].trim() : null,
      });
      return { success: true, message: `Added ${person.name} to contacts`, data: person };
    }
  }
  
  // Add expense commands
  if (cmd.includes("expense") || cmd.includes("spent") || cmd.includes("cost")) {
    const amountMatch = cmd.match(/[₹$]?(\d+(?:\.\d{2})?)/);
    const categoryMatch = cmd.match(/(?:for|on)\s+(food|transport|stay|gear|misc)/i);
    
    if (amountMatch) {
      const expense = await storage.createExpense({
        userId,
        amount: amountMatch[1],
        category: categoryMatch ? categoryMatch[1].toLowerCase() as any : "misc",
        note: command,
      });
      return { success: true, message: `Logged ₹${expense.amount} expense`, data: expense };
    }
  }
  
  // Add water commands
  if (cmd.includes("water") && (cmd.includes("ml") || cmd.includes("glass"))) {
    const amountMatch = cmd.match(/(\d+)\s*(?:ml|glass)/);
    const quantity = amountMatch ? parseInt(amountMatch[1]) : 250;
    
    const water = await storage.createWaterLog({
      userId,
      quantityMl: quantity,
    });
    return { success: true, message: `Logged ${quantity}ml water intake`, data: water };
  }
  
  // Add meal commands
  if (cmd.includes("breakfast") || cmd.includes("lunch") || cmd.includes("dinner") || cmd.includes("snack")) {
    let meal = "snack";
    if (cmd.includes("breakfast")) meal = "breakfast";
    else if (cmd.includes("lunch")) meal = "lunch";
    else if (cmd.includes("dinner")) meal = "dinner";
    
    const mealLog = await storage.createMealLog({
      userId,
      meal: meal as any,
      note: command,
    });
    return { success: true, message: `Logged ${meal}`, data: mealLog };
  }
  
  // Add journal commands
  if (cmd.includes("journal") || cmd.includes("note") || cmd.includes("today")) {
    const entry = await storage.createJournalEntry({
      userId,
      title: "Quick Entry",
      body: command,
    });
    return { success: true, message: "Added journal entry", data: entry };
  }
  
  return { success: false, message: "Command not recognized. Try: 'add person [name], phone [number]' or 'expense 100 for food'" };
}
