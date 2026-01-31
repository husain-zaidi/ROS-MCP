// Example test cases for ROS 2 MCP Server tools
// Run these examples by asking Copilot or testing manually

// ============================================
// EXAMPLE 1: Node Discovery and Inspection
// ============================================
// Ask Copilot:
// "List all ROS 2 nodes currently running"
// Tool used: list_ros_nodes
// Expected: All active nodes with their connections

// ============================================
// EXAMPLE 2: Topic Monitoring (Observational)
// ============================================
// Ask Copilot:
// "Monitor the /tf topic for 5 seconds and tell me what transforms are being sent"
// Tool used: monitor_topic with duration_seconds=5
// Expected: Sample of TF2 transform messages
// Agent behavior: Waits 5 seconds, then analyzes data

// ============================================
// EXAMPLE 3: System Graph Visualization
// ============================================
// Ask Copilot:
// "Create a graph showing how all my ROS 2 nodes and topics are connected"
// Tool used: generate_ros_graph with output_format="text"
// Expected: ASCII diagram or DOT format showing node->topic relationships

// ============================================
// EXAMPLE 4: Health Check
// ============================================
// Ask Copilot:
// "Check the overall health of my ROS 2 system and tell me if anything is wrong"
// Tool used: check_ros_system_status with include_diagnostics=true
// Expected: System status, node count, topic count, services available

// ============================================
// EXAMPLE 5: Topic Type Inspection
// ============================================
// Ask Copilot:
// "What topics are available and what message types do they use?"
// Tool used: list_ros_topics with detailed=true
// Expected: Topic names with corresponding message types

// ============================================
// EXAMPLE 6: Node Parameter Management
// ============================================
// Ask Copilot:
// "List all parameters for the /my_node node"
// Tool used: get_node_parameters with node_name="/my_node"
// Expected: List of parameters and their values

// Then:
// "Set the parameter 'debug_level' on /my_node to 2"
// Tool used: set_node_parameter
// Expected: Confirmation of parameter change

// ============================================
// EXAMPLE 7: Publishing Test Data
// ============================================
// Ask Copilot:
// "Publish a test message to the /test_topic topic"
// Tool used: publish_to_topic
// Expected: Message successfully published

// ============================================
// EXAMPLE 8: Service Discovery and Calling
// ============================================
// Ask Copilot:
// "List all available ROS 2 services"
// Tool used: list_ros_services
// Expected: All registered services

// Then:
// "Call the /spawn service with parameters x=1.0 y=2.0 name=test"
// Tool used: call_service
// Expected: Service response

// ============================================
// EXAMPLE 9: Continuous Monitoring Session
// ============================================
// Ask Copilot:
// "Monitor the /sensor_data topic for 10 seconds and analyze the message rate"
// Tool used: monitor_topic with duration_seconds=10
// Expected: 
//   1. Waits 10 seconds collecting messages
//   2. Agent analyzes the frequency of messages
//   3. Agent reports message rate

// ============================================
// EXAMPLE 10: TF2 Frame Inspection
// ============================================
// Ask Copilot:
// "Show me all TF2 frames and their transformations"
// Tool used: monitor_tf2_frames with duration_seconds=5
// Expected:
//   1. Frame tree structure
//   2. Static transforms
//   3. Sample of dynamic transforms over 5 seconds

// ============================================
// EXAMPLE 11: Node Connection Analysis
// ============================================
// Ask Copilot:
// "For the /robot_driver node, tell me what it publishes and what it subscribes to"
// Tool used: get_node_connections with node_name="/robot_driver"
// Expected: List of published and subscribed topics

// ============================================
// EXAMPLE 12: Debugging Multi-Node System
// ============================================
// Ask Copilot:
// "I think the /motion_controller node isn't receiving commands. Can you debug this?"
// Copilot will:
//   1. get_node_connections("/motion_controller") - see what it subscribes to
//   2. generate_ros_graph() - verify if anything publishes to those topics
//   3. monitor_topic("/cmd_velocity", 3) - check if commands are actually being published
//   4. Analyze and suggest the issue

// ============================================
// EXAMPLE 13: RQT Graph for Visualization
// ============================================
// Ask Copilot:
// "Export the ROS graph in Graphviz format so I can visualize it"
// Tool used: generate_ros_graph with output_format="dot"
// Expected: DOT format code that can be converted to PNG/PDF with:
// $ dot -Tpng graph.dot -o graph.png

// ============================================
// EXAMPLE 14: Multi-Step Diagnosis
// ============================================
// Ask Copilot:
// "My robot seems slow. Can you diagnose what might be causing it?"
// Copilot will sequence:
//   1. check_ros_system_status() - overall system state
//   2. list_ros_nodes() - all active nodes
//   3. generate_ros_graph() - identify heavy connections
//   4. monitor_topic("/heavy_topic", 5) - measure actual data throughput
//   5. Provide analysis and recommendations

// ============================================
// TOOL DESIGN PATTERNS
// ============================================

// Pattern 1: Fire-and-forget (instant)
// Tools: list_ros_nodes, list_ros_topics, get_node_parameters
// Agent behavior: Call -> Get result immediately -> Respond

// Pattern 2: Observational with wait (agent blocking)
// Tools: monitor_topic, monitor_tf2_frames, check_ros_system_status
// Agent behavior: Call -> Wait N seconds -> Get results -> Analyze -> Respond
// This is perfect for agents as they naturally handle the blocking period

// Pattern 3: Complex analysis (compound tools)
// Tools: generate_ros_graph, get_node_connections
// Agent behavior: Call -> Get structured data -> Parse -> Provide insights

// ============================================
// COPILOT AGENT FLOW EXAMPLE
// ============================================

// User: "Show me what topics are being actively used right now"
// 
// Copilot reasoning:
// 1. Call list_ros_topics to get all topics
// 2. For each topic, call monitor_topic with duration_seconds=5
//    (Agent waits 5 seconds per topic)
// 3. Analyze which topics have actual data flowing
// 4. Report back with active topics and their message rates
//
// This flow showcases how observational tools enable agents
// to gather time-dependent data naturally

// ============================================
// TEST SCENARIO: Developing with Copilot
// ============================================

// Scenario: You're developing a new ROS 2 node and debugging it

// Step 1 - Discovery
// Copilot: "What nodes are currently running?"
// [list_ros_nodes]

// Step 2 - Understanding topology
// Copilot: "Show me how my new node connects to the rest of the system"
// [generate_ros_graph]

// Step 3 - Live debugging
// Copilot: "Let me watch the /my_node/output topic for 5 seconds"
// [monitor_topic with 5 second wait]
// Agent analysis: "I see 127 messages were published in 5 seconds, rate is 25.4 Hz"

// Step 4 - Parameter tweaking
// Copilot: "Let me increase the publish rate parameter to 50 Hz"
// [set_node_parameter]

// Step 5 - Verification
// Copilot: "Monitor again for 3 seconds"
// [monitor_topic with 3 second wait]
// Agent analysis: "New rate is 50.2 Hz - parameter change worked!"

// ============================================
