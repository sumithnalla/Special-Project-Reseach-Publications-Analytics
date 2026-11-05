# Research Publication Analytics System
## In-Depth Functional & Product Specification for Codex

> **Purpose of this document:** This file explains the project from the user's and product's point of view. It focuses on **what the system must do, how users move through it, what every page means, what information is entered, what the system calculates, and what the expected behavior is**.
>
> This document is intentionally complementary to the separate technical/architecture master prompt. Use **both files together** when asking Codex to build the project.

---

# 1. Project Identity

## Project Name

**Research Publication Analytics System**

## Project Type

A full-stack web application for a college/university that allows:

1. Faculty members to maintain their research publication records.
2. Faculty members to submit publication information for verification.
3. An administrator to review and manage those publication records.
4. The system to calculate research-publication statistics automatically.
5. Faculty and administrators to view useful dashboards and charts.
6. The administrator to generate institutional reports.

The project should feel like a real internal university research-management application rather than a simple CRUD demo.

---

# 2. The Core Idea in One Sentence

**Faculty enter their research publications, the admin verifies and manages those records, and the system automatically turns the stored publication data into dashboards, analytics, and reports.**

---

# 3. Real-World Problem

In a college or university, research information can become difficult to manage when publication details are spread across:

- spreadsheets,
- personal records,
- department files,
- emails,
- documents,
- different faculty members' own records.

This creates problems such as:

- difficulty knowing how many publications the institution has,
- difficulty finding publications by a particular faculty member,
- difficulty comparing publication activity across departments,
- difficulty determining publication trends by year,
- difficulty identifying indexed publications,
- difficulty calculating citation-related statistics,
- difficulty preparing accreditation/research reports,
- duplicate or incomplete records,
- lack of a verification workflow.

The Research Publication Analytics System solves this by keeping publication information in one structured application.

---

# 4. What the Application Actually Does

The application has two major user roles:

## Faculty

Faculty members use the system to:

- log in,
- view their profile,
- add publications,
- edit their own publications,
- delete their own publications,
- see the verification status of publications,
- view their own publication statistics,
- search/filter their own publication records.

## Admin

The administrator uses the system to:

- log in,
- view institution-wide statistics,
- manage faculty accounts,
- view all publications,
- review submitted publications,
- approve or reject publications,
- edit or delete publication records,
- search and filter records,
- view department-level analytics,
- view faculty-level analytics,
- generate reports,
- inspect audit activity.

---

# 5. What the Application Is NOT

The MVP should NOT become unnecessarily complicated.

It is not:

- a social network for researchers,
- a complete university ERP,
- a replacement for Scopus,
- a replacement for Web of Science,
- a Google Scholar clone,
- a plagiarism detector,
- an automatic research-paper crawler,
- a paper-writing AI,
- a journal submission platform,
- a payment system,
- a public research marketplace.

The application is primarily a **research publication record management + verification + analytics + reporting system**.

---

# 6. Important Product Principle

The system should treat a publication record as the basic unit of research information.

A publication belongs to a faculty member.

A publication contains information such as:

- title,
- authors,
- type,
- journal/conference,
- year,
- DOI,
- publisher,
- indexing,
- quartile,
- impact factor,
- citations,
- URL,
- verification status.

The system then uses these records to calculate analytics.

---

# 7. User Roles

There are exactly two primary roles.

---

## 7.1 Faculty

Faculty are the people who enter and maintain their own publication information.

A faculty member should only be able to manage their own records.

They should NOT be able to:

- view another faculty member's private account information,
- approve their own publication,
- approve someone else's publication,
- access admin-only pages,
- change their role to admin.

---

## 7.2 Admin

The admin is the system administrator/research coordinator.

The admin can see institution-wide information and manage research records.

Admin can:

- view all faculty,
- create faculty accounts,
- edit faculty information,
- deactivate faculty accounts,
- view all publications,
- approve/reject publications,
- edit publications,
- delete publications,
- view analytics,
- generate reports,
- view audit activity.

---

# 8. Authentication Behavior

The application has a login page.

The login page should be simple.

It should contain:

- Email
- Password
- Login button

There should NOT be public registration in the MVP.

The system identifies the user's role after successful authentication.

---

# 9. Demo Login Requirements

The system must contain a seeded administrator account.

Admin email:

`sumithnalla0607@gmail.com`

Admin password:

`admin@123`

The database must store the password securely as a hash.

Do not store the plaintext password as the user's database password.

---

# 10. Faculty Login Behavior

For demonstration purposes, faculty accounts can use:

- any valid-looking email address,
- a six-digit dummy password.

Example:

`faculty01@college.edu`

Password:

`123456`

The seed data should contain many faculty accounts so that the application can be demonstrated realistically.

---

# 11. What Happens After Login

The login flow is:

```text
User opens application
        |
        v
Login Page
        |
        v
Enter Email + Password
        |
        v
Backend verifies credentials
        |
        v
System identifies role
       / \
      /   \
 Faculty  Admin
   |        |
   v        v
Faculty   Admin
Dashboard Dashboard
```

The user should not manually choose "Faculty" or "Admin" on the login page.

The backend/database should determine the role.

---

