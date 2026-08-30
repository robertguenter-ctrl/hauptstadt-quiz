-- Spielräume für Handy-Buzzer Multiplayer
create table if not exists public.game_rooms (
  code text primary key,
  state jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.game_rooms(code) on delete cascade,
  slot int not null check (slot >= 0 and slot <= 3),
  name text not null,
  created_at timestamptz not null default now(),
  unique (room_code, slot),
  unique (room_code, name)
);

alter table public.game_rooms enable row level security;
alter table public.room_players enable row level security;

create policy "Spielräume lesen"
  on public.game_rooms for select using (true);

create policy "Spielräume anlegen"
  on public.game_rooms for insert with check (true);

create policy "Spielräume aktualisieren"
  on public.game_rooms for update using (true);

create policy "Spieler lesen"
  on public.room_players for select using (true);

create policy "Spieler beitreten"
  on public.room_players for insert with check (true);

create policy "Spieler entfernen"
  on public.room_players for delete using (true);

-- Realtime aktivieren (im Supabase Dashboard unter Database → Publications,
-- oder: alter publication supabase_realtime add table game_rooms, room_players;)
alter publication supabase_realtime add table public.game_rooms;
alter publication supabase_realtime add table public.room_players;
