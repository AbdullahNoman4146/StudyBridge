# StudyBridge 
### (Visa, Admission & Compliance Management System)

A web-based academic project developed using **Laravel (PHP Framework)** and **MySQL**, designed to simplify and digitize student consultancy operations such as admission processing, visa tracking, document management, and application workflow monitoring.

---

## Project Overview

Student consultancy firms often manage student applications manually using tools like WhatsApp, Excel, and Google Drive. This leads to problems such as missed deadlines, lost documents, and lack of transparency for students.

This project provides a **centralized, workflow-based management system** where admins, agents, and students can track application progress, manage documents, and monitor visa/admission stages efficiently.

---

##  Objectives

- Digitize student admission and visa management
- Reduce manual tracking and communication overhead
- Provide real-time application status to students
- Improve document organization and deadline tracking
- Create a structured workflow for consultancy operations

---

##  User Roles

- **Admin** – Manages system, agents, countries, and overall workflow  
- **Agent** – Handles assigned students, updates application stages  
- **Student** – Views application progress and document status (read-only)

---

##  Core Features

-  Role-based authentication
-  Separate dashboards for Admin, Agent, and Student
-  Student management with profile and timeline
-  Country-wise visa checklist configuration
-  Application workflow & stage tracking
-  Kanban-style application pipeline
-  Document upload, review, and status tracking
-  Deadline alerts and status notifications (in-app)
-  User & role management

---

##  Application Pages

1. Login Page  
2. Admin Dashboard  
3. Agent Dashboard  
4. Student Dashboard  
5. Student List  
6. Student Profile (Overview, Timeline, Documents, Messages)  
7. Application Workflow  
8. Kanban Pipeline View  
9. Country & Visa Setup  
10. Document Center  
11. Settings & User Management  

---

##  Technology Stack

### Backend
- **PHP 8+**
- **Laravel Framework**
- Laravel Blade / REST API

### Frontend
- HTML5, CSS3
- JavaScript
- Bootstrap / Tailwind CSS (optional)

### Database
- **MySQL**

### Tools & Libraries
- Laravel Authentication
- Laravel Scheduler (for deadline checks)
- Spatie Laravel Permissions (roles & access control)

---

##  System Architecture (Simplified)

- MVC Architecture (Laravel)
- Role-based access control
- Centralized MySQL database
- Server-side rendered pages with dashboard UI

---

##  Database Overview (Key Tables)

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



