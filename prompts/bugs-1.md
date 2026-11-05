 I need you to make the following changes to my existing application.

### 1. GitHub Repository Setup (First Priority)
Before making any code changes, connect my existing project to this newly created GitHub repository:

https://github.com/sumithnalla/Special-Project-Reseach-Publications-Analytics

Upload the complete existing project (frontend, backend, configurations, and necessary files) to the repository first. Create a proper `.gitignore` to exclude `.env`, `.venv`, `node_modules`, credentials, and other sensitive files. Do not overwrite existing work. After the initial push, proceed with development and push the completed changes.

### 2. MongoDB Atlas Connection
I have successfully logged into MongoDB Atlas CLI using **sumithnalla0607@gmail.com**,.
Verify that the backend is connected to the correct MongoDB Atlas database. 

### 3. Admin Dashboard Changes
- **Faculty Creation:** Fix the issue preventing administrators from creating new faculty accounts. The browser currently shows `409 Conflict` errors. Identify and resolve the actual cause, including duplicate validation and proper error handling.
- **Designation Dropdown:** Replace the designation text input with a dropdown containing options such as Assistant Professor, Associate Professor, Professor, HOD, and other relevant designations.
- **Publication Approval:** Fix the Approve and Reject buttons. Currently, deleting publications works, but approving/rejecting fails with CORS and API errors. Resolve the underlying backend/API issue and ensure publication statuses update correctly.
- **Publications Table:** Add serial numbers to the publications list. Display a maximum of **50 publications per page**, with Previous/Next pagination, page numbers, and the total record count. Ensure search and filters work correctly with pagination.
- **Reports Page:** Enhance reporting with options to generate and download reports for individual faculty members, departments, research topics, publication types, publication statuses, and custom date ranges. Support CSV and PDF exports, with useful summary statistics.

### 4. Remove Unnecessary Pages
- **Admin Dashboard:** Remove the Pending and Analytics pages from the sidebar and routing.
- **Faculty Dashboard:** Remove the Analytics page.
- Keep the existing Dashboard pages because they already provide the necessary analytics and overview information.
- Ensure removing these pages does not break any other functionality.

### 5. Quality Checks and Final Delivery
Maintain the existing professional UI design and responsiveness. Do not unnecessarily redesign working components.

Test faculty creation, publication approval/rejection, deletion, pagination, filtering, reporting, and MongoDB connectivity. Fix any related frontend/backend issues and provide meaningful success/error messages.

After completing everything, push the updated code to GitHub and provide a summary of the changes, tests performed, and any remaining issues.

**Important:** Work on the existing project rather than rebuilding it from scratch. Preserve all existing faculty, publications, and database records. 