# 12. Faculty Journey

A normal faculty member's complete journey should look like this:

```text
Login
  ↓
Faculty Dashboard
  ↓
View Profile
  ↓
View My Publications
  ↓
Add Publication
  ↓
Submit Publication
  ↓
Publication becomes Pending
  ↓
Admin reviews it
  ↓
Approved OR Rejected
  ↓
Faculty sees updated status
  ↓
Approved publication contributes to official analytics
```

This workflow is one of the most important parts of the application.

---

# 13. Faculty Dashboard

After successful faculty login, the faculty member should land on a dashboard.

The dashboard should answer:

> "What is my current research-publication status?"

---

## 13.1 Dashboard Summary Cards

The dashboard can display cards such as:

### Total Publications

Number of publications belonging to the logged-in faculty member.

### Approved Publications

Number of publications that have been approved.

### Pending Publications

Number of publications waiting for admin verification.

### Rejected Publications

Number of publications rejected by the admin.

### Journal Publications

Number of approved journal publications.

### Conference Publications

Number of approved conference publications.

### Scopus Indexed

Number of approved publications marked as Scopus indexed.

### Total Citations

Sum of citation counts for the faculty member's approved publications.

---

# 14. Faculty Dashboard Charts

The dashboard should include visual analytics.

Examples:

## Publications by Year

A line or bar chart showing how many approved publications the faculty member has for each year.

Example:

```text
2020  ███
2021  █████
2022  ████
2023  ███████
2024  █████
2025  ████████
2026  ███
```

The exact numbers come from the database.

---

## Publications by Type

Example categories:

- Journal
- Conference
- Book Chapter

This can be represented using a pie/donut/bar chart.

---

## Indexing Distribution

Example:

- Scopus
- Web of Science
- UGC
- Other
- Not Indexed

---

# 15. Recent Publications Section

The faculty dashboard should also show a small recent-publications list.

Each row can contain:

- Publication title
- Type
- Year
- Indexing
- Status

The user should be able to click a publication to view its details.

---

# 16. Faculty Profile Page

The profile page represents the logged-in faculty member.

It can contain:

- Full name
- Faculty ID
- Email
- Department
- Designation
- Joining year
- Research areas
- Contact information if required

The profile should clearly identify the logged-in faculty member.

---

# 17. Why Profile and Login Are Connected

The login account identifies the user.

The faculty profile stores additional information about that person.

Conceptually:

```text
Login Account
     |
     | identifies user
     v
Faculty Profile
     |
     | owns
     v
Publications
```

The faculty member should not have to repeatedly type their identity when adding a publication.

The system already knows who is logged in.

Therefore, when a faculty member creates a publication, the application automatically associates that publication with their faculty account.

---

# 18. My Publications Page

This page displays publications belonging to the currently logged-in faculty member.

It should provide:

- publication list,
- search,
- filters,
- pagination,
- status information,
- edit button,
- delete button,
- view details button,
- add publication button.

---

# 19. Publication Status

Every publication submission should have a status.

Recommended statuses:

- `Pending`
- `Approved`
- `Rejected`

Optional:

- `Draft`

For the MVP, the essential lifecycle is:

```text
Pending → Approved
Pending → Rejected
```

If draft functionality is implemented, it becomes:

```text
Draft
  ↓
Submitted
  ↓
Pending
  ↓
Approved / Rejected
```

---

# 20. Why Approval Exists

The approval system gives the application a realistic institutional workflow.

Without approval:

```text
Faculty enters fake/incorrect data
        ↓
Immediately appears in institutional statistics
```

With approval:

```text
Faculty enters publication
        ↓
Pending
        ↓
Admin verifies
        ↓
Approved
        ↓
Included in official analytics
```

This makes the analytics more meaningful because the official statistics are based on verified records.

---

# 21. Add Publication Page

The Add Publication page is one of the most important faculty forms.

The faculty member should be able to enter information such as:

### Basic Information

- Publication title
- Authors
- Publication type
- Publication year

### Venue Information

- Journal name
- Conference name
- Publisher

### Research Metadata

- DOI
- Indexing
- Quartile
- Impact factor
- Citation count

### Online Information

- Publication URL

Optional advanced information:

- Abstract
- Keywords
- PDF/document reference

---

# 22. Publication Types

At minimum:

- Journal
- Conference
- Book Chapter

The system should make the type selectable.

---

# 23. Indexing Categories

Recommended options:

- Scopus
- Web of Science
- UGC
- Other
- Not Indexed

The system should allow analytics to group publications according to these categories.

---

# 24. Journal Quartile

For applicable journal publications:

- Q1
- Q2
- Q3
- Q4
- N/A

For publications where quartile does not apply, use `N/A`.

---

# 25. Citation Count

The faculty member can provide the current citation count.

The system should store this as a number.

Examples:

```text
0
5
12
47
120
```

It should not be stored as text such as:

```text
"12 citations"
```

The numeric value is important because the application needs to calculate totals and averages.

---

# 26. Impact Factor

Impact factor should be numeric.

Example:

```text
0
1.2
2.8
5.4
9.1
```

If the publication does not have an applicable impact factor, the value can be empty or zero depending on the application's validation design.

---

