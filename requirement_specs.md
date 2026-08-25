# Class Updates & Homework Tracking Application

**Functional Requirement & Technical Specification**  
**Version:** 1.0  
**Date:** August 2026

## 1. Objectives

The application will:

- Allow instructors to quickly record each class taken for a student.
- Automatically show previous unchecked homework when entering a new class.
- Allow the instructor to mark previous homework as checked while saving the new class.
- Prevent duplicate class records.
- Provide student-wise and date-wise reporting.
- Provide secure authentication and authorization for instructors and administrators.
- Keep the initial infrastructure cost at or near zero.

## 2. Recommended Technology Architecture

The initial architecture should be deliberately simple and should avoid a separate backend server.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + TypeScript | Web application and user interface |
| UI | Tailwind CSS or standard CSS | Responsive interface |
| Hosting | Cloudflare Pages | Hosts the web application |
| Backend/API | Supabase | Authentication and secure data access |
| Database | PostgreSQL via Supabase | Stores application data |
| Authentication | Supabase Auth | Instructor/admin login |
| Security | PostgreSQL Row Level Security (RLS) | Controls data access |
| Source Control | GitHub | Code repository and deployment |

### Initial architecture

```text
Browser
   |
   v
Cloudflare Pages
   |
   | HTTPS
   v
Supabase API
   |
   v
PostgreSQL
```

A separate Node.js/Python backend is **not required for Version 1**.

## 3. Class Update Entry

Each class creates one new `class_updates` record.

| Field | Specification |
|---|---|
| Student Name | Required. Search/select from student master list. |
| Instructor | Prefilled from authenticated instructor. Query string may be used for convenience/prefill but is NOT the security mechanism. |
| Subject | English or Math. |
| Level | Selected from configured level list. |
| Class Duration | Text box with dropdown suggestions: 30 mins, 45 mins, 1 hr, 1.5 hrs, 2 hrs. User may enter another value. |
| Booklet Number | Text/input field. |
| CW | Free-text classwork field. |
| HW | Free-text homework field. |
| Date of Class | Defaults to today's date for a new record and can be changed using a date picker. |

## 4. Class Duration

Class Duration should be a **text box combined with a dropdown**.

### Dropdown values

- 30 mins
- 45 mins
- 1 hr
- 1.5 hrs
- 2 hrs

The user should also be able to enter another/custom value.

### Recommended database representation

Store duration numerically as minutes:

| Display | Stored value |
|---|---:|
| 30 mins | 30 |
| 45 mins | 45 |
| 1 hr | 60 |
| 1.5 hrs | 90 |
| 2 hrs | 120 |

Custom durations can also be stored.

## 5. Homework Tracking — Separate Homework Entity

Homework should **not** be treated only as a Yes/No field inside the class record.

Each homework assignment should be stored as a separate `homework` record linked to the class that assigned it.

| Homework ID | Class Date | Homework | Checked | Checked By/Date |
|---|---|---|---|---|
| HW-101 | 15-Aug | 15-6 Pages 7, 11, 13, 14, 15 | No | — |
| HW-102 | 18-Aug | 15-6 Pages 16, 18 | Yes | Instructor / 22-Aug |

This allows the system to maintain a complete homework history.

## 6. Pending Homework Workflow

When an instructor selects a student for a new class, the application should automatically retrieve previous homework that:

1. Belongs to the student.
2. Was assigned before the new class date.
3. Has not yet been checked.

The pending homework should appear on the **same class-entry screen**.

### Workflow

1. Instructor selects the student.
2. Application finds previous unchecked homework.
3. Pending homework is displayed.
4. Instructor checks the homework that has been completed/checked.
5. Instructor enters the new class information and new HW.
6. Instructor clicks **Save Class Update**.
7. The application inserts the new class, inserts the new homework record, and updates all selected previous homework records.
8. All database changes should occur in **one transaction**.

If any operation fails, the transaction should roll back.

## 7. Example: 15-Aug Class and 22-Aug Class

On **15-Aug**, the instructor enters:

```text
HW: 15-6 Pages 7, 11, 13, 14, 15
```

The homework remains unchecked.

When the instructor enters a class for the same student on **22-Aug**, the screen should show:

```text
Previous Pending Homework

15-Aug
☐ 15-6 Pages 7, 11, 13, 14, 15
```

The instructor can check the homework.

When **Save Class Update** is clicked:

```text
INSERT new 22-Aug class
INSERT new 22-Aug homework
UPDATE 15-Aug homework → checked
```

All operations should happen atomically.

## 8. Homework Data

Recommended fields:

```text
homework.id
homework.student_id
homework.class_update_id
homework.homework_text
homework.assigned_date
homework.checked
homework.checked_date
homework.checked_by
```

### Version 1

Homework should remain **free text**. Page-by-page structured tracking can be considered as a future enhancement.

## 9. Instructor Identity and Query String

A query string may be used to prefill the instructor when opening the class-entry screen.

Example:

```text
/class-update?instructor=priya
```

However:

> **The query string must never be trusted as proof of identity.**

