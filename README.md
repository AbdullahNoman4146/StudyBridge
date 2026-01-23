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


## Project Milestones

### Milestone 1: Requirement Analysis & System Design
- Identify problems in current student consultancy operations
- Define system objectives and scope
- Finalize user roles (Admin, Agent, Student)
- Design system architecture, database schema (ER diagram), and UI wireframes

### Milestone 2: Core Module Development
- Implement authentication and role-based access control
- Develop dashboards for Admin, Agent, and Student
- Implement student management and application workflow
- Integrate document upload and basic validation

### Milestone 3: Testing, Refinement & Final Submission
- Test system functionality and fix bugs
- Improve UI consistency and usability
- Generate sample data and reports
- Prepare project documentation and presentation
