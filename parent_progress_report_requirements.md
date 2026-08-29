# Parent Progress Report & Feedback — Requirements Specification

## 1. Purpose

Create a separate, parent-facing web page for each enrolled student.

The page will allow parents to easily view their child's class progress, homework, current levels, and recent activity, and to provide feedback to the learning centre.

The parent experience must be substantially simpler than the existing instructor/admin application.

### Key design principle

> **No traditional parent account/login. Use a unique private URL plus a PIN.**

A parent should be able to open a link received through WhatsApp, SMS or email, enter a short PIN, and immediately see the report.

---

## 2. Existing System Context

The current Class Management & Homework Tracking System is a React/TypeScript SPA using Supabase PostgreSQL, Supabase Authentication/RLS and Cloudflare Pages. fileciteturn2file0L11-L23

The existing system records students, instructors, subjects, curriculum levels, class updates and homework. The class-update model includes student, instructor, subject, level, date, duration, booklet number, CW and HW. fileciteturn2file0L96-L125

The homework model separately tracks assignments, checked status, checked date and the instructor who checked them. fileciteturn2file0L126-L147

The existing staff application already has authentication and Row Level Security. fileciteturn2file0L197-L209

The parent-facing functionality described here must be a **separate access layer** and must not expose the existing staff application.

---

## 3. Parent Access Model

### 3.1 No traditional parent login

Parents should NOT initially be required to:

- Create an account
- Enter an email address
- Remember a username
- Use the instructor/admin login
- Reset a password

Instead, each student gets a unique parent-access URL.

Example:

```text
https://yourdomain.com/parent/<long-random-token>
```

The token must be opaque and randomly generated.

The student name, student ID or any sequential identifier must NOT appear in the URL.

### 3.2 PIN protection

The private URL must additionally require a PIN.

Parent flow:

```text
Parent receives private link
        ↓
Opens link
        ↓
Parent PIN screen
        ↓
Enters PIN
        ↓
PIN verified
        ↓
Parent report displayed
```

PIN requirements:

- Short enough to be convenient.
- Never stored as plain text.
- Securely hashed.
- Failed attempts rate-limited.
- Repeated failures temporarily blocked.
- Changeable by an authorized administrator.
- Revoked when parent access is revoked.
- Old access invalidated when the URL/token is regenerated.

The exact PIN length and hashing implementation are implementation decisions.

---

## 4. Parent URL Requirements

### 4.1 Unique URL per student

Every active student with parent access enabled should have a unique parent-access token.

Example:

```text
/parent/7Kp92xQm...long-random-value...
```

The token must:

- Be cryptographically/randomly generated.
- Be sufficiently long to prevent guessing.
- Not contain the student's name.
- Not contain the student's database ID.
- Not be sequential.
- Not expose internal database identifiers.
- Be revocable.
- Be replaceable/regenerated.

### 4.2 URL persistence

The parent URL should normally remain valid indefinitely.

It should NOT automatically expire every few days or weeks.

Access should end when:

- An administrator revokes the link.
- The administrator regenerates the parent link.
- The student is no longer eligible for parent access.
- A security/administrative action disables access.

### 4.3 Revoke and regenerate

Administrators should have:

- **Revoke Parent Access**
- **Regenerate Parent Link**

Regenerating a link must invalidate the previous link.

---

## 5. Parent Access Administration

Add a parent-access section to the existing Admin Management area.

Suggested view:

| Student | Parent Access | Actions |
|---|---|---|
| Student A | Active | Copy Link / Change PIN / Revoke |
| Student B | Active | Copy Link / Change PIN / Revoke |
| Student C | Disabled | Generate Access |

Administrator capabilities:

1. Generate parent access.
2. Generate/regenerate the private URL.
3. Set/change the PIN.
4. Copy the parent URL.
5. Revoke access.
6. Re-enable access.
7. See when access was created/updated.
8. Optionally see last successful parent access.

---

## 6. Parent Report Page

The parent page should be **mobile-first**.

Parents will commonly access it from WhatsApp, SMS or email.

The page should not look like the internal admin reporting system. It should use simple cards and clear language.

---

## 7. Report Header

At the top:

### Student Name

Example:

**Rukaiya**

Below:

**Learning Progress Report**

Also show:

**Last updated: DD Month YYYY**

The parent should immediately know whose report they are viewing and how current the information is.

---

## 8. Current Learning Levels

Show the student's current level(s).

For English:

```text
English
Current Level: G
```

For Math:

