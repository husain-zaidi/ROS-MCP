import { Layout } from "@/components/Layout";
import { useSettings, useUpdateSettings } from "@/hooks/use-ros";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema, type InsertSettings } from "@shared/schema";
import { useEffect } from "react";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { toast } = useToast();

  const form = useForm<InsertSettings>({
    resolver: zodResolver(insertSettingsSchema),
    defaultValues: {
      rosbridgeUrl: "ws://localhost:9090",
      isSimulated: true,
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (settings) {
      form.reset({
        rosbridgeUrl: settings.rosbridgeUrl,
        isSimulated: settings.isSimulated,
      });
    }
  }, [settings, form]);

  const onSubmit = (data: InsertSettings) => {
    updateSettings(data, {
      onSuccess: () => {
        toast({ title: "Settings Saved", description: "Configuration updated successfully." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  if (isLoading) return <Layout><div className="p-8">Loading settings...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure connection parameters and modes.</p>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div>
                  <h3 className="text-lg font-medium">Connection Mode</h3>
                  <p className="text-sm text-muted-foreground">Toggle between real hardware and simulation.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={form.watch("isSimulated")}
                    onChange={(e) => form.setValue("isSimulated", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ROS Bridge WebSocket URL</label>
                <input 
                  {...form.register("rosbridgeUrl")}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                  placeholder="ws://localhost:9090"
                />
                <p className="text-xs text-muted-foreground">The endpoint for rosbridge_suite (usually port 9090).</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isPending ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
