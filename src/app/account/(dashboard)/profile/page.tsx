"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import {
  AlertTriangle,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { PinField } from "@/components/PinField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PREF_LABELS: { key: string; title: string; desc: string }[] = [
  {
    key: "order_updates",
    title: "Order updates",
    desc: "Status changes and delivery confirmations by email.",
  },
  {
    key: "promotions",
    title: "Offers & promotions",
    desc: "New drops, restocks and member-only discounts.",
  },
];

export default function Profile() {
  const {
    user,
    profile,
    updateProfile,
    setPin,
    updatePreferences,
    changePassword,
    deleteAccount,
    signOut,
  } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // PIN
  const [showPinForm, setShowPinForm] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinSaving, setPinSaving] = useState(false);

  // Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState(false);

  const prefs = profile?.preferences ?? {};

  useEffect(() => {
    if (profile) {
      setName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile({
      full_name: name.trim(),
      phone: phone.trim(),
    });
    setSaving(false);
    if (error) toast.error(error);
    else toast.success("Profile updated.");
  };

  const displayName = profile?.full_name || user?.email || "Account";

  const savePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6) {
      toast.error("PIN must be 6 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs don't match.");
      return;
    }
    setPinSaving(true);
    const { error } = await setPin(newPin);
    setPinSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(
      profile?.has_pin ? "PIN updated." : "PIN created — you can now sign in with it.",
    );
    setNewPin("");
    setConfirmPin("");
    setShowPinForm(false);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }
    setPasswordSaving(true);
    const { error } = await changePassword(currentPassword, newPassword);
    setPasswordSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Password updated — please sign in again.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);
    await signOut();
    navigate("/account/login");
  };

  const togglePref = async (key: string, value: boolean) => {
    const { error } = await updatePreferences({ [key]: value });
    if (error) toast.error(error);
    else toast.success("Preference saved.");
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await deleteAccount();
    setDeleting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Your account has been deleted.");
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Account</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
          Your profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your details, security and preferences.
        </p>
      </div>

      {/* Identity card */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <InitialsAvatar name={displayName} className="size-14 text-lg" />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              {displayName}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form
          onSubmit={save}
          className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2"
        >
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Full name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 024 000 0000"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
            <Mail className="size-4 text-accent" />
            <span>{user?.email}</span>
            <span className="text-xs">·</span>
            <UserIcon className="size-4 text-accent" />
            <span>Email can't be changed here</span>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="shadow-gold" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Security */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="font-display text-base font-semibold text-foreground">
              Login & security
            </p>
            <p className="text-sm text-muted-foreground">
              Your PIN and password — used to sign in to your account.
            </p>
          </div>
        </div>

        {/* PIN */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <Lock className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">6-digit login PIN</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {profile?.has_pin
                  ? "You can sign in with your PIN instead of your password."
                  : "Set up a PIN for faster sign-in next time."}
              </p>
            </div>
          </div>
          {!showPinForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPinForm(true)}
            >
              {profile?.has_pin ? "Change PIN" : "Set up PIN"}
            </Button>
          )}
        </div>
        {showPinForm && (
          <form onSubmit={savePin} className="mt-4 space-y-4 border-t border-border pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 block text-sm font-medium">New PIN</Label>
                <PinField value={newPin} onChange={setNewPin} autoFocus />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Confirm PIN</Label>
                <PinField value={confirmPin} onChange={setConfirmPin} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="shadow-gold" disabled={pinSaving}>
                {pinSaving ? "Saving…" : "Save PIN"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPinForm(false);
                  setNewPin("");
                  setConfirmPin("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Password */}
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <KeyRound className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Password</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Keep your account secure with a strong password.
              </p>
            </div>
          </div>
          {!showPasswordForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordForm(true)}
            >
              Change password
            </Button>
          )}
        </div>
        {showPasswordForm && (
          <form
            onSubmit={savePassword}
            className="mt-4 space-y-4 border-t border-border pt-5"
          >
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Current password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">New password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Confirm new password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="shadow-gold" disabled={passwordSaving}>
                {passwordSaving ? "Updating…" : "Update password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You'll be asked to sign in again after changing your password.
            </p>
          </form>
        )}
      </div>

      {/* Preferences */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <Mail className="size-5" />
          </span>
          <div>
            <p className="font-display text-base font-semibold text-foreground">
              Email preferences
            </p>
            <p className="text-sm text-muted-foreground">
              Choose what we send you — change anytime.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-1">
          {PREF_LABELS.map((p) => (
            <div
              key={p.key}
              className="flex items-center justify-between gap-4 rounded-lg py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{p.title}</p>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
              <Switch
                checked={prefs[p.key] ?? true}
                onCheckedChange={(v) => void togglePref(p.key, v)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <p className="font-display text-base font-semibold text-foreground">
              Danger zone
            </p>
            <p className="text-sm text-muted-foreground">
              Sign out of this device or permanently delete your account.
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Sign out</p>
            <p className="text-sm text-muted-foreground">
              End this session on this device.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void signOut()}>
            <LogOut className="mr-1.5 size-4" />
            Sign out
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Delete account</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Permanently removes your profile, saved addresses, wishlist,
              cart and reviews. Past orders are kept on record but detached
              from your account.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-1.5 size-4" />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This is permanent. Your profile, saved addresses, wishlist
                  and reviews will be removed immediately and can't be
                  recovered.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting…" : "Yes, delete my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
