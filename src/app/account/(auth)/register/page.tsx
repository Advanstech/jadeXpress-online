"use client";
import { useState } from "react";
import { Link } from "@/components/Link";
import { useNavigate } from "@/hooks/useNavigate";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await signUp(name.trim(), email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Account created — welcome to JadeXpress!");
    navigate("/account", { replace: true });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Faster checkout, saved addresses and order tracking."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/account/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label className="mb-1.5 block text-sm font-medium">Full name</Label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ama Owusu"
          />
        </div>
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
          <Label className="mb-1.5 block text-sm font-medium">Password</Label>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        <Button type="submit" className="w-full shadow-gold" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
