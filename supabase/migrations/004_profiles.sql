create table profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  display_name text        not null,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "authenticated users can select profiles"
  on profiles for select
  to authenticated
  using (true);

create policy "users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
