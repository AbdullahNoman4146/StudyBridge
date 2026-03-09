# StudyBridge  
### (Visa, Admission & Compliance Management System)

A web-based academic project developed using **Laravel (PHP Framework)** and **MySQL**, designed to simplify and digitize student consultancy operations such as admission processing, visa tracking, document management, and application workflow monitoring.

---

## Team Members

| Student ID  | Name              | University Email                    |
|------------ |-------------------|-------------------------------------|
| 20230104134 | Abesh Barua       | abesh.cse.20230104134@aust.edu      |
| 20230104143 | Rubai Raihan      | rushnal.cse.20230104143@aust.edu    |
| 20230104144 | Shihab Sharar     | shihab.cse.20230104144@aust.edu     |
| 20230104146 | Abdullah Al Noman | noman.cse.20230104146@aust.edu      |

---

## Project Overview

Student consultancy firms often manage student applications manually using tools like WhatsApp, Excel, and Google Drive. This leads to problems such as missed deadlines, lost documents, and lack of transparency for students.

This project provides a **centralized, workflow-based management system** where admins, agents, and students can track application progress, manage documents, and monitor visa and admission stages efficiently.

---

## Objectives

- Digitize student admission and visa management  
- Reduce manual tracking and communication overhead  
- Provide real-time application status to students  
- Improve document organization and deadline tracking  
- Create a structured workflow for consultancy operations  

---

## User Roles

- **Admin** – Manages system users, countries, and overall workflow  
- **Agent** – Handles assigned students and updates application stages  
- **Student** – Views application progress and document status

---

## Core Features

- Role-based authentication  
- Separate dashboards for Admin, Agent, and Student  
- Student management with profile and timeline  
- Country-wise visa checklist configuration  
- Application workflow and stage tracking  
- Application Pipeline View (stage-based progress tracking)  
- Document upload, review, and status tracking  
- Deadline alerts and status notifications  
- User and role management  

---

## Application Pages

1. Login Page  
2. Admin Dashboard  
3. Agent Dashboard  
4. Student Dashboard  
5. Student List  
6. Student Profile (Overview, Timeline, Documents, Messages)  
7. Application Workflow  
8. Application Pipeline View  
9. Country and Visa Setup  
10. Document Center  
11. Settings and User Management  

---

## UI Design

UI mockups and design layouts for this project can be found at:

**UI Design Link:**  
`https://www.figma.com/make/WyMZSLoM5l1uKnc9TFRM3k/StudyBridge-UI-Mockups?t=8k8R5cwS3p4MS8aM-20&fullscreen=1`

---


## Technology Stack

### Backend
- PHP 8+
- Laravel Framework
- Laravel Blade / REST API

### Frontend
- HTML5, CSS3  
- JavaScript  
- Bootstrap or Tailwind CSS (optional)  

### Database
- MySQL  

### Tools and Libraries
- Laravel Authentication  
- Laravel Scheduler (for deadline checks)  
- Spatie Laravel Permissions (role-based access control)  

---

## System Architecture
- MVC architecture using Laravel  
- Role-based access control  
- Centralized MySQL database  
- Server-side rendered pages with dashboard UI  

---

## Database Overview (Key Tables)

- users  
- roles  
- students  
- agents  
- countries  
- visa_checklists  
- applications  
- application_stages  
- documents  
- notifications  

---

## API Endpoints (Examples)

### Frontend Routes:

- /login
- /register
- /admin-dashboard
- /agent-dashboard
- /student-dashboard
- /students
- /students/:id
- /application-workflow
- /application-pipeline
- /country-visa-setup
- /document-center
- /settings

### Authentication:
- POST /api/login
- POST /api/register
- GET /api/me
- POST /api/logout
- POST /api/change-password

### Admin API
- GET /api/admin/dashboard
- POST /api/admin/agents
- GET /api/admin/students
- GET /api/admin/students/{id}

### Agent API
- GET /api/agent/dashboard
- GET /api/agent/students
- GET /api/agent/tasks

### Student API
- GET /api/student/dashboard
- GET /api/student/profile
- PUT /api/student/profile

### Countries API
- GET /api/countries
- GET /api/visa-checklists

### Workflow API
- GET /api/workflow
- GET /api/pipeline

### Documents API
- GET /api/documents
- POST /api/documents/upload
- PUT /api/documents/{id}/status


- Prepare project documentation and presentation

---

## Local Development Setup

Follow these steps to get the project running on your machine.

1. **Start the database**
   ```powershell
   docker-compose up -d mysql
   ```
   (maps port 3307 to 3306 by default; adjust if needed)

2. **Copy environment file and generate keys**
   ```powershell
   cd server
   cp .env.example .env
   php artisan key:generate
   php artisan jwt:secret      # populates JWT_SECRET
   ```

3. **Edit `server/.env`** with your DB credentials (host `127.0.0.1`, port `3307`,
   database `studybridge`, user `root`, password `root`).

4. **Run migrations** to create tables (including `users`):
   ```bash
   php artisan migrate
   ```

5. **Start the Laravel backend** (default http://localhost:8000):
   ```bash
   php artisan serve
   ```

6. **Install frontend deps and run dev server**
   ```bash
   cd ../client
   npm install              # also installs Tailwind/PostCSS
   npm run dev              # Vite will compile Tailwind CSS automatically
   ```

   Vite is configured to proxy `/api` → `http://localhost:8000` so the React app
   can call the backend without CORS problems.

Once everything is up, you should be able to register/login and see the
Tailwind‑styled login and dashboard pages.

---

## Milestone Breakdown

### Milestone 1 
- Homepage
- Student login
- Admin login
- JWT authentication working
- Basic admin dashboard access working
- Basic student dashboard access working
- Users and student_profiles database tables created

### Milestone 2
- Admin creates agent accounts
- Agent login added
- Agent changes password after first login
- Agent dashboard implementation
- Student list page
- Student profile page with tabs
- Application workflow page
- Application pipeline page
- Basic notifications inside dashboards

### Milestone 3
- Country & Visa Setup page
- Document Center page
- Settings & User Management page
- Country and visa checklist management
- Document upload and status management
- Final system integration
- Final testing and debugging
- Final project presentation readiness