# 27. Publication Validation

The form should validate important information.

Examples:

- Title cannot be empty.
- Publication type must be selected.
- Publication year must be reasonable.
- Citation count cannot be negative.
- Impact factor cannot be negative.
- Email values must have valid structure.
- Required fields must be clearly identified.

The system should show understandable error messages.

Example:

```text
Publication title is required.
```

rather than:

```text
422 Unprocessable Entity
```

for the normal user-facing experience.

---

# 28. After Faculty Submits a Publication

When the faculty member clicks:

**Submit Publication**

the system should:

1. Validate the data.
2. Save the publication.
3. Associate it with the logged-in faculty member.
4. Set its status to `Pending`.
5. Record the submission time.
6. Optionally record an audit event.
7. Show a success message.
8. Return the faculty member to their publication list or detail page.

Example success message:

```text
Publication submitted successfully and is waiting for admin approval.
```

---

# 29. Editing a Publication

Faculty should be able to edit their own publication records.

However, the workflow should remain logically consistent.

Recommended behavior:

### Editing Pending Publication

Faculty can edit it.

### Editing Approved Publication

The product can either:

1. allow editing and return it to `Pending`, or
2. allow minor editing without changing status.

For a realistic verification workflow, the preferred behavior is:

```text
Approved
   ↓
Faculty edits important publication information
   ↓
Pending again
   ↓
Admin reviews changes
```

This prevents unverified changes from immediately becoming official.

---

# 30. Deleting a Publication

Faculty can delete publications that they own.

The UI should ask for confirmation.

Example:

```text
Are you sure you want to delete this publication?
This action cannot be undone.
```

The application should not silently delete records when the user clicks the button.

---

# 31. Rejected Publication

If an admin rejects a publication, the faculty member should be able to see:

- status = Rejected
- rejection reason, if implemented
- publication details
- option to edit/resubmit

Recommended workflow:

```text
Pending
   ↓
Rejected
   ↓
Faculty sees reason
   ↓
Faculty edits
   ↓
Resubmits
   ↓
Pending
```

This makes the application much more realistic.

---

# 32. Admin Journey

The admin's journey is different.

The admin wants to answer:

> "What is happening with research publications across the institution, and which records need my attention?"

The admin journey should be:

```text
Admin Login
    ↓
Admin Dashboard
    ↓
Check Pending Approvals
    ↓
Review Publications
    ↓
Approve / Reject
    ↓
Manage Faculty
    ↓
View Institution Analytics
    ↓
Generate Reports
    ↓
Review Audit Activity
```

---

# 33. Admin Dashboard

The admin dashboard is the central institutional overview.

It should show high-level metrics.

---

## 33.1 Faculty Statistics

Examples:

- Total Faculty
- Active Faculty
- Departments
- Faculty with Publications

---

## 33.2 Publication Statistics

Examples:

- Total Publications
- Approved Publications
- Pending Publications
- Rejected Publications
- Journal Publications
- Conference Publications
- Book Chapters

---

## 33.3 Research Impact Statistics

Examples:

- Total Citations
- Average Citations per Approved Publication
- Scopus Indexed Publications
- Web of Science Publications
- Q1 Publications
- Q2 Publications

---

# 34. Admin Dashboard Charts

The admin dashboard should visually explain institutional research activity.

---

## Publications by Year

Shows publication volume over time.

Example:

```text
Year       Publications

2020       █████
2021       ███████
2022       █████████
2023       ███████████
2024       █████████████
2025       ███████████████
2026       █████████
```

---

## Publications by Department

Shows which departments have publication records.

Example departments:

- Computer Science
- Electronics
- Electrical
- Mechanical
- Civil
- Mathematics
- Physics
- Chemistry
- Biotechnology
- Management

The actual departments can be changed to match the college.

---

## Publications by Type

- Journal
- Conference
- Book Chapter

---

## Publications by Indexing

- Scopus
- Web of Science
- UGC
- Other
- Not Indexed

---

## Publications by Quartile

- Q1
- Q2
- Q3
- Q4
- N/A

---

# 35. Pending Approvals Page

This is a dedicated admin page.

It should answer:

> "Which publication records are waiting for verification?"

The page should display pending submissions.

Each row can include:

- Faculty name
- Department
- Publication title
- Type
- Year
- Indexing
- Submitted date
- Status
- Review button

---

# 36. Publication Review Page

When the admin opens a pending publication, the admin should see the complete publication information.

Example:

```text
Publication Title
Authors
Faculty
Department
Type
Journal/Conference
Year
DOI
Publisher
Indexing
Quartile
Impact Factor
Citation Count
Publication URL
Submission Date
```

The admin then has options:

- Approve
- Reject
- Edit
- Delete
- Return to list

If rejecting, the system should ideally allow a reason.

Example:

```text
Reason:
DOI or journal information needs verification.
```

---

# 37. Approval Behavior

When admin clicks:

**Approve**

the system should:

1. Confirm the action.
2. Change status to `Approved`.
3. Record approval timestamp.
4. Record which admin performed the action.
5. Add an audit log.
6. Make the publication eligible for official analytics.
7. Update dashboards automatically.

---

# 38. Rejection Behavior

