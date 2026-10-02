CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Interest',
  university_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  user_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id,user_id)
);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id text NOT NULL,
  community_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  post_type text NOT NULL DEFAULT 'discussion',
  image_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  author_id text NOT NULL,
  parent_comment_id uuid NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  post_id uuid NOT NULL,
  vote_type text NOT NULL,
  UNIQUE (user_id,post_id)
);

CREATE TABLE IF NOT EXISTS comment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  comment_id uuid NOT NULL,
  vote_type text NOT NULL,
  UNIQUE (user_id,comment_id)
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id text NOT NULL,
  following_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id,following_id)
);

CREATE TABLE IF NOT EXISTS saved_posts (
  user_id text NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id,post_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL,
  actor_id text NULL,
  post_id uuid NULL,
  comment_id uuid NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id,created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id,read,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_members_community ON community_members(community_id);

INSERT INTO universities(name,slug) VALUES ('University Constantine 2','constantine-2') ON CONFLICT (slug) DO NOTHING;
INSERT INTO universities(name,slug) VALUES ('University of Algiers','algiers') ON CONFLICT (slug) DO NOTHING;
INSERT INTO universities(name,slug) VALUES ('University of Oran','oran') ON CONFLICT (slug) DO NOTHING;

INSERT INTO communities(name,slug,description,category,university_id)
SELECT 'Constantine 2','constantine-2','Everything related to student life at University Constantine 2.','University',id FROM universities WHERE slug='constantine-2'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO communities(name,slug,description,category)
VALUES ('Computer Science','computer-science','Programming, computer science, university courses, projects and careers.','Subject')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO communities(name,slug,description,category)
VALUES ('Mathematics','mathematics','Mathematics, proofs, Analyse and problem solving.','Subject')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO communities(name,slug,description,category)
VALUES ('Programming','programming','Code, algorithms, tools and practical programming.','Interest')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO communities(name,slug,description,category)
VALUES ('Artificial Intelligence','ai','AI, machine learning and intelligent systems.','Interest')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO communities(name,slug,description,category)
VALUES ('Cybersecurity','cybersecurity','Security, networks, Linux and ethical hacking.','Interest')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO communities(name,slug,description,category)
VALUES ('Startups','startups','Student founders, ideas, products and building.','Interest')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO communities(name,slug,description,category)
VALUES ('Science','science','Science, research and discovery.','Interest')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO communities(name,slug,description,category)
VALUES ('Books','books','Books, reading lists and ideas worth discussing.','Interest')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO communities(name,slug,description,category)
VALUES ('Gaming','gaming','Games and student gaming discussions.','Interest')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO communities(name,slug,description,category)
VALUES ('Sports','sports','Training, cycling and student sports.','Interest')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO community_members(community_id,user_id)
SELECT c.id,p.user_id FROM communities c CROSS JOIN profiles p
WHERE c.slug='computer-science' AND p.field='Computer Science'
ON CONFLICT DO NOTHING;
INSERT INTO community_members(community_id,user_id)
SELECT c.id,p.user_id FROM communities c CROSS JOIN profiles p
WHERE c.slug='constantine-2' AND p.university='University Constantine 2'
ON CONFLICT DO NOTHING;

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,'What is the best way to learn C?','I am starting C and want a study path that works alongside university. What helped you most?','question'
FROM profiles p CROSS JOIN communities c WHERE p.name='Ahmed B.' AND c.slug='programming'
AND NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='What is the best way to learn C?');

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,'Does anyone understand this Analyse exercise?','I am stuck on the proof step. Can someone explain the idea without skipping the reasoning?','question'
FROM profiles p CROSS JOIN communities c WHERE p.name='Sara' AND c.slug='mathematics'
AND NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='Does anyone understand this Analyse exercise?');

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,'How are you studying Algorithms?','Looking for a simple routine for learning algorithms and practicing by hand before coding.','discussion'
FROM profiles p CROSS JOIN communities c WHERE p.name='Yacine' AND c.slug='computer-science'
AND NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='How are you studying Algorithms?');

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,'TD schedule has been updated','Check the latest group information before your next TD session.','announcement'
FROM profiles p CROSS JOIN communities c WHERE p.name='Amine' AND c.slug='constantine-2'
AND NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='TD schedule has been updated');

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,'Good resources for Python?','Share beginner-friendly books, courses or exercises that you actually used.','discussion'
FROM profiles p CROSS JOIN communities c WHERE p.name='Lina' AND c.slug='programming'
AND NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='Good resources for Python?');

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,'AI projects for first-year students','What is a realistic first AI project that teaches useful fundamentals?','discussion'
FROM profiles p CROSS JOIN communities c WHERE p.name='Ahmed B.' AND c.slug='ai'
AND NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='AI projects for first-year students');

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,'How should I start with Linux?','I want to use Linux for CS without making my setup unnecessarily complicated.','question'
FROM profiles p CROSS JOIN communities c WHERE p.name='Nadir' AND c.slug='cybersecurity'
AND NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='How should I start with Linux?');

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,'Student startup ideas','What problems around university life are actually worth solving?','discussion'
FROM profiles p CROSS JOIN communities c WHERE p.name='Meriem' AND c.slug='startups'
AND NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='Student startup ideas');

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,'Best books for learning computer science','Share the books you would keep if you could only keep five.','discussion'
FROM profiles p CROSS JOIN communities c WHERE p.name='Karim' AND c.slug='books'
AND NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='Best books for learning computer science');

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,'Cycling routes around Constantine','Any students interested in weekend cycling?','discussion'
FROM profiles p CROSS JOIN communities c WHERE p.name='Wassim' AND c.slug='sports'
AND NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='Cycling routes around Constantine');