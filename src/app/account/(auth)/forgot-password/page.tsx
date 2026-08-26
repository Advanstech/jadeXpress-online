"use client";

import { useState } from "react";
import { Link } from "@/components/Link";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="If an account exists, a reset link is on its way."
        footer={
          <Link to="/account/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
            <CheckCircle2 className="size-7" />
          </span>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to{" "}
            <strong className="text-foreground">{email}</strong>. Click the link
            in the email to set a new password.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll send a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/account/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={submit}
        className="space-y-4"
      >
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
        <Button type="submit" className="w-full shadow-gold" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
