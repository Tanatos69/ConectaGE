"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/**
 * Client-side persistence for the demo. In production these slices become real
 * API calls (favorites/follows tables, a credits ledger, saved-search alerts).
 * For the presentation build we persist to localStorage, mirroring the pattern
 * used by the i18n context (default state on the server, hydrate in useEffect).
 *
 * Every interactive marketplace feature (favorites, store follows, saved
 * searches, credits/promotions) plugs into this single provider.
 */

export interface SearchCriteria {
  q?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  listingType?: "offer" | "wanted";
  sort?: string;
}

export interface SavedSearch {
  id: string;
  label: string;
  criteria: SearchCriteria;
  alerts: boolean;
  createdAt: number;
}

export interface CreditTx {
  id: string;
  type: "purchase" | "spend";
  amount: number; // signed: +credits on purchase, -credits on spend
  label: string;
  date: number;
}

export interface CreditsState {
  balance: number;
  transactions: CreditTx[];
  promoted: string[]; // listing slugs currently boosted/featured
}

interface AppStateValue {
  hydrated: boolean;

  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;

  follows: string[];
  isFollowing: (slug: string) => boolean;
  toggleFollow: (slug: string) => void;

  savedSearches: SavedSearch[];
  addSavedSearch: (label: string, criteria: SearchCriteria) => void;
  removeSavedSearch: (id: string) => void;
  toggleSearchAlerts: (id: string) => void;

  credits: CreditsState;
  buyCredits: (amount: number, label: string) => void;
  /** Returns false (and changes nothing) when the balance is insufficient. */
  spendCredits: (amount: number, label: string, slug?: string) => boolean;
  isPromoted: (slug: string) => boolean;
}

const KEYS = {
  favorites: "conectage-favorites",
  follows: "conectage-follows",
  savedSearches: "conectage-saved-searches",
  credits: "conectage-credits",
} as const;

const DEFAULT_CREDITS: CreditsState = {
  balance: 30,
  transactions: [
    {
      id: "welcome",
      type: "purchase",
      amount: 30,
      label: "Saldo de bienvenida",
      date: Date.now(),
    },
  ],
  promoted: [],
};

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [follows, setFollows] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [credits, setCredits] = useState<CreditsState>(DEFAULT_CREDITS);

  // Hydrate every slice once on mount.
  useEffect(() => {
    setFavorites(readJSON<string[]>(KEYS.favorites, []));
    setFollows(readJSON<string[]>(KEYS.follows, []));
    setSavedSearches(readJSON<SavedSearch[]>(KEYS.savedSearches, []));
    setCredits(readJSON<CreditsState>(KEYS.credits, DEFAULT_CREDITS));
    setHydrated(true);
  }, []);

  // Persist on change, but never before hydration (avoids clobbering stored
  // data with the server-default empty state on first paint).
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEYS.favorites, JSON.stringify(favorites));
  }, [favorites, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEYS.follows, JSON.stringify(follows));
  }, [follows, hydrated]);
  useEffect(() => {
    if (hydrated)
      localStorage.setItem(KEYS.savedSearches, JSON.stringify(savedSearches));
  }, [savedSearches, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEYS.credits, JSON.stringify(credits));
  }, [credits, hydrated]);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const toggleFollow = useCallback((slug: string) => {
    setFollows((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const addSavedSearch = useCallback((label: string, criteria: SearchCriteria) => {
    setSavedSearches((prev) => [
      { id: uid(), label, criteria, alerts: true, createdAt: Date.now() },
      ...prev,
    ]);
  }, []);

  const removeSavedSearch = useCallback((id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleSearchAlerts = useCallback((id: string) => {
    setSavedSearches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, alerts: !s.alerts } : s)),
    );
  }, []);

  const buyCredits = useCallback((amount: number, label: string) => {
    setCredits((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      transactions: [
        { id: uid(), type: "purchase", amount, label, date: Date.now() },
        ...prev.transactions,
      ],
    }));
  }, []);

  const spendCredits = useCallback(
    (amount: number, label: string, slug?: string) => {
      let ok = false;
      setCredits((prev) => {
        if (prev.balance < amount) return prev;
        ok = true;
        return {
          balance: prev.balance - amount,
          transactions: [
            { id: uid(), type: "spend", amount: -amount, label, date: Date.now() },
            ...prev.transactions,
          ],
          promoted:
            slug && !prev.promoted.includes(slug)
              ? [...prev.promoted, slug]
              : prev.promoted,
        };
      });
      return ok;
    },
    [],
  );

  const value: AppStateValue = {
    hydrated,
    favorites,
    isFavorite: (slug) => favorites.includes(slug),
    toggleFavorite,
    follows,
    isFollowing: (slug) => follows.includes(slug),
    toggleFollow,
    savedSearches,
    addSavedSearch,
    removeSavedSearch,
    toggleSearchAlerts,
    credits,
    buyCredits,
    spendCredits,
    isPromoted: (slug) => credits.promoted.includes(slug),
  };

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
