import * as ROSLIB from "roslib";
import { type IStorage } from "./storage";
import { type RosNode, type RosTopic, type RosMessage, type TfFrame, type NodeGraph } from "@shared/schema";
// import WebSocket from "ws"; // roslib uses 'ws' internally in node

// Mock Data Generators
function generateMockNodes(): RosNode[] {
  return [
    { name: "/talker", namespace: "/", publications: ["/chatter"], subscriptions: [], services: ["/talker/get_loggers"] },
    { name: "/listener", namespace: "/", publications: [], subscriptions: ["/chatter"], services: ["/listener/get_loggers"] },
    { name: "/turtlesim", namespace: "/", publications: ["/turtle1/pose", "/turtle1/color_sensor"], subscriptions: ["/turtle1/cmd_vel"], services: ["/reset", "/spawn", "/kill"] }
  ];
}

function generateMockTopics(): RosTopic[] {
  return [
    { name: "/chatter", type: "std_msgs/String" },
    { name: "/turtle1/cmd_vel", type: "geometry_msgs/Twist" },
    { name: "/turtle1/pose", type: "turtlesim/Pose" },
    { name: "/tf", type: "tf2_msgs/TFMessage" }
  ];
}

function generateMockGraph(): NodeGraph {
  return {
    nodes: [
      { id: "/talker", label: "/talker" },
      { id: "/listener", label: "/listener" },
      { id: "/turtlesim", label: "/turtlesim" }
    ],
    edges: [
      { id: "e1", source: "/talker", target: "/listener", label: "/chatter" },
      { id: "e2", source: "user", target: "/turtlesim", label: "/turtle1/cmd_vel" } // "user" represents external input
    ]
  };
}

export class RosService {
  private ros: ROSLIB.Ros | null = null;
  private storage: IStorage;
  private isSimulated: boolean = true;
  private topicHistory: Map<string, RosMessage[]> = new Map();
  private subscribers: Map<string, ROSLIB.Topic> = new Map();

  constructor(storage: IStorage) {
    this.storage = storage;
    this.initialize();
  }

  async initialize() {
    const settings = await this.storage.getSettings();
    this.isSimulated = settings.isSimulated;
    if (!this.isSimulated) {
      this.connect(settings.rosbridgeUrl);
    }
  }

  async reconnect() {
    if (this.ros) {
      this.ros.close();
      this.ros = null;
    }
    await this.initialize();
  }

  private connect(url: string) {
    console.log(`Connecting to ROS Bridge at ${url}`);
    try {
      this.ros = new ROSLIB.Ros({ url });
      
      this.ros.on('connection', () => {
        console.log('Connected to websocket server.');
      });

      this.ros.on('error', (error) => {
        console.log('Error connecting to websocket server: ', error);
        // Fallback to simulated if connection fails? 
        // For now, just log.
      });

      this.ros.on('close', () => {
        console.log('Connection to websocket server closed.');
      });
    } catch (e) {
      console.error("Failed to create ROS connection:", e);
    }
  }

  // === API Methods ===

  async getNodes(): Promise<RosNode[]> {
    if (this.isSimulated || !this.ros?.isConnected) {
      return generateMockNodes();
    }
    
    return new Promise((resolve, reject) => {
      this.ros!.getNodes((nodes) => {
        // Fetch details for each node (expensive in real ROS, maybe just return names)
        // For efficiency in this demo, we'll map names to basic objects
        // In a real app, we'd call getNodeDetails for each.
        const rosNodes: RosNode[] = nodes.map(name => ({
          name,
          namespace: "/",
          publications: [],
          subscriptions: [],
          services: []
        }));
        resolve(rosNodes);
      }, (error) => reject(error));
    });
  }

  async getTopics(): Promise<RosTopic[]> {
    if (this.isSimulated || !this.ros?.isConnected) {
      return generateMockTopics();
    }

    return new Promise((resolve, reject) => {
      this.ros!.getTopics((result) => {
        const topics = result.topics.map((name, i) => ({
          name,
          type: result.types[i]
        }));
        resolve(topics);
      }, (error) => reject(error));
    });
  }

  async publish(topicName: string, messageType: string, message: any) {
    if (this.isSimulated || !this.ros?.isConnected) {
      console.log(`[SIM] Published to ${topicName}:`, message);
      // Store in history for simulation
      this.storeMessage(topicName, message);
      return;
    }

    const topic = new ROSLIB.Topic({
      ros: this.ros!,
      name: topicName,
      messageType: messageType
    });
    const msg = new ROSLIB.Message(message);
    topic.publish(msg);
  }

  subscribe(topicName: string, messageType: string = 'std_msgs/String') {
    if (this.subscribers.has(topicName)) return;

    if (this.isSimulated || !this.ros?.isConnected) {
      // Start generating mock data if simulated
      if (!this.topicHistory.has(topicName)) {
        this.topicHistory.set(topicName, []);
      }
      return;
    }

    const topic = new ROSLIB.Topic({
      ros: this.ros!,
      name: topicName,
      messageType: messageType
    });

    topic.subscribe((message) => {
      this.storeMessage(topicName, message);
    });
    this.subscribers.set(topicName, topic);
  }

  private storeMessage(topic: string, message: any) {
    if (!this.topicHistory.has(topic)) {
      this.topicHistory.set(topic, []);
    }
    const history = this.topicHistory.get(topic)!;
    history.push(message);
    if (history.length > 50) history.shift(); // Keep last 50
  }

  getTopicHistory(topic: string): RosMessage[] {
    // Generate some data if simulated and empty
    if (this.isSimulated && (!this.topicHistory.has(topic) || this.topicHistory.get(topic)!.length === 0)) {
       const mockMsg = { data: `Mock data ${Date.now()}`, stamp: Date.now() };
       this.storeMessage(topic, mockMsg);
    }
    return this.topicHistory.get(topic) || [];
  }

  async getGraph(): Promise<NodeGraph> {
    if (this.isSimulated || !this.ros?.isConnected) {
      return generateMockGraph();
    }
    // Real graph construction via ROS API is complex (polling all nodes).
    // For MVP, return a simplified list or static graph, 
    // or try to fetch from standard /rosapi/get_node_details if available.
    return generateMockGraph(); // Fallback for now
  }

  async getTfFrames(): Promise<TfFrame[]> {
    if (this.isSimulated || !this.ros?.isConnected) {
      return [
        { 
          child_frame_id: "base_link", 
          header: { frame_id: "map" }, 
          transform: { translation: { x: 1, y: 2, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } } 
        }
      ];
    }
    // TF monitoring usually requires a TFClient which listens to /tf
    // We can't easily return a snapshot without listening for a while.
    return []; 
  }
}
