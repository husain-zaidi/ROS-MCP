import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useRosNodes } from "@/hooks/use-ros";
import { Cpu, Search, ArrowRight, Activity, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Nodes() {
  const { data: nodes, isLoading } = useRosNodes();
  const [search, setSearch] = useState("");
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const filteredNodes = nodes?.filter(node => 
    node.name.toLowerCase().includes(search.toLowerCase()) || 
    node.namespace.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">ROS Nodes</h1>
            <p className="text-muted-foreground mt-1">Manage and inspect active nodes in the graph.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1.5 shadow-sm w-full md:w-auto">
            <Search className="w-4 h-4 text-muted-foreground ml-2" />
            <input 
              type="text" 
              placeholder="Search nodes..." 
              className="bg-transparent border-none text-sm focus:outline-none w-full md:w-64 text-foreground placeholder:text-muted-foreground/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-card/50 rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNodes?.map((node) => (
              <Dialog key={node.name} onOpenChange={(open) => !open && setSelectedNode(null)}>
                <DialogTrigger asChild onClick={() => setSelectedNode(node)}>
                  <button className="group flex flex-col text-left bg-card border border-border/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200">
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {node.namespace}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{node.name}</h3>
                    <div className="mt-auto pt-4 flex gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-bold font-mono text-foreground">{node.publications.length}</span> Pubs
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold font-mono text-foreground">{node.subscriptions.length}</span> Subs
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold font-mono text-foreground">{node.services.length}</span> Srvs
                      </div>
                    </div>
                  </button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl bg-card border-border shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-display">
                      <Cpu className="w-6 h-6 text-primary" />
                      {node.name}
                      <span className="text-sm font-mono font-normal text-muted-foreground bg-muted px-2 py-1 rounded ml-auto">
                        {node.namespace}
                      </span>
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    <section>
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <ArrowRight className="w-4 h-4 text-green-500" /> Publications
                      </h4>
                      {node.publications.length > 0 ? (
                        <div className="bg-muted/30 rounded-lg border border-white/5 divide-y divide-white/5">
                          {node.publications.map((pub: string) => (
                            <div key={pub} className="px-4 py-2 font-mono text-sm text-muted-foreground">
                              {pub}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic px-4">No publications</p>
                      )}
                    </section>

                    <section>
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <ArrowRight className="w-4 h-4 text-orange-500 rotate-180" /> Subscriptions
                      </h4>
                      {node.subscriptions.length > 0 ? (
                        <div className="bg-muted/30 rounded-lg border border-white/5 divide-y divide-white/5">
                          {node.subscriptions.map((sub: string) => (
                            <div key={sub} className="px-4 py-2 font-mono text-sm text-muted-foreground">
                              {sub}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic px-4">No subscriptions</p>
                      )}
                    </section>

                    <section>
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <Activity className="w-4 h-4 text-blue-500" /> Services
                      </h4>
                      {node.services.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {node.services.map((srv: string) => (
                            <div key={srv} className="bg-muted/30 rounded border border-white/5 px-3 py-2 font-mono text-xs text-muted-foreground truncate" title={srv}>
                              {srv}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic px-4">No services available</p>
                      )}
                    </section>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
            
            {filteredNodes?.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No nodes found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
