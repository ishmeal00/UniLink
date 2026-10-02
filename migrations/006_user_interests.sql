CREATE TABLE user_interests (
  user_id TEXT NOT NULL,
  interest_id UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, interest_id)
)