import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPinSchema, insertExpenseSchema, insertJournalSchema, insertPersonSchema, insertRoutineItemSchema, insertPackingItemSchema, insertMealLogSchema, insertWaterLogSchema } from "@shared/schema";
import { parseCommand, parseQuery, generateResponse } from "./openai";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage_config,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add basic security headers
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    next();
  }, (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

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
      
      // Use OpenAI to parse and execute commands
      const result = await parseAndExecuteCommand(command, userId);
      res.json(result);
    } catch (error) {
      console.error("Error processing command:", error);
      res.status(500).json({ message: "Failed to process command" });
    }
  });

  // AI-powered query endpoint
  app.post('/api/query', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query } = req.body;
      
      // Parse query with OpenAI
      const intent = await parseQuery(query, ['people', 'expenses', 'journal', 'pins']);
      
      let searchResults: any[] = [];
      
      // Execute the query based on parsed intent
      if (intent.entity === 'people') {
        searchResults = await executePersonQuery(userId, intent.filters);
      } else if (intent.entity === 'expenses') {
        searchResults = await executeExpenseQuery(userId, intent.filters);
      } else if (intent.entity === 'journal') {
        searchResults = await executeJournalQuery(userId, intent.filters);
      } else if (intent.entity === 'pins') {
        searchResults = await executePinQuery(userId, intent.filters);
      }
      
      // Generate natural language response
      const response = await generateResponse(query, searchResults);
      
      res.json({
        success: true,
        response,
        data: searchResults,
        intent,
      });
    } catch (error) {
      console.error("Error processing query:", error);
      res.status(500).json({ message: "Failed to process query" });
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

  // Upload image for a person
  app.post('/api/people/:id/upload', isAuthenticated, upload.single('photo'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const personId = req.params.id;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const photoUrl = `/uploads/${req.file.filename}`;
      
      // Update the person with the photo URL
      const updatedPerson = await storage.updatePersonPhoto(personId, userId, photoUrl);
      
      res.json({ 
        success: true, 
        photoUrl,
        person: updatedPerson 
      });
    } catch (error) {
      console.error("Error uploading person photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // General file upload endpoint
  app.post('/api/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({ 
        success: true, 
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
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

// Query execution functions
async function executePersonQuery(userId: string, filters: Record<string, any>) {
  let people = await storage.getPeople(userId);
  
  if (filters.whereMet) {
    people = people.filter(p => 
      p.whereMet?.toLowerCase().includes(filters.whereMet.toLowerCase())
    );
  }
  
  if (filters.name) {
    people = people.filter(p => 
      p.name.toLowerCase().includes(filters.name.toLowerCase())
    );
  }
  
  return people;
}

async function executeExpenseQuery(userId: string, filters: Record<string, any>) {
  const date = filters.date === 'today' ? new Date().toISOString().split('T')[0] : filters.date;
  let expenses = await storage.getExpenses(userId, date);
  
  if (filters.category) {
    expenses = expenses.filter(e => e.category === filters.category);
  }
  
  if (filters.minAmount) {
    expenses = expenses.filter(e => parseFloat(e.amount) >= filters.minAmount);
  }
  
  return expenses;
}

async function executeJournalQuery(userId: string, filters: Record<string, any>) {
  let entries = await storage.getJournalEntries(userId);
  
  if (filters.keyword) {
    entries = entries.filter(e => 
      e.title?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      e.body?.toLowerCase().includes(filters.keyword.toLowerCase())
    );
  }
  
  return entries;
}

async function executePinQuery(userId: string, filters: Record<string, any>) {
  let pins = await storage.getPins(userId);
  
  if (filters.status) {
    pins = pins.filter(p => p.status === filters.status);
  }
  
  if (filters.address) {
    pins = pins.filter(p => 
      p.address?.toLowerCase().includes(filters.address.toLowerCase()) ||
      p.title?.toLowerCase().includes(filters.address.toLowerCase())
    );
  }
  
  return pins;
}

// OpenAI-enhanced command parser
async function parseAndExecuteCommand(command: string, userId: string) {
  try {
    // First, try OpenAI parsing
    const intent = await parseCommand(command);
    
    if (intent.confidence > 0.7) {
      // Execute the parsed command
      if (intent.action === 'add_person') {
        const person = await storage.createPerson({
          userId,
          name: intent.data.name,
          phone: intent.data.phone || null,
          whatsapp: intent.data.whatsapp || null,
          email: intent.data.email || null,
          whereMet: intent.data.whereMet || null,
          notes: intent.data.notes || null,
        });
        return { success: true, message: `Added ${person.name} to contacts`, data: person };
      }
      
      if (intent.action === 'add_expense') {
        const expense = await storage.createExpense({
          userId,
          amount: intent.data.amount,
          category: intent.data.category || "misc",
          note: intent.data.note || command,
        });
        return { success: true, message: `Logged ₹${expense.amount} expense`, data: expense };
      }
      
      if (intent.action === 'add_water') {
        const water = await storage.createWaterLog({
          userId,
          quantityMl: intent.data.quantityMl || 250,
        });
        return { success: true, message: `Logged ${water.quantityMl}ml water intake`, data: water };
      }
      
      if (intent.action === 'add_meal') {
        const mealLog = await storage.createMealLog({
          userId,
          meal: intent.data.meal,
          note: intent.data.note || command,
        });
        return { success: true, message: `Logged ${mealLog.meal}`, data: mealLog };
      }
      
      if (intent.action === 'add_journal') {
        const entry = await storage.createJournalEntry({
          userId,
          title: intent.data.title || "Quick Entry",
          body: intent.data.body || command,
        });
        return { success: true, message: "Added journal entry", data: entry };
      }
      
      if (intent.action === 'add_pin') {
        const pin = await storage.createPin({
          userId,
          title: intent.data.title,
          address: intent.data.address || null,
          notes: intent.data.notes || null,
          status: intent.data.status || "planned",
        });
        return { success: true, message: `Added ${pin.title} to travel plans`, data: pin };
      }
    }
    
    // Fallback to regex-based parsing for backward compatibility
    return await fallbackCommandParsing(command, userId);
    
  } catch (error) {
    console.error("Error in AI command parsing:", error);
    // Fallback to regex-based parsing
    return await fallbackCommandParsing(command, userId);
  }
}

// Fallback command parser using regex patterns
async function fallbackCommandParsing(command: string, userId: string) {
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
