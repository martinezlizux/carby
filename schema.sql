-- 1. Create Users Table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  gender text,
  height numeric,
  weight numeric,
  diabetes_type text,
  uses_insulin boolean,
  carb_ratio numeric -- gramos de carbs por 1 unidad de insulina
);

-- 2. Create Food Database Table
CREATE TABLE food_database (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  food_name text NOT NULL UNIQUE,
  portion_description text,
  carbs numeric NOT NULL,
  calories numeric,
  ai_verified boolean DEFAULT true
);

-- 3. Create Logs Table
CREATE TABLE logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid REFERENCES users(id),
  query_text text, -- Lo que el usuario preguntó
  food_id uuid REFERENCES food_database(id), -- Null si es una comida compuesta
  total_carbs numeric,
  insulin_dose numeric
);
