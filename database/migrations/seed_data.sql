INSERT INTO users (
  name,
  email,
  password,
  role,
  country_id,
  must_change_password,
  status
) VALUES (
  'System Admin',
  'admin@studybridge.com',
  '$2y$12$Lwc5TyAASFSeBTk5LD8Jy.DZvVKXX9r0g/nSzfNZuZsu9.EkuJZhy',
  'admin',
  NULL,
  0,
  'active'
);