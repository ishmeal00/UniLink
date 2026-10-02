INSERT INTO profiles(user_id,name,university,field,year,bio) VALUES
('demo-salim','Salim','University Constantine 2','Computer Science','2nd Year','Interested in systems and Linux.'),
('demo-rania','Rania','University of Algiers','Economics','2nd Year','Interested in student entrepreneurship.'),
('demo-yasmine','Yasmine','University of Oran','Mathematics','1st Year','Learning proofs and problem solving.'),
('demo-omar','Omar','University Constantine 2','Physics','3rd Year','Physics, Python and research.'),
('demo-soufiane','Soufiane','University Constantine 2','Computer Science','1st Year','Exploring web development.'),
('demo-maya','Maya','University of Algiers','Computer Science','3rd Year','AI and software engineering.'),
('demo-lynda','Lynda','University of Oran','Physics','2nd Year','Science and books.'),
('demo-rachid','Rachid','University Constantine 2','Mathematics','2nd Year','Algorithms and discrete math.')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO posts(author_id,community_id,title,content,post_type)
SELECT p.user_id,c.id,
'Discussion #'||g.n,
CASE WHEN g.n%4=0 THEN 'What resources are you using this semester? Share something that genuinely helped.'
WHEN g.n%4=1 THEN 'I am trying to build a better study routine. What works for you?'
WHEN g.n%4=2 THEN 'Does anyone want to discuss this topic after class?'
ELSE 'Small question: how would you approach this problem step by step?' END,
CASE WHEN g.n%7=0 THEN 'question' ELSE 'discussion' END
FROM generate_series(1,45) g(n)
CROSS JOIN LATERAL (SELECT user_id FROM profiles ORDER BY md5(user_id||g.n::text) LIMIT 1) p
CROSS JOIN LATERAL (SELECT id FROM communities ORDER BY md5(id::text||g.n::text) LIMIT 1) c
WHERE NOT EXISTS (SELECT 1 FROM posts x WHERE x.title='Discussion #'||g.n);

INSERT INTO comments(post_id,author_id,content)
SELECT p.id,
       u.user_id,
       CASE WHEN g.n%3=0 THEN 'I had the same question. This explanation helped me.'
            WHEN g.n%3=1 THEN 'I would start by writing down the definitions first.'
            ELSE 'Good point. I am going to try this approach.' END
FROM posts p
CROSS JOIN LATERAL (SELECT user_id FROM profiles ORDER BY md5(p.id::text||user_id) LIMIT 1) u
CROSS JOIN generate_series(1,3) g(n)
WHERE NOT EXISTS (SELECT 1 FROM comments c WHERE c.post_id=p.id)
LIMIT 150;

INSERT INTO follows(follower_id,following_id)
SELECT a.user_id,b.user_id
FROM profiles a CROSS JOIN profiles b
WHERE a.user_id<>b.user_id
AND a.user_id IN ('demo-ahmed','demo-sara','demo-yacine','demo-karim','demo-lina')
AND b.user_id IN ('demo-sara','demo-ahmed','demo-nadir','demo-wassim')
ON CONFLICT DO NOTHING;