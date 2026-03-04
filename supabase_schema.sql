-- Create users table to store the onboarding data
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL,
  name text,
  age numeric,
  gender text,
  height numeric,
  weight numeric,
  diabetes_type text,
  takes_medication boolean DEFAULT true,
  medications jsonb DEFAULT '[]'::jsonb,
  use_carb_ratio boolean DEFAULT false,
  carb_ratio numeric DEFAULT 10,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own profiles
CREATE POLICY "Users can view own profile."
  ON profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Create a generic food_database table
CREATE TABLE public.food_database (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  food_name text NOT NULL,
  carbs numeric NOT NULL,
  protein numeric,
  fat numeric,
  calories numeric,
  search_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Food database can be read by everyone (or just authenticated users)
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Food DB is readable by all"
  ON public.food_database FOR SELECT
  USING ( true );

-- Insert some mock data into food_database
INSERT INTO public.food_database (food_name, carbs, protein, fat, calories)
VALUES 
  ('apple', 14, 0.3, 0.2, 52),
  ('banana', 27, 1.3, 0.3, 105),
  ('bread slice', 15, 3, 1, 79),
  ('pizza slice', 36, 12, 10, 285),
  ('rice cup', 45, 4, 0.4, 205);

-- Create history table to log AI chats / food logs
CREATE TABLE public.food_logs (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  query text,
  food_name text,
  carbs_calculated numeric,
  insulin_calculated numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- RLS for food logs
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON food_logs FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own logs"
  ON food_logs FOR INSERT
  WITH CHECK ( auth.uid() = user_id );
