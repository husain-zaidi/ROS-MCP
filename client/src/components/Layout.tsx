import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Network, 
  MessageSquareText, 
  GitGraph, 
  Move3d, 
  Settings, 
  Activity,
  Cpu
} from "lucide-react";
import { useSettings } from "@/hooks/use-ros";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: settings } = useSettings();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Nodes", href: "/nodes", icon: Cpu },
    { label: "Topics", href: "/topics", icon: MessageSquareText },
    { label: "Node Graph", href: "/graph", icon: Network },
    { label: "TF Viewer", href: "/tf", icon: Move3d },
    { label: "MCP Logs", href: "/logs", icon: Activity },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col backdrop-blur-sm z-50">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50">
              <GitGraph className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none">ROS 2 MCP</h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">Control Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                `}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 bg-background/30">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${settings?.isSimulated ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
            <div>
              <p className="text-xs font-medium text-foreground">
                {settings?.isSimulated ? "Simulated Mode" : "Connected"}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
                {settings?.rosbridgeUrl}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto p-8 animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
