import { useCallback, useMemo } from 'react';
import { Layout } from "@/components/Layout";
import { useRosGraph } from "@/hooks/use-ros";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, ConnectionLineType, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AlertCircle } from 'lucide-react';

export default function Graph() {
  const { data: graphData, isLoading } = useRosGraph();

  // Convert schema data to ReactFlow format
  const initialNodes = useMemo(() => {
    if (!graphData) return [];
    // Basic layout algorithm (very simplified) can be replaced with dagre later if needed
    // For now, we trust the hook or just scatter them if no layout provided
    // Assuming backend might eventually do layout or we just randomize for MVP
    return graphData.nodes.map((node, index) => ({
      id: node.id,
      position: { x: (index % 5) * 250 + 50, y: Math.floor(index / 5) * 150 + 50 },
      data: { label: node.label },
      type: 'default', // standard styled node from index.css
      className: 'font-mono text-xs font-bold p-4 min-w-[150px] text-center'
    }));
  }, [graphData]);

  const initialEdges = useMemo(() => {
    if (!graphData) return [];
    return graphData.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'hsl(var(--primary))' },
      labelStyle: { fill: 'hsl(var(--muted-foreground))', fontWeight: 700 }
    }));
  }, [graphData]);

  // We are using controlled state, but since data updates from API, we need to sync it.
  // In a real sophisticated app, we'd use useEffect to update nodes/edges when graphData changes
  // without resetting positions if user moved them. For MVP, we'll just render freshly.

  if (isLoading) {
    return (
      <Layout>
         <div className="h-[calc(100vh-100px)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground animate-pulse">Building Node Graph...</p>
            </div>
         </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-100px)] w-full bg-card/30 border border-border/50 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur border border-border rounded-lg p-3 max-w-xs">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Computation Graph
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Visualizing {graphData?.nodes.length} nodes and {graphData?.edges.length} connections.
          </p>
        </div>
        
        {(!graphData || graphData.nodes.length === 0) ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-muted-foreground">
             <AlertCircle className="w-12 h-12 opacity-50" />
             <p>No graph data available</p>
          </div>
        ) : (
          <ReactFlow
            defaultNodes={initialNodes}
            defaultEdges={initialEdges}
            fitView
            attributionPosition="bottom-right"
            className="bg-black/20"
          >
            <Background color="hsl(var(--primary))" gap={20} size={1} className="opacity-10" />
            <Controls className="bg-background border border-border fill-foreground text-foreground" />
          </ReactFlow>
        )}
      </div>
    </Layout>
  );
}
