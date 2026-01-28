import { z } from 'zod';
import { RosNodeSchema, RosTopicSchema, RosMessageSchema, TfFrameSchema, NodeGraphSchema, insertSettingsSchema, settings } from './schema';

export const api = {
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings',
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  },
  ros: {
    nodes: {
      method: 'GET' as const,
      path: '/api/ros/nodes',
      responses: {
        200: z.array(RosNodeSchema),
      },
    },
    topics: {
      method: 'GET' as const,
      path: '/api/ros/topics',
      responses: {
        200: z.array(RosTopicSchema),
      },
    },
    publish: {
      method: 'POST' as const,
      path: '/api/ros/publish',
      input: z.object({
        topic: z.string(),
        type: z.string(),
        msg: z.record(z.any()),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    subscribe: {
      method: 'GET' as const,
      path: '/api/ros/subscribe/:topic', // Use query param for message type if needed, or simple string
      responses: {
        200: z.object({ 
          topic: z.string(),
          latestMessage: RosMessageSchema.optional(),
          history: z.array(RosMessageSchema),
        }),
      },
    },
    graph: {
      method: 'GET' as const,
      path: '/api/ros/graph',
      responses: {
        200: NodeGraphSchema,
      },
    },
    tf: {
      method: 'GET' as const,
      path: '/api/ros/tf',
      responses: {
        200: z.array(TfFrameSchema),
      },
    }
  },
  mcp: {
    logs: {
      method: 'GET' as const,
      path: '/api/mcp/logs',
      responses: {
        200: z.array(z.custom<any>()), // ToolLog
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
