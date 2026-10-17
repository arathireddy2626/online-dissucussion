# Online Discussion Tool for Academic Forums

A full-stack web application engineered to bridge the communication gap in online and in-person courses by providing a secure, role-based virtual discussion environment.

This platform acts as a centralized forum where course administrators (instructors) can govern student enrollment, orchestrate topic-based discussion threads, and manage archive lifecycles. Built with a React frontend and a Node.js/Express backend, the system emphasizes secure authentication, a robust hybrid database architecture, and automated email dispatching.

## 🚀 Key Features & Technical Highlights

* **Role-Based Access Control (RBAC):** Distinct application flows and permission sets for Instructors (Administrators) and Students.
* **Secure Authentication Pipeline:** Auto-generates unique student usernames and enforces strict password policies (minimum 8 characters, alphanumeric + special character). All passwords are cryptographically hashed using `bcryptjs` and are never exposed in plain text during transit or storage.
* **Hybrid Polyglot Database Architecture:** Strategically leverages both **MySQL** and **MongoDB** to handle different data access patterns, ensuring optimal performance for both structured relational data and flexible document storage.
* **Rich Discussion Threads:** Users can seamlessly browse and post entries containing text and image payloads (PNG, JPG, GIF) to dedicated discussion topics.
* **Archival & Retrieval Engine:** Instructors can archive inactive discussions into text or PDF formats. Students can submit requests for archived topics, which the system securely fulfills by dispatching a copy directly to the student via email.
* **Automated Email Notifications:** Integrates `nodemailer` to automatically email auto-generated account credentials upon enrollment, confirm course withdrawals, and deliver retrieved archives.
* **Request Queueing:** Implements asynchronous backend queues (`EnrollQueue`, `RemoveStudentQueue`) to handle student course registration and drop requests pending instructor approval.

## 🏗️ System Architecture & Tech Stack

**Frontend (Client)**

* **Framework:** React (Bootstrapped via Vite for optimized build tooling and HMR).
* **Routing:** React Router DOM for declarative, client-side navigation.
* **Styling & Linting:** CSS/PostCSS with strict linting via Oxlint.

**Backend (API Server)**

* **Runtime:** Node.js with Express.js REST API routing.
* **Security:** `bcryptjs` for password hashing and `cors` for cross-origin resource sharing policy management.
* **Utilities:** `nodemailer` for SMTP email dispatch and `dotenv` for environment variable isolation.

**Database Layer**

* **Relational Datastore (MySQL):** Connected via `mysql2`, this handles strictly structured relational entities such as `LoginCredential`, `StudentRecord`, and state-driven queues (`EnrollQueue`, `RemoveStudentQueue`) to ensure ACID compliance and data integrity.
* **NoSQL Datastore (MongoDB):** Handled via the native `mongodb` driver, this provides a highly scalable, flexible document model ideal for storing nested `Discussion` threads, dynamic `Message` payloads, and unstructured archive data.

## 📡 REST API Endpoints

The backend exposes a structured RESTful API. Below are the core endpoints driving the application's functionality.

### Authentication & Account

* `POST /api/auth/login` - Authenticates users (Instructor/Student) and issues session tokens.
* `PUT /api/auth/password` - Updates the authenticated user's password securely.

### Instructor Administrative Tasks

* `GET /api/admin/students` - Retrieves a list of all currently enrolled students.
* `GET /api/admin/requests/enroll` - Fetches the `EnrollQueue` of pending student join requests.
* `POST /api/admin/enroll` - Processes an enrollment request, provisions the `StudentRecord` and `LoginCredential`, and dispatches an automated welcome email.
* `GET /api/admin/requests/withdraw` - Fetches the `RemoveStudentQueue` of pending course drop requests.
* `POST /api/admin/withdraw` - Deletes a student's login credentials while retaining their historical messages, and dispatches a confirmation email.

### Discussions & Messages

* `GET /api/discussions` - Retrieves the directory of all active discussion topics.
* `POST /api/discussions` - Creates a new discussion thread (Instructor only).
* `GET /api/discussions/:discussionId/messages` - Retrieves all chronological message entries for a specific thread.
* `POST /api/discussions/:discussionId/messages` - Appends a new message (text/image) to a thread with a logged timestamp.
* `DELETE /api/discussions/:discussionId/messages/:messageId` - Removes an inappropriate or unwanted message (Instructor only).

### Archives & Retrieval

* `POST /api/admin/discussions/:discussionId/archive` - Archives a discussion, locking it from new messages and storing it in a persistent file format.
* `GET /api/admin/archives` - Retrieves the directory of all archived discussions.
* `POST /api/students/requests/archive` - Submits a student request to retrieve a specific archived topic.
* `GET /api/admin/requests/archive` - Fetches the queue of pending archive retrieval requests.
* `POST /api/admin/archives/:archiveId/dispatch` - Processes an archive retrieval request, sending a copy of the archived file directly to the requesting student via email.

## 📂 Project Structure

```text
online-discussion-project/
├── database/                 # MySQL schema definitions and database design docs
│   ├── 005_rubric_schema.sql
│   ├── 006_rubric_demo_content.sql
│   ├── 007_demo_activity.sql
│   └── design.md
├── mongodb/                  # MongoDB initialization and query scripts
│   ├── mongodb_setup.js
│   └── mongodb_show_data.js
├── frontend/                 # React client built with Vite
│   ├── src/                  # Components, views, and React Router logic
│   ├── public/               # Static assets and icons
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite build configuration
├── server/                   # Node.js/Express backend API
│   ├── index.js              # Express server entry point and route definitions
│   ├── .env.example          # Template for environment variables
│   └── package.json          # Backend dependencies (Express, bcryptjs, nodemailer, mysql2, mongodb)
└── postman/                  # API integration testing collections
    ├── Online_Discussion_Demo.postman_collection.json
    ├── MySQL.postman_environment.json
    ├── MongoDB.postman_environment.json
    └── mysql_demo_queries.sql

```

## ⚙️ Installation & Local Setup

### 1. Database Initialization

This application requires both MySQL and MongoDB to be running locally.

1. **MySQL Setup:** Execute the SQL scripts located in the `/database` directory in sequential order to build the relational schema, establish constraints, and seed initial user demo content (including the default instructor account).
2. **MongoDB Setup:** Navigate to the `/mongodb` directory and run `node mongodb_setup.js` to initialize the document collections for discussions and messages.

### 2. Backend API Setup

1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Duplicate `.env.example` to `.env` and configure your credentials for both MySQL and MongoDB URIs, the server port, and SMTP settings for `nodemailer`.
4. Start the development server: `npm run dev`

### 3. Frontend Client Setup

1. Open a new terminal and navigate to the client directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. The application GUI will compile and become accessible via `localhost`.
