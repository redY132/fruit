create or replace function generate_lobby_code()
returns text language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

create table lobbies (
  id          uuid        primary key default gen_random_uuid(),
  code        text        not null unique default generate_lobby_code(),
  host_id     uuid        not null references auth.users(id) on delete cascade,
  status      text        not null default 'waiting'
                          check (status in ('waiting', 'playing', 'finished')),
  seed        bigint      not null default floor(random() * 9223372036854775807)::bigint,
  max_players smallint    not null default 4,
  created_at  timestamptz not null default now()
);

alter table lobbies enable row level security;

create policy "authenticated users can select lobbies"
  on lobbies for select
  to authenticated
  using (true);

create policy "authenticated users can insert lobbies"
  on lobbies for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "host can update lobby"
  on lobbies for update
  to authenticated
  using (auth.uid() = host_id);

create policy "host can delete lobby"
  on lobbies for delete
  to authenticated
  using (auth.uid() = host_id);
