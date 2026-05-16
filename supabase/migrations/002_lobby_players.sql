create table lobby_players (
  lobby_id      uuid        not null references lobbies(id) on delete cascade,
  player_id     uuid        not null references auth.users(id) on delete cascade,
  ready         boolean     not null default false,
  lives         smallint    not null default 3,
  score         integer     not null default 0,
  eliminated_at timestamptz,
  joined_at     timestamptz not null default now(),
  primary key (lobby_id, player_id)
);

revoke update on lobby_players from authenticated;
grant update (ready) on lobby_players to authenticated;

alter table lobby_players enable row level security;

create policy "members see all rows in their lobby"
  on lobby_players for select
  to authenticated
  using (
    lobby_id in (
      select lobby_id from lobby_players where player_id = auth.uid()
    )
  );

create policy "players can join a lobby"
  on lobby_players for insert
  to authenticated
  with check (auth.uid() = player_id);

create policy "players can update their own row"
  on lobby_players for update
  to authenticated
  using (auth.uid() = player_id);

create policy "players can leave a lobby"
  on lobby_players for delete
  to authenticated
  using (auth.uid() = player_id);
