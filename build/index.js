"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const child_process_1 = require("child_process");
const util_1 = require("util");
const child_process_2 = require("child_process");
const execAsync = (0, util_1.promisify)(child_process_2.exec);
// Create server instance
const server = new mcp_js_1.McpServer({
    name: "ros-mcp",
    version: "1.0.0",
});
// Helper function to execute ROS 2 commands
function executeRosCommand(command) {
    try {
        const result = (0, child_process_1.execSync)(command, {
            encoding: "utf-8",
            env: process.env,
        });
        return result.trim();
    }
    catch (error) {
        return `Error: ${error.message || error}`;
    }
}
// Helper function to execute command with timeout
async function executeWithTimeout(command, timeoutMs = 5000) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            resolve("Command timeout - partial results above");
        }, timeoutMs);
        try {
            const result = executeRosCommand(command);
            clearTimeout(timer);
            resolve(result);
        }
        catch (error) {
            clearTimeout(timer);
            resolve(`Error: ${error.message}`);
        }
    });
}
// ==================== TOOL DEFINITIONS ====================
// Tool 1: List all ROS 2 nodes
server.tool("list_ros_nodes", "List all currently running ROS 2 nodes and their information", {}, async () => {
    const output = executeRosCommand("ros2 node list");
    const nodes = output.split("\n").filter((line) => line.trim());
    if (nodes.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: "No ROS 2 nodes are currently running.",
                },
            ],
        };
    }
    let details = "Running ROS 2 Nodes:\n";
    for (const node of nodes) {
        const nodeInfo = executeRosCommand(`ros2 node info ${node}`);
        details += `\n${node}:\n${nodeInfo}\n`;
    }
    return {
        content: [
            {
                type: "text",
                text: details,
            },
        ],
    };
});
// Tool 2: List ROS 2 topics
server.tool("list_ros_topics", "List all ROS 2 topics with their types and publishers/subscribers", {
    detailed: zod_1.z.boolean().optional().describe("Show detailed topic information"),
}, async (params) => {
    const command = params.detailed ? "ros2 topic list -t" : "ros2 topic list";
    const output = executeRosCommand(command);
    return {
        content: [
            {
                type: "text",
                text: output || "No topics available",
            },
        ],
    };
});
// Tool 3: Monitor a specific topic (observational - waits and collects data)
server.tool("monitor_topic", "Monitor a ROS 2 topic for a specified duration. Collects messages over time.", {
    topic_name: zod_1.z.string().describe("The name of the topic to monitor"),
    duration_seconds: zod_1.z
        .number()
        .positive()
        .max(30)
        .default(5)
        .describe("How long to monitor (max 30 seconds)"),
    message_count: zod_1.z
        .number()
        .positive()
        .max(100)
        .optional()
        .describe("Stop after collecting this many messages (whichever comes first)"),
}, async (params) => {
    const duration = params.duration_seconds || 5;
    const count = params.message_count ? `-c ${params.message_count}` : "";
    const command = `timeout ${duration} ros2 topic echo ${params.topic_name} ${count} 2>/dev/null || true`;
    const output = await executeWithTimeout(command, (duration + 2) * 1000);
    return {
        content: [
            {
                type: "text",
                text: output ||
                    `No messages received on topic '${params.topic_name}' during ${duration}s`,
            },
        ],
    };
});
// Tool 4: Get topic statistics and info
server.tool("get_topic_info", "Get detailed information about a specific ROS 2 topic including message type", {
    topic_name: zod_1.z.string().describe("The name of the topic"),
}, async (params) => {
    const output = executeRosCommand(`ros2 topic info ${params.topic_name}`);
    return {
        content: [
            {
                type: "text",
                text: output,
            },
        ],
    };
});
// Tool 5: Publish a message to a topic
server.tool("publish_to_topic", "Publish a message to a ROS 2 topic", {
    topic_name: zod_1.z.string().describe("The topic name to publish to"),
    message: zod_1.z.string().describe("The message content in ROS message format"),
    topic_type: zod_1.z.string().optional().describe("The message type (e.g., std_msgs/String)"),
}, async (params) => {
    let command = `ros2 topic pub --once ${params.topic_name}`;
    if (params.topic_type) {
        command += ` ${params.topic_type}`;
    }
    command += ` "${params.message}"`;
    const output = executeRosCommand(command);
    return {
        content: [
            {
                type: "text",
                text: output || `Message published to ${params.topic_name}`,
            },
        ],
    };
});
// Tool 6: List ROS 2 services
server.tool("list_ros_services", "List all available ROS 2 services", {}, async () => {
    const output = executeRosCommand("ros2 service list");
    return {
        content: [
            {
                type: "text",
                text: output || "No services available",
            },
        ],
    };
});
// Tool 7: Call a ROS 2 service
server.tool("call_service", "Call a ROS 2 service with optional parameters", {
    service_name: zod_1.z.string().describe("The name of the service"),
    request: zod_1.z
        .string()
        .optional()
        .describe("The request parameters. A dictionary in YAML format"),
}, async (params) => {
    let command = `ros2 service call ${params.service_name}`;
    if (params.request) {
        command += ` "${params.request}"`;
    }
    const output = executeRosCommand(command);
    return {
        content: [
            {
                type: "text",
                text: output,
            },
        ],
    };
});
// Tool 8: Monitor TF2 frames
server.tool("monitor_tf2_frames", "Monitor TF2 transform frames and their relationships", {
    duration_seconds: zod_1.z
        .number()
        .positive()
        .max(30)
        .default(5)
        .describe("Duration to monitor TF2 frames"),
}, async (params) => {
    const duration = params.duration_seconds || 5;
    // Get current frame tree
    const frameTree = executeRosCommand("ros2 run tf2_tools view_frames.py 2>/dev/null || echo 'TF2 tools not available'");
    // Get static transforms
    const staticTf = executeRosCommand(`timeout ${duration} ros2 topic echo /tf_static --qos-reliability reliable 2>/dev/null || echo 'No static transforms'`);
    const dynamicTf = executeRosCommand(`timeout ${duration} ros2 topic echo /tf 2>/dev/null || echo 'No dynamic transforms'`);
    const result = `TF2 Frame Information:\n\nFrame Tree:\n${frameTree}\n\nStatic Transforms:\n${staticTf}\n\nDynamic Transforms (sampled):\n${dynamicTf}`;
    return {
        content: [
            {
                type: "text",
                text: result,
            },
        ],
    };
});
// Tool 9: Get node parameters
server.tool("get_node_parameters", "Get parameters for a specific ROS 2 node", {
    node_name: zod_1.z.string().describe("The name of the node"),
}, async (params) => {
    const output = executeRosCommand(`ros2 param list ${params.node_name}`);
    return {
        content: [
            {
                type: "text",
                text: output || `No parameters found for node '${params.node_name}'`,
            },
        ],
    };
});
// Tool 10: Set node parameter
server.tool("set_node_parameter", "Set a parameter for a ROS 2 node", {
    node_name: zod_1.z.string().describe("The name of the node"),
    param_name: zod_1.z.string().describe("The parameter name"),
    param_value: zod_1.z.string().describe("The parameter value"),
}, async (params) => {
    const output = executeRosCommand(`ros2 param set ${params.node_name} ${params.param_name} ${params.param_value}`);
    return {
        content: [
            {
                type: "text",
                text: output,
            },
        ],
    };
});
// Tool 11: Get node subscriptions and publications
server.tool("get_node_connections", "Get all topics that a node publishes to and subscribes from", {
    node_name: zod_1.z.string().describe("The name of the node"),
}, async (params) => {
    const output = executeRosCommand(`ros2 node info ${params.node_name}`);
    return {
        content: [
            {
                type: "text",
                text: output,
            },
        ],
    };
});
// Tool 12: Generate RQT graph (node and topic dependency visualization)
server.tool("generate_ros_graph", "Generate RQT graph showing connections between nodes and topics", {
    output_format: zod_1.z
        .enum(["text", "dot"])
        .default("text")
        .describe("Output format: text (ASCII) or dot (for graphviz)"),
}, async (params) => {
    // Get all nodes
    const nodeList = executeRosCommand("ros2 node list").split("\n").filter((n) => n.trim());
    // Build a graph representation
    let graphData = {};
    for (const node of nodeList) {
        const nodeInfo = executeRosCommand(`ros2 node info ${node}`);
        graphData[node] = {
            pubs: nodeInfo.match(/Published topics:[\s\S]*?(?=Subscribed topics:|$)/)?.[0]
                ?.split("\n")
                .slice(1)
                .map((t) => t.trim().split(" ")[0])
                .filter((t) => t) || [],
            subs: nodeInfo.match(/Subscribed topics:[\s\S]*?(?=Services|$)/)?.[0]
                ?.split("\n")
                .slice(1)
                .map((t) => t.trim().split(" ")[0])
                .filter((t) => t) || [],
        };
    }
    if (params.output_format === "dot") {
        let dot = "digraph ros_graph {\n";
        dot += '  rankdir=LR;\n  node [shape=box];\n';
        for (const [node, connections] of Object.entries(graphData)) {
            dot += `  "${node}" [style=filled fillcolor=lightblue];\n`;
            for (const pub of connections.pubs) {
                dot += `  "${node}" -> "${pub}" [label="pub"];\n`;
            }
            for (const sub of connections.subs) {
                dot += `  "${sub}" -> "${node}" [label="sub"];\n`;
            }
        }
        dot += "}\n";
        return {
            content: [
                {
                    type: "text",
                    text: dot,
                },
            ],
        };
    }
    else {
        let graph = "ROS 2 Node and Topic Dependency Graph\n";
        graph += "=======================================\n\n";
        for (const [node, connections] of Object.entries(graphData)) {
            graph += `Node: ${node}\n`;
            if (connections.pubs.length > 0) {
                graph += `  Publishes: ${connections.pubs.join(", ")}\n`;
            }
            if (connections.subs.length > 0) {
                graph += `  Subscribes: ${connections.subs.join(", ")}\n`;
            }
            graph += "\n";
        }
        return {
            content: [
                {
                    type: "text",
                    text: graph,
                },
            ],
        };
    }
});
// Tool 13: Run a ROS 2 launch file
server.tool("run_ros_launch", "Launch a ROS 2 package launch file", {
    package_name: zod_1.z.string().describe("The ROS 2 package name"),
    launch_file: zod_1.z.string().describe("The launch file name (without .launch.py)"),
    args: zod_1.z
        .string()
        .optional()
        .describe("Additional arguments to pass to the launch file"),
}, async (params) => {
    const argsStr = params.args ? ` ${params.args}` : "";
    const command = `ros2 launch ${params.package_name} ${params.launch_file}.launch.py${argsStr}`;
    const output = executeRosCommand(command);
    return {
        content: [
            {
                type: "text",
                text: `Launch command: ${command}\nStatus: ${output}`,
            },
        ],
    };
});
// Tool 14: Run a ROS 2 node directly
server.tool("run_ros_node", "Run a ROS 2 node from a package", {
    package_name: zod_1.z.string().describe("The ROS 2 package name"),
    node_type: zod_1.z.string().describe("The node executable name"),
    node_name: zod_1.z.string().optional().describe("Custom name for the node instance"),
    args: zod_1.z.string().optional().describe("Additional arguments for the node"),
}, async (params) => {
    let command = `ros2 run ${params.package_name} ${params.node_type}`;
    if (params.node_name) {
        command += ` --ros-args -n ${params.node_name}`;
    }
    if (params.args) {
        command += ` ${params.args}`;
    }
    // This is a fire-and-forget command for testing
    const output = executeRosCommand(command);
    return {
        content: [
            {
                type: "text",
                text: `Node launch command: ${command}\nStatus: Started (run in background)`,
            },
        ],
    };
});
// Tool 15: Check ROS 2 system status and node health
server.tool("check_ros_system_status", "Check overall ROS 2 system status, daemon, and node health", {
    include_diagnostics: zod_1.z.boolean().optional().describe("Include diagnostic aggregator info"),
}, async (params) => {
    let status = "ROS 2 System Status Report\n";
    status += "==========================\n\n";
    // Check daemon
    const daemon = executeRosCommand("ps aux | grep ros2_daemon || echo 'Daemon status check'");
    status += `ROS 2 Daemon:\n${daemon}\n\n`;
    // List nodes
    const nodes = executeRosCommand("ros2 node list");
    const nodeCount = nodes.split("\n").filter((n) => n.trim()).length;
    status += `Active Nodes: ${nodeCount}\n${nodes}\n\n`;
    // Check topics
    const topics = executeRosCommand("ros2 topic list");
    const topicCount = topics.split("\n").filter((t) => t.trim()).length;
    status += `Active Topics: ${topicCount}\n\n`;
    // Check services
    const services = executeRosCommand("ros2 service list");
    const serviceCount = services.split("\n").filter((s) => s.trim()).length;
    status += `Available Services: ${serviceCount}\n\n`;
    if (params.include_diagnostics) {
        const diag = executeRosCommand(`timeout 5 ros2 topic echo /diagnostics_agg 2>/dev/null || echo 'No diagnostics available'`);
        status += `Diagnostics:\n${diag}\n`;
    }
    return {
        content: [
            {
                type: "text",
                text: status,
            },
        ],
    };
});
// ==================== SERVER STARTUP ====================
// Start the server with stdio transport
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("ROS 2 MCP Server started and listening on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