The actual instructor identity must come from authentication.

```text
Query string
    |
    v
Convenience / prefill

Authenticated login
    |
    v
Actual instructor identity
    |
    v
Database
```

This prevents someone from changing the URL and impersonating another instructor.

## 10. Authentication

The application should require login.

### Instructor

An instructor should be able to:

- Create class updates.
- View permitted student history.
- Check homework.
- Edit records according to configured permissions.

### Administrator

An administrator should be able to:

- Manage students.
- Manage instructors.
- Manage levels.
- Manage users.
- View all records.
- Correct records.
- Generate reports.
- Manage application configuration.

Supabase Auth is recommended for authentication.

## 11. Security

Security is particularly important because the application stores student/class information.

The application should:

- Use HTTPS for all communication.
- Never put a PostgreSQL password or database connection string in the browser.
- Use the Supabase API/client layer for frontend data access.
- Use PostgreSQL Row Level Security (RLS).
- Use the authenticated user's ID rather than trusting URL parameters.
- Restrict instructor access according to role and permissions.
- Separate administrative operations from instructor operations.
- Consider an audit log for important changes.

### Security architecture

```text
Instructor
    |
    v
Login / Supabase Auth
    |
    v
Authenticated User
    |
    v
Supabase API
    |
    v
PostgreSQL + RLS
```

## 12. Duplicate Prevention

Duplicate prevention should exist at **two levels**.

### 12.1 UI-level validation

Before saving, the application should check whether a potentially duplicate class already exists and warn the instructor.

### 12.2 Database-level protection

The database should enforce the final duplicate rule using a unique constraint.

A possible initial uniqueness rule is:

```text
Student + Instructor + Subject + Class Date
```

However, if the same student can legitimately have two classes on the same day, class time or another identifier must be included.

## 13. Core Database Tables

Recommended initial tables:

### `students`

```text
id
name
active
created_at
updated_at
```

### `instructors`

```text
id
name
email
active
created_at
updated_at
```

### `subjects`

Initial values:

```text
English
Math
```

### `levels`

Examples:

```text
Grade 2
Grade 3
Grade 4
...
```

### `class_updates`

```text
id
student_id
instructor_id
subject_id
level_id
class_date
duration_minutes
booklet_number
cw
hw
created_at
updated_at
```

### `homework`

```text
id
student_id
class_update_id
homework_text
assigned_date
checked
checked_date
checked_by
created_at
updated_at
```

### `users / profiles`

Authenticated user information and roles.

### `audit_log`

Optional but recommended record of important actions.

## 14. Reporting

The application should support:

- Month-to-date reports.
- Full-month reports.
- Custom date ranges.
- Student-wise reports.
- Date-wise reports for each student.
- Subject filtering.
- Instructor filtering.
- Class duration totals.
- Homework status.
- Pending homework history.
- Checked homework history.

A typical student report should show:

| Date | Instructor | Subject | Level | Duration | Booklet | CW | HW |
|---|---|---|---|---:|---|---|---|

Excel and PDF export can be added after the basic reports are working.

## 15. Main Screens

1. Login
2. Dashboard
3. New Class Update
4. Class History
5. Student History
6. Reports
7. Admin / Master Data Management

## 16. New Class Update Screen

Proposed layout:

```text
--------------------------------------------------
                NEW CLASS UPDATE
--------------------------------------------------

Instructor:    Priya
Student:       [ Search student... ]

Subject:       [ Math ▼ ]
Level:         [ Grade 3 ▼ ]

Class Date:    [ 22-Aug-2026 📅 ]

Duration:      [ 1 hr ▼ / custom text ]

Booklet No:    [ 15 ]

CW:
[                                             ]
[                                             ]

HW:
[                                             ]
[                                             ]

--------------------------------------------------
Previous Pending Homework
--------------------------------------------------

15-Aug
☐ 15-6 Pages 7, 11, 13, 14, 15

18-Aug
☐ 15-6 Pages 16, 18

--------------------------------------------------

              [ SAVE CLASS UPDATE ]
--------------------------------------------------
```

## 17. Save Class Update Transaction

The Save operation should be atomic.

1. Validate the new class.
2. Check duplicate constraints.
3. Insert `class_updates`.
4. Insert the new `homework` record if HW was entered.
5. Update every previously unchecked homework item selected by the instructor.
6. Set `checked_by`.
7. Set `checked_date`.
8. Commit the transaction.

If any step fails:

```text
ROLLBACK
```

The database must not contain a partially saved class.

## 18. Historical Class Entry

The instructor may change the class date.

Business logic must use the **entered class date**, not today's date.

For example, if today is 24-Aug but the instructor enters a class dated 22-Aug:

```text
Pending homework
=
Homework assigned before 22-Aug
AND
Homework is unchecked
```

## 19. Editing and Deleting Records

Recommended rules:

- Instructors should have controlled edit permissions.
- Permanent deletion should generally be restricted to administrators.
- Consider soft deletion/cancellation instead of physically deleting important historical records.
- Important changes should ideally be auditable.

## 20. Cloudflare + Supabase Architecture

