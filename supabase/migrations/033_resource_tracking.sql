-- NGE-262: Resource tracking tables for Sanity CMS integration

-- Saved/bookmarked resources
CREATE TABLE resource_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sanity_resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('resource', 'blog_post')),
  audience TEXT CHECK (audience IN ('parent', 'athlete')),
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, sanity_resource_id)
);

-- Resource view tracking (fire-and-forget)
CREATE TABLE resource_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sanity_resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('resource', 'blog_post')),
  category TEXT,
  audience TEXT CHECK (audience IN ('parent', 'athlete')),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_resource_saves_user ON resource_saves(user_id);
CREATE INDEX idx_resource_saves_sanity_id ON resource_saves(sanity_resource_id);
CREATE INDEX idx_resource_views_user ON resource_views(user_id);
CREATE INDEX idx_resource_views_sanity_id ON resource_views(sanity_resource_id);
CREATE INDEX idx_resource_views_category ON resource_views(category);

-- RLS
ALTER TABLE resource_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_views ENABLE ROW LEVEL SECURITY;

-- resource_saves: users manage own saves
CREATE POLICY "Users can view own saves"
  ON resource_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves"
  ON resource_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves"
  ON resource_saves FOR DELETE
  USING (auth.uid() = user_id);

-- resource_views: anyone can insert (fire-and-forget), users read own views
CREATE POLICY "Anyone can insert views"
  ON resource_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own views"
  ON resource_views FOR SELECT
  USING (auth.uid() = user_id);
