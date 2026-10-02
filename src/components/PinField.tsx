import { Input } from "@/components/ui/input";

interface PinFieldProps {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}

export function PinField({ value, onChange, autoFocus }: PinFieldProps) {
  return (
    <Input
      type="password"
      inputMode="numeric"
      maxLength={6}
      value={value}
      onChange={(e) => {
        const val = e.target.value.replace(/[^0-9]/g, "");
        onChange(val);
      }}
      autoFocus={autoFocus}
      placeholder="••••"
      className="font-mono text-lg tracking-widest"
    />
  );
}
