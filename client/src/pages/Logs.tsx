import { Layout } from "@/components/Layout";
import { useMcpLogs } from "@/hooks/use-ros";
import { Terminal, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function Logs() {
  const { data: logs, isLoading } = useMcpLogs();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">MCP Tool Logs</h1>
          <p className="text-muted-foreground mt-1">Audit trail of agent tool execution.</p>
        </div>

        <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border/60 bg-muted/20">
            <Terminal className="w-5 h-5 text-muted-foreground" />
            <span className="font-mono text-sm text-muted-foreground">Console Output</span>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading ? (
               <div className="p-8 text-center text-muted-foreground animate-pulse">Loading logs...</div>
            ) : logs && logs.length > 0 ? (
              <div className="divide-y divide-border/30">
                {logs.map((log: any) => (
                  <div key={log.id} className="p-4 hover:bg-white/5 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {log.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                        {log.status === 'pending' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                        
                        <span className="font-mono font-bold text-foreground">{log.toolName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <Clock className="w-3 h-3" />
                        {log.createdAt ? format(new Date(log.createdAt), "HH:mm:ss.SSS") : "--:--:--"}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Arguments</span>
                        <div className="code-block text-xs">
                          <pre>{JSON.stringify(log.arguments, null, 2)}</pre>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Result</span>
                        <div className={`code-block text-xs ${log.status === 'error' ? 'border-red-500/30 bg-red-500/5' : ''}`}>
                          <pre>{JSON.stringify(log.result, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No tool logs recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
