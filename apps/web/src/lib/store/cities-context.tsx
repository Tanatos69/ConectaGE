"use client";

import { createContext, useContext } from "react";
import {
  EQUATORIAL_GUINEA_CITIES_BY_PROVINCE,
  GE_CITIES,
  type CityByProvince,
} from "@/lib/cities";

/**
 * Admin-managed cities (locations table, /admin/ubicaciones), fetched once
 * per request in the (public) layout and shared with every client component
 * that renders a city dropdown — replaces the old direct GE_CITIES imports.
 * The static list stays as the default so anything rendered outside the
 * provider (or before Supabase is configured) still shows sensible options.
 */
interface CitiesContextValue {
  /** Flat, alphabetically sorted city names. */
  cities: string[];
  /** Grouped by province, for the publish wizard's grouped select. */
  byProvince: CityByProvince[];
}

const CitiesContext = createContext<CitiesContextValue>({
  cities: GE_CITIES,
  byProvince: EQUATORIAL_GUINEA_CITIES_BY_PROVINCE,
});

export function CitiesProvider({
  cities,
  byProvince,
  children,
}: CitiesContextValue & { children: React.ReactNode }) {
  return (
    <CitiesContext.Provider value={{ cities, byProvince }}>{children}</CitiesContext.Provider>
  );
}

export function useCities(): CitiesContextValue {
  return useContext(CitiesContext);
}