Cloudflare Pages and Supabase can work together directly.

```text
                  Internet
                     |
                     v
             +----------------+
             | Cloudflare     |
             | Pages          |
             | React App      |
             +-------+--------+
                     |
                     | HTTPS
                     v
             +----------------+
             | Supabase       |
             | API/Auth       |
             +-------+--------+
                     |
                     v
             +----------------+
             | PostgreSQL     |
             | Database       |
             +----------------+
```

The browser does **not** connect directly to PostgreSQL using a database password.

Instead:

```text
React
  |
  v
Supabase API
  |
  v
PostgreSQL
```

## 21. Initial Cost

Target initial infrastructure cost: **approximately ₹0/month**.

| Component | Recommended Service | Initial Cost |
|---|---|---:|
| Frontend hosting | Cloudflare Pages | ₹0 initially |
| Database | Supabase PostgreSQL | ₹0 initially |
| Authentication | Supabase Auth | ₹0 initially |
| API | Supabase Data API | ₹0 initially |
| Source control | GitHub | ₹0 initially |
| Domain | Optional custom domain | Approximately ₹800–₹1,500/year |

A paid database plan can be considered later when production reliability, backups, storage, traffic or other requirements justify it.

## 22. Implementation Phases

### Phase 1 — Requirements and Database Design

Finalize business rules, tables, relationships, duplicate rules, security rules and roles.

### Phase 2 — Supabase Setup

Set up PostgreSQL, tables, relationships, constraints, RLS and authentication.

### Phase 3 — Authentication

Implement instructor/admin login and roles.

### Phase 4 — Class Entry

Implement student, instructor, subject, level, date, duration, booklet, CW and HW.

### Phase 5 — Homework

Implement pending homework display, checking, checked date/by, and atomic save.

### Phase 6 — Duplicate Prevention

Implement UI warnings and database unique constraints.

### Phase 7 — History

Implement class, student and homework history.

### Phase 8 — Reports

Implement month-to-date, full-month, date-range and student/date-wise reports.

### Phase 9 — Export

Add Excel and PDF.

### Phase 10 — UI Polish

Add mobile responsiveness, better search, filters, dashboard and usability improvements.

## 23. Business Rules to Finalize Before Coding

1. What exactly constitutes a duplicate class?
2. Can a student have two classes on the same day?
3. Can the same student have Math and English on the same day?
4. Can two instructors teach the same student on the same day?
5. Should pending homework be shown only for the current subject or all subjects?
6. Can instructors edit previous class records?
7. Can instructors cancel/delete records?
8. What can an instructor see compared with an administrator?
9. What happens when a historical class is entered?
10. Should homework be checked as one whole assignment or page-by-page?
11. What happens if the same homework is entered twice?
12. Should cancelled classes appear in reports?
13. Should duration be stored as minutes?
14. Should booklet numbers be free text or selected from a booklet master list?

## 24. Recommended Version 1 Scope

Version 1 should include:

- Student master data.
- Instructor master data.
- Secure login.
- Class update entry.
- Editable class date.
- Duration text box with dropdown suggestions.
- Separate homework records.
- Pending homework display.
- Homework checking.
- Atomic Save Class Update transaction.
- Duplicate prevention.
- Student/class history.
- Month-to-date reports.
- Date-wise reports.
- Basic security/RLS.

Avoid over-engineering Version 1.

## 25. Future Enhancements

Potential future features:

- Page-by-page homework tracking.
- Excel/PDF exports.
- Homework reminders.
- Dashboard statistics.
- Attendance tracking.
- Class start/end time.
- Mobile/PWA support.
- Detailed audit history.
- Advanced reporting.
- Analytics.

## 26. Final Recommended Architecture

```text
React + TypeScript
        |
        v
Cloudflare Pages
        |
        | HTTPS
        v
Supabase API + Authentication
        |
        v
PostgreSQL
        |
        +-- Students
        +-- Instructors
        +-- Subjects
        +-- Levels
        +-- Class Updates
        +-- Homework
        +-- Users / Profiles
        +-- Audit Log
```

### Most important design decisions

1. **Homework is a separate entity**, not merely a Yes/No field in the class record.
2. **Instructor identity comes from authentication**, not the query string.
3. **Query strings are for convenience/prefill only.**
4. **Class duration uses a text box with dropdown suggestions.**
5. **Duplicate prevention exists both in the UI and database.**
6. **Saving a class and updating checked homework happens in one database transaction.**
7. **PostgreSQL + Supabase is the preferred database/backend platform.**
8. **Cloudflare Pages is the preferred initial frontend hosting platform.**
9. **PostgreSQL RLS should be used for authorization/data security.**
10. **Initial infrastructure can be approximately ₹0/month.**

## 27. Core Instructor Workflow

```text
Login
  ↓
Select Student
  ↓
See Pending Homework
  ↓
Check Completed Previous Homework
  ↓
Enter Today's CW/HW
  ↓
Save
  ↓
Class + New HW + Previous HW Updates
saved atomically
```

The database design should support this workflow reliably before additional features are added.
