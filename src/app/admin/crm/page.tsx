"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Users, MessageSquare, Send, BrainCircuit, Target, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminCustomers } from "@/hooks/useAdmin";

export default function AdminCRMPage() {
  const { data: customers, isLoading } = useAdminCustomers();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const activeCustomers = customers?.length ?? 0;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setAiResponse(
        `Subject: Special Offer Just For You!\n\nHi [Customer Name],\n\nWe noticed you've been a loyal customer of JadeXpress, and we wanted to say thank you! Here is a special 15% discount on your next purchase of wellness supplements.\n\nUse code: WELLNESS15 at checkout.\n\nStay healthy,\nThe JadeXpress Team`
      );
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            AI CRM & Outreach
          </h1>
          <p className="text-muted-foreground mt-1">
            Leverage AI to engage customers, analyze sentiment, and drive sales.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 pt-2">
        {/* Left Column: AI Campaign Builder */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-soft overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <BrainCircuit className="size-5 text-primary" />
                AI Outreach Generator
              </CardTitle>
              <CardDescription>
                Describe the campaign or offer, and our AI will draft a highly-converting email for your target audience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Campaign Prompt</label>
                <Textarea 
                  placeholder="e.g. Write a promotional email for loyal customers offering 15% off supplements for the weekend..."
                  className="min-h-[100px] bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={generating || !prompt.trim()}
                className="w-full shadow-gold"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-4 animate-spin" /> Generating Magic...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-4" /> Generate Campaign
                  </span>
                )}
              </Button>

              {aiResponse && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg bg-background border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                      <Mail className="size-4" /> AI Draft Result
                    </h4>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">Copy</Button>
                  </div>
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                    {aiResponse}
                  </pre>
                  <Button className="w-full mt-4 gap-2" variant="secondary">
                    <Send className="size-4" /> Send to Segment
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Quick Segments */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Target className="size-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">High-Value Customers</p>
                  <p className="text-sm text-muted-foreground">Top 20% by spend</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                  <MessageSquare className="size-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">At-Risk Accounts</p>
                  <p className="text-sm text-muted-foreground">No purchase in 60 days</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: CRM Stats */}
        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">Audience Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Users className="size-5 text-primary" />
                  <span className="font-medium">Total Contacts</span>
                </div>
                <span className="font-bold">{isLoading ? "..." : activeCustomers}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-emerald-500" />
                  <span className="font-medium">Email Subscribers</span>
                </div>
                <span className="font-bold">{isLoading ? "..." : Math.floor(activeCustomers * 0.85)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft overflow-hidden relative">
            <CardHeader className="pb-3 border-b border-border/40 bg-secondary/20">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Active Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Welcome Series</p>
                    <p className="text-xs text-muted-foreground">3 emails • 55% open rate</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Abandoned Cart</p>
                    <p className="text-xs text-muted-foreground">1 email • 12% recovery</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