When admin clicks:

**Reject**

the system should:

1. Ask for confirmation.
2. Optionally/ideally collect rejection reason.
3. Change status to `Rejected`.
4. Record rejection time.
5. Record the admin who rejected it.
6. Add an audit log.
7. Ensure it is excluded from official approved-publication analytics.

---

# 39. Admin Faculty Management

The admin should have a Faculty page.

This page displays faculty accounts.

Possible columns:

- Name
- Faculty ID
- Email
- Department
- Designation
- Joining Year
- Publication Count
- Account Status
- Actions

Actions:

- View
- Edit
- Activate/Deactivate
- View Publications

---

# 40. Creating a Faculty Account

The admin should be able to create faculty accounts.

Fields can include:

- Full Name
- Faculty ID
- Email
- Department
- Designation
- Joining Year
- Research Areas
- Initial Password

The backend should hash the password before storing it.

The admin must never see stored plaintext passwords.

---

# 41. Deactivating Faculty

Admin can deactivate a faculty account.

A deactivated user should not be able to log in.

Their historical publication records should remain in the database unless the admin explicitly deletes them.

This preserves institutional history.

---

# 42. Admin Publications Page

The admin needs a complete publication-management page.

It should display publications across all faculty members.

Useful columns:

- Title
- Faculty
- Department
- Type
- Year
- Indexing
- Quartile
- Citations
- Status

Actions:

- View
- Edit
- Approve
- Reject
- Delete

Actions should depend on the current status.

For example, an already-approved publication does not need an "Approve" button.

---

# 43. Search

Both faculty and admin should have search functionality.

Search should support useful fields.

Faculty search:

- title
- journal/conference
- year
- DOI
- type

Admin search:

- title
- faculty name
- department
- journal/conference
- DOI
- type
- status
- year

---

# 44. Filters

The system should support filters such as:

### Year

Example:

```text
2024
2025
2026
```

### Publication Type

```text
Journal
Conference
Book Chapter
```

### Status

```text
Pending
Approved
Rejected
```

### Indexing

```text
Scopus
Web of Science
UGC
Other
Not Indexed
```

### Quartile

```text
Q1
Q2
Q3
Q4
N/A
```

### Department

Admin only or admin-oriented analytics/filtering.

---

# 45. Pagination

If the application contains thousands of publications, the UI should not display all records on one page.

Use pagination.

Example:

```text
Showing 1–20 of 2,500 publications

< Previous   1  2  3  4  5   Next >
```

---

# 46. Faculty Analytics Page

Faculty analytics should answer:

> "How productive and impactful is my publication record?"

Possible metrics:

- Total approved publications
- Publications by year
- Publications by type
- Publications by indexing
- Publications by quartile
- Total citations
- Average citations
- Highest-cited publication

All values should come from actual stored records.

Do not hard-code analytics.

---

# 47. Admin Analytics Page

Admin analytics should answer:

> "What does the institution's research publication activity look like?"

Possible analytics:

### Overall

- Total approved publications
- Total citations
- Average citations
- Number of publishing faculty
- Number of departments represented

### Time

- Publications per year
- Citations per year

### Department

- Publications by department
- Citations by department
- Faculty count by department

### Publication Type

- Journal
- Conference
- Book Chapter

### Indexing

- Scopus
- Web of Science
- UGC
- Other
- Not Indexed

### Quartile

- Q1
- Q2
- Q3
- Q4

---

# 48. Critical Analytics Rule

The official analytics should normally use **approved publications**.

This means:

```text
Pending publication
      ↓
Not included in official approved statistics

Rejected publication
      ↓
Not included in official approved statistics

Approved publication
      ↓
Included in official statistics
```

This is a core business rule.

The UI can separately show pending/rejected counts so that administrators know they exist.

---

# 49. Where Analytics Come From

Analytics are not manually typed into the system.

They are calculated from publication records.

For example:

If the database contains:

```text
Publication A → 10 citations
Publication B → 20 citations
Publication C → 5 citations
```

Then:

```text
Total citations = 35
```

If there are:

```text
2024 → 8 approved publications
2025 → 12 approved publications
2026 → 15 approved publications
```

the yearly chart should automatically show:

```text
2024 → 8
2025 → 12
2026 → 15
```

The application must derive these values from the data.

---

# 50. Department Analytics Concept

Suppose the database has:

```text
Computer Science → 120 publications
Mechanical       → 80 publications
ECE              → 95 publications
Civil            → 45 publications
```

The department chart should automatically calculate and display those totals.

If a new publication is approved, the relevant department's statistics should update.

---

# 51. Citation Analytics

The system can calculate:

## Total Citations

```text
sum of citation_count
```

for approved publications.

## Average Citations

```text
total citations / approved publication count
```

Handle the zero-publication case safely.

If there are no approved publications, do not divide by zero.

Display something understandable such as:

```text
0
```

or:

```text
N/A
```

depending on UI design.

---

# 52. Reports

The application should allow the admin to generate reports.

The purpose is to turn database information into useful institutional output.

---

# 53. PDF Reports

The admin can generate a PDF report.

Possible contents:

