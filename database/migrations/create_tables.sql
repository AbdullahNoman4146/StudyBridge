DROP TABLE IF EXISTS application_documents;
DROP TABLE IF EXISTS scholarship_applications;
DROP TABLE IF EXISTS scholarships;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS countries;

CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO countries (name) VALUES
('Canada'),
('Australia'),
('United Kingdom'),
('United States'),
('Germany');

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'agent', 'student') NOT NULL,
  country_id INT NULL,
  must_change_password TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_users_role_country (role, country_id),
  CONSTRAINT fk_users_country
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
);

CREATE TABLE student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  address VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE scholarships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NOT NULL,
  country_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  university_name VARCHAR(160) NOT NULL,
  degree_level VARCHAR(100) NOT NULL,
  funding_type VARCHAR(100) NOT NULL,
  amount VARCHAR(120) NULL,
  deadline DATE NOT NULL,
  intake VARCHAR(100) NULL,
  description TEXT NOT NULL,
  eligibility TEXT NULL,
  required_documents LONGTEXT NULL,
  application_instructions TEXT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_scholarships_agent (agent_id),
  INDEX idx_scholarships_country (country_id),
  INDEX idx_scholarships_status_deadline (status, deadline),
  CONSTRAINT fk_scholarships_agent
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_scholarships_country
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

CREATE TABLE scholarship_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scholarship_id INT NOT NULL,
  student_id INT NOT NULL,
  agent_id INT NOT NULL,
  message TEXT NULL,
  status ENUM('submitted', 'under_review', 'needs_documents', 'approved', 'rejected') NOT NULL DEFAULT 'submitted',
  agent_note TEXT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_scholarship_student (scholarship_id, student_id),
  INDEX idx_scholarship_applications_agent_status (agent_id, status),
  INDEX idx_scholarship_applications_student (student_id),
  CONSTRAINT fk_scholarship_applications_scholarship
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE,
  CONSTRAINT fk_scholarship_applications_student
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_scholarship_applications_agent
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE application_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NULL,
  file_size BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_application_documents_application (application_id),
  CONSTRAINT fk_application_documents_application
    FOREIGN KEY (application_id) REFERENCES scholarship_applications(id) ON DELETE CASCADE
);

CREATE TABLE application_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_application_messages_application (application_id),
  INDEX idx_application_messages_sender (sender_id),
  CONSTRAINT fk_application_messages_application
    FOREIGN KEY (application_id) REFERENCES scholarship_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_application_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS scholarship_interests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scholarship_id INT NOT NULL,
  student_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_scholarship_interest (scholarship_id, student_id),
  INDEX idx_scholarship_interests_student (student_id),
  INDEX idx_scholarship_interests_scholarship (scholarship_id),
  CONSTRAINT fk_scholarship_interests_scholarship
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE,
  CONSTRAINT fk_scholarship_interests_student
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);