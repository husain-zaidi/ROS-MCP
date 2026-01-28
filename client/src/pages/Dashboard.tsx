import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { useRosNodes, useRosTopics, useSettings, useMcpLogs } from "@/hooks/use-ros";
import { Cpu, MessageSquareText, Activity, Zap, Server, Globe } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: nodes } = useRosNodes();
  const { data: topics } = useRosTopics();
  const { data: settings } = useSettings();
  const { data: logs } = useMcpLogs();

  // Mock data for the chart since we don't have historical message rates yet
  const chartData = [
    { time: '00:00', rate: 120 },
    { time: '00:05', rate: 132 },
    { time: '00:10', rate: 101 },
    { time: '00:15', rate: 154 },
    { time: '00:20', rate: 180 },
    { time: '00:25', rate: 195 },
    { time: '00:30', rate: 170 },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">System Overview</h1>
          <p className="text-muted-foreground mt-2">Real-time status of the ROS 2 environment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Active Nodes" 
            value={nodes?.length || 0} 
            icon={Cpu} 
            trend="+2 active"
            color="primary"
          />
          <StatCard 
            title="Available Topics" 
            value={topics?.length || 0} 
            icon={MessageSquareText} 
            trend="Stable"
            color="accent"
          />
          <StatCard 
            title="MCP Operations" 
            value={logs?.length || 0} 
            icon={Activity} 
            trend="Last 1h"
            color="success"
          />
          <StatCard 
            title="Bridge Status" 
            value={settings?.isSimulated ? "Simulated" : "Online"} 
            icon={Zap} 
            color={settings?.isSimulated ? "warning" : "success"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-card border border-border/60 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Message Rate (Hz)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRate)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Server className="w-5 h-5 text-accent" />
              Environment
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-white/5">
                <span className="text-sm text-muted-foreground">Distribution</span>
                <span className="text-sm font-mono font-bold text-foreground">Humble</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-white/5">
                <span className="text-sm text-muted-foreground">Middleware</span>
                <span className="text-sm font-mono font-bold text-foreground">Fast DDS</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-white/5">
                <span className="text-sm text-muted-foreground">Bridge URL</span>
                <span className="text-xs font-mono text-primary truncate max-w-[150px]" title={settings?.rosbridgeUrl}>
                  {settings?.rosbridgeUrl}
                </span>
              </div>
              
              <div className="mt-8 pt-4 border-t border-border/50">
                <h4 className="text-sm font-medium mb-3">Recent Tool Usage</h4>
                <div className="space-y-2">
                  {logs?.slice(0, 3).map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-mono">{log.toolName}</span>
                      <span className={`px-1.5 py-0.5 rounded ${log.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <p className="text-xs text-muted-foreground italic">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