```text
Math
BTM: 12
CTM: 10
```

The existing student model stores default English, BTM and CTM levels. fileciteturn2file0L96-L104

The parent report should use appropriate subject/level information without exposing internal database fields.

---

## 9. Progress Summary

Provide a high-level summary near the top.

Suggested metrics:

- Classes this month
- Total learning hours this month
- Homework assigned
- Homework completed
- Homework pending

Example:

```text
This Month

8 Classes       8 Hours
7 Homework      6 Completed
```

Exact metrics can be finalized during UI design.

---

## 10. Recent Classes

Display recent classes in reverse chronological order.

Each class should show, where available:

- Date
- Subject
- Instructor
- Duration
- Level
- Booklet number
- Class work
- Homework

The existing class-update model contains these core fields. fileciteturn2file0L110-L125

Example:

```text
22 August 2026

English
Instructor: Elma
Duration: 1 hour

Class Work
Booklet 15 — Pages 7–11

Homework
Pages 12–15
```

---

## 11. Homework Section

Homework should be a prominent part of the parent report.

Separate homework into:

### Pending

Homework that has not yet been marked checked by the instructor.

### Completed

Homework that has been checked by the instructor.

The existing homework workflow already tracks checked status, checked date and the checking instructor. fileciteturn2file0L126-L136

Important:

> **Parent acknowledgement must NOT automatically mark homework as completed.**

Only the existing instructor/homework-checking workflow determines whether homework is checked/completed.

---

## 12. Parent Homework Acknowledgement — Optional

Consider:

> **Have you seen this homework?**

[✓ Acknowledge]

This means the parent has seen/received the homework. It must NOT mean the child completed it.

If implemented, record:

- Homework ID
- Student
- Parent access/session
- Acknowledgement timestamp

This is optional for V1.

---

## 13. Parent Feedback

The report should provide a very low-friction way for parents to provide feedback.

### 13.1 Quick reaction

> **How are you feeling about your child's progress?**

Three options:

- 👍 Good
- 😐 Okay
- 👎 Needs attention

The parent should be able to submit this with one tap.

### 13.2 Written feedback

Provide an optional text box:

> **Would you like to tell us anything?**

Examples:

- Child is enjoying the classes.
- Homework is difficult.
- Please give more practice.
- Child is struggling with a particular topic.
- We would like more information about progress.

Written feedback is optional.

---

## 14. Request a Call

Provide:

> **Would you like us to contact you?**

Options:

- No
- Yes, please contact me

If yes, optionally allow a reason:

- Progress
- Homework
- Difficulty with a topic
- General feedback
- Other

This should create a visible item for staff/admin follow-up.

---

## 15. Feedback Records

Each parent feedback submission should record, at minimum:

- Student
- Feedback type
- Rating/reaction, if supplied
- Written feedback, if supplied
- Contact requested
- Contact reason
- Submission date/time
- Parent-access context/token reference

Do not store the raw parent PIN.

---

## 16. Staff/Admin Feedback Management

Parent feedback should be visible to authorized staff.

Suggested statuses:

```text
New
Reviewed
Responded
```

Example:

```text
Rukaiya — Parent Feedback

👎 Needs attention

"Rukaiya is finding the current work difficult."

Status: NEW

[Mark as Reviewed]
[Mark as Responded]
```

New feedback should be visually distinguishable from reviewed feedback.

---

## 17. Instructor Visibility

Where appropriate, instructors should be able to see feedback related to their students.

Potential model:

- Admin: all parent feedback.
- Instructor: feedback for students/classes they teach.
- Parent: only their own student's report and their own submitted feedback.

Exact visibility rules should be finalized during implementation.

---

## 18. Parent Feedback Frequency

Do not require parents to submit feedback every time they visit.

The page should allow voluntary feedback at any time.

Optionally, the system may periodically encourage feedback, but it should not become intrusive.

---

## 19. Parent Session Behaviour

After successful PIN entry, the parent should not have to re-enter the PIN for every interaction.

A secure temporary session should be established.

The session should:

- Be limited in duration.
- Be tied to the parent-access token.
- Not grant staff authentication.
- Not provide access to other students.
- Expire after a reasonable period of inactivity.

Exact session duration is a technical-design decision.

---

## 20. Logout / Lock

Provide:

**Lock Report**

or

**Sign Out**

This should clear the parent session from the current browser.

Useful when parents use a shared device.

---

## 21. Security Requirements

Security is a high-priority requirement because the page contains a child's educational information.

