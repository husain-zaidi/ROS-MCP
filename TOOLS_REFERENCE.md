# ROS 2 MCP Tools Reference

Complete API documentation for all available tools in the ROS 2 MCP server.

## Table of Contents
1. [Node Management Tools](#node-management-tools)
2. [Topic Tools](#topic-tools)
3. [Service Tools](#service-tools)
4. [Transform (TF2) Tools](#transform-tf2-tools)
5. [System Tools](#system-tools)
6. [Visualization Tools](#visualization-tools)

---

## Node Management Tools

### list_ros_nodes
**Description**: List all currently running ROS 2 nodes and their detailed information.

**Parameters**: None

**Returns**: Text output containing:
- List of node names
- For each node: published topics, subscribed topics, services offered

**Example Usage**:
```
"List all ROS 2 nodes currently running"
```

**Response Example**:
```
Running ROS 2 Nodes:

/robot_driver:
  Subscriptions:
    /cmd_vel [geometry_msgs/msg/Twist]
  Publications:
    /odom [nav_msgs/msg/Odometry]
  Services offered:
    /set_parameters
    ...

/sensor_node:
  Subscriptions:
    (none)
  Publications:
    /sensor_data [sensor_msgs/msg/PointCloud2]
  ...
```

---

### get_node_connections
**Description**: Get all topics that a node publishes to and subscribes from.

**Parameters**:
- `node_name` (string, required): The name of the node (e.g., "/robot_driver")

**Returns**: Detailed node connection information including:
- Published topics with message types
- Subscribed topics with message types
- Available services

**Example Usage**:
```
"Show me what topics the /motion_controller node publishes and subscribes to"
```

---

### get_node_parameters
**Description**: Get all parameters available in a specific ROS 2 node.

**Parameters**:
- `node_name` (string, required): The name of the node

**Returns**: List of parameters and their current values

**Example Usage**:
```
"List all parameters for the /robot_driver node"
```

---

### set_node_parameter
**Description**: Set a parameter for a ROS 2 node at runtime.

**Parameters**:
- `node_name` (string, required): The name of the node
- `param_name` (string, required): The parameter name
- `param_value` (string, required): The new value

**Returns**: Confirmation of parameter change

**Example Usage**:
```
"Set the 'max_velocity' parameter on /robot_driver to 2.5"
```

---

### run_ros_node
**Description**: Run a ROS 2 node from a package.

**Parameters**:
- `package_name` (string, required): The ROS 2 package name
- `node_type` (string, required): The node executable name
- `node_name` (string, optional): Custom name for the node instance
- `args` (string, optional): Additional arguments for the node

**Returns**: Launch command and status

**Example Usage**:
```
"Run the controller node from the robot_control package"
```

**Command Generated**:
```
ros2 run robot_control controller --ros-args -n /my_controller
```

---

### run_ros_launch
**Description**: Launch a ROS 2 package launch file.

**Parameters**:
- `package_name` (string, required): The ROS 2 package name
- `launch_file` (string, required): The launch file name (without .launch.py)
- `args` (string, optional): Additional arguments to pass to the launch file

**Returns**: Launch command and status

**Example Usage**:
```
"Launch the navigation system using the nav_system launch file"
```

---

## Topic Tools

### list_ros_topics
**Description**: List all available ROS 2 topics.

**Parameters**:
- `detailed` (boolean, optional): If true, show message types for each topic

**Returns**: List of topic names and optionally their message types

**Example Usage**:
```
"What topics are currently available?"
"Show all ROS topics with their message types"
```

**Response Example**:
```
/robot/odom [nav_msgs/msg/Odometry]
/robot/pose [geometry_msgs/msg/PoseStamped]
/sensor/lidar [sensor_msgs/msg/PointCloud2]
/cmd_vel [geometry_msgs/msg/Twist]
```

---

### get_topic_info
**Description**: Get detailed information about a specific ROS 2 topic.

**Parameters**:
- `topic_name` (string, required): The name of the topic

**Returns**: Topic information including:
- Message type
- Number of publishers
- Number of subscribers
- Quality of Service settings

**Example Usage**:
```
"Tell me about the /cmd_vel topic"
```

---

### monitor_topic
**⏱️ OBSERVATIONAL TOOL** - Agent waits for specified duration

**Description**: Subscribe to a ROS 2 topic and collect messages over a specified time period.

**Parameters**:
- `topic_name` (string, required): The name of the topic to monitor
- `duration_seconds` (number, optional, default=5, max=30): How long to monitor
- `message_count` (number, optional, max=100): Stop after collecting N messages (whichever comes first)

**Returns**: Sample messages from the topic collected during the observation window

**Behavior**: 
- Blocks for the specified duration (agent naturally waits)
- Collects up to the specified number of messages
- Returns all collected data at the end

**Example Usage**:
```
"Monitor the /cmd_vel topic for 5 seconds and tell me what velocity commands are being sent"
```

**Response Example**:
```
linear: 
  x: 0.5
  y: 0.0
  z: 0.0
angular: 
  x: 0.0
  y: 0.0
  z: 0.1
---
linear: 
  x: 0.5
  y: 0.0
  z: 0.0
angular: 
  x: 0.0
  y: 0.0
  z: 0.15
---
```

---

### publish_to_topic
**Description**: Publish a message to a ROS 2 topic.

**Parameters**:
- `topic_name` (string, required): The topic name to publish to
- `message` (string, required): The message content in ROS message format
- `topic_type` (string, optional): The message type (e.g., std_msgs/String)

**Returns**: Confirmation that message was published

**Example Usage**:
```
"Publish 'Hello' to the /test_topic"
```

**Message Format Examples**:
```
# String message
"hello world"

# Twist message (velocity)
"linear: {x: 1.0, y: 0.0, z: 0.0} angular: {x: 0.0, y: 0.0, z: 0.0}"

# Point message
"x: 1.5 y: 2.0 z: 0.5"
```

---

## Service Tools

### list_ros_services
**Description**: List all available ROS 2 services.

**Parameters**: None

**Returns**: List of all registered services and their types

**Example Usage**:
```
"List all available ROS 2 services"
```

**Response Example**:
```
/robot/reset [std_srvs/srv/Empty]
/robot/calibrate [robot_msgs/srv/Calibrate]
/robot/get_status [robot_msgs/srv/GetStatus]
/robot/shutdown [std_srvs/srv/Trigger]
```

---

### call_service
**Description**: Call a ROS 2 service with optional parameters.

**Parameters**:
- `service_name` (string, required): The name of the service
- `request` (string, optional): The request parameters in YAML format

**Returns**: Service response

**Example Usage**:
```
"Call the /robot/reset service"
"Call the /robot/calibrate service with parameter 'joint_id: 1'"
```

---

## Transform (TF2) Tools

### monitor_tf2_frames
**⏱️ OBSERVATIONAL TOOL** - Agent waits for specified duration

**Description**: Monitor TF2 transform frames and their relationships.

**Parameters**:
- `duration_seconds` (number, optional, default=5, max=30): How long to monitor TF2 transforms

**Returns**:
- Frame tree structure
- Static transforms
- Sample of dynamic transforms collected during the observation period

**Behavior**:
- Blocks for the specified duration
- Collects both static and dynamic frame transforms
- Returns structured frame relationship data

**Example Usage**:
```
"Show me all TF2 frames in the system"
"Monitor the TF2 transforms for 10 seconds"
```

**Response Example**:
```
TF2 Frame Information:

Frame Tree:
map
├── odom
│   └── base_link
│       ├── camera_link
│       └── lidar_link
└── global_landmark

Static Transforms:
Transform [map] -> [map_stabilized]
  Translation: (0.00, 0.00, 0.00)
  Rotation: (0.00, 0.00, 0.00, 1.00)

Dynamic Transforms (sampled):
Transform [odom] -> [base_link]
  Translation: (0.50, 0.10, 0.00)
  Rotation: (0.00, 0.00, 0.707, 0.707)
...
```

---

## System Tools

### check_ros_system_status
**Description**: Check overall ROS 2 system status, daemon health, and active nodes/topics.

**Parameters**:
- `include_diagnostics` (boolean, optional): Include diagnostic aggregator information

**Returns**: Comprehensive system status report including:
- ROS 2 daemon status
- Number of active nodes with their names
- Number of active topics
- Number of available services
- Optional: Diagnostic aggregator data

**Example Usage**:
```
"Check the health of my ROS 2 system"
"Is my ROS 2 system running correctly?"
```

**Response Example**:
```
ROS 2 System Status Report
==========================

ROS 2 Daemon:
/root/.ros/humble_daemon_<PID>

Active Nodes: 5
/robot_driver
/sensor_node
/motion_controller
/state_publisher
/tf_broadcaster

Active Topics: 12

Available Services: 8

Diagnostics:
Status: OK (All subsystems nominal)
- /robot/motor_status: OK
- /robot/power: OK
- /sensors/lidar: OK
```

---

## Visualization Tools

### generate_ros_graph
**Description**: Generate a dependency graph showing connections between ROS 2 nodes and topics.

**Parameters**:
- `output_format` (string, optional, default="text"): Output format
  - "text": ASCII text representation
  - "dot": Graphviz DOT format for advanced visualization

**Returns**: Graph representation of node/topic relationships

**Example Usage**:
```
"Show me how all my ROS nodes and topics are connected"
"Generate a Graphviz graph of my ROS system"
```

**Response Example (text format)**:
```
ROS 2 Node and Topic Dependency Graph
=======================================

Node: /robot_driver
  Publishes: /odom, /battery_status
  Subscribes: /cmd_vel

Node: /motion_controller
  Publishes: /motor_commands
  Subscribes: /cmd_vel, /odom

Node: /sensor_node
  Publishes: /lidar_scan, /imu_data
  Subscribes: (none)
```

**Response Example (DOT format)**:
```graphviz
digraph ros_graph {
  rankdir=LR;
  node [shape=box];
  "/robot_driver" [style=filled fillcolor=lightblue];
  "/robot_driver" -> "/cmd_vel" [label="pub"];
  "/motion_controller" -> "/robot_driver" [label="sub"];
  ...
}
```

The DOT format can be converted to images:
```bash
dot -Tpng graph.dot -o graph.png
```

---

## Tool Usage Patterns

### Pattern 1: Instant Information Retrieval
Used for tools that return data immediately:
- `list_ros_nodes`
- `list_ros_topics`
- `get_node_parameters`
- `generate_ros_graph`

### Pattern 2: Observational Monitoring (Agent Blocking)
Used for tools that collect data over time:
- `monitor_topic` (agent waits 1-30 seconds)
- `monitor_tf2_frames` (agent waits 1-30 seconds)

These tools are perfect for AI agents because:
1. The agent naturally handles the waiting period
2. Returns comprehensive time-series data
3. Agent can then analyze and reason about the collected data

### Pattern 3: Actions with Feedback
Used for tools that perform changes:
- `set_node_parameter`
- `publish_to_topic`
- `call_service`
- `run_ros_node`

---

## Error Handling

All tools gracefully handle errors and return error messages. Examples:

```
"Error: ros2 command not found" 
→ ROS 2 is not installed or sourced

"Error: /nonexistent_node not found"
→ Node name is incorrect or node is not running

"No messages received on topic '/test_topic' during 5s"
→ Topic exists but no data is being published
```

---

## Best Practices for Agent Use

1. **Start with discovery**: Use `list_ros_nodes` and `list_ros_topics` first
2. **Understand topology**: Use `generate_ros_graph` to see connections
3. **Monitor before changing**: Use `monitor_topic` to verify current behavior
4. **Make changes**: Use `set_node_parameter` or `publish_to_topic`
5. **Verify changes**: Use `monitor_topic` again to confirm effect
6. **Debug systematically**: Use `check_ros_system_status` to identify problems

---

## Performance Characteristics

| Tool | Latency | Data Size | Notes |
|------|---------|-----------|-------|
| `list_ros_nodes` | <100ms | Small | Instant enumeration |
| `monitor_topic` | 1-30s | Variable | Depends on message frequency |
| `generate_ros_graph` | <500ms | Small | Fast even with many nodes |
| `check_ros_system_status` | ~1-2s | Medium | May need diagnostic aggregator |
| `monitor_tf2_frames` | 1-30s | Medium | Depends on transform frequency |
| `publish_to_topic` | <50ms | N/A | Immediate publish |

---

## Limitations and Workarounds

1. **DDS Communication**: Server requires ROS 2 DDS network access
   - Workaround: Ensure ROS 2 environment is properly sourced

2. **TF2 Tools**: Some tools require `tf2_tools` package
   - Workaround: `sudo apt install ros-humble-tf2-tools`

3. **Long Operations**: Operations timeout after specified duration
   - Workaround: Adjust `duration_seconds` parameter

4. **Large Message Counts**: Limited to 100 messages per monitoring session
   - Workaround: Use shorter duration for high-frequency topics

5. **Complex Messages**: Some complex message types may not serialize perfectly
   - Workaround: Use YAML format for publishing

---
