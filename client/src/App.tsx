import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/Dashboard";
import Nodes from "@/pages/Nodes";
import Topics from "@/pages/Topics";
import Graph from "@/pages/Graph";
import TfViewer from "@/pages/TfViewer";
import Settings from "@/pages/Settings";
import Logs from "@/pages/Logs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/nodes" component={Nodes} />
      <Route path="/topics" component={Topics} />
      <Route path="/graph" component={Graph} />
      <Route path="/tf" component={TfViewer} />
      <Route path="/settings" component={Settings} />
      <Route path="/logs" component={Logs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
