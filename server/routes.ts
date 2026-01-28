import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { RosService } from "./ros-service";
import { McpServer } from "./mcp-server";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize ROS Service
  const rosService = new RosService(storage);
  const mcpServer = new McpServer(rosService);

  // Settings Routes
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post(api.settings.update.path, async (req, res) => {
    const updated = await storage.updateSettings(req.body);
    // Re-initialize ROS service if connection details changed
    rosService.reconnect();
    res.json(updated);
  });

  // ROS Routes
  app.get(api.ros.nodes.path, async (req, res) => {
    const nodes = await rosService.getNodes();
    res.json(nodes);
  });

  app.get(api.ros.topics.path, async (req, res) => {
    const topics = await rosService.getTopics();
    res.json(topics);
  });

  app.post(api.ros.publish.path, async (req, res) => {
    try {
      const { topic, type, msg } = req.body;
      await rosService.publish(topic, type, msg);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.get('/api/ros/subscribe/:topic', async (req, res) => {
    const topic = req.params.topic;
    // Simple fetch of latest state for REST
    const history = rosService.getTopicHistory(topic);
    const latest = history[history.length - 1];
    res.json({ topic, latestMessage: latest, history });
  });

  app.get(api.ros.graph.path, async (req, res) => {
    const graph = await rosService.getGraph();
    res.json(graph);
  });

  app.get(api.ros.tf.path, async (req, res) => {
    const tf = await rosService.getTfFrames();
    res.json(tf);
  });

  // MCP Logs
  app.get(api.mcp.logs.path, async (req, res) => {
    const logs = await storage.getToolLogs();
    res.json(logs);
  });

  // MCP Server Endpoint (SSE or direct tool execution)
  // Here we expose the tools via HTTP so they can be called by an agent
  app.post('/api/mcp/execute', async (req, res) => {
    const { tool, args } = req.body;
    try {
      const result = await mcpServer.executeTool(tool, args);
      await storage.createToolLog({
        toolName: tool,
        arguments: args,
        result,
        status: 'success'
      });
      res.json(result);
    } catch (error: any) {
      await storage.createToolLog({
        toolName: tool,
        arguments: args,
        result: { error: error.message },
        status: 'error'
      });
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
