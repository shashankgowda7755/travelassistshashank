import { apiRequest } from "./queryClient";

export const api = {
  // Command processing
  executeCommand: async (command: string) => {
    const response = await apiRequest("POST", "/api/command", { command });
    return response.json();
  },

  // Pins
  getPins: async () => {
    const response = await apiRequest("GET", "/api/pins");
    return response.json();
  },
  
  createPin: async (pin: any) => {
    const response = await apiRequest("POST", "/api/pins", pin);
    return response.json();
  },

  // Expenses
  getExpenses: async (date?: string) => {
    const url = date ? `/api/expenses?date=${date}` : "/api/expenses";
    const response = await apiRequest("GET", url);
    return response.json();
  },
  
  createExpense: async (expense: any) => {
    const response = await apiRequest("POST", "/api/expenses", expense);
    return response.json();
  },

  // Journal
  getJournalEntries: async () => {
    const response = await apiRequest("GET", "/api/journal");
    return response.json();
  },
  
  createJournalEntry: async (entry: any) => {
    const response = await apiRequest("POST", "/api/journal", entry);
    return response.json();
  },

  // People
  getPeople: async (search?: string) => {
    const url = search ? `/api/people?search=${encodeURIComponent(search)}` : "/api/people";
    const response = await apiRequest("GET", url);
    return response.json();
  },
  
  createPerson: async (person: any) => {
    const response = await apiRequest("POST", "/api/people", person);
    return response.json();
  },

  // Stats
  getTodayStats: async () => {
    const response = await apiRequest("GET", "/api/stats/today");
    return response.json();
  },
};
