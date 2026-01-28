import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertSettings } from "@shared/schema";

// Settings
export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<InsertSettings>) => {
      const res = await fetch(api.settings.update.path, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
    },
  });
}

// ROS Nodes
export function useRosNodes() {
  return useQuery({
    queryKey: [api.ros.nodes.path],
    queryFn: async () => {
      const res = await fetch(api.ros.nodes.path);
      if (!res.ok) throw new Error("Failed to fetch ROS nodes");
      return api.ros.nodes.responses[200].parse(await res.json());
    },
    refetchInterval: 5000,
  });
}

// ROS Topics
export function useRosTopics() {
  return useQuery({
    queryKey: [api.ros.topics.path],
    queryFn: async () => {
      const res = await fetch(api.ros.topics.path);
      if (!res.ok) throw new Error("Failed to fetch ROS topics");
      return api.ros.topics.responses[200].parse(await res.json());
    },
    refetchInterval: 5000,
  });
}

// Publish Message
export function usePublishMessage() {
  return useMutation({
    mutationFn: async (data: { topic: string; type: string; msg: Record<string, any> }) => {
      const res = await fetch(api.ros.publish.path, {
        method: api.ros.publish.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to publish message");
      return api.ros.publish.responses[200].parse(await res.json());
    },
  });
}

// Subscribe/Echo (fetch latest)
export function useRosTopicMessages(topic: string, enabled = false) {
  return useQuery({
    queryKey: [api.ros.subscribe.path, topic],
    queryFn: async () => {
      const url = buildUrl(api.ros.subscribe.path, { topic: encodeURIComponent(topic) });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch topic messages");
      return api.ros.subscribe.responses[200].parse(await res.json());
    },
    enabled: enabled && !!topic,
    refetchInterval: enabled ? 1000 : false,
  });
}

// Node Graph
export function useRosGraph() {
  return useQuery({
    queryKey: [api.ros.graph.path],
    queryFn: async () => {
      const res = await fetch(api.ros.graph.path);
      if (!res.ok) throw new Error("Failed to fetch node graph");
      return api.ros.graph.responses[200].parse(await res.json());
    },
    refetchInterval: 10000,
  });
}

// TF Tree
export function useRosTf() {
  return useQuery({
    queryKey: [api.ros.tf.path],
    queryFn: async () => {
      const res = await fetch(api.ros.tf.path);
      if (!res.ok) throw new Error("Failed to fetch TF frames");
      return api.ros.tf.responses[200].parse(await res.json());
    },
    refetchInterval: 2000,
  });
}

// MCP Logs
export function useMcpLogs() {
  return useQuery({
    queryKey: [api.mcp.logs.path],
    queryFn: async () => {
      const res = await fetch(api.mcp.logs.path);
      if (!res.ok) throw new Error("Failed to fetch MCP logs");
      return api.mcp.logs.responses[200].parse(await res.json());
    },
    refetchInterval: 3000,
  });
}
