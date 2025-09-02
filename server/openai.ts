import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CommandIntent {
  action: string;
  entity: string;
  data: Record<string, any>;
  confidence: number;
}

export interface QueryIntent {
  type: 'search' | 'filter' | 'list';
  entity: string;
  filters: Record<string, any>;
  query: string;
  confidence: number;
}

export async function parseCommand(command: string): Promise<CommandIntent> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a command parser for a travel companion app. Parse natural language commands into structured actions.

Available actions:
- add_person: Add a contact (name, phone, whatsapp, email, whereMet, notes)
- add_expense: Log an expense (amount, category: food/transport/stay/gear/misc, note)
- add_journal: Create journal entry (title, body)
- add_water: Log water intake (quantityMl)
- add_meal: Log meal (meal: breakfast/lunch/dinner/snack, note)
- add_pin: Add travel destination (title, address, notes, status: planned/visited)
- query: Search or retrieve data

Extract relevant data fields from the command. Return JSON in this format:
{
  "action": "action_name",
  "entity": "entity_type", 
  "data": {"field": "value"},
  "confidence": 0.0-1.0
}

Examples:
"add contact John with phone 1234567890 met in Pune" → {"action": "add_person", "entity": "person", "data": {"name": "John", "phone": "1234567890", "whereMet": "Pune"}, "confidence": 0.95}
"expense 250 for lunch" → {"action": "add_expense", "entity": "expense", "data": {"amount": "250", "category": "food", "note": "lunch"}, "confidence": 0.90}`
        },
        {
          role: "user",
          content: command,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      action: result.action || 'unknown',
      entity: result.entity || 'unknown',
      data: result.data || {},
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
    };
  } catch (error) {
    console.error("Failed to parse command with OpenAI:", error);
    return {
      action: 'unknown',
      entity: 'unknown', 
      data: {},
      confidence: 0,
    };
  }
}

export async function parseQuery(query: string, availableData: string[]): Promise<QueryIntent> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a query parser for a travel companion app. Parse natural language queries into structured search filters.

Available data types: ${availableData.join(', ')}

Parse queries like:
- "show me people in Pune" 
- "list expenses from last week"
- "find contacts who are guides"
- "journal entries about food"

Return JSON in this format:
{
  "type": "search|filter|list",
  "entity": "people|expenses|journal|pins",
  "filters": {"field": "value"},
  "query": "original_query",
  "confidence": 0.0-1.0
}

Examples:
"show me people in Pune" → {"type": "filter", "entity": "people", "filters": {"whereMet": "Pune"}, "query": "show me people in Pune", "confidence": 0.95}
"list today's expenses" → {"type": "filter", "entity": "expenses", "filters": {"date": "today"}, "query": "list today's expenses", "confidence": 0.90}`
        },
        {
          role: "user",
          content: query,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      type: result.type || 'search',
      entity: result.entity || 'unknown',
      filters: result.filters || {},
      query: result.query || query,
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
    };
  } catch (error) {
    console.error("Failed to parse query with OpenAI:", error);
    return {
      type: 'search',
      entity: 'unknown',
      filters: {},
      query: query,
      confidence: 0,
    };
  }
}

export async function generateResponse(userQuery: string, searchResults: any[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a helpful travel assistant. Based on the user's query and the data found, provide a natural, conversational response. 

Keep responses concise and helpful. Format data in a readable way. If no results found, suggest alternatives.

Examples:
- For people searches: "I found 3 people you met in Pune: John (Guide), Sarah (Traveler), and Mike (Local)."
- For expense queries: "You spent ₹1,250 today: ₹400 on food, ₹500 on transport, ₹350 on stay."
- For empty results: "I couldn't find any people in Pune in your contacts. Try searching for a different location or check if the name is spelled correctly."`
        },
        {
          role: "user",
          content: `Query: ${userQuery}\n\nData found: ${JSON.stringify(searchResults)}`
        },
      ],
    });

    return response.choices[0].message.content || "I couldn't process your request.";
  } catch (error) {
    console.error("Failed to generate response with OpenAI:", error);
    return "I encountered an error while processing your request.";
  }
}