"use client";
import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  resolveAddressSuggestion,
  useAddressSearch,
  type AddressSuggestion,
} from "@/hooks/useAddressSearch";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  countryBias?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Address autocomplete for the street-address field. Backed by Google Places
 * (accurate, requires an API key — see `GOOGLE_MAPS_API_KEY` in site config)
 * with an automatic, no-key fallback to OpenStreetMap search.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  countryBias,
  placeholder,
  className,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const { results, loading } = useAddressSearch(value, countryBias);

  const pick = async (suggestion: AddressSuggestion) => {
    setOpen(false);
    if (suggestion.placeId) {
      setResolving(true);
      const resolved = await resolveAddressSuggestion(suggestion);
      setResolving(false);
      onSelect(resolved);
      return;
    }
    onSelect(suggestion);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {(loading || resolving) && (
        <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-elegant">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void pick(r)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
              <span className="line-clamp-2">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
