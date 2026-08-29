# Class Management & Homework Tracking System
## Business User & Instructor Guide

Welcome to the **Class Management & Homework Tracking Application**. This system streamlines daily class recording, student level tracking, homework accountability, and attendance analytics for instructors and administrators.

---

## 1. User Roles & Capabilities

| Feature / Action | Instructor | Administrator |
| :--- | :---: | :---: |
| **Record New Class Updates** | ✅ Yes | ✅ Yes (can select any instructor) |
| **Review & Check Off Pending Homework** | ✅ Yes | ✅ Yes |
| **Browse & Filter Class History** | ✅ Yes | ✅ Yes |
| **Export Class History to CSV** | ✅ Yes | ✅ Yes |
| **View Analytics & Reports** | ✅ Yes *(Auto-locked to own classes)* | ✅ Yes *(All instructors or filtered)* |
| **Print Performance Reports** | ✅ Yes | ✅ Yes |
| **Change Own Password** | ✅ Yes | ✅ Yes |
| **Add / Edit Student Master Data & Default Levels** | ❌ No | ✅ Yes |
| **Add / Edit Instructors** | ❌ No | ✅ Yes |
| **Set / Reset Passwords for Instructors** | ❌ No | ✅ Yes |

---

## 2. Getting Started & Logging In

### 2.1 Standard Login
1. Open the application URL in any web browser on your phone, tablet, or laptop.
2. Enter your **registered email address** (e.g., `rajaram.class@gmail.com`) and your **password**.
3. Click **Sign In**. You will automatically be routed to the **New Class Update** screen.

### 2.2 Changing Your Password
Every logged-in user can change their password at any time:
1. In the top navigation header (or the mobile menu), click the **"Password"** (🔑) button.
2. Enter your **New Password** (minimum 6 characters) and re-type it to confirm.
3. Click **Update Password**. Your password updates immediately.

---

## 3. Daily Workflow: Recording a Class Update

The **New Class Update** screen allows you to log teaching sessions, record classwork, assign new homework, and review previous unchecked homework **in a single step**.

```
[ Step 1: Select Student & Subject ] 
             ↓
[ Step 2: Confirm Auto-Prefilled Levels (English or Math BTM/CTM) ]
             ↓
[ Step 3: Set Date, Duration (e.g. 1 hr), & Booklet Number ]
             ↓
[ Step 4: Enter Classwork (CW) & Assigned Homework (HW) ]
             ↓
[ Step 5: Check off Previous Pending Homework (if completed) ]
             ↓
[ Step 6: Click "Save Class Update" ]
```

### 3.1 Step-by-Step Instructions

1. **Select the Student:**
   * Type or search for the student name in the search box.
   * Selecting a student **automatically pre-fills their previous/default levels** for both English and Math!

2. **Select the Subject:**
   * Choose **English** or **Math**.

3. **Confirm Curriculum Levels:**
   * **For English:** Select the current level from the dropdown (Levels are ordered from highest to lowest: `Level 8` down to `Level Pre-A`). If the student is enrolled in Math only, select `🚫 None (Not Enrolled in English)`.
   * **For Math (Dual-Track BTM & CTM):**
     * **BTM (Basic Thinking Math):** Choose between `⭐ Summit` (Special product) or numeric levels `32` down to `1`. If the student is not enrolled in Math, choose `🚫 None (Not Enrolled in Math)`.
     * **CTM (Critical Thinking Math):** Numeric levels `32` down to `1`.
     * *Special Product Rule:* When BTM is set to `Summit`, CTM is automatically set to `'X'` (N/A) for you.
     * *Single-Subject Rule:* When BTM is set to `None`, CTM is automatically locked to `None`.

4. **Class Date & Duration:**
   * **Date:** Defaults to today. Can be backdated if entering previous classes.
   * **Duration:** Quick 1-click presets for `30 mins`, `45 mins`, `1 hr`, `1.5 hrs`, `2 hrs`, or choose `Custom` to enter exact minutes.

5. **Booklet Number:**
   * Enter the booklet or module identifier (e.g., `15-6`, `Booklet 12`).

6. **Classwork (CW) & Homework (HW):**
   * **Classwork (CW):** Enter topics covered or exercises completed during the session.
   * **Homework (HW):** Enter new assignments assigned for next time (e.g., `15-6 Pages 7, 11, 13, 14, 15`). Entering text here automatically creates a trackable homework assignment.

7. **Review & Check Off Previous Pending Homework:**
   * As soon as a student and subject are selected, any **previous unchecked homework** for that student automatically loads in the yellow review box.
   * Review each assignment. If the student completed it, click the checkbox to mark it as **"✓ Marked as Checked"**.
   * Use **"Select All"** to check off all previous items at once.
   * *Subject Toggle:* By default, only pending homework for the current subject is shown. Click **"All Subjects"** to review cross-subject homework if needed.

8. **Save Record:**
   * Click **Save Class Update**.
   * The class record is saved, the new homework is logged, and all selected previous homework items are marked as checked with today's date in one atomic operation.

