"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCRMPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">AI CRM & Outreach</h1>
        <p className="text-muted-foreground mt-2">Leverage AI to engage customers and drive sales.</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50 shadow-soft border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">✨</span> AI Tooling Activation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The AI engine is being calibrated for customer purchase history analysis and automated email drafting. 
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
