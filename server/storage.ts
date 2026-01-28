import { db } from "./db";
import {
  settings,
  toolLogs,
  type Settings,
  type InsertSettings,
  type ToolLog,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<InsertSettings>): Promise<Settings>;
  
  // Logs
  createToolLog(log: { toolName: string; arguments: any; result: any; status: string }): Promise<ToolLog>;
  getToolLogs(): Promise<ToolLog[]>;
}

export class DatabaseStorage implements IStorage {
  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings);
    if (!existing) {
      const [created] = await db.insert(settings).values({}).returning();
      return created;
    }
    return existing;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const [existing] = await db.select().from(settings);
    if (!existing) {
      const [created] = await db.insert(settings).values(updates as InsertSettings).returning();
      return created;
    }
    const [updated] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.id, existing.id))
      .returning();
    return updated;
  }

  async createToolLog(log: { toolName: string; arguments: any; result: any; status: string }): Promise<ToolLog> {
    const [entry] = await db.insert(toolLogs).values(log).returning();
    return entry;
  }

  async getToolLogs(): Promise<ToolLog[]> {
    return await db.select().from(toolLogs).orderBy(desc(toolLogs.createdAt)).limit(50);
  }
}

export const storage = new DatabaseStorage();