---

## 4. Viewing Class Records & History

Click **"History"** in the navigation menu to browse historical records.

### 4.1 Search & Filters
* **Search Box:** Type any keyword to instantly search across student names, instructor names, classwork descriptions, homework details, booklet numbers, or levels.
* **Filter Dropdowns:** Filter by Student, Instructor, Subject, or Date Range.
* **Export to CSV:** Click **"Export CSV"** to download the currently filtered view into an Excel-compatible spreadsheet.

### 4.2 Mobile vs Desktop View
* **On Desktop / Laptops:** Displays a comprehensive multi-column data table.
* **On Mobile Phones:** Automatically switches to convenient **Mobile Cards** with badges. Tap **"View Classwork & Homework"** on any card to expand or collapse details without awkward horizontal scrolling.

---

## 5. Analytics & Performance Reports

Click **"Reports"** to view real-time instructional metrics.

### 5.1 Instructor vs Administrator Scope
* **For Instructors:** The system automatically locks reports to **your own classes**. The instructor dropdown is hidden, giving you an immediate summary of your students and hours taught.
* **For Administrators:** Can view all classes center-wide or filter by any specific instructor.

### 5.2 Metrics Summary
* **Total Classes:** Total teaching sessions conducted in the selected period.
* **Duration:** Cumulative hours and minutes taught.
* **Checked Homework:** Total assignments reviewed and marked completed.
* **Pending Homework:** Active homework items awaiting completion or instructor review.

### 5.3 Report Date Range Presets
* **Month-to-Date (MTD):** From the 1st of the current month up to today.
* **Full Month:** Select any calendar month to view its complete historical report.
* **Custom Date Range:** Select specific *From* and *To* dates.

### 5.4 Printing Reports
* Click **"Print Report"** to produce a clean, printer-friendly summary document without website headers or buttons.

---

## 6. Administrator Guide (Master Data & Security)

Administrators have access to the **"Admin Panel"** (`/admin`) to configure master records.

### 6.1 Managing Students & Default Levels
1. Navigate to **Admin Panel** > **Students & Levels**.
2. **Add New Student:**
   * Enter the student's full name.
   * Assign their initial **English Level** and **Math Levels (BTM & CTM)**.
   * For students taking only one subject, select `🚫 None (Not Enrolled)` for the other subject.
   * Add optional notes (e.g. learning targets or parent preferences).
   * Click **Add Student**.
3. **Edit Student Levels:**
   * Click the **Pencil icon** (✏️) next to any student to update their default levels.
   * Click **Save Levels**. Future class entries for this student will automatically pre-fill with these updated levels.
4. **Deactivate / Activate:**
   * Toggle student status when a student goes on leave or returns.

### 6.2 Managing Instructors & Resetting Passwords
1. Navigate to **Admin Panel** > **Instructors & Passwords**.
2. **Add New Instructor:** Enter name and email address.
3. **Set / Reset Password for Any Instructor:**
   * Click **"Set Password"** (🔑) next to the instructor's name.
   * Click **"Auto-Generate"** to create a strong password (e.g. `X8#bV9@mP2`), or type a custom password.
   * Click the **Copy icon** (📋) to copy the password and send it to the teacher.
   * Click **Set Password**. The instructor can immediately log in using this password.

### 6.3 Curriculum Reference
* The **Curriculum & Levels** tab displays the official curriculum sequence:
  * **English:** `8` → `7` → `6` → `5` → `I` → `H` → `G` → `F` → `E` → `D` → `C` → `B` → `A` → `Pre-A`
  * **Math BTM:** `⭐ Summit` + `32` down to `1`
  * **Math CTM:** `32` down to `1` + `X`

---

## 7. Mobile Phone Usage & Tips

The application is optimized for smartphones (iPhone, Android) so instructors can record classes quickly during sessions:

* **Bottom Navigation Bar:** Fast 1-thumb switching between **New Class (+)**, **History (📜)**, and **Reports (📊)**.
* **Large Touch Controls:** Dropdowns and checkboxes are sized for easy tapping on phone screens.
* **Offline Preview Sandbox:** If demonstrating features without logging in, append `?displaysandbox` to the web address (e.g., `https://your-site.pages.dev/login?displaysandbox`).

---

## 8. Quick Troubleshooting & FAQ

**Q: A student only takes English. What should I choose for Math?**  
A: Select **`None (Not Enrolled in Math)`** in the Math BTM dropdown. The CTM level will automatically lock to `None`.

**Q: A student is enrolled in the Summit math product. What should CTM be?**  
A: Select **`Summit`** in the BTM dropdown. The system automatically sets CTM to **`X`**.

**Q: I made a duplicate class entry by mistake. Will the system warn me?**  
A: Yes. If a record already exists for the same student, instructor, subject, and date, the application warns you before saving to prevent accidental duplicates.

**Q: How do I export records for accounting or parent progress reviews?**  
A: Go to **History**, apply any filters (student, month, or subject), and click **"Export CSV"**. The spreadsheet will download immediately.
