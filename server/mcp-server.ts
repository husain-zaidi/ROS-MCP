import { RosService } from "./ros-service";

export class McpServer {
  private rosService: RosService;

  constructor(rosService: RosService) {
    this.rosService = rosService;
  }

  async executeTool(name: string, args: any): Promise<any> {
    console.log(`Executing tool: ${name}`, args);
    
    switch (name) {
      case "list_nodes":
        return await this.rosService.getNodes();
      
      case "list_topics":
        return await this.rosService.getTopics();
      
      case "read_topic":
        // Args: { topic: string, duration_sec?: number }
        const { topic, duration_sec = 1 } = args;
        // Logic: subscribe, wait, return messages collected
        this.rosService.subscribe(topic);
        
        // Wait for data
        await new Promise(resolve => setTimeout(resolve, duration_sec * 1000));
        
        const history = this.rosService.getTopicHistory(topic);
        // Return only recent messages collected during the window (approximated by taking last N)
        return { 
          topic, 
          messages: history.slice(-5) // Return last 5 for brevity
        };
      
      case "publish_message":
        // Args: { topic: string, type: string, msg: any }
        await this.rosService.publish(args.topic, args.type, args.msg);
        return { success: true, status: "Published" };
      
      case "get_tf_frames":
        return await this.rosService.getTfFrames();
        
      case "get_node_graph":
        return await this.rosService.getGraph();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
