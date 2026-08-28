"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSalesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Sales & Analytics</h1>
        <p className="text-muted-foreground mt-2">Deep dive into revenue streams and product performance.</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50 shadow-soft">
        <CardHeader>
          <CardTitle>Sales Module Under Construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The full analytical suite for sales is being built. Check back soon for advanced insights.</p>
        </CardContent>
      </Card>
    </div>
  );
}
