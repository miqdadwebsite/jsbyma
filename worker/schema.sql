-- Like counts per post (id = slug derived from the post title).
CREATE TABLE IF NOT EXISTS posts (
  id    TEXT PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0
);

-- One row per (post, visitor) so each visitor can only like once.
CREATE TABLE IF NOT EXISTS like_records (
  post_id    TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  liked_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (post_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_like_records_visitor ON like_records (visitor_id);