- Institution name
- Report generation date
- Total faculty
- Total approved publications
- Publications by year
- Publications by department
- Publications by type
- Indexing distribution
- Citation summary

The PDF should look like an actual report rather than raw database output.

---

# 54. Excel Reports

The admin should also be able to export data to Excel.

Useful sheets can include:

### Sheet 1 — Publications

Columns:

- Faculty
- Department
- Title
- Authors
- Type
- Year
- Journal/Conference
- Publisher
- DOI
- Indexing
- Quartile
- Impact Factor
- Citations
- Status

### Sheet 2 — Faculty Summary

Possible columns:

- Faculty
- Department
- Total Approved Publications
- Journal Publications
- Conference Publications
- Scopus Publications
- Total Citations

### Sheet 3 — Department Summary

Possible columns:

- Department
- Faculty Count
- Publication Count
- Citation Count

---

# 55. Report Filtering

Reports should ideally respect filters selected by the admin.

For example, admin selects:

```text
Year: 2025
Department: Computer Science
Status: Approved
```

Then the exported report should represent that filtered data.

If filter-aware reporting is too much for the first implementation, the MVP can generate institution-wide approved reports first.

---

# 56. Audit Logs

Important administrative actions should be recorded.

Examples:

```text
Admin logged in
Faculty created
Faculty deactivated
Publication submitted
Publication approved
Publication rejected
Publication edited
Publication deleted
```

An audit record can conceptually contain:

- action
- actor
- target
- timestamp
- additional information

The purpose is traceability.

---

# 57. Why Audit Logs Matter

If an admin changes a publication, the system should have a record that something happened.

For example:

```text
Who:
Admin

What:
Approved publication

Which:
Publication ID XYZ

When:
2026-09-26 10:30
```

This is especially useful for an academic/institutional application.

---

# 58. Faculty Permissions Matrix

| Action | Faculty |
|---|---|
| Login | Yes |
| View own profile | Yes |
| Edit own profile | Yes/depending on implementation |
| View own publications | Yes |
| Add publication | Yes |
| Edit own publication | Yes |
| Delete own publication | Yes |
| View own analytics | Yes |
| View all faculty | No |
| View another faculty's private records | No |
| Approve publication | No |
| Reject publication | No |
| Manage faculty accounts | No |
| Generate institution reports | No |
| View audit logs | No |

---

# 59. Admin Permissions Matrix

| Action | Admin |
|---|---|
| Login | Yes |
| View own profile | Yes |
| View all faculty | Yes |
| Create faculty | Yes |
| Edit faculty | Yes |
| Deactivate faculty | Yes |
| View all publications | Yes |
| Edit any publication | Yes |
| Delete any publication | Yes |
| Approve publication | Yes |
| Reject publication | Yes |
| View institution analytics | Yes |
| View department analytics | Yes |
| Generate PDF | Yes |
| Generate Excel | Yes |
| View audit logs | Yes |

---

# 60. Complete Faculty Use Case

## Use Case: Add a Publication

### Actor

Faculty member.

### Preconditions

- Faculty is logged in.
- Faculty account is active.

### Steps

1. Faculty opens My Publications.
2. Faculty clicks Add Publication.
3. Faculty fills in publication information.
4. Faculty submits the form.
5. System validates input.
6. System creates the publication record.
7. System associates it with the logged-in faculty account.
8. System sets status to Pending.
9. System displays success message.
10. Publication appears in My Publications with Pending status.

### Result

The publication waits for admin review.

---

# 61. Complete Admin Use Case

## Use Case: Approve a Publication

### Actor

Admin.

### Preconditions

- Admin is logged in.
- Publication exists.
- Publication is pending.

### Steps

1. Admin opens Pending Approvals.
2. Admin sees the submitted publication.
3. Admin opens the publication.
4. Admin reviews the information.
5. Admin clicks Approve.
6. System confirms the action.
7. Status changes to Approved.
8. Approval information is stored.
9. Audit log is created.
10. Publication becomes eligible for official analytics.

### Result

The publication becomes part of approved research statistics.

---

# 62. Complete Rejection Use Case

## Use Case: Reject Publication

### Steps

1. Admin opens Pending Approvals.
2. Admin selects a publication.
3. Admin reviews details.
4. Admin clicks Reject.
5. System asks for a reason if rejection reason is enabled.
6. Admin confirms.
7. Status becomes Rejected.
8. Rejection is recorded.
9. Audit log is created.
10. Faculty sees the rejected status.

### Result

The publication is not counted in official approved analytics.

---

# 63. Example End-to-End Scenario

Consider a faculty member named:

**Dr. Ananya Rao**

She belongs to:

**Computer Science**

She logs in.

The dashboard initially shows:

```text
Total Publications: 8
Approved: 6
Pending: 1
Rejected: 1
Total Citations: 94
```

She adds a new journal paper.

She enters:

```text
Title:
Deep Learning for Smart Campus Analytics

Type:
Journal

Year:
2026

Indexing:
Scopus

Quartile:
Q1

Impact Factor:
5.2

Citations:
0
```

She submits it.

The system changes the record to:

```text
Pending
```

The admin logs in.

The admin sees:

```text
Pending Approvals: 1
```

The admin opens the record and verifies it.

