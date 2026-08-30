-- Länder-Tabelle für Hauptstadt-Quiz
create table if not exists public.countries (
  id text primary key,
  name_de text not null,
  capital_de text not null,
  iso_code text not null unique,
  region text not null check (region in ('europe', 'world'))
);

alter table public.countries enable row level security;

create policy "Länder sind öffentlich lesbar"
  on public.countries for select
  using (true);

-- Seed: Europa + bekannte Länder
insert into public.countries (id, name_de, capital_de, iso_code, region) values
  ('de', 'Deutschland', 'Berlin', 'DE', 'europe'),
  ('at', 'Österreich', 'Wien', 'AT', 'europe'),
  ('ch', 'Schweiz', 'Bern', 'CH', 'europe'),
  ('fr', 'Frankreich', 'Paris', 'FR', 'europe'),
  ('it', 'Italien', 'Rom', 'IT', 'europe'),
  ('es', 'Spanien', 'Madrid', 'ES', 'europe'),
  ('pt', 'Portugal', 'Lissabon', 'PT', 'europe'),
  ('nl', 'Niederlande', 'Amsterdam', 'NL', 'europe'),
  ('be', 'Belgien', 'Brüssel', 'BE', 'europe'),
  ('lu', 'Luxemburg', 'Luxemburg', 'LU', 'europe'),
  ('pl', 'Polen', 'Warschau', 'PL', 'europe'),
  ('cz', 'Tschechien', 'Prag', 'CZ', 'europe'),
  ('sk', 'Slowakei', 'Bratislava', 'SK', 'europe'),
  ('hu', 'Ungarn', 'Budapest', 'HU', 'europe'),
  ('ro', 'Rumänien', 'Bukarest', 'RO', 'europe'),
  ('bg', 'Bulgarien', 'Sofia', 'BG', 'europe'),
  ('gr', 'Griechenland', 'Athen', 'GR', 'europe'),
  ('hr', 'Kroatien', 'Zagreb', 'HR', 'europe'),
  ('si', 'Slowenien', 'Ljubljana', 'SI', 'europe'),
  ('rs', 'Serbien', 'Belgrad', 'RS', 'europe'),
  ('ba', 'Bosnien und Herzegowina', 'Sarajevo', 'BA', 'europe'),
  ('me', 'Montenegro', 'Podgorica', 'ME', 'europe'),
  ('mk', 'Nordmazedonien', 'Skopje', 'MK', 'europe'),
  ('al', 'Albanien', 'Tirana', 'AL', 'europe'),
  ('ua', 'Ukraine', 'Kiew', 'UA', 'europe'),
  ('lt', 'Litauen', 'Vilnius', 'LT', 'europe'),
  ('lv', 'Lettland', 'Riga', 'LV', 'europe'),
  ('ee', 'Estland', 'Tallinn', 'EE', 'europe'),
  ('fi', 'Finnland', 'Helsinki', 'FI', 'europe'),
  ('se', 'Schweden', 'Stockholm', 'SE', 'europe'),
  ('no', 'Norwegen', 'Oslo', 'NO', 'europe'),
  ('dk', 'Dänemark', 'Kopenhagen', 'DK', 'europe'),
  ('is', 'Island', 'Reykjavík', 'IS', 'europe'),
  ('ie', 'Irland', 'Dublin', 'IE', 'europe'),
  ('gb', 'Vereinigtes Königreich', 'London', 'GB', 'europe'),
  ('mt', 'Malta', 'Valletta', 'MT', 'europe'),
  ('cy', 'Zypern', 'Nikosia', 'CY', 'europe'),
  ('tr', 'Türkei', 'Ankara', 'TR', 'europe'),
  ('ru', 'Russland', 'Moskau', 'RU', 'europe'),
  ('us', 'USA', 'Washington, D.C.', 'US', 'world'),
  ('ca', 'Kanada', 'Ottawa', 'CA', 'world'),
  ('br', 'Brasilien', 'Brasília', 'BR', 'world'),
  ('ar', 'Argentinien', 'Buenos Aires', 'AR', 'world'),
  ('mx', 'Mexiko', 'Mexiko-Stadt', 'MX', 'world'),
  ('cn', 'China', 'Peking', 'CN', 'world'),
  ('jp', 'Japan', 'Tokio', 'JP', 'world'),
  ('kr', 'Südkorea', 'Seoul', 'KR', 'world'),
  ('in', 'Indien', 'Neu-Delhi', 'IN', 'world'),
  ('au', 'Australien', 'Canberra', 'AU', 'world'),
  ('eg', 'Ägypten', 'Kairo', 'EG', 'world'),
  ('za', 'Südafrika', 'Pretoria', 'ZA', 'world'),
  ('ng', 'Nigeria', 'Abuja', 'NG', 'world'),
  ('ke', 'Kenia', 'Nairobi', 'KE', 'world'),
  ('ma', 'Marokko', 'Rabat', 'MA', 'world'),
  ('th', 'Thailand', 'Bangkok', 'TH', 'world'),
  ('id', 'Indonesien', 'Jakarta', 'ID', 'world'),
  ('sa', 'Saudi-Arabien', 'Riad', 'SA', 'world'),
  ('il', 'Israel', 'Jerusalem', 'IL', 'world'),
  ('nz', 'Neuseeland', 'Wellington', 'NZ', 'world')
on conflict (id) do nothing;
