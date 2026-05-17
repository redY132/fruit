-- Fix handle_new_user trigger: SPLIT_PART(NULL, '@', 1) returns NULL in PostgreSQL,
-- so anonymous users (no email, no full_name) caused a NOT NULL violation on display_name,
-- rolling back signInAnonymously() entirely and leaving playerId null forever.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1), 'Player'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Add INSERT policy so upsertProfile() works (PostgreSQL checks INSERT RLS even
-- on upserts that resolve to an ON CONFLICT UPDATE).
CREATE POLICY "users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