### 21.1 Student isolation

A parent-access session must access **only the student associated with that parent token**.

Changing URL or request parameters must never allow another student's data to be retrieved.

### 21.2 Do not trust the URL alone

The backend must validate:

```text
parent token
    ↓
active parent-access record
    ↓
associated student
    ↓
authorized report data
```

The PIN must also be verified before report data is exposed.

### 21.3 No staff access

A parent session must not provide access to:

- `/new-class`
- `/class-history`
- `/reports`
- `/admin`
- Instructor data-management functions
- Staff authentication functions

### 21.4 No cross-student data

Parent endpoints/data access must never return:

- Other students
- Other parents
- Other students' homework
- Other students' class records
- Internal staff-only information

### 21.5 Rate limiting

PIN verification must be protected against repeated guessing.

Requirements:

- Rate limiting.
- Temporary lockout after repeated failures.
- Generic error messages.
- Do not reveal unnecessary information about whether a token/student exists.

### 21.6 PIN storage

The PIN must never be stored in plain text.

Store only a secure hash.

### 21.7 Audit trail

Consider recording:

- Parent access created
- Parent access revoked
- Parent link regenerated
- PIN changed
- Successful PIN verification
- Failed PIN verification
- Feedback submitted

Exact audit requirements should be finalized during technical design.

---

## 22. Proposed Data Model

The existing system has `students`, `class_updates` and `homework`. fileciteturn2file0L96-L147

Introduce a new parent-access area rather than modifying existing staff authentication.

### Proposed `parent_access`

Conceptually:

```text
parent_access
--------------
id
student_id
access_token_hash
pin_hash
active
created_at
updated_at
last_accessed_at
revoked_at
```

Exact columns, types and constraints are implementation decisions.

Important:

- Store a secure representation of the token rather than unnecessarily storing the raw credential.
- Never store the PIN in plain text.
- Prefer one active parent access record per student for V1 unless multiple guardians become a requirement.

### Proposed `parent_feedback`

Conceptually:

```text
parent_feedback
---------------
id
student_id
parent_access_id
rating
feedback_text
contact_requested
contact_reason
status
created_at
reviewed_at
reviewed_by
responded_at
```

Exact schema should be finalized during technical design.

---

## 23. Multiple Parents / Multiple Links

### V1 recommendation

Use **one parent-access link per student**.

This keeps administration simple.

Future versions could support:

- Mother/guardian link
- Father/guardian link
- Multiple guardians
- Different PINs
- Separate access/revocation

Do not add this complexity unless there is a real requirement.

---

## 24. Parent Report Date Range

The parent should initially see:

### Summary

Current month / recent activity.

### Recent Classes

Most recent classes, with an option to view older history.

Potential future controls:

- This month
- Last month
- Last 3 months
- All history

Exact default number of classes should be decided during UI design.

---

## 25. Empty States

### No classes yet

> No classes have been recorded yet.

### No homework

> No homework has been assigned recently.

### No pending homework

> 🎉 There is no pending homework.

### No feedback

Simply show the feedback controls.

---

## 26. Error States

If the parent link is invalid/revoked:

> **This report link is no longer active.**  
> Please contact the learning centre.

If the PIN is incorrect:

> **Incorrect PIN. Please try again.**

Do not reveal internal technical information.

If the service is unavailable:

> **We're temporarily unable to load the report. Please try again later.**

---

## 27. Parent Page Navigation

Keep navigation minimal.

Suggested sections:

```text
Overview
Classes
Homework
Feedback
```

A single scrolling page may be preferable for V1.

Avoid creating a complex parent portal.

---

## 28. Mobile-First UI

Requirements:

- Large touch targets.
- Readable text.
- Minimal tables.
- Cards rather than dense desktop tables.
- Fast initial load.
- Responsive layout.
- Easy scrolling.
- Clear visual distinction between pending and completed homework.

---

## 29. Parent Communication / Link Distribution

Administrator workflow:

```text
Admin
 ↓
Select student
 ↓
Generate Parent Access
 ↓
Set PIN
 ↓
Copy Link
 ↓
Send to parent through WhatsApp/SMS/email
```

The system does not initially need to send the message itself.

Future versions could integrate messaging/email.

---

## 30. Relationship to Existing Reports Page

The current application already has an internal `Reports.tsx` page for staff performance metrics and hours breakdown. fileciteturn2file0L50-L55

The new parent page should **not replace** the existing staff Reports page.

They serve different purposes:

### Staff Reports

Operational/internal reporting.