The admin approves it.

Now:

```text
Status:
Approved
```

The faculty dashboard updates:

```text
Approved Publications: 7
```

The institution dashboard also updates:

```text
2026 Publications: +1
Computer Science Publications: +1
Scopus Publications: +1
Q1 Publications: +1
```

This is the core value of the application.

---

# 64. Example Rejection Scenario

A faculty member submits:

```text
Title:
Some Research Paper
```

but enters incomplete journal information.

Admin reviews it and rejects it.

The system displays:

```text
Status: Rejected

Reason:
Please verify the journal and DOI information before resubmitting.
```

The faculty member edits the record.

After resubmission:

```text
Status: Pending
```

The admin can review it again.

---

# 65. Large Demonstration Dataset

The application should contain a large synthetic dataset for demonstration.

The goal is to make dashboards and charts look realistic.

A recommended dataset size is approximately:

- 75 faculty
- 10 departments
- 2,500 publications

A minimum fallback can be:

- 50 faculty
- 8 departments
- 1,000 publications

The data should span multiple years, such as:

```text
2020
2021
2022
2023
2024
2025
2026
```

---

# 66. Synthetic Data Must Look Realistic

The data should not be repetitive.

For example, do not create:

```text
Paper 1
Paper 2
Paper 3
Paper 4
```

Instead use realistic synthetic research titles.

Examples:

- Machine Learning Based Energy Optimization in Smart Buildings
- IoT Enabled Monitoring for Industrial Automation
- Deep Learning Approaches for Medical Image Classification
- Secure Cloud Architecture for Academic Information Systems
- Blockchain Based Framework for Academic Credential Verification

All data must be clearly synthetic/demo data and must not pretend to represent real faculty research.

---

# 67. Distribution of Synthetic Data

The seed data should contain variation.

Examples:

### Publication Types

- Journal
- Conference
- Book Chapter

### Indexing

- Scopus
- Web of Science
- UGC
- Other
- Not Indexed

### Quartiles

- Q1
- Q2
- Q3
- Q4
- N/A

### Status

- Approved
- Pending
- Rejected

There should be enough approved data to make analytics meaningful.

---

# 68. Do Not Make All Data Approved

The dataset should intentionally contain multiple statuses.

For example:

```text
Approved: majority
Pending: some
Rejected: some
```

This allows the admin approval dashboard to be demonstrated.

---

# 69. Do Not Make All Faculty Identical

Faculty should vary in:

- department,
- designation,
- joining year,
- number of publications,
- research areas,
- publication types,
- citation counts,
- indexing,
- publication years.

Some faculty can have many publications.

Some can have few.

Some can have zero or very few recent publications.

This makes the analytics visually useful.

---

# 70. Product Navigation

## Faculty Navigation

Recommended sidebar:

```text
Dashboard
My Profile
My Publications
Analytics
Logout
```

## Admin Navigation

Recommended sidebar:

```text
Dashboard
Faculty
Publications
Pending Approvals
Analytics
Reports
Audit Logs
Logout
```

---

# 71. Dashboard Design Philosophy

The application should be simple and easy-going.

It should look professional but not overloaded.

The UI should prioritize:

- readable cards,
- clean tables,
- understandable charts,
- clear buttons,
- consistent spacing,
- useful empty states,
- useful error messages.

Avoid creating a visually overwhelming enterprise dashboard.

---

# 72. Empty States

Every list should have a meaningful empty state.

Example:

If a faculty member has no publications:

```text
No publications found.

Start building your research profile by adding your first publication.
```

With an:

**Add Publication**

button.

---

# 73. Loading States

Pages that fetch data should show loading indicators.

Examples:

```text
Loading publications...
```

```text
Loading analytics...
```

Do not show a blank page while waiting for data.

---

# 74. Error States

If the backend is unavailable, the frontend should display something understandable.

Example:

```text
We couldn't load your publications.
Please try again.
```

Do not expose raw stack traces to users.

---

# 75. Confirmation Behavior

Destructive operations should use confirmation.

Examples:

- Delete publication
- Delete faculty
- Deactivate faculty

The confirmation should clearly explain the action.

---

# 76. Success Messages

Important actions should give immediate feedback.

Examples:

```text
Publication added successfully.
```

```text
Publication submitted for approval.
```

```text
Publication approved successfully.
```

```text
Faculty account created successfully.
```

---

# 77. Role-Based Page Protection

A faculty member should not simply type an admin URL and see the admin page.

The application should protect admin routes.

Conceptually:

```text
Faculty
   ↓
tries /admin/dashboard
   ↓
Access denied / redirected
```

Similarly, an unauthenticated user should not access private pages.

---

# 78. Data Ownership

A very important rule:

**Faculty can only manage publications belonging to themselves.**

The backend must enforce this.

Do not rely only on hiding buttons in the frontend.

For example, if Faculty A manually sends a request attempting to edit Faculty B's publication, the backend must reject it.

---

# 79. Admin Ownership

Admin is allowed to manage institutional records.

Therefore:

```text
Faculty → own records
Admin   → institutional records
```

This distinction should exist throughout the application.

---

# 80. Database Concept in Plain Language

The application needs a place to store:

