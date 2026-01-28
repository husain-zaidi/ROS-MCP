import { pgTable, text, serial, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === SETTINGS ===
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  rosbridgeUrl: text("rosbridge_url").notNull().default("ws://localhost:9090"),
  isSimulated: boolean("is_simulated").notNull().default(true),
});

export const insertSettingsSchema = createInsertSchema(settings);
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// === LOGS (for MCP tool activity) ===
export const toolLogs = pgTable("tool_logs", {
  id: serial("id").primaryKey(),
  toolName: text("tool_name").notNull(),
  arguments: jsonb("arguments"),
  result: jsonb("result"),
  status: text("status").notNull(), // 'success', 'error', 'pending'
  createdAt: timestamp("created_at").defaultNow(),
});

export type ToolLog = typeof toolLogs.$inferSelect;

// === ROS TYPES (Non-database, used for API contracts) ===

export const RosNodeSchema = z.object({
  name: z.string(),
  namespace: z.string(),
  publications: z.array(z.string()),
  subscriptions: z.array(z.string()),
  services: z.array(z.string()),
});
export type RosNode = z.infer<typeof RosNodeSchema>;

export const RosTopicSchema = z.object({
  name: z.string(),
  type: z.string(),
});
export type RosTopic = z.infer<typeof RosTopicSchema>;

export const RosMessageSchema = z.record(z.any());
export type RosMessage = z.infer<typeof RosMessageSchema>;

export const TfFrameSchema = z.object({
  child_frame_id: z.string(),
  header: z.object({
    frame_id: z.string(),
    stamp: z.object({ sec: z.number(), nanosec: z.number() }).optional(),
  }),
  transform: z.object({
    translation: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    rotation: z.object({ x: z.number(), y: z.number(), z: z.number(), w: z.number() }),
  }),
});
export type TfFrame = z.infer<typeof TfFrameSchema>;

export const NodeGraphSchema = z.object({
  nodes: z.array(z.object({ id: z.string(), label: z.string() })),
  edges: z.array(z.object({ id: z.string(), source: z.string(), target: z.string(), label: z.string().optional() })),
});
export type NodeGraph = z.infer<typeof NodeGraphSchema>;
