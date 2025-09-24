-- Prisma initial migration for QuizPRO
-- Enums
CREATE TYPE "Role" AS ENUM ('user','admin','pro');
CREATE TYPE "Category" AS ENUM ('GK','Geography','Science','Literature','Technology','PopCulture','Sports','Travel');
CREATE TYPE "Difficulty" AS ENUM ('easy','medium','hard');

-- Tables
CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  country TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  role "Role" NOT NULL DEFAULT 'user',
  subscription_expires_at TIMESTAMPTZ,
  banned_until TIMESTAMPTZ
);

CREATE TABLE "Question" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category "Category" NOT NULL,
  difficulty "Difficulty" NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  image_url TEXT,
  audio_url TEXT,
  created_by UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  import_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT
);
CREATE INDEX "Question_category_idx" ON "Question" (category);
CREATE INDEX "Question_difficulty_idx" ON "Question" (difficulty);

CREATE TABLE "GameSession" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  questions_played JSONB NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  streaks JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "GameSession_user_id_idx" ON "GameSession" (user_id);

CREATE TABLE "Leaderboard" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, period)
);
CREATE INDEX "Leaderboard_period_score_idx" ON "Leaderboard" (period, score DESC);
