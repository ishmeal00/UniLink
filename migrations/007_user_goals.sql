CREATE TABLE user_goals (
  user_id TEXT NOT NULL,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, goal_id)
)