### Users

Who can log in.

### Faculty Profiles

Information about faculty members.

### Departments

Department information.

### Publications

Research records.

### Audit Logs

Important system actions.

The technical master prompt explains the database implementation.

This functional document only defines what those records mean.

---

# 81. What the System Calculates Automatically

The system should calculate:

- total publications,
- approved publications,
- pending publications,
- rejected publications,
- publications by year,
- publications by department,
- publications by type,
- publications by indexing,
- publications by quartile,
- total citations,
- average citations,
- faculty publication counts,
- department publication counts,
- other useful aggregations.

Users should not manually enter these summary values.

---

# 82. What Users Enter

Faculty primarily enter:

- publication information,
- research profile information.

Admin primarily enters/manages:

- faculty account information,
- verification decisions,
- optional rejection reasons,
- administrative corrections.

---

# 83. What the System Owns

The system automatically owns/manages:

- publication status,
- timestamps,
- ownership association,
- calculated statistics,
- audit events,
- authentication state,
- report generation.

---

# 84. Search + Analytics Relationship

Search and analytics are different.

### Search

Answers:

> "Find this particular record."

### Analytics

Answers:

> "What does the overall data look like?"

Both should exist.

---

# 85. Example Search Questions

A faculty member might want:

> "Show my 2025 journal publications."

An admin might want:

> "Show all pending Scopus publications."

Another admin query:

> "Show Computer Science publications from 2024."

The interface should make these types of questions easy to perform using search and filters.

---

# 86. Example Analytics Questions

The admin dashboard should help answer:

> How many approved publications exist?

> How many publications were produced each year?

> Which departments have publication records?

> How many publications are Scopus indexed?

> How many Q1 publications exist?

> What is the total citation count?

> Which faculty members have publication records?

These questions should be answered by the dashboard.

---

# 87. Important Distinction: Raw Data vs Calculated Data

Publication record:

```text
Citation Count = 25
```

is raw stored data.

Analytics:

```text
Total Citations = 4,850
```

is calculated from many publication records.

The application should clearly maintain this distinction.

---

# 88. Product-Level Data Flow

The conceptual data flow is:

```text
Faculty
   |
   | enters publication
   v
Publication Record
   |
   | pending
   v
Admin Review
   |
   +------> Rejected
   |
   +------> Approved
                |
                v
         Official Analytics
                |
        +-------+-------+
        |       |       |
        v       v       v
     Charts   Tables   Reports
```

---

# 89. Why This Is a Good B.Tech Project

The project demonstrates multiple important full-stack concepts:

- authentication,
- authorization,
- CRUD operations,
- database design,
- REST APIs,
- frontend/backend integration,
- form validation,
- search,
- filtering,
- pagination,
- data analytics,
- data visualization,
- report generation,
- role-based access control,
- audit logging,
- synthetic data generation.

It also has a clear real-world problem and a measurable workflow.

---

# 90. MVP Definition

The minimum complete application must support:

### Authentication

- Faculty login
- Admin login
- Role-based routing

### Faculty

- Dashboard
- Profile
- Add publication
- View publications
- Edit own publication
- Delete own publication
- View status
- View analytics

### Admin

- Dashboard
- Faculty management
- Publication management
- Pending approvals
- Approve
- Reject
- Analytics
- PDF report
- Excel export
- Audit logs

### Database

- Users
- Faculty
- Departments
- Publications
- Audit logs

### Dataset

Large synthetic data for demonstration.

---

# 91. Optional Features

These can be added only if the core system is already working.

Possible enhancements:

- DOI metadata lookup
- Abstract field
- publication PDF upload
- email notifications
- profile photo
- advanced report filtering
- publication duplicate detection
- chart export
- dark mode
- configurable institution name
- advanced dashboard widgets

Do not let optional features delay the core application.

---

# 92. Features That Should Not Distract From the MVP

Avoid spending too much development time on:

- complicated social features,
- chat,
- messaging,
- external academic scraping,
- complex AI recommendations,
- unnecessary microservices,
- complex permissions beyond Faculty/Admin,
- complicated workflow engines.

The goal is a strong, working B.Tech project.

---

# 93. Definition of Done — Faculty Side

The faculty side is complete when a faculty member can:

1. Open the login page.
2. Log in.
3. Reach the faculty dashboard.
4. See their own statistics.
5. Open their profile.
6. Open My Publications.
7. Add a publication.
8. Submit it.
9. See Pending status.
10. Edit their own publication.
11. Delete their own publication.
12. Search/filter their publications.
13. See approval/rejection status.
14. View their analytics.
15. Log out.

---

# 94. Definition of Done — Admin Side

The admin side is complete when the admin can:

1. Log in with the required admin account.
2. Reach the admin dashboard.
3. See institution-level statistics.
4. View faculty.
5. Create faculty.
6. Edit faculty.
7. Deactivate faculty.
8. View all publications.
9. Search/filter publications.
10. View pending publications.
11. Approve publications.
12. Reject publications.
13. Edit publications.
14. Delete publications.
15. View institution analytics.
16. Generate PDF report.
17. Export Excel report.
18. View audit logs.
19. Log out.

---

# 95. Definition of Done — Data

