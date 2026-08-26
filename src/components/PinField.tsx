import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface PinFieldProps {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}

export function PinField({ value, onChange, autoFocus }: PinFieldProps) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      inputMode="numeric"
      pattern="^[0-9]+$"
      autoFocus={autoFocus}
    >
      <InputOTPGroup>
        {Array.from({ length: 6 }).map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
