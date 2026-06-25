export interface CityByProvince {
  province: string;
  cities: string[];
}

export const EQUATORIAL_GUINEA_CITIES_BY_PROVINCE: CityByProvince[] = [
  {
    province: "Bioko Norte",
    cities: ["Malabo", "Rebola", "Baney", "Riaba"],
  },
  {
    province: "Bioko Sur",
    cities: ["Luba", "Moka", "Batete"],
  },
  {
    province: "Litoral",
    cities: ["Bata", "Mbini", "Cogo", "Acalayong", "Machinda"],
  },
  {
    province: "Centro Sur",
    cities: ["Evinayong", "Niefang", "Sevilla de Niefang", "Ncue", "Belebú"],
  },
  {
    province: "Kié-Ntem",
    cities: ["Ebebiyín", "Nsork", "Mikomeseng", "Nkimi", "Bidjabidjan"],
  },
  {
    province: "Wele-Nzas",
    cities: ["Mongomo", "Akonibe", "Añisoc", "Nsoc Nsomo", "Mengomeyén"],
  },
  {
    province: "Djibloho",
    cities: ["Ciudad de la Paz"],
  },
  {
    province: "Annobón",
    cities: ["San Antonio de Palé"],
  },
];

/** Flat alphabetically-sorted list for simple dropdowns */
export const GE_CITIES: string[] = EQUATORIAL_GUINEA_CITIES_BY_PROVINCE
  .flatMap((p) => p.cities)
  .sort((a, b) => a.localeCompare(b, "es"));
