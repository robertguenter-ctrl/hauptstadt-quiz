export interface Country {
  id: string;
  name_de: string;
  capital_de: string;
  iso_code: string;
  region: "europe" | "world";
}

/** Europa + bekannte Länder weltweit — Fallback wenn Supabase nicht konfiguriert ist. */
export const COUNTRIES: Country[] = [
  { id: "de", name_de: "Deutschland", capital_de: "Berlin", iso_code: "DE", region: "europe" },
  { id: "at", name_de: "Österreich", capital_de: "Wien", iso_code: "AT", region: "europe" },
  { id: "ch", name_de: "Schweiz", capital_de: "Bern", iso_code: "CH", region: "europe" },
  { id: "fr", name_de: "Frankreich", capital_de: "Paris", iso_code: "FR", region: "europe" },
  { id: "it", name_de: "Italien", capital_de: "Rom", iso_code: "IT", region: "europe" },
  { id: "es", name_de: "Spanien", capital_de: "Madrid", iso_code: "ES", region: "europe" },
  { id: "pt", name_de: "Portugal", capital_de: "Lissabon", iso_code: "PT", region: "europe" },
  { id: "nl", name_de: "Niederlande", capital_de: "Amsterdam", iso_code: "NL", region: "europe" },
  { id: "be", name_de: "Belgien", capital_de: "Brüssel", iso_code: "BE", region: "europe" },
  { id: "lu", name_de: "Luxemburg", capital_de: "Luxemburg", iso_code: "LU", region: "europe" },
  { id: "pl", name_de: "Polen", capital_de: "Warschau", iso_code: "PL", region: "europe" },
  { id: "cz", name_de: "Tschechien", capital_de: "Prag", iso_code: "CZ", region: "europe" },
  { id: "sk", name_de: "Slowakei", capital_de: "Bratislava", iso_code: "SK", region: "europe" },
  { id: "hu", name_de: "Ungarn", capital_de: "Budapest", iso_code: "HU", region: "europe" },
  { id: "ro", name_de: "Rumänien", capital_de: "Bukarest", iso_code: "RO", region: "europe" },
  { id: "bg", name_de: "Bulgarien", capital_de: "Sofia", iso_code: "BG", region: "europe" },
  { id: "gr", name_de: "Griechenland", capital_de: "Athen", iso_code: "GR", region: "europe" },
  { id: "hr", name_de: "Kroatien", capital_de: "Zagreb", iso_code: "HR", region: "europe" },
  { id: "si", name_de: "Slowenien", capital_de: "Ljubljana", iso_code: "SI", region: "europe" },
  { id: "rs", name_de: "Serbien", capital_de: "Belgrad", iso_code: "RS", region: "europe" },
  { id: "ba", name_de: "Bosnien und Herzegowina", capital_de: "Sarajevo", iso_code: "BA", region: "europe" },
  { id: "me", name_de: "Montenegro", capital_de: "Podgorica", iso_code: "ME", region: "europe" },
  { id: "mk", name_de: "Nordmazedonien", capital_de: "Skopje", iso_code: "MK", region: "europe" },
  { id: "al", name_de: "Albanien", capital_de: "Tirana", iso_code: "AL", region: "europe" },
  { id: "ua", name_de: "Ukraine", capital_de: "Kiew", iso_code: "UA", region: "europe" },
  { id: "lt", name_de: "Litauen", capital_de: "Vilnius", iso_code: "LT", region: "europe" },
  { id: "lv", name_de: "Lettland", capital_de: "Riga", iso_code: "LV", region: "europe" },
  { id: "ee", name_de: "Estland", capital_de: "Tallinn", iso_code: "EE", region: "europe" },
  { id: "fi", name_de: "Finnland", capital_de: "Helsinki", iso_code: "FI", region: "europe" },
  { id: "se", name_de: "Schweden", capital_de: "Stockholm", iso_code: "SE", region: "europe" },
  { id: "no", name_de: "Norwegen", capital_de: "Oslo", iso_code: "NO", region: "europe" },
  { id: "dk", name_de: "Dänemark", capital_de: "Kopenhagen", iso_code: "DK", region: "europe" },
  { id: "is", name_de: "Island", capital_de: "Reykjavík", iso_code: "IS", region: "europe" },
  { id: "ie", name_de: "Irland", capital_de: "Dublin", iso_code: "IE", region: "europe" },
  { id: "gb", name_de: "Vereinigtes Königreich", capital_de: "London", iso_code: "GB", region: "europe" },
  { id: "mt", name_de: "Malta", capital_de: "Valletta", iso_code: "MT", region: "europe" },
  { id: "cy", name_de: "Zypern", capital_de: "Nikosia", iso_code: "CY", region: "europe" },
  { id: "tr", name_de: "Türkei", capital_de: "Ankara", iso_code: "TR", region: "europe" },
  { id: "ru", name_de: "Russland", capital_de: "Moskau", iso_code: "RU", region: "europe" },
  { id: "us", name_de: "USA", capital_de: "Washington, D.C.", iso_code: "US", region: "world" },
  { id: "ca", name_de: "Kanada", capital_de: "Ottawa", iso_code: "CA", region: "world" },
  { id: "br", name_de: "Brasilien", capital_de: "Brasília", iso_code: "BR", region: "world" },
  { id: "ar", name_de: "Argentinien", capital_de: "Buenos Aires", iso_code: "AR", region: "world" },
  { id: "mx", name_de: "Mexiko", capital_de: "Mexiko-Stadt", iso_code: "MX", region: "world" },
  { id: "cn", name_de: "China", capital_de: "Peking", iso_code: "CN", region: "world" },
  { id: "jp", name_de: "Japan", capital_de: "Tokio", iso_code: "JP", region: "world" },
  { id: "kr", name_de: "Südkorea", capital_de: "Seoul", iso_code: "KR", region: "world" },
  { id: "in", name_de: "Indien", capital_de: "Neu-Delhi", iso_code: "IN", region: "world" },
  { id: "au", name_de: "Australien", capital_de: "Canberra", iso_code: "AU", region: "world" },
  { id: "eg", name_de: "Ägypten", capital_de: "Kairo", iso_code: "EG", region: "world" },
  { id: "za", name_de: "Südafrika", capital_de: "Pretoria", iso_code: "ZA", region: "world" },
  { id: "ng", name_de: "Nigeria", capital_de: "Abuja", iso_code: "NG", region: "world" },
  { id: "ke", name_de: "Kenia", capital_de: "Nairobi", iso_code: "KE", region: "world" },
  { id: "ma", name_de: "Marokko", capital_de: "Rabat", iso_code: "MA", region: "world" },
  { id: "th", name_de: "Thailand", capital_de: "Bangkok", iso_code: "TH", region: "world" },
  { id: "id", name_de: "Indonesien", capital_de: "Jakarta", iso_code: "ID", region: "world" },
  { id: "sa", name_de: "Saudi-Arabien", capital_de: "Riad", iso_code: "SA", region: "world" },
  { id: "il", name_de: "Israel", capital_de: "Jerusalem", iso_code: "IL", region: "world" },
  { id: "nz", name_de: "Neuseeland", capital_de: "Wellington", iso_code: "NZ", region: "world" },
];

export function getPlayableCountries(): Country[] {
  return COUNTRIES;
}