### Parent Report

Simple, child-focused progress communication.

---

## 31. Relationship to Existing Authentication

The existing staff application uses Supabase Authentication and RLS. fileciteturn2file0L197-L209

Parent access should be implemented as a separate authorization mechanism.

Do not create parent Supabase Auth accounts merely to make the parent page work.

The parent URL + PIN flow should be sufficient for V1.

---

## 32. Cloudflare / Supabase Architecture

The existing application is hosted through Cloudflare Pages and uses Supabase PostgreSQL/Auth/RLS. fileciteturn2file0L15-L23

The parent page should fit into this architecture.

Conceptually:

```text
Parent browser
      |
      | unique URL
      v
Cloudflare Pages
      |
      | parent access/session request
      v
Secure backend/database layer
      |
      v
Supabase PostgreSQL
      |
      +---- Parent Access
      +---- Student
      +---- Class Updates
      +---- Homework
      +---- Parent Feedback
```

Exact implementation mechanism should be determined during technical design.

---

## 33. Recommended V1 Scope

### Access

- Unique long random URL per student.
- PIN protection.
- No parent account/login.
- Secure temporary session.
- Revoke access.
- Regenerate URL.
- Change PIN.

### Parent Report

- Student name.
- Current levels.
- Monthly summary.
- Recent classes.
- Instructor.
- Duration.
- CW.
- HW.
- Pending/completed homework.
- Last updated date.

### Feedback

- 👍 / 😐 / 👎.
- Optional written feedback.
- Request-a-call option.
- New/Reviewed/Responded status for staff.

### Security

- Strong random token.
- Secure PIN hash.
- Rate limiting.
- Student-level isolation.
- Parent/staff access separation.
- No exposure of internal IDs.
- Audit logging for important access-management actions.

---

## 34. Explicitly Out of Scope for V1

Do not implement initially:

- Parent account creation.
- Parent username/password.
- Parent email verification.
- Multiple parent accounts per student.
- Parent-to-parent communication.
- Chat/messaging system.
- Online payments.
- Complex analytics.
- Mobile application.
- Automated WhatsApp integration.
- Automated email delivery.

These can be considered later.

---

## 35. Recommended Parent Experience

```text
                    PARENT
                       |
                       v
          Receives private URL + PIN
                       |
                       v
             Opens parent URL
                       |
                       v
                 Enter PIN
                       |
                 PIN verified
                       |
                       v
              ┌─────────────────┐
              │ Student         │
              │ Progress Report │
              └─────────────────┘
                       |
          ┌────────────┼────────────┐
          v            v            v
       Overview      Classes      Homework
          |            |            |
          └────────────┼────────────┘
                       v
                 Parent Feedback
                       |
                ┌──────┴──────┐
                v             v
             👍 😐 👎      Written text
                               |
                               v
                       Request a call
                               |
                               v
                       Staff/Admin
                       sees feedback
```

---

## 36. Acceptance Criteria

The feature will be considered ready for V1 when:

1. An administrator can generate parent access for a student.
2. The system generates a unique, non-guessable URL.
3. The URL does not expose the student ID/name.
4. The administrator can set/change the PIN.
5. A parent can open the URL without creating an account.
6. A parent must successfully enter the PIN before viewing report data.
7. An incorrect PIN does not reveal student information.
8. Repeated incorrect PIN attempts are rate-limited.
9. A parent can see only the associated student's information.
10. The report displays current levels and recent class information.
11. Homework is clearly separated into pending/completed.
12. Homework completion remains controlled by the existing instructor workflow.
13. A parent can submit 👍 / 😐 / 👎 feedback.
14. A parent can optionally submit written feedback.
15. A parent can optionally request contact.
16. Staff/admin can see submitted feedback.
17. Feedback has a clear status such as New/Reviewed/Responded.
18. Admin can revoke parent access.
19. Admin can regenerate the parent URL.
20. Regenerating the URL invalidates the previous URL.
21. Parent sessions can expire/lock.
22. Parent access cannot provide access to staff-only routes.
23. The page works well on mobile.
24. No parent PIN is stored in plain text.
25. No parent-facing API permits cross-student data access.

---

## 37. Design Philosophy

The most important requirement is:

> **Make it extremely easy for a parent to view their child's progress while maintaining a strong security boundary around the child's data.**

The preferred experience is therefore:

**Private long URL + PIN + simple mobile-first report + one-tap feedback.**

This should feel like opening a private progress report, **not like logging into another software application**.
