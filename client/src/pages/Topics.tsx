import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useRosTopics, usePublishMessage, useRosTopicMessages } from "@/hooks/use-ros";
import { MessageSquareText, Search, Send, Play, Square, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

function TopicEcho({ topic }: { topic: string }) {
  const { data, isLoading } = useRosTopicMessages(topic, true);

  if (isLoading && !data) return <div className="p-4 text-center text-muted-foreground animate-pulse">Waiting for message...</div>;

  return (
    <div className="mt-4 bg-black/50 rounded-lg border border-border p-4 font-mono text-xs overflow-auto max-h-[300px]">
      {data?.latestMessage ? (
        <pre className="text-green-400">{JSON.stringify(data.latestMessage, null, 2)}</pre>
      ) : (
        <div className="text-muted-foreground italic">No messages received yet</div>
      )}
    </div>
  );
}

export default function Topics() {
  const { data: topics, isLoading } = useRosTopics();
  const [search, setSearch] = useState("");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [messageBody, setMessageBody] = useState("{}");
  const { mutate: publish, isPending } = usePublishMessage();
  const { toast } = useToast();

  const filteredTopics = topics?.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  const handlePublish = () => {
    if (!selectedTopic) return;
    try {
      const msg = JSON.parse(messageBody);
      publish(
        { topic: selectedTopic.name, type: selectedTopic.type, msg },
        {
          onSuccess: () => {
            toast({ title: "Message Sent", description: `Published to ${selectedTopic.name}` });
            setPublishDialogOpen(false);
          },
          onError: (err) => {
            toast({ title: "Failed to Publish", description: err.message, variant: "destructive" });
          }
        }
      );
    } catch (e) {
      toast({ title: "Invalid JSON", description: "Please check your message format", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Topics</h1>
            <p className="text-muted-foreground mt-1">Monitor streams and publish commands.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1.5 shadow-sm w-full md:w-auto">
            <Search className="w-4 h-4 text-muted-foreground ml-2" />
            <input 
              type="text" 
              placeholder="Search topics..." 
              className="bg-transparent border-none text-sm focus:outline-none w-full md:w-64 text-foreground placeholder:text-muted-foreground/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/60 bg-muted/20 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            <div className="col-span-5 md:col-span-4">Topic Name</div>
            <div className="col-span-4 md:col-span-4">Type</div>
            <div className="col-span-3 md:col-span-4 text-right">Actions</div>
          </div>
          
          <div className="divide-y divide-border/40">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Loading topics...</div>
            ) : filteredTopics?.map((topic) => (
              <div key={topic.name} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20 transition-colors">
                <div className="col-span-5 md:col-span-4 font-mono text-sm text-primary truncate" title={topic.name}>
                  {topic.name}
                </div>
                <div className="col-span-4 md:col-span-4 font-mono text-xs text-muted-foreground truncate" title={topic.type}>
                  {topic.type}
                </div>
                <div className="col-span-3 md:col-span-4 flex justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="p-2 rounded-md hover:bg-background border border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border shadow-2xl max-w-xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-accent" />
                          Echo: {topic.name}
                        </DialogTitle>
                      </DialogHeader>
                      <TopicEcho topic={topic.name} />
                    </DialogContent>
                  </Dialog>

                  <Dialog open={publishDialogOpen && selectedTopic?.name === topic.name} onOpenChange={(open) => {
                    setPublishDialogOpen(open);
                    if (!open) setSelectedTopic(null);
                    else {
                      setSelectedTopic(topic);
                      setMessageBody("{\n  \n}");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <button className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground text-primary transition-all">
                        <Send className="w-4 h-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Send className="w-5 h-5 text-primary" />
                          Publish to {topic.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase text-muted-foreground">Message Type</label>
                          <div className="font-mono text-sm p-2 bg-muted/30 rounded border border-border">{topic.type}</div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase text-muted-foreground">JSON Data</label>
                          <textarea 
                            className="w-full h-40 bg-black/30 border border-border rounded-lg p-3 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                            value={messageBody}
                            onChange={(e) => setMessageBody(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button 
                            onClick={() => setPublishDialogOpen(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handlePublish}
                            disabled={isPending}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isPending ? "Publishing..." : "Publish Message"}
                          </button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
