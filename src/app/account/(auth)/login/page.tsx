"use client";

import { useState } from "react";
import { Link } from "@/components/Link";
import { useNavigate } from "@/hooks/useNavigate";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AuthShell } from "@/components/AuthShell";
import { PinField } from "@/components/PinField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const { signIn, signInWithPin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pinEmail, setPinEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const from = useSearchParams()?.get("from") ?? "/account";

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Welcome back!");
    navigate(from, { replace: true });
  };

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinEmail.trim()) {
      toast.error("Enter your email.");
      return;
    }
    if (pin.length !== 6) {
      toast.error("Enter your 6-digit PIN.");
      return;
    }
    setLoading(true);
    const { error } = await signInWithPin(pinEmail.trim(), pin);
    setLoading(false);
    if (error) {
      toast.error(error);
      setPin("");
      return;
    }
    toast.success("Welcome back!");
    navigate(from, { replace: true });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your orders, addresses and wishlist."
      footer={
        <>
          New to JadeXpress?{" "}
          <Link to="/account/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="mb-5 grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="pin">6-digit PIN</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <form onSubmit={submitPassword} className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-sm font-medium">Password</Label>
                <Link
                  to="/account/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full shadow-gold" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="pin">
          <form onSubmit={submitPin} className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Email</Label>
              <Input
                type="email"
                required
                value={pinEmail}
                onChange={(e) => setPinEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium">6-digit PIN</Label>
              <PinField value={pin} onChange={setPin} />
            </div>
            <Button type="submit" className="w-full shadow-gold" disabled={loading}>
              {loading ? "Signing in…" : "Sign in with PIN"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Set up a PIN from your account profile for faster sign-in next
              time.
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </AuthShell>
  );
}
