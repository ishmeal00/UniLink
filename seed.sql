INSERT INTO skills(name) SELECT unnest(ARRAY['C','C++','Python','Java','JavaScript','Web Development','Mathematics','Design','Marketing','English','French']) ON CONFLICT DO NOTHING;
INSERT INTO interests(name) SELECT unnest(ARRAY['AI','Cybersecurity','Programming','Startups','Sports','Gaming','Science','Reading','Music','Entrepreneurship']) ON CONFLICT DO NOTHING;
INSERT INTO goals(name) SELECT unnest(ARRAY['Study Partner','Project Partner','Friend','Teammate','Mentor','Tutor','Someone with similar interests']) ON CONFLICT DO NOTHING;
INSERT INTO profiles(user_id,name,university,field,year,bio,avatar) VALUES
('demo-ahmed','Ahmed','University Constantine 2','Computer Science','2nd Year','Building small projects and learning Python.',''),
('demo-sara','Sara','University Constantine 2','Computer Science','1st Year','Interested in AI and learning with others.',''),
('demo-yacine','Yacine','University Constantine 2','Mathematics','2nd Year','Math, algorithms and science.',''),
('demo-amine','Amine','University Constantine 2','Computer Science','3rd Year','Web development and startups.',''),
('demo-lina','Lina','University Constantine 2','Physics','1st Year','Science, reading and programming.',''),
('demo-rayane','Rayane','University Constantine 2','Economics','2nd Year','Entrepreneurship and marketing.',''),
('demo-ines','Ines','University Constantine 2','Computer Science','1st Year','Python and cybersecurity learner.',''),
('demo-karim','Karim','University Constantine 2','Computer Science','2nd Year','C, C++ and systems.',''),
('demo-meriem','Meriem','University Constantine 2','Mathematics','3rd Year','Mathematics and tutoring.',''),
('demo-nadir','Nadir','University Constantine 2','Computer Science','Master','AI and research.',''),
('demo-hiba','Hiba','University Constantine 2','Physics','2nd Year','Science and music.',''),
('demo-wassim','Wassim','University Constantine 2','Computer Science','1st Year','Programming and gaming.',''),
('demo-nour','Nour','University Constantine 2','Economics','1st Year','Startups and entrepreneurship.',''),
('demo-samir','Samir','University Constantine 2','Computer Science','3rd Year','JavaScript and web development.',''),
('demo-malak','Malak','University Constantine 2','Computer Science','2nd Year','AI, Python and science.',''),
('demo-bilal','Bilal','University Constantine 2','Mathematics','1st Year','Math and programming.',''),
('demo-dalila','Dalila','University Constantine 2','Computer Science','1st Year','English, Python and reading.',''),
('demo-fares','Fares','University Constantine 2','Physics','3rd Year','Programming and science.',''),
('demo-aya','Aya','University Constantine 2','Computer Science','2nd Year','Cybersecurity and startups.',''),
('demo-ilyes','Ilyes','University Constantine 2','Computer Science','1st Year','C, Python and gaming.','')
ON CONFLICT (user_id) DO NOTHING;