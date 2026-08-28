"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAccountingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Accounting Hub</h1>
        <p className="text-muted-foreground mt-2">Manage payables, receivables, and financial health.</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50 shadow-soft">
        <CardHeader>
          <CardTitle>Accounting Module Under Construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The enterprise accounting suite is currently in development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
