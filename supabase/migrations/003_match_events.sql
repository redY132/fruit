create table match_events (
  id         uuid        primary key default gen_random_uuid(),
  lobby_id   uuid        not null references lobbies(id) on delete cascade,
  player_id  uuid        references auth.users(id) on delete set null,
  type       text        not null check (type in ('fruit_spawn', 'bomb_inject')),
  payload    jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

alter table match_events enable row level security;

create policy "lobby members can select match events"
  on match_events for select
  to authenticated
  using (
    lobby_id in (
      select lobby_id from lobby_players where player_id = auth.uid()
    )
  );
