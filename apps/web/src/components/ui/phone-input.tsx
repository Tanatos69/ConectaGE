"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Country-code picker + local number, emitting a single normalized value
 * like "+240222000000". Prevents the classic "missing +" format failures and
 * supports sellers whose WhatsApp lives on a foreign number (e.g. +86).
 */

interface Country {
  code: string; // dial code without '+'
  flag: string;
  name: string;
}

const COUNTRIES: Country[] = [
  { code: "240", flag: "🇬🇶", name: "Guinea Ecuatorial" },
  { code: "237", flag: "🇨🇲", name: "Camerún" },
  { code: "241", flag: "🇬🇦", name: "Gabón" },
  { code: "234", flag: "🇳🇬", name: "Nigeria" },
  { code: "34", flag: "🇪🇸", name: "España" },
  { code: "33", flag: "🇫🇷", name: "Francia" },
  { code: "351", flag: "🇵🇹", name: "Portugal" },
  { code: "86", flag: "🇨🇳", name: "China" },
  { code: "1", flag: "🇺🇸", name: "EEUU / Canadá" },
  { code: "44", flag: "🇬🇧", name: "Reino Unido" },
  { code: "212", flag: "🇲🇦", name: "Marruecos" },
  { code: "221", flag: "🇸🇳", name: "Senegal" },
  { code: "225", flag: "🇨🇮", name: "Costa de Marfil" },
  { code: "243", flag: "🇨🇩", name: "R.D. Congo" },
  { code: "55", flag: "🇧🇷", name: "Brasil" },
];

// Longest dial codes first so "+2407..." matches 240, not 24.
const BY_LENGTH = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);

function splitValue(value: string): { dial: string; local: string } {
  const digits = value.replace(/[^0-9]/g, "");
  for (const c of BY_LENGTH) {
    if (digits.startsWith(c.code)) {
      return { dial: c.code, local: digits.slice(c.code.length) };
    }
  }
  return { dial: "240", local: digits };
}

export function PhoneInput({
  value,
  onChange,
  id,
  required,
  className,
}: {
  /** Normalized full number, e.g. "+240222000000" (or "" when empty). */
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  className?: string;
}) {
  const { dial, local } = useMemo(() => splitValue(value), [value]);

  function emit(nextDial: string, nextLocal: string) {
    const digits = nextLocal.replace(/[^0-9]/g, "");
    onChange(digits ? `+${nextDial}${digits}` : "");
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <select
        aria-label="Código de país"
        value={dial}
        onChange={(e) => emit(e.target.value, local)}
        className="h-11 shrink-0 rounded-xl border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} +{c.code}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        required={required}
        placeholder="222 000 000"
        value={local}
        onChange={(e) => emit(dial, e.target.value)}
        className="h-11 w-full min-w-0 flex-1 rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}
