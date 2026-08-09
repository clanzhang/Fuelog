-- Fuelog Supabase 数据库表结构
-- 在 Supabase 控制台 → SQL Editor 中执行本脚本

-- 用户设置
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calorie_goal INT DEFAULT 2000,
  carbs_goal INT DEFAULT 250,
  protein_goal INT DEFAULT 120,
  fat_goal INT DEFAULT 65,
  water_goal NUMERIC DEFAULT 2.0,
  exercise_goal INT DEFAULT 60,
  unit TEXT DEFAULT 'kcal',
  user_name TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 饮食记录
CREATE TABLE IF NOT EXISTS food_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT,
  image_url TEXT,
  calories INT NOT NULL DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  protein NUMERIC DEFAULT 0,
  fat NUMERIC DEFAULT 0,
  fiber NUMERIC DEFAULT 0,
  sugar NUMERIC DEFAULT 0,
  sodium NUMERIC DEFAULT 0,
  tips TEXT DEFAULT '',
  meal_type TEXT DEFAULT 'lunch',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 训练计划
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'dumbbell',
  time TEXT,
  duration INT DEFAULT 0,
  warmup INT DEFAULT 0,
  calories_burned INT DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 习惯打卡
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_intake NUMERIC DEFAULT 0,
  water_type TEXT DEFAULT 'water',
  exercise_minutes INT DEFAULT 0,
  exercise_type TEXT DEFAULT '',
  UNIQUE(user_id, date)
);

-- 收藏食谱
CREATE TABLE IF NOT EXISTS favorite_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  author TEXT DEFAULT '',
  emoji TEXT,
  image_url TEXT,
  calories INT DEFAULT 0,
  category TEXT DEFAULT '',
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 开启 RLS（行级安全）—— 用 DO 块 + 存在性检查，表不存在时自动跳过，重复执行也安全
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'user_settings','food_entries','training_plans','habit_logs','favorite_recipes'
  ] LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    END IF;
  END LOOP;
END $$;

-- 每个用户只能读写自己的数据（策略，表存在才创建）
DO $$
BEGIN
  IF to_regclass('public.user_settings') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "users can CRUD own settings" ON user_settings';
    EXECUTE 'CREATE POLICY "users can CRUD own settings" ON user_settings FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.food_entries') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "users can CRUD own food" ON food_entries';
    EXECUTE 'CREATE POLICY "users can CRUD own food" ON food_entries FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.training_plans') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "users can CRUD own plans" ON training_plans';
    EXECUTE 'CREATE POLICY "users can CRUD own plans" ON training_plans FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.habit_logs') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "users can CRUD own habits" ON habit_logs';
    EXECUTE 'CREATE POLICY "users can CRUD own habits" ON habit_logs FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.favorite_recipes') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "users can CRUD own recipes" ON favorite_recipes';
    EXECUTE 'CREATE POLICY "users can CRUD own recipes" ON favorite_recipes FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;
