# Homework Requirements Specification

## 1. Purpose

Enhance the existing homework functionality so instructors can record homework status updates over time without cluttering the **New Class** screen.

The existing homework text box remains the primary way instructors enter homework. Statuses and notes are optional and accessible through a secondary action.

## 2. Design Principles

- Keep the **New Class** screen simple and uncluttered.
- Do not require instructors to enter a homework status for every class.
- Allow an instructor to add a status/note only when useful.
- Never overwrite an earlier homework status.
- Maintain a complete, dated history of homework status updates.
- Clearly distinguish the current/latest status from historical statuses.
- Keep status history associated with the original homework assignment.

## 3. New Class Screen

Keep the existing homework field essentially unchanged:

**Homework**  
`[ Homework text box ]`

Provide a small unobtrusive action next to or below it:

**+ Add HW status/note**

Normally, no large status section should occupy space on the screen.

After a status has been recorded, the interface may show:

- **Current: Partially completed**
- **+ Add another status/note**
- **View history (N)**

The exact visual treatment can be finalized during UI design.

## 4. Adding a Homework Status

When the instructor selects **+ Add HW status/note**, display a small inline panel, pop-up, or modal.

### Suggested statuses

- Not done
- Partially completed
- Completed
- Needs correction
- Not applicable
- Other

Include an optional free-text **Note**.

Example:

> Status: Not done  
> Note: Student did not complete the homework.

On saving, automatically record:

- Status
- Optional note
- Date/time of the update
- Instructor who entered the update

The instructor should not have to manually enter the date or instructor name.

## 5. Status History — Do Not Overwrite

Homework statuses must be stored as a history.

A new status entered on a later date must **not replace** an earlier status.

Example:

Homework assigned on **1 Aug**:

> Pages 7, 11, 13, 14, 15

1 Aug:

> **Not done** — Student did not complete the homework.

8 Aug:

> **Partially completed** — Pages 7 and 11 completed.

15 Aug:

> **Needs correction** — Pages 11 and 14 need correction.

20 Aug:

> **Completed** — Homework completed and checked.

All four entries remain available.

## 6. Current Status

The most recent status is the **current status**.

Example:

> **Current status: Completed — 20 Aug**

The previous statuses remain accessible through an expandable **View history** action.

History should preferably show the newest update first for quick review.

## 7. Adding a Status on a Later Class

When an instructor enters a subsequent class for the same student, the instructor should be able to see existing homework and its current status.

Example:

### Previous Homework

**1 Aug — Pages 7, 11, 13, 14, 15**

Current status: **Not done**

Actions:

- **+ Add status/update**
- **Mark as completed**

If a status is added on 8 Aug, create a new history entry. Do not modify the 1 Aug entry.

The homework can therefore progress naturally:

**Not done → Partially completed → Needs correction → Completed**

## 8. Existing Pending Homework Workflow

The existing workflow that displays previous unchecked/pending homework should continue.

For each pending homework item, the instructor should be able to:

1. See the original homework.
2. See its current/latest status.
3. View previous status updates.
4. Add a new status/update.
5. Mark the homework as resolved/completed where appropriate.

Adding a status must not remove previous history.

## 9. Homework Status vs. HW Checked

The existing **HW Checked** concept should remain separate from homework status.

### Homework Status

Describes what happened with the homework:

- Not done
- Partially completed
- Completed
- Needs correction
- etc.

### HW Checked

Indicates whether an instructor has reviewed the homework.

For example:

> Status: Partially completed  
> HW Checked: Yes

means the instructor reviewed the homework and determined that only part was completed.

**Checked must not automatically mean Completed.**

## 10. Parent Display

Homework information is already displayed to parents.

Parents should be able to see the latest/current homework status and, where appropriate, the status history.

Suggested display:

### Homework

**Pages 7, 11, 13, 14, 15**

**Current status:** Partially completed

**Status history**

- 8 Aug — Not done
- 15 Aug — Partially completed
- 22 Aug — Completed

Use **Show details** or an expandable history control if necessary to keep the parent report compact.

## 11. Parent Visibility of Notes

Not every instructor note necessarily needs to be visible to parents.

The design should eventually support:

- **Parent-visible note**
- **Internal instructor/admin note**

For Version 1, the simplest approach is for status and note to be parent-visible, with instructors understanding that the note may appear in the parent report.

If internal notes are required later, introduce them as a separate field rather than changing the meaning of existing notes.

## 12. Audit / History Requirements

Each homework status update should preserve:

- Original homework record
- Status
- Note, if entered
- Status update date/time
- Instructor who entered it

Historical entries should not be silently deleted or overwritten during normal use.

If editing/deleting historical entries is eventually permitted, an appropriate audit trail should be preserved.

## 13. Recommended Version 1 Scope

Version 1 should include:

1. Existing HW text box.
2. **+ Add HW status/note** action.
3. Status selection.
4. Optional note.
5. Automatic date/time.
6. Automatic instructor identification.
7. Persistent status history.
8. Latest/current status display.
9. **View history** action.
10. Integration with the existing pending/unchecked homework workflow.
11. Parent display of current status and status history.

Do **not** add a large permanent status form to the New Class screen.

## 14. Future Enhancements — Not Required for Version 1

Potential future enhancements:

- Per-page/per-task homework checking.
- Individual checkboxes for homework items.
- Separate parent-visible and internal instructor notes.
- Homework completion statistics.
- Automatic reminders for long-pending homework.
- Filtering students by homework status.
- Homework status reporting across a date range.

These are outside Version 1 unless separately approved.

## 15. Core Requirement

**Homework status is a timeline, not a single field.**

The original homework remains intact, and every subsequent status update is added as a new dated entry.

This is the core design requirement for the homework feature.
