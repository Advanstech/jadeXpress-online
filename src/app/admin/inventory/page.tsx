"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Search, AlertCircle, Plus, Filter, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminProducts } from "@/hooks/useAdmin";
import { formatGHS } from "@/lib/format";

export default function AdminInventoryPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminProducts({ page: 1, limit: 50, search });

  const products = data?.products ?? [];
  const lowStock = products.filter(p => p.stock < 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div className="space-y-6 relative">
      {/* Sticky Header with Backdrop Blur */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track stock levels, suppliers, and reorder alerts.
          </p>
        </div>
        <Button className="shadow-gold self-start sm:self-auto">
          <Plus className="size-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3 pt-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Package className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold font-display">{data?.total ?? "..."}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <AlertCircle className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold font-display">{isLoading ? "..." : lowStock}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
                <AlertCircle className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold font-display">{isLoading ? "..." : outOfStock}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Table Area */}
      <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row gap-4 justify-between items-center bg-secondary/10">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search products by name or SKU..." 
              className="pl-9 bg-background/50 border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="size-4 mr-2" />
            Filter Status
          </Button>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">Price <ArrowUpDown className="size-3" /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">Stock <ArrowUpDown className="size-3" /></div>
                </th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse">
                    Loading inventory data...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product, i) => (
                  <motion.tr 
                    key={product.id} 
                    className="hover:bg-secondary/20 transition-colors group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-md border border-border/50 bg-secondary/50 overflow-hidden shrink-0">
                          {product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="size-full object-cover" crossOrigin="anonymous" />
                          ) : (
                            <Package className="size-5 m-auto mt-2.5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[200px]">
                          <p className="font-medium text-foreground truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{product.categorySlug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{product.sku}</td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {formatGHS(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock === 0 ? 'text-rose-500' : product.stock < 10 ? 'text-amber-500' : 'text-foreground'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary text-muted-foreground'
                      }`}>
                        <span className="capitalize">{product.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