The project is not complete if it only works with five manually created records.

The application should contain a large synthetic dataset suitable for demonstration.

The charts should visibly show meaningful variation.

The admin dashboard should not look empty.

The faculty dashboards should have different values for different users.

---

# 96. Definition of Done — Analytics

Analytics are complete when:

- they come from database records,
- approved records are used for official publication statistics,
- counts update when data changes,
- charts match the underlying data,
- faculty analytics are scoped to the logged-in faculty,
- admin analytics represent institution-wide data.

---

# 97. Definition of Done — Workflow

The most important end-to-end test is:

```text
Faculty Login
     ↓
Add Publication
     ↓
Publication Pending
     ↓
Admin Login
     ↓
Review Publication
     ↓
Approve
     ↓
Faculty sees Approved
     ↓
Analytics update
     ↓
Report includes publication
```

If this complete chain works, the core product is functioning.

---

# 98. Definition of Done — Security

At minimum:

- passwords are hashed,
- protected pages require authentication,
- admin routes require admin role,
- faculty cannot access other faculty's private records,
- faculty cannot approve publications,
- backend enforces ownership,
- secrets are stored in environment configuration,
- database credentials are not hard-coded into frontend code.

---

# 99. Definition of Done — User Experience

The application should feel finished.

That means:

- no broken navigation,
- no empty unexplained pages,
- no raw backend errors,
- forms have validation,
- buttons work,
- loading states exist,
- destructive actions require confirmation,
- charts render correctly,
- tables are readable,
- login/logout works,
- responsive layout is usable.

---

# 100. Recommended Product Demo Sequence

For the final college/project demonstration, show the application in this order:

## Step 1 — Login

Show the login page.

Log in as faculty.

## Step 2 — Faculty Dashboard

Show:

- total publications,
- approved,
- pending,
- citations,
- charts.

## Step 3 — Add Publication

Create a new publication.

## Step 4 — Pending Status

Show that the publication is pending.

## Step 5 — Admin Login

Log out and log in as admin.

## Step 6 — Admin Dashboard

Show institutional statistics.

## Step 7 — Pending Approvals

Open the new faculty submission.

## Step 8 — Approve

Approve the publication.

## Step 9 — Analytics

Show how the approved publication is reflected in statistics.

## Step 10 — Reports

Generate PDF and Excel.

## Step 11 — Audit Logs

Show that important actions were recorded.

This creates a very clear demonstration story.

---

# 101. Final Product Mental Model

The entire application can be remembered using five words:

## Enter → Verify → Store → Analyze → Report

### Enter

Faculty enters publication information.

### Verify

Admin reviews and approves/rejects it.

### Store

The database maintains the records.

### Analyze

The system calculates statistics and displays charts.

### Report

The admin exports institutional research information.

That is the central purpose of the entire project.

---

# 102. Final Instruction to Codex

Treat this document as the **functional/product truth** of the application.

The separate technical master prompt defines:

- architecture,
- technologies,
- project structure,
- APIs,
- database implementation,
- setup scripts,
- testing,
- terminal workflow,
- MongoDB Atlas safety,
- implementation details.

This document defines:

- what the application means,
- who uses it,
- what each role does,
- how the workflows behave,
- what every major page should accomplish,
- how publication verification works,
- what analytics should represent,
- what reports should contain,
- what "complete" means.

When implementing the project:

1. Build the actual user workflows described here.
2. Do not create pages that exist only because they are technically easy.
3. Every major page must have a clear user purpose.
4. Every dashboard number must come from real database data.
5. Do not hard-code analytics.
6. Preserve the Faculty/Admin permission boundary.
7. Preserve the publication approval workflow.
8. Use the large synthetic dataset to make the system demonstrable.
9. Keep the interface simple enough for a B.Tech project demonstration.
10. Prefer a fully working end-to-end feature over a large number of incomplete features.

---

# 103. Final One-Paragraph Project Description

**Research Publication Analytics System is a full-stack university research-management application in which faculty members securely log in, maintain their research profiles, submit publication records, and track the verification status of their work. An administrator manages faculty accounts, reviews and verifies submitted publications, and maintains institution-wide research records. Once publications are approved, the system automatically aggregates the stored information into analytics such as publication trends, department-wise output, publication types, indexing status, journal quartiles, and citation statistics. The administrator can use these analytics to understand institutional research activity and generate PDF/Excel reports. The application therefore connects publication data entry, verification, structured storage, analytics, visualization, and reporting into one complete workflow.**

---

# 104. Final Success Condition

The project should be considered successful only when a person can use it from beginning to end without developer intervention:

```text
Open Application
      ↓
Login
      ↓
Use Correct Role
      ↓
Manage Publication Data
      ↓
Submit / Review
      ↓
Approve / Reject
      ↓
See Updated Analytics
      ↓
Generate Report
      ↓
Logout
```

**The application should demonstrate this complete cycle reliably with the seeded synthetic dataset.**

---

## Companion Document

Use this functional specification together with:

**`research_publication_analytics_codex_master_prompt.md`**

The functional specification explains **WHAT the product should do**.

The master prompt explains **HOW Codex should build it**.

Both should be supplied to Codex together.
