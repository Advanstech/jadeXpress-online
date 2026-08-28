"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminInventoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">Track stock levels, suppliers, and reorder alerts.</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50 shadow-soft">
        <CardHeader>
          <CardTitle>Inventory Module Under Construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The inventory management hub is currently in development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
