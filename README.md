# ROS 2 MCP Server
![NPM Version](https://img.shields.io/npm/v/ros-mcp)
[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522ros%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522ros-mcp%2522%255D%257D)

A Model Context Protocol (MCP) server for ROS 2 that enables GitHub Copilot and other AI agents to interact with ROS 2 systems. This server provides tools for monitoring, debugging, and managing ROS 2 nodes, topics, services, and TF2 frames.

### Quickstart

Add the following to `.vscode/mcp.json`

```json
{
  "servers": {
    "ros": {
      "command": "npx",
      "args": ["ros-mcp"]
    }
  }
}
```

Ensure the server is selected in tools for vs code copilot

You're good to go!
try "List active ros topics" to test it out.

## Features

### Node Management
- **list_ros_nodes**: List all running ROS 2 nodes with detailed information
- **get_node_connections**: View all topics a node publishes to and subscribes from
- **get_node_parameters**: List parameters for a specific node
- **set_node_parameter**: Modify node parameters at runtime
- **run_ros_node**: Launch a ROS 2 node from a package
- **run_ros_launch**: Execute a launch file

### Topic Monitoring
- **list_ros_topics**: List all available topics with optional detailed type information
- **get_topic_info**: Get detailed information about a specific topic
- **monitor_topic**: Subscribe to a topic and collect messages for a specified duration (observational tool with wait capability)
- **publish_to_topic**: Publish messages to a topic

### Service Management
- **list_ros_services**: List all available services
- **call_service**: Call a service with optional parameters

### TF2 Frame Monitoring
- **monitor_tf2_frames**: Monitor TF2 transform frames and relationships (includes static and dynamic transforms)

### System Visualization & Debugging
- **generate_ros_graph**: Generate dependency graphs showing connections between nodes and topics (supports both text and Graphviz DOT format)
- **check_ros_system_status**: Check overall system health, daemon status, and node/topic/service counts

## Installation

### Prerequisites
- ROS 2 (tested with Humble and later)
- Node.js 18+
- npm or yarn

### Manual Setup

```bash
# Clone or navigate to the repository
cd /path/to/ROS-MCP

# Install dependencies
npm install

# Build the TypeScript
npm run build
```

WSL might need linking the nvm node to the default node path

sudo ln -s ~/.nvm/versions/node/v24.11.0/bin/node /usr/local/bin/node
sudo ln -s ~/.nvm/versions/node/v24.11.0/bin/npm /usr/local/bin/npm

## Usage

### Running the Server

```bash
# Direct execution (recommended for MCP integration)
npm start

# Development with ts-node
npm run dev
```

### With GitHub Copilot

Configure the MCP server in your GitHub Copilot settings:

```json
{
  "servers": {
    "ros": {
      "command": "node",
      "args": ["/path/to/ROS-MCP/build/index.js"]
    }
  }
}
```

## Tool Details

### Observational Tools (with Wait Capability)

Some tools are designed to collect data over time, allowing the agent to wait and observe:

- **monitor_topic**: Waits for 1-30 seconds, collecting messages from a topic. Supports custom message count limits. Perfect for:
  - Observing sensor data streams
  - Verifying topic publishing patterns
  - Debugging message throughput

- **monitor_tf2_frames**: Observes TF2 frame transforms over a specified duration (1-30 seconds)

### Tool Examples

#### Monitor a Topic
```
Tool: monitor_topic
Parameters:
  - topic_name: "/sensor_msgs/LaserScan"
  - duration_seconds: 5
  - message_count: 10
```
This collects up to 10 messages from the LaserScan topic over 5 seconds.

#### Generate Node Graph
```
Tool: generate_ros_graph
Parameters:
  - output_format: "text" (or "dot" for Graphviz)
```
Returns a visual representation of how nodes and topics are connected.

#### Monitor System Health
```
Tool: check_ros_system_status
Parameters:
  - include_diagnostics: true
```
Provides comprehensive system status including daemon health, active nodes, and services.

## Architecture

The server is built with:
- **@modelcontextprotocol/sdk**: MCP framework for agent communication
- **Zod**: Type-safe parameter validation
- **Node.js Child Process**: Command execution for ROS 2 CLI tools

## How It Works

1. **Command Execution**: Each tool executes the corresponding `ros2` CLI command
2. **Output Parsing**: Results are parsed and formatted for agent consumption
3. **Timeout Handling**: Observational tools use configurable timeouts to collect data
4. **Error Handling**: Commands that fail gracefully return error messages

## Designing Tools for Agent Observation

This MCP server follows patterns that work well with AI agents:

1. **Blocking Observational Operations**: Tools like `monitor_topic` block for the specified duration, allowing agents to naturally await results
2. **Bounded Time Windows**: All monitoring tools have maximum durations (typically 5-30 seconds) to prevent indefinite waits
3. **Progressive Data Collection**: Tools collect data incrementally and return results at the end of the observation window
4. **Clear Output Format**: Results are structured text that agents can easily parse and reason about

## Example Usage with Copilot

A Copilot agent using this MCP can:

```
Agent: "What topics are currently being published?"
[Uses: list_ros_topics]

Agent: "Let me observe the /cmd_vel topic for 5 seconds"
[Uses: monitor_topic with topic_name="/cmd_vel", duration_seconds=5]
[Waits 5 seconds for data collection]

Agent: "Here are the velocity commands being sent: [parsed data]"

Agent: "Show me how all nodes are connected"
[Uses: generate_ros_graph with output_format="text"]

Agent: "Let me try publishing a test message to the /cmd_vel topic"
[Uses: publish_to_topic]

Agent: "Let me check if any node is having issues"
[Uses: check_ros_system_status with include_diagnostics=true]
```

## Limitations

- Some ROS 2 CLI commands require the ROS 2 environment to be properly sourced
- TF2 monitoring requires the `tf2_tools` package to be installed
- The server executes commands in the current environment - ensure ROS 2 is properly installed
- Long-running operations may timeout; adjust duration parameters as needed

## Future Enhancements

- Integration with ROS 2 bag recording/playback
- Parameter server monitoring
- Action client/server interface
- Live rqt plugin integration
- Rviz2 data streaming
- Custom message type parsing
- CLI

## License

MIT

## Contributing

Contributions welcome! Please ensure all tools handle errors gracefully and include proper parameter validation.
