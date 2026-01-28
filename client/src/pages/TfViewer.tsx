import { Layout } from "@/components/Layout";
import { useRosTf } from "@/hooks/use-ros";
import { Move3d, ChevronRight, CornerDownRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TfNodeProps {
  frame: any;
  allFrames: any[];
  depth: number;
}

function TfNode({ frame, allFrames, depth }: TfNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Find children
  const children = allFrames.filter(f => f.header.frame_id === frame.child_frame_id);
  
  // Format transform numbers
  const fmt = (n: number) => n.toFixed(3);

  return (
    <div className="select-none">
      <div 
        className={`
          flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border border-transparent
          hover:bg-muted/30 hover:border-white/5
        `}
        style={{ marginLeft: `${depth * 24}px` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-1.5 rounded bg-primary/10 text-primary">
          {children.length > 0 ? (
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
          ) : (
            <CornerDownRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-foreground">{frame.child_frame_id}</span>
            <span className="text-xs text-muted-foreground font-mono">parent: {frame.header.frame_id}</span>
          </div>
          
          {isExpanded && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2 text-[10px] font-mono text-muted-foreground/70 bg-black/20 p-2 rounded border border-white/5">
              <div>
                <span className="text-accent">TRANS:</span> x={fmt(frame.transform.translation.x)}, y={fmt(frame.transform.translation.y)}, z={fmt(frame.transform.translation.z)}
              </div>
              <div>
                <span className="text-green-500">ROT:</span> x={fmt(frame.transform.rotation.x)}, y={fmt(frame.transform.rotation.y)}, z={fmt(frame.transform.rotation.z)}, w={fmt(frame.transform.rotation.w)}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {children.map(child => (
              <TfNode key={child.child_frame_id} frame={child} allFrames={allFrames} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TfViewer() {
  const { data: frames, isLoading } = useRosTf();

  // Find root frames (frames that are not children of any other frame in the list)
  // Note: In a perfect TF tree there is one root (map or world), but we might capture partials
  const rootFrames = frames?.filter(f => !frames.some(parent => parent.child_frame_id === f.header.frame_id)) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">TF Tree</h1>
          <p className="text-muted-foreground mt-1">Coordinate frame transforms hierarchy.</p>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm min-h-[500px]">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                 <div key={i} className="h-12 bg-muted/20 rounded-lg w-full" style={{ width: `${100 - i * 10}%` }} />
              ))}
            </div>
          ) : frames && frames.length > 0 ? (
            <div className="space-y-2">
              {rootFrames.map(root => (
                <TfNode key={root.child_frame_id} frame={root} allFrames={frames} depth={0} />
              ))}
              {/* Fallback if circular or disconnected, usually rare in healthy ROS systems */}
              {rootFrames.length === 0 && frames.length > 0 && (
                <div className="text-yellow-500 p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
                  <p className="font-bold">Warning: No clear root frame detected.</p>
                  <p className="text-sm">Showing raw list instead.</p>
                  {frames.map(f => (
                    <div key={f.child_frame_id} className="mt-2 font-mono text-xs">{f.child_frame_id} &rarr; {f.header.frame_id}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
              <Move3d className="w-16 h-16 opacity-20 mb-4" />
              <p>No TF data received yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
