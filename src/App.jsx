import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const result = response.status === 204 ? null : await response.json()
  if (!response.ok) throw new Error(result?.error || 'Request failed.')
  return result
}

const courseInfo = {
  title: 'Software Engineering',
  instructorName: 'Dr. Kasi',
}

const defaultInstructor = {
  username: 'drKasi',
  name: 'Dr. Kasi',
  role: 'Instructor',
}

const initialStudents = [
  { id: 1, firstname: 'John', lastname: 'Doe', email: 'john.doe@campus.edu', username: 'jdoe23', role: 'Student' },
  { id: 2, firstname: 'Aisha', lastname: 'Rahman', email: 'aisha.rahman@campus.edu', username: 'arahman17', role: 'Student' },
  { id: 3, firstname: 'Daniel', lastname: 'Kim', email: 'daniel.kim@campus.edu', username: 'dkim41', role: 'Student' },
]

const initialDiscussions = [
  {
    id: 'Jan-24-2024:11:34:28',
    courseTitle: courseInfo.title,
    topic: 'Week 1: Intro to software engineering',
    createdAt: 'Jan-24-2024:11:34:28',
    entries: [
      { id: 'entry-1', username: 'jdoe23', postedAt: 'Jan-24-2024:11:45:10', content: 'Welcome everyone! Please review the syllabus and share your expectations for the course.' },
      { id: 'entry-2', username: 'snguyen12', postedAt: 'Jan-24-2024:12:05:48', content: 'I am most excited about learning how software engineering connects planning, testing, and teamwork.' },
      { id: 'entry-3', username: 'arahman17', postedAt: 'Jan-24-2024:12:18:22', content: 'I would like to understand how requirements analysis differs from coding in real project work.' },
      { id: 'entry-4', username: 'ebrooks53', postedAt: 'Jan-24-2024:12:32:06', content: 'I think the best part of the course will be seeing how teams handle communication, deadlines, and quality checks together.' },
      { id: 'entry-5', username: 'drKasi', postedAt: 'Jan-24-2024:12:44:41', content: 'This week introduces the lifecycle of software engineering, including planning, design, implementation, validation, and maintenance. Please use the course material to connect theory to practice.' },
    ],
  },
  {
    id: 'Jan-30-2024:09:15:02',
    courseTitle: courseInfo.title,
    topic: 'Project planning and milestones',
    createdAt: 'Jan-30-2024:09:15:02',
    entries: [
      { id: 'entry-6', username: 'drKasi', postedAt: 'Jan-30-2024:09:18:41', content: 'Students should submit a realistic project scope, milestone plan, and risk assessment before the deadline. Clear planning is essential for successful delivery.' },
      { id: 'entry-7', username: 'ebrooks53', postedAt: 'Jan-30-2024:09:42:11', content: 'Our team has divided tasks into research, design, implementation, and testing to keep milestones realistic.' },
      { id: 'entry-8', username: 'pnair32', postedAt: 'Jan-30-2024:09:57:10', content: 'We are aiming to set weekly targets so we can measure progress and avoid rushing the final submission.' },
      { id: 'entry-9', username: 'lortega30', postedAt: 'Jan-30-2024:10:13:40', content: 'I think a milestone review meeting would help the group detect risk early, especially around unfinished features or unclear requirements.' },
      { id: 'entry-10', username: 'dkim41', postedAt: 'Jan-30-2024:10:29:18', content: 'I agree. Breaking the work into smaller checkpoints makes it easier to assign responsibilities and track accountability.' },
    ],
  },
  {
    id: 'Feb-02-2024:10:22:09',
    courseTitle: courseInfo.title,
    topic: 'User stories and acceptance criteria',
    createdAt: 'Feb-02-2024:10:22:09',
    entries: [
      { id: 'entry-11', username: 'pnair32', postedAt: 'Feb-02-2024:10:33:50', content: 'I wrote a user story for a student login page. The acceptance criteria includes validation, error messages, and secure access.' },
      { id: 'entry-12', username: 'lortega30', postedAt: 'Feb-02-2024:10:48:20', content: 'We should include edge cases like empty password, wrong username, and session expiry for the tests.' },
      { id: 'entry-13', username: 'npatel08', postedAt: 'Feb-02-2024:11:02:10', content: 'A good user story must explain the value to the user, not just the interface. Otherwise the requirement is too technical and unclear.' },
      { id: 'entry-14', username: 'ohaddad21', postedAt: 'Feb-02-2024:11:20:43', content: 'I would also include a definition of done so the team knows when the feature is complete and ready for review.' },
      { id: 'entry-15', username: 'drKasi', postedAt: 'Feb-02-2024:11:39:56', content: 'Strong acceptance criteria should be measurable, testable, and connected to user outcomes. This is a good example of sound requirement engineering.' },
    ],
  },
  {
    id: 'Feb-05-2024:08:42:18',
    courseTitle: courseInfo.title,
    topic: 'Database design choices',
    createdAt: 'Feb-05-2024:08:42:18',
    entries: [
      { id: 'entry-16', username: 'npatel08', postedAt: 'Feb-05-2024:08:52:12', content: 'For our system, a normalized schema will help with student records, course sections, and discussion threads.' },
      { id: 'entry-17', username: 'ohaddad21', postedAt: 'Feb-05-2024:09:16:34', content: 'I suggest separating archive requests from discussion content so the data model stays clear and scalable.' },
      { id: 'entry-18', username: 'vliu39', postedAt: 'Feb-05-2024:09:27:52', content: 'A relational design is useful here, but we also need to consider how records will behave when the app grows with more courses and students.' },
      { id: 'entry-19', username: 'snguyen12', postedAt: 'Feb-05-2024:09:48:09', content: 'If we add indexes and consistent primary keys, the system will be easier to query and maintain over time.' },
      { id: 'entry-20', username: 'drKasi', postedAt: 'Feb-05-2024:10:04:17', content: 'Your discussion identifies an important design principle: model data according to business rules and expected queries, not only by table appearance.' },
    ],
  },
  {
    id: 'Feb-08-2024:14:11:03',
    courseTitle: courseInfo.title,
    topic: 'API design for discussion posts',
    createdAt: 'Feb-08-2024:14:11:03',
    entries: [
      { id: 'entry-21', username: 'vliu39', postedAt: 'Feb-08-2024:14:22:07', content: 'A clean API should support create discussion, post reply, fetch archive, and approve teacher access.' },
      { id: 'entry-22', username: 'jdoe23', postedAt: 'Feb-08-2024:14:39:10', content: 'I recommend using clear route names and response codes so the frontend can handle errors consistently.' },
      { id: 'entry-23', username: 'arahman17', postedAt: 'Feb-08-2024:14:52:18', content: 'I suggest having separate endpoints for discussion creation and archive retrieval so each action has a clear responsibility.' },
      { id: 'entry-24', username: 'mbell26', postedAt: 'Feb-08-2024:15:09:42', content: 'We should also handle validation and unauthorized access properly so the API does not expose protected course information.' },
      { id: 'entry-25', username: 'drKasi', postedAt: 'Feb-08-2024:15:22:03', content: 'This is a solid API design discussion. Good interfaces are explicit, secure, and easy to test in a full development lifecycle.' },
    ],
  },
  {
    id: 'Feb-11-2024:11:06:27',
    courseTitle: courseInfo.title,
    topic: 'Testing strategy for web apps',
    createdAt: 'Feb-11-2024:11:06:27',
    entries: [
      { id: 'entry-26', username: 'ewalker73', postedAt: 'Feb-11-2024:11:20:42', content: 'We should test login, discussion creation, route protection, and archive approval flows before release.' },
      { id: 'entry-27', username: 'drKasi', postedAt: 'Feb-11-2024:11:33:19', content: 'Yes. Testing should cover both functional correctness and system-level behavior, especially for authentication and authorization.' },
      { id: 'entry-28', username: 'lgomez44', postedAt: 'Feb-11-2024:11:47:31', content: 'Unit tests can check individual logic, while end-to-end tests help verify the user journey through the actual interface.' },
      { id: 'entry-29', username: 'njames57', postedAt: 'Feb-11-2024:12:01:41', content: 'I would also include edge cases like invalid credentials, empty fields, and failed archive requests to catch potential bugs early.' },
      { id: 'entry-30', username: 'hsaleh19', postedAt: 'Feb-11-2024:12:18:16', content: 'A comprehensive test plan should also confirm that the app behaves appropriately when the user is unauthorized or when a system call fails.' },
    ],
  },
  {
    id: 'Feb-15-2024:13:16:40',
    courseTitle: courseInfo.title,
    topic: 'Frontend layout review',
    createdAt: 'Feb-15-2024:13:16:40',
    entries: [
      { id: 'entry-31', username: 'lgomez44', postedAt: 'Feb-15-2024:13:26:58', content: 'The dashboard should feel clean to the instructor, while the student portal needs a more focused learning view.' },
      { id: 'entry-32', username: 'mbell26', postedAt: 'Feb-15-2024:13:41:03', content: 'I think a compact sidebar and consistent color system will make the portal easier to follow.' },
      { id: 'entry-33', username: 'dkim41', postedAt: 'Feb-15-2024:13:56:22', content: 'The layout should reduce clutter so students can immediately identify active discussions, archive requests, and the selected discussion thread.' },
      { id: 'entry-34', username: 'snguyen12', postedAt: 'Feb-15-2024:14:11:11', content: 'I agree. It would also help if important controls were grouped and the visual hierarchy matched the task flow.' },
      { id: 'entry-35', username: 'drKasi', postedAt: 'Feb-15-2024:14:24:40', content: 'Strong interface design is not only about aesthetics; it supports clarity, navigation, and user confidence during task completion.' },
    ],
  },
  {
    id: 'Feb-18-2024:09:10:05',
    courseTitle: courseInfo.title,
    topic: 'Accessibility and inclusive design',
    createdAt: 'Feb-18-2024:09:10:05',
    entries: [
      { id: 'entry-36', username: 'hsaleh19', postedAt: 'Feb-18-2024:09:23:48', content: 'High contrast text, larger buttons, and keyboard navigation are important for student usability.' },
      { id: 'entry-37', username: 'njames57', postedAt: 'Feb-18-2024:09:41:11', content: 'We should also add descriptive labels for form inputs and accessible alt text for uploaded images.' },
      { id: 'entry-38', username: 'ewalker73', postedAt: 'Feb-18-2024:09:53:26', content: 'Accessible design improves the experience for all students, especially those using assistive technologies or smaller screens.' },
      { id: 'entry-39', username: 'jdoe23', postedAt: 'Feb-18-2024:10:09:41', content: 'I think color alone should not be used to convey meaning because some students may have visual impairments or low-contrast settings.' },
      { id: 'entry-40', username: 'drKasi', postedAt: 'Feb-18-2024:10:27:08', content: 'Accessibility is a core engineering requirement, not an optional enhancement. Inclusive design improves both usability and compliance.' },
    ],
  },
  {
    id: 'Feb-20-2024:15:24:55',
    courseTitle: courseInfo.title,
    topic: 'Authentication and session handling',
    createdAt: 'Feb-20-2024:15:24:55',
    entries: [
      { id: 'entry-41', username: 'arahman17', postedAt: 'Feb-20-2024:15:37:08', content: 'A secure login system should protect passwords and keep student sessions restricted to their own role.' },
      { id: 'entry-42', username: 'dkim41', postedAt: 'Feb-20-2024:15:52:31', content: 'The app should redirect unauthorized users away from the instructor pages and only allow approved archive requests.' },
      { id: 'entry-43', username: 'mbell26', postedAt: 'Feb-20-2024:16:11:14', content: 'I also think session expiration and proper logout handling are important because they reduce the chance of stale access.' },
      { id: 'entry-44', username: 'pnair32', postedAt: 'Feb-20-2024:16:26:19', content: 'We should avoid exposing direct URLs that allow students to bypass the login flow.' },
      { id: 'entry-45', username: 'drKasi', postedAt: 'Feb-20-2024:16:40:49', content: 'Authentication and session management are central to secure system design. Access control must be enforced on both the interface and backend logic.' },
    ],
  },
  {
    id: 'Feb-22-2024:12:11:16',
    courseTitle: courseInfo.title,
    topic: 'Security concerns in course platform',
    createdAt: 'Feb-22-2024:12:11:16',
    entries: [
      { id: 'entry-46', username: 'snguyen12', postedAt: 'Feb-22-2024:12:19:24', content: 'We need to be careful with direct access to archives and avoid exposing protected documents without approval.' },
      { id: 'entry-47', username: 'drKasi', postedAt: 'Feb-22-2024:12:34:50', content: 'This is a critical concern. Student records and archive content must be protected through policy enforcement and controlled retrieval workflows.' },
      { id: 'entry-48', username: 'npatel08', postedAt: 'Feb-22-2024:12:48:06', content: 'It would also be useful to keep audit records so we can see who requested access and when approval was granted.' },
      { id: 'entry-49', username: 'ohaddad21', postedAt: 'Feb-22-2024:13:02:48', content: 'The risk is not only data leakage but also inconsistent authorization, which can break trust in the platform.' },
      { id: 'entry-50', username: 'vliu39', postedAt: 'Feb-22-2024:13:18:12', content: 'I agree. Principle-of-least-privilege should guide every access decision in a teaching platform.' },
    ],
  },
  {
    id: 'Feb-24-2024:10:05:08',
    courseTitle: courseInfo.title,
    topic: 'Agile sprint planning',
    createdAt: 'Feb-24-2024:10:05:08',
    entries: [
      { id: 'entry-51', username: 'ebrooks53', postedAt: 'Feb-24-2024:10:18:42', content: 'We should keep sprint goals small and review blockers every few days to maintain momentum.' },
      { id: 'entry-52', username: 'lortega30', postedAt: 'Feb-24-2024:10:41:06', content: 'I would also schedule a short retrospective to improve communication and reduce repeated errors.' },
      { id: 'entry-53', username: 'dkim41', postedAt: 'Feb-24-2024:10:58:19', content: 'A sprint plan works best when responsibilities are clearly assigned and progress is visible to the whole team.' },
      { id: 'entry-54', username: 'jdoe23', postedAt: 'Feb-24-2024:11:12:50', content: 'Tracking blockers early helps the team adjust before small problems become major delays.' },
      { id: 'entry-55', username: 'drKasi', postedAt: 'Feb-24-2024:11:29:40', content: 'Agile planning is effective when scope is realistic and teams regularly reflect on both delivery and process improvement.' },
    ],
  },
  {
    id: 'Feb-27-2024:16:02:19',
    courseTitle: courseInfo.title,
    topic: 'Version control and branching strategy',
    createdAt: 'Feb-27-2024:16:02:19',
    entries: [
      { id: 'entry-56', username: 'ohaddad21', postedAt: 'Feb-27-2024:16:11:22', content: 'A simple Git workflow with feature branches and pull requests helps teams review changes safely.' },
      { id: 'entry-57', username: 'vliu39', postedAt: 'Feb-27-2024:16:24:09', content: 'We also need a consistent commit message format and a clear merge policy to avoid confusion.' },
      { id: 'entry-58', username: 'npatel08', postedAt: 'Feb-27-2024:16:37:22', content: 'Branch naming should clearly describe the feature or fix so teammates can understand the purpose without opening the code.' },
      { id: 'entry-59', username: 'arahman17', postedAt: 'Feb-27-2024:16:49:05', content: 'I think protected main branches and mandatory peer review would improve code quality and reduce mistakes.' },
      { id: 'entry-60', username: 'drKasi', postedAt: 'Feb-27-2024:17:02:38', content: 'Version control practices are central to collaborative software development. Good branching and review habits reduce risk and improve maintainability.' },
    ],
  },
  {
    id: 'Mar-01-2024:08:51:11',
    courseTitle: courseInfo.title,
    topic: 'CI/CD pipeline and deployment',
    createdAt: 'Mar-01-2024:08:51:11',
    entries: [
      { id: 'entry-61', username: 'npatel08', postedAt: 'Mar-01-2024:09:00:02', content: 'Automating build and deployment checks allows us to catch issues before students see broken pages.' },
      { id: 'entry-62', username: 'jdoe23', postedAt: 'Mar-01-2024:09:14:17', content: 'We should ensure the pipeline checks linting, build health, and test execution every time a change is pushed.' },
      { id: 'entry-63', username: 'ewalker73', postedAt: 'Mar-01-2024:09:31:09', content: 'Automated deployment is valuable only if it validates quality. Otherwise we risk shipping unstable releases to users.' },
      { id: 'entry-64', username: 'lgomez44', postedAt: 'Mar-01-2024:09:47:58', content: 'I also think staging and production environments should be separated clearly to reduce operational mistakes.' },
      { id: 'entry-65', username: 'drKasi', postedAt: 'Mar-01-2024:10:04:21', content: 'Continuous integration and deployment strengthen reliability when supported by testing, monitoring, and careful environment control.' },
    ],
  },
  {
    id: 'Mar-03-2024:14:44:32',
    courseTitle: courseInfo.title,
    topic: 'Code review best practices',
    createdAt: 'Mar-03-2024:14:44:32',
    entries: [
      { id: 'entry-66', username: 'ewalker73', postedAt: 'Mar-03-2024:14:54:14', content: 'Constructive feedback should focus on logic, maintainability, and readability instead of personal opinions.' },
      { id: 'entry-67', username: 'lgomez44', postedAt: 'Mar-03-2024:15:08:05', content: 'I like the rule of leaving comments on intent, edge cases, and risks so others understand the decision-making.' },
      { id: 'entry-68', username: 'pnair32', postedAt: 'Mar-03-2024:15:23:50', content: 'Review comments should be actionable and specific, otherwise the author may not know what exactly needs to change.' },
      { id: 'entry-69', username: 'mbell26', postedAt: 'Mar-03-2024:15:36:27', content: 'A good review also respects the original design and questions the implementation without undermining the whole approach.' },
      { id: 'entry-70', username: 'drKasi', postedAt: 'Mar-03-2024:15:49:11', content: 'Peer review is a professional skill. Effective reviews balance quality assurance with respect for team effort and design intent.' },
    ],
  },
  {
    id: 'Mar-05-2024:09:35:16',
    courseTitle: courseInfo.title,
    topic: 'Documenting requirements clearly',
    createdAt: 'Mar-05-2024:09:35:16',
    entries: [
      { id: 'entry-71', username: 'pnair32', postedAt: 'Mar-05-2024:09:49:44', content: 'When requirements are ambiguous, the team ends up building the wrong thing. Clear documentation saves time.' },
      { id: 'entry-72', username: 'arahman17', postedAt: 'Mar-05-2024:10:02:31', content: 'I would also add examples and expected outcomes so the team shares the same understanding.' },
      { id: 'entry-73', username: 'snguyen12', postedAt: 'Mar-05-2024:10:17:42', content: 'This is especially important when different team members are responsible for coding, testing, and presentation tasks.' },
      { id: 'entry-74', username: 'lortega30', postedAt: 'Mar-05-2024:10:34:11', content: 'Short, precise requirements reduce confusion and prevent wasted effort during implementation.' },
      { id: 'entry-75', username: 'drKasi', postedAt: 'Mar-05-2024:10:47:25', content: 'Documentation is not administrative overhead; it is a critical mechanism for alignment, traceability, and quality assurance.' },
    ],
  },
  {
    id: 'Mar-07-2024:12:18:14',
    courseTitle: courseInfo.title,
    topic: 'Performance and optimization',
    createdAt: 'Mar-07-2024:12:18:14',
    entries: [
      { id: 'entry-76', username: 'mbell26', postedAt: 'Mar-07-2024:12:26:39', content: 'Large pages can feel slow, so we should reduce unnecessary renders and keep assets light.' },
      { id: 'entry-77', username: 'njames57', postedAt: 'Mar-07-2024:12:42:04', content: 'Caching and code splitting are useful long-term strategies for complex apps.' },
      { id: 'entry-78', username: 'vliu39', postedAt: 'Mar-07-2024:12:58:13', content: 'We should also monitor bottlenecks during testing so we know whether performance issues are caused by code or infrastructure.' },
      { id: 'entry-79', username: 'ohaddad21', postedAt: 'Mar-07-2024:13:12:35', content: 'Optimization should begin with measurement. If we do not know the actual bottleneck, we may waste time optimizing the wrong layer.' },
      { id: 'entry-80', username: 'drKasi', postedAt: 'Mar-07-2024:13:29:49', content: 'Performance engineering begins with evidence. Profiling, benchmarking, and targeted optimization are more valuable than guesswork.' },
    ],
  },
  {
    id: 'Mar-10-2024:16:42:52',
    courseTitle: courseInfo.title,
    topic: 'Data privacy in student software',
    createdAt: 'Mar-10-2024:16:42:52',
    entries: [
      { id: 'entry-81', username: 'hsaleh19', postedAt: 'Mar-10-2024:16:50:18', content: 'Student data should only be visible to authorized users and never stored without a clear purpose.' },
      { id: 'entry-82', username: 'drKasi', postedAt: 'Mar-10-2024:17:04:41', content: 'This topic is essential. Privacy, consent, and secure handling of educational data are important ethical and legal responsibilities.' },
      { id: 'entry-83', username: 'ewalker73', postedAt: 'Mar-10-2024:17:20:02', content: 'I also think we should limit unnecessary data collection and ensure any archive request is tied to a legitimate educational purpose.' },
      { id: 'entry-84', username: 'npatel08', postedAt: 'Mar-10-2024:17:34:08', content: 'Minimizing access and keeping logs helps maintain accountability while protecting sensitive student information.' },
      { id: 'entry-85', username: 'pnair32', postedAt: 'Mar-10-2024:17:48:16', content: 'A system can be functional and still unsafe if it stores or exposes information without clear protection or oversight.' },
    ],
  },
  {
    id: 'Mar-12-2024:11:22:09',
    courseTitle: courseInfo.title,
    topic: 'UX improvements for discussion portals',
    createdAt: 'Mar-12-2024:11:22:09',
    entries: [
      { id: 'entry-86', username: 'dkim41', postedAt: 'Mar-12-2024:11:35:55', content: 'Clear thread titles, color-coded statuses, and simple sorting would make the portal much easier to navigate.' },
      { id: 'entry-87', username: 'snguyen12', postedAt: 'Mar-12-2024:11:48:22', content: 'Students also benefit when the discussion list shows unread counts and active status.' },
      { id: 'entry-88', username: 'mbell26', postedAt: 'Mar-12-2024:12:01:17', content: 'I think strong hierarchy matters a lot because students need to quickly understand what is active, archived, and pending.' },
      { id: 'entry-89', username: 'jdoe23', postedAt: 'Mar-12-2024:12:17:40', content: 'A useful interface should reduce friction during navigation so students can spend more time learning and less time searching for content.' },
      { id: 'entry-90', username: 'drKasi', postedAt: 'Mar-12-2024:12:30:53', content: 'User experience is a design quality issue and a learning support issue. Clear structure improves both participation and comprehension.' },
    ],
  },
  {
    id: 'Mar-14-2024:10:13:18',
    courseTitle: courseInfo.title,
    topic: 'Team communication habits',
    createdAt: 'Mar-14-2024:10:13:18',
    entries: [
      { id: 'entry-91', username: 'lortega30', postedAt: 'Mar-14-2024:10:23:31', content: 'A small daily update can reduce misunderstandings and remind the team about blockers or progress.' },
      { id: 'entry-92', username: 'vliu39', postedAt: 'Mar-14-2024:10:46:16', content: 'I would also encourage async updates to support students with different schedules and workloads.' },
      { id: 'entry-93', username: 'nah', postedAt: 'Mar-14-2024:11:03:12', content: 'Clear communication helps the team avoid silent blockers and keeps everyone aligned on the next action.' },
      { id: 'entry-94', username: 'hsaleh19', postedAt: 'Mar-14-2024:11:18:44', content: 'I think a shared communication channel should include updates on risks, decisions, and progress to reduce confusion.' },
      { id: 'entry-95', username: 'drKasi', postedAt: 'Mar-14-2024:11:35:09', content: 'Effective communication is a professional competency. It enables coordination, reduces risk, and improves successful collaboration in engineering teams.' },
    ],
  },
  {
    id: 'Mar-17-2024:13:52:30',
    courseTitle: courseInfo.title,
    topic: 'Portfolio and project reflection',
    createdAt: 'Mar-17-2024:13:52:30',
    entries: [
      { id: 'entry-96', username: 'ewalker73', postedAt: 'Mar-17-2024:14:02:19', content: 'This class helped me understand how design decisions affect the entire software lifecycle.' },
      { id: 'entry-97', username: 'jdoe23', postedAt: 'Mar-17-2024:14:18:41', content: 'I plan to include the discussion portal project in my portfolio because it covers planning, UI, architecture, and teamwork.' },
      { id: 'entry-98', username: 'snguyen12', postedAt: 'Mar-17-2024:14:31:07', content: 'Reflecting on the process also helps us explain the choices we made, which is valuable in interviews and presentations.' },
      { id: 'entry-99', username: 'npatel08', postedAt: 'Mar-17-2024:14:48:21', content: 'I also want to mention how we responded to feedback and improved the project through iterations.' },
      { id: 'entry-100', username: 'drKasi', postedAt: 'Mar-17-2024:15:04:33', content: 'Portfolio quality is improved when students can explain decisions, trade-offs, and outcomes. Reflection is a key part of professional growth.' },
    ],
  },
  {
    id: 'Mar-20-2024:08:23:47',
    courseTitle: courseInfo.title,
    topic: 'Final presentation checklist',
    createdAt: 'Mar-20-2024:08:23:47',
    entries: [
      { id: 'entry-101', username: 'ohaddad21', postedAt: 'Mar-20-2024:08:34:09', content: 'The final presentations should show the core problem, design decisions, testing strategy, and lessons learned.' },
      { id: 'entry-102', username: 'ewalker73', postedAt: 'Mar-20-2024:08:55:42', content: 'A short demo of the working system will also help the class understand the value of each feature.' },
      { id: 'entry-103', username: 'lortega30', postedAt: 'Mar-20-2024:09:13:18', content: 'I would also include time for questions and a brief explanation of what still needs improvement after the demo.' },
      { id: 'entry-104', username: 'mbell26', postedAt: 'Mar-20-2024:09:29:41', content: 'The presentation should keep a close link between requirements, implementation, and evidence of testing.' },
      { id: 'entry-105', username: 'drKasi', postedAt: 'Mar-20-2024:09:44:05', content: 'Your final presentation should communicate both technical achievement and thoughtful evaluation of project limitations and lessons learned.' },
    ],
  },
  {
    id: 'Mar-23-2024:15:31:03',
    courseTitle: courseInfo.title,
    topic: 'Career readiness in software engineering',
    createdAt: 'Mar-23-2024:15:31:03',
    entries: [
      { id: 'entry-106', username: 'npatel08', postedAt: 'Mar-23-2024:15:43:58', content: 'This course is helping us think like professional engineers, not just students solving an assignment.' },
      { id: 'entry-107', username: 'dkim41', postedAt: 'Mar-23-2024:15:57:42', content: 'The most valuable skill so far has been communicating decisions clearly with team members and stakeholders.' },
      { id: 'entry-108', username: 'vliu39', postedAt: 'Mar-23-2024:16:11:20', content: 'I also see the value in documenting trade-offs and explaining why we selected one approach over another.' },
      { id: 'entry-109', username: 'arahman17', postedAt: 'Mar-23-2024:16:24:35', content: 'Career readiness includes both technical confidence and professional communication, especially in team environments.' },
      { id: 'entry-110', username: 'drKasi', postedAt: 'Mar-23-2024:16:39:52', content: 'This course is intended to develop both engineering competence and professional judgment. Your reflections are aligned with that objective.' },
    ],
  },
  {
    id: 'Mar-26-2024:09:14:19',
    courseTitle: courseInfo.title,
    topic: 'Using AI tools responsibly in class',
    createdAt: 'Mar-26-2024:09:14:19',
    entries: [
      { id: 'entry-111', username: 'hsaleh19', postedAt: 'Mar-26-2024:09:26:12', content: 'AI can help us brainstorm and debug, but we still need to understand the final solution we submit.' },
      { id: 'entry-112', username: 'drKasi', postedAt: 'Mar-26-2024:09:41:31', content: 'AI tools can support learning when used critically and transparently. They should enhance reasoning and analysis, not replace it.' },
      { id: 'entry-113', username: 'npatel08', postedAt: 'Mar-26-2024:09:54:02', content: 'I think we should be careful to cite or explain where AI suggestions were used so that our work remains honest and traceable.' },
      { id: 'entry-114', username: 'jdoe23', postedAt: 'Mar-26-2024:10:12:48', content: 'This is especially important in software engineering, because we still need to understand the logic behind any code or design recommendation.' },
      { id: 'entry-115', username: 'pnair32', postedAt: 'Mar-26-2024:10:31:56', content: 'Using AI responsibly means verifying outputs, checking for errors, and learning from the process instead of copying blindly.' },
    ],
  },
  {
    id: 'Mar-29-2024:14:18:45',
    courseTitle: courseInfo.title,
    topic: 'Reflections on teamwork and delivery',
    createdAt: 'Mar-29-2024:14:18:45',
    entries: [
      { id: 'entry-116', username: 'lgomez44', postedAt: 'Mar-29-2024:14:31:27', content: 'My group improved by being explicit about responsibilities and agreeing on a shared communication channel.' },
      { id: 'entry-117', username: 'mbell26', postedAt: 'Mar-29-2024:14:48:16', content: 'I also learned that deadlines become easier to meet when tasks are continuously visible and reviewed.' },
      { id: 'entry-118', username: 'snguyen12', postedAt: 'Mar-29-2024:15:03:09', content: 'Clear accountability helps the team avoid duplicated work and keeps everyone informed about what still needs to be done.' },
      { id: 'entry-119', username: 'ohaddad21', postedAt: 'Mar-29-2024:15:16:44', content: 'I think good delivery depends on regular coordination, honest progress updates, and a willingness to adjust when problems arise.' },
      { id: 'entry-120', username: 'drKasi', postedAt: 'Mar-29-2024:15:31:25', content: 'This is a strong reflection on team dynamics. Delivery quality is usually the result of disciplined communication, planning, and shared accountability.' },
    ],
  },
]

const initialArchivedDiscussions = [
  { id: 'Dec-15-2023:14:20:35', courseTitle: courseInfo.title, topic: 'Midterm review questions', createdAt: 'Dec-15-2023:14:20:35', entries: [{ id: 'archive-entry-1', username: 'drKasi', postedAt: 'Dec-15-2023:14:22:00', content: 'Sample review guide for the midterm exam with core software engineering themes and learning outcomes.' }] },
  { id: 'Dec-18-2023:09:10:20', courseTitle: courseInfo.title, topic: 'Previous semester project examples', createdAt: 'Dec-18-2023:09:10:20', entries: [{ id: 'archive-entry-2', username: 'drKasi', postedAt: 'Dec-18-2023:09:15:11', content: 'Examples of strong capstone projects and evaluation rubrics for project planning and delivery.' }] },
  { id: 'Jan-12-2024:10:08:55', courseTitle: courseInfo.title, topic: 'Course template and grading rubric', createdAt: 'Jan-12-2024:10:08:55', entries: [{ id: 'archive-entry-3', username: 'drKasi', postedAt: 'Jan-12-2024:10:11:33', content: 'Archive of course structure, assignment breakdown, and evaluation criteria for team collaboration and code quality.' }] },
  { id: 'Jan-16-2024:16:41:42', courseTitle: courseInfo.title, topic: 'Sample design documents', createdAt: 'Jan-16-2024:16:41:42', entries: [{ id: 'archive-entry-4', username: 'drKasi', postedAt: 'Jan-16-2024:16:47:09', content: 'Archived design document notes that explain requirements, architecture decisions, and system constraints.' }] },
]

const initialCourseRequests = []

const formatDiscussionKey = (date = new Date()) => {
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  return `${month}-${day}-${year}:${hour}:${minute}:${second}`
}

const CourseBrandMark = ({ compact = false }) => (
  <div className={`brand-mark ${compact ? 'small' : ''}`} aria-label="Course discussion portal logo">
    <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="brandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="52%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <rect x="5" y="8" width="54" height="48" rx="16" fill="url(#brandGlow)" opacity="0.18" />
      <path d="M18 23.5c0-4.4 3.6-8 8-8h16c4.5 0 8 3.6 8 8v12.5c0 4.5-3.5 8-8 8H29.2l-7.7 6.9V44c-4.4 0-8-3.5-8-8V23.5Z" fill="url(#brandGlow)" />
      <path d="M22 26h20M22 31h14M22 36h17" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.92" />
      <circle cx="46" cy="18" r="5" fill="#ffffff" opacity="0.9" />
    </svg>
  </div>
)

const topRightUserBar = (activeUser, onLogout) => (
  <div className="user-area">
    <div className="user-pill">
      <span className="user-avatar">{(activeUser?.name || 'U').charAt(0).toUpperCase()}</span>
      <div className="user-meta">
        <span className="user-name">{activeUser?.username || 'User'}</span>
        <small>{activeUser?.role || 'Member'}</small>
      </div>
    </div>
    <button className="logout-button" onClick={onLogout}>Logout</button>
  </div>
)

const PAGE_SIZE = 5

const getPaginatedItems = (items, currentPage, pageSize = PAGE_SIZE) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safePage - 1) * pageSize

  return {
    totalPages,
    safePage,
    visibleItems: items.slice(startIndex, startIndex + pageSize),
  }
}

const PaginationControls = ({ currentPage, totalPages, onPrev, onNext }) => (
  <div className="pagination-bar">
    <button className="pagination-button" onClick={onPrev} disabled={currentPage <= 1} type="button">
      ← Prev
    </button>
    <span className="pagination-meta">Page {currentPage} of {totalPages}</span>
    <button className="pagination-button" onClick={onNext} disabled={currentPage >= totalPages} type="button">
      Next →
    </button>
  </div>
)

const SessionContext = createContext({ activeUser: null, onLogout: () => {} })

const InstructorLayout = ({ title, backTo = null, children }) => {
  const navigate = useNavigate()
  const { activeUser, onLogout } = useContext(SessionContext)

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <CourseBrandMark compact />
          <div>
            <p className="eyebrow">Course portal</p>
            <h2>{courseInfo.title}</h2>
          </div>
        </div>
        <nav className="nav-menu">
          {['dashboard', 'discussions', 'students', 'archive', 'reports'].map((section) => (
            <button key={section} className="nav-item" onClick={() => navigate(`/instructor/${section}`)}>
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </nav>
      </aside>
      <main className="dashboard-main">
        <header className="topbar">
          <div className="title-wrap">
            <div>
              <p className="eyebrow muted">Instructor workspace</p>
              <h1>{title}</h1>
            </div>
          </div>
          <div className="header-actions">
            {backTo && <button className="back-button" onClick={() => navigate(backTo)}>Back</button>}
            <button className="back-button" onClick={() => navigate('/change-password')}>Change password</button>
            {topRightUserBar(activeUser, onLogout)}
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}

const DiscussionRoute = ({ onSelect, render }) => {
  const { discussionId } = useParams()
  useEffect(() => {
    if (discussionId) onSelect(discussionId)
  }, [discussionId])
  return render()
}

function App() {
  const navigate = useNavigate()
  const [students, setStudents] = useState(initialStudents)
  const [discussions, setDiscussions] = useState(initialDiscussions)
  const [archivedDiscussions, setArchivedDiscussions] = useState(initialArchivedDiscussions)
  const [archiveRequests, setArchiveRequests] = useState([])
  const [courseRequests, setCourseRequests] = useState(initialCourseRequests)
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(initialDiscussions[0]?.id || '')
  const [activeUser, setActiveUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [newStudent, setNewStudent] = useState({ studentId: '', firstname: '', lastname: '', email: '' })
  const [newDiscussion, setNewDiscussion] = useState({ topic: '', content: '' })
  const [newPost, setNewPost] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [reportType, setReportType] = useState('student-summary')
  const [reportMessage, setReportMessage] = useState('')
  const [discussionPage, setDiscussionPage] = useState(1)
  const [studentPage, setStudentPage] = useState(1)
  const [archiveRequestPage, setArchiveRequestPage] = useState(1)
  const [studentDiscussionPage, setStudentDiscussionPage] = useState(1)
  const [studentArchivePage, setStudentArchivePage] = useState(1)
  const [courseRequest, setCourseRequest] = useState({ type: 'enrollment', firstname: '', lastname: '', studentId: '', email: '' })
  const [passwordChange, setPasswordChange] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [discussionSearch, setDiscussionSearch] = useState('')
  const [entrySearch, setEntrySearch] = useState('')
  const [discussionRequests, setDiscussionRequests] = useState([])
  const [requestTopic, setRequestTopic] = useState('')
  const [archiveLookup, setArchiveLookup] = useState('')

  const archiveAccess = useMemo(() => {
    const access = {}
    archiveRequests
      .filter((request) => request.status === 'Approved')
      .forEach((request) => {
        access[request.studentUsername] = [...(access[request.studentUsername] || []), request.archiveId]
      })
    return access
  }, [archiveRequests])

  const allUsers = useMemo(() => [defaultInstructor, ...students], [students])
  const selectedDiscussion = discussions.find((discussion) => discussion.id === selectedDiscussionId) || null
  const filteredDiscussions = discussions.filter((discussion) => {
    const query = discussionSearch.trim().toLowerCase()
    return !query || discussion.topic.toLowerCase().includes(query) || String(discussion.createdAt).toLowerCase().includes(query)
  })
  const pagedDiscussions = getPaginatedItems(filteredDiscussions, discussionPage)
  const pagedStudents = getPaginatedItems(students, studentPage)
  const pagedArchiveRequests = getPaginatedItems(archiveRequests, archiveRequestPage)
  const pagedStudentDiscussions = getPaginatedItems(discussions, studentDiscussionPage)
  const pagedStudentArchive = getPaginatedItems(archivedDiscussions, studentArchivePage)

  const refreshDatabaseData = async () => {
    try {
      const [studentResult, discussionResult, archiveResult, requestResult] = await Promise.all([
        apiRequest('/api/students'),
        apiRequest('/api/discussions'),
        apiRequest('/api/archives'),
        apiRequest('/api/enrollment-requests'),
      ])
      setStudents(studentResult)
      setDiscussions(discussionResult.discussions)
      setArchivedDiscussions(archiveResult.discussions)
      setCourseRequests(requestResult.requests)
      setSelectedDiscussionId((currentId) => discussionResult.discussions.some((item) => item.id === currentId)
        ? currentId
        : discussionResult.discussions[0]?.id || '')
    } catch {
      setErrorMessage('Database data could not be loaded. The server may be unavailable.')
    }
  }

  useEffect(() => {
    refreshDatabaseData()
  }, [])

  const loadDiscussionRequests = async () => {
    try {
      const result = await apiRequest('/api/discussion-requests')
      setDiscussionRequests(result.requests)
    } catch {
      setDiscussionRequests([])
    }
  }

  const loadArchiveRequests = async () => {
    try {
      const path = activeUser?.role === 'Student'
        ? `/api/archive-requests?username=${encodeURIComponent(activeUser.username)}`
        : '/api/archive-requests'
      const result = await apiRequest(path)
      setArchiveRequests(result.requests)
    } catch {
      setArchiveRequests([])
    }
  }

  useEffect(() => {
    if (!activeUser) return
    loadArchiveRequests()
    if (activeUser.role === 'Instructor') loadDiscussionRequests()
  }, [activeUser])

  const normalizeUsername = (value = '') => value.trim().toLowerCase()

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result.error || 'Invalid username or password.')
        return
      }

      const matchedUser = result.user
      setActiveUser(matchedUser)
      setErrorMessage('')
      setSuccessMessage('')

      if (matchedUser.role === 'Instructor') {
        navigate('/instructor/dashboard')
      } else {
        navigate('/student')
      }
    } catch {
      setErrorMessage('The login server is unavailable. Start the server and try again.')
      return
    }
  }

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' })
    setActiveUser(null)
    setFormData({ username: '', password: '' })
    setErrorMessage('')
    setSuccessMessage('')
    navigate('/login')
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setErrorMessage('The new passwords do not match.')
      return
    }
    try {
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ username: activeUser.username, oldPassword: passwordChange.oldPassword, newPassword: passwordChange.newPassword }),
      })
      setPasswordChange({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setErrorMessage('')
      setSuccessMessage('Password changed successfully.')
    } catch (error) {
      setSuccessMessage('')
      setErrorMessage(error.message)
    }
  }

  const handleAddStudent = async (event) => {
    event.preventDefault()
    if (!newStudent.firstname || !newStudent.lastname || !newStudent.studentId || !newStudent.email) {
      setSuccessMessage('Please complete all student fields before creating the account.')
      return
    }

    const duplicate = students.some(
      (student) =>
        student.email.toLowerCase() === newStudent.email.toLowerCase() ||
        String(student.id).toLowerCase() === newStudent.studentId.toLowerCase()
    )

    if (duplicate) {
      setSuccessMessage('A student account with the same ID, email, or generated username already exists.')
      return
    }

    const createdStudent = {
      id: newStudent.studentId,
      firstname: newStudent.firstname,
      lastname: newStudent.lastname,
      email: newStudent.email,
      role: 'Student',
    }

    try {
      await apiRequest('/api/students', {
        method: 'POST',
        body: JSON.stringify({
          ...createdStudent,
          studentId: Number(String(createdStudent.id).replace(/\D/g, '')),
        }),
      })
      await refreshDatabaseData()
    } catch (error) {
      setSuccessMessage(error.message)
      return
    }
    setNewStudent({ studentId: '', firstname: '', lastname: '', email: '' })
    setSuccessMessage('Student account created successfully. Credentials will be sent by email.')
  }

  const handleCourseRequestChange = (event) => {
    const { name, value } = event.target
    setCourseRequest((prev) => ({ ...prev, [name]: value }))
  }

  const handleCourseRequestSubmit = async (event) => {
    event.preventDefault()
    const { type, firstname, lastname, studentId, email } = courseRequest

    if (!firstname.trim() || !lastname.trim() || !studentId.trim() || !email.trim()) {
      setErrorMessage('Please complete your first name, last name, student ID, and email address.')
      return
    }

    const matchingStudent = students.find(
      (student) => String(student.id).toLowerCase() === studentId.trim().toLowerCase() || student.email.toLowerCase() === email.trim().toLowerCase()
    )

    if (type === 'enrollment' && matchingStudent) {
      setErrorMessage('An account with this student ID or email address already exists.')
      return
    }

    if (type === 'withdrawal' && !matchingStudent) {
      setErrorMessage('Use the numeric Student ID linked to your account, such as 2, or confirm your email address.')
      return
    }

    const alreadyRequested = courseRequests.some(
      (request) => request.type === type && request.status === 'Pending review' && String(request.studentId).toLowerCase() === studentId.trim().toLowerCase()
    )

    if (alreadyRequested) {
      setErrorMessage('A pending request already exists for this student.')
      return
    }

    try {
      const numericStudentId = Number(String(studentId).replace(/\D/g, ''))
      await apiRequest('/api/enrollment-requests', {
        method: 'POST',
        body: JSON.stringify({ studentId: numericStudentId, type, firstname: firstname.trim(), lastname: lastname.trim(), email: email.trim() }),
      })
      await refreshDatabaseData()
    } catch (error) {
      setErrorMessage(error.message)
      return
    }

    setCourseRequest({ type, firstname: '', lastname: '', studentId: '', email: '' })
    setErrorMessage('')
    setSuccessMessage(type === 'enrollment' ? 'Enrollment request sent to the instructor.' : 'Withdrawal request sent to the instructor.')
  }

    const handleWithdrawalRequest = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to request withdrawal from ${courseInfo.title}?\n\nYour instructor will review the request. Your account is removed only after it is approved.`
    )
    if (!confirmed) return

    try {
      await apiRequest('/api/enrollment-requests', {
        method: 'POST',
        body: JSON.stringify({ studentId: Number(activeUser.studentId), type: 'withdrawal' }),
      })
      setSuccessMessage('Your withdrawal request was sent to the instructor.')
    } catch (error) {
      setSuccessMessage(error.message)
    }
  }
const handleProcessCourseRequest = async (request) => {
    if (request.type === 'enrollment') {
      let credentials
      try {
        credentials = await apiRequest(`/api/students/${request.studentId}/credentials`, {
          method: 'POST',
          body: JSON.stringify({}),
        })
        await refreshDatabaseData()
      } catch (error) {
        setSuccessMessage(error.message)
        return
      }
      
      const subject = encodeURIComponent(`Your ${courseInfo.title} student account`)
      const body = encodeURIComponent(`Dear ${request.firstname},\n\nYour request to enroll in ${courseInfo.title} has been approved.\n\nUsername: ${credentials.username}\nPassword: ${credentials.password}\n\nPlease use these credentials to sign in.\n\nBest regards,\nDr. Kasi`)
      window.location.href = `mailto:${request.email}?subject=${subject}&body=${body}`
      
      setSuccessMessage(`Enrollment approved for ${request.firstname} ${request.lastname}. An email with the generated credentials is ready.`)
    } else {
      try {
        await apiRequest(`/api/students/${request.studentId}/withdraw`, { method: 'POST' })
        await refreshDatabaseData()
      } catch (error) {
        setSuccessMessage(error.message)
        return
      }
      
      const subject = encodeURIComponent(`Course withdrawal confirmation: ${courseInfo.title}`)
      const body = encodeURIComponent(`Dear ${request.firstname},\n\nYour request to withdraw from ${courseInfo.title} has been processed. Your student account has been removed, while your discussion messages have been retained.\n\nBest regards,\nDr. Kasi`)
      window.location.href = `mailto:${request.email}?subject=${subject}&body=${body}`
      
      setSuccessMessage(`Withdrawal approved for ${request.firstname} ${request.lastname}. A confirmation email is ready.`)
    }

    setCourseRequests((prev) => prev.map((item) => item.id === request.id ? { ...item, status: 'Processed' } : item))
  }

  const handleRemoveStudent = async (studentId) => {
    try {
      await apiRequest(`/api/students/${Number(String(studentId).replace(/\D/g, ''))}`, { method: 'DELETE' })
      await refreshDatabaseData()
    } catch (error) {
      setSuccessMessage(error.message)
      return
    }
    setSuccessMessage('Student removed from the course enrollment.')
  }

  const handleNewDiscussion = async (event) => {
    event.preventDefault()
    if (!newDiscussion.topic.trim()) {
      setSuccessMessage('A discussion topic is required.')
      return
    }
    if (newDiscussion.topic.trim().length > 80) {
      setSuccessMessage('Discussion topics must be 80 characters or fewer.')
      return
    }

    try {
      const result = await apiRequest('/api/discussions', {
        method: 'POST',
        body: JSON.stringify({ topic: newDiscussion.topic, content: newDiscussion.content, username: activeUser.username }),
      })
      await refreshDatabaseData()
      setSelectedDiscussionId(result.id)
    } catch (error) {
      setSuccessMessage(error.message)
      return
    }
    setNewDiscussion({ topic: '', content: '' })
    setSuccessMessage('Discussion created successfully.')
  }

  const handleArchiveDiscussion = async (discussionId) => {
    const discussionToArchive = discussions.find((discussion) => discussion.id === discussionId)
    if (!discussionToArchive) return

    try {
      await apiRequest(`/api/discussions/${discussionId}/archive`, { method: 'POST' })
      await refreshDatabaseData()
    } catch (error) {
      setSuccessMessage(error.message)
      return
    }
    setSelectedDiscussionId('')
    setSuccessMessage(`Discussion archived: ${discussionToArchive.topic}`)
  }

  const handlePostMessage = async () => {
    if (!selectedDiscussion || !newPost.trim() && !attachment) return

    try {
      await apiRequest(`/api/discussions/${selectedDiscussion.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ username: activeUser.username, content: newPost, imageName: attachment?.name, imageType: attachment?.type, imageData: attachment?.data }),
      })
      await refreshDatabaseData()
    } catch (error) {
      setSuccessMessage(error.message)
      return
    }

    setNewPost('')
    setAttachment(null)
    setSuccessMessage('Message posted successfully.')
  }

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setAttachment(null)
      return
    }
    const imageType = file.type === 'image/jpeg' ? 'jpg' : file.type.replace('image/', '')
    if (!['png', 'jpg', 'gif'].includes(imageType)) {
      setSuccessMessage('Only PNG, JPG, and GIF images are allowed.')
      setAttachment(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => setAttachment({ name: file.name, type: imageType, data: reader.result })
    reader.readAsDataURL(file)
  }

  const handleRemoveMessage = async (discussionId, entryId) => {
    try {
      await apiRequest(`/api/messages/${entryId}`, { method: 'DELETE' })
      await refreshDatabaseData()
    } catch (error) {
      setSuccessMessage(error.message)
      return
    }
    setSuccessMessage('The selected message was removed.')
  }

  const handleRequestDiscussion = async (event) => {
    event.preventDefault()
    const topic = requestTopic.trim()
    if (!topic) {
      setSuccessMessage('Please enter a topic.')
      return
    }
    if (topic.length > 80) {
      setSuccessMessage('Discussion topics must be 80 characters or fewer.')
      return
    }
    try {
      await apiRequest('/api/discussion-requests', {
        method: 'POST',
        body: JSON.stringify({ studentId: activeUser.id, topic }),
      })
    } catch (error) {
      setSuccessMessage(error.message)
      return
    }
    setRequestTopic('')
    setSuccessMessage('Your discussion request was sent to the instructor.')
  }

  const handleCreateFromRequest = async (request) => {
    try {
      const result = await apiRequest('/api/discussions', {
        method: 'POST',
        body: JSON.stringify({ topic: request.topic, content: '', username: activeUser.username }),
      })
      await apiRequest('/api/discussion-requests', {
        method: 'DELETE',
        body: JSON.stringify({ studentId: request.studentId, topic: request.topic }),
      })
      await refreshDatabaseData()
      await loadDiscussionRequests()
      setSelectedDiscussionId(result.id)
      setSuccessMessage(`Discussion "${request.topic}" was created.`)
    } catch (error) {
      setSuccessMessage(error.message)
    }
  }

  const handleRequestArchivedDiscussion = async (event) => {
    event.preventDefault()
    const text = archiveLookup.trim().toLowerCase()
    if (!text) {
      setSuccessMessage('Enter the topic or key given by your instructor.')
      return
    }
    const match = archivedDiscussions.find(
      (archive) => archive.topic.toLowerCase() === text || String(archive.createdAt).toLowerCase() === text
    )
    if (!match) {
      setSuccessMessage('No archived discussion matches that topic or key. Ask the instructor for the exact details.')
      return
    }
    const alreadyRequested = archiveRequests.some(
      (request) => request.archiveId === match.id && request.studentUsername === activeUser.username
    )
    if (alreadyRequested) {
      setSuccessMessage(`You already requested ${match.topic}.`)
      return
    }
    try {
      await apiRequest('/api/archive-requests', {
        method: 'POST',
        body: JSON.stringify({ studentId: activeUser.id, topic: match.topic }),
      })
      await loadArchiveRequests()
    } catch (error) {
      setSuccessMessage(error.message)
      return
    }
    setArchiveLookup('')
    setSuccessMessage(`Request sent for ${match.topic}.`)
  }

  const handleSendArchiveEmail = async (request) => {
    try {
      await apiRequest('/api/archive-requests/approve', {
        method: 'POST',
        body: JSON.stringify({ studentId: request.studentId, topic: request.topic }),
      })
      await loadArchiveRequests()
      setSuccessMessage(`Approved. The archived copy was emailed to ${request.studentUsername}.`)
    } catch (error) {
      setSuccessMessage(error.message)
    }
  }

  const renderLoginPage = () => (
    <div className="login-page">
      <div className="login-panel">
        <div className="brand-block">
          <CourseBrandMark />
          <div>
            <p className="eyebrow">Course discussion portal</p>
            <h1>{courseInfo.title}</h1>
          </div>
        </div>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <div className="form-header">
            <h2>Welcome to Online Discussion Tool</h2>
            <p>Sign in to continue to your course discussion tools.</p>
          </div>

          <label className="field-label" htmlFor="username">Username</label>
          <input id="username" name="username" type="text" placeholder="Enter username" value={formData.username} onChange={handleLoginChange} />

          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" placeholder="Enter password" value={formData.password} onChange={handleLoginChange} />

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="signin-button">Sign in</button>
          <button type="button" className="new-student-link" onClick={() => { setErrorMessage(''); navigate('/student-request') }}>New student?</button>
        </form>
      </div>

      <div className="info-panel">
        <div className="info-card">
          <span className="badge">Single-course portal</span>
          <h3>Manage discussions securely and efficiently.</h3>
          <p>
            Instructors can enroll or remove students, create archiveable discussions, monitor messages,
            and control retrieval of archived discussions. Students can view discussions, post entries,
            and request archived material.
          </p>
        </div>

        <div className="mini-stats">
          <div><strong>Admin</strong><span>Instructor</span></div>
          <div><strong>Live</strong><span>Discussions</span></div>
          <div><strong>Archive</strong><span>Safe storage</span></div>
        </div>
      </div>
    </div>
  )

  const renderStudentRequestPage = () => (
    <div className="request-page">
      <div className="request-panel">
        <div className="brand-block">
          <CourseBrandMark />
          <div>
            <p className="eyebrow">Course discussion portal</p>
            <h1>Course access request</h1>
          </div>
        </div>
        <div className="card-panel request-form-panel">
          <div className="panel-header"><div><h3>Request course access</h3><p className="form-note">The instructor will review your request and email the result.</p></div></div>
          <form className="stack-form" onSubmit={handleCourseRequestSubmit}>
        
            <label className="field-label" htmlFor="requestFirstname">Firstname</label>
            <input id="requestFirstname" name="firstname" type="text" value={courseRequest.firstname} onChange={handleCourseRequestChange} required />
            <label className="field-label" htmlFor="requestLastname">Lastname</label>
            <input id="requestLastname" name="lastname" type="text" value={courseRequest.lastname} onChange={handleCourseRequestChange} required />
            <label className="field-label" htmlFor="requestStudentId">Student ID</label>
            <input id="requestStudentId" name="studentId" type="text" value={courseRequest.studentId} onChange={handleCourseRequestChange} required />
            <label className="field-label" htmlFor="requestEmail">Email address</label>
            <input id="requestEmail" name="email" type="email" value={courseRequest.email} onChange={handleCourseRequestChange} required />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <div className="alert-box">{successMessage}</div>}
            <button type="submit" className="primary-btn">Send request</button>
            <button type="button" className="back-link" onClick={() => { setErrorMessage(''); setSuccessMessage(''); navigate('/login') }}>Back to sign in</button>
          </form>
        </div>
      </div>
      <div className="info-panel request-info-panel">
        <div className="info-card">
          <span className="badge">{courseInfo.title}</span>
          <h3>{courseRequest.type === 'enrollment' ? 'Start your course workspace.' : 'Leave the course with a clear record.'}</h3>
          <p>{courseRequest.type === 'enrollment' ? 'Submit your details to request an account. If approved, your instructor will send your generated login credentials by email.' : 'Submit your details to request withdrawal. Your account will be removed after approval, but your discussion messages will remain available in the course record.'}</p>
        </div>
      </div>
    </div>
  )

  const renderChangePasswordPage = () => (
    <InstructorLayout title="Change password" backTo={activeUser?.role === 'Instructor' ? '/instructor/dashboard' : '/student'}>
      <section className="content-grid single-column">
        <div className="card-panel password-panel">
          <div className="panel-header"><h3>Change password</h3></div>
          <form className="stack-form" onSubmit={handleChangePassword}>
            <label className="field-label" htmlFor="oldPassword">Old password</label>
            <input id="oldPassword" type="password" value={passwordChange.oldPassword} onChange={(event) => setPasswordChange((prev) => ({ ...prev, oldPassword: event.target.value }))} required />
            <label className="field-label" htmlFor="newPassword">New password</label>
            <input id="newPassword" type="password" value={passwordChange.newPassword} onChange={(event) => setPasswordChange((prev) => ({ ...prev, newPassword: event.target.value }))} required />
            <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" value={passwordChange.confirmPassword} onChange={(event) => setPasswordChange((prev) => ({ ...prev, confirmPassword: event.target.value }))} required />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <div className="alert-box">{successMessage}</div>}
            <button className="primary-btn" type="submit">Save password</button>
          </form>
        </div>
      </section>
    </InstructorLayout>
  )

  const handleGenerateReport = (event) => {
    event.preventDefault()

    const reportMap = {
      'student-summary': {
        title: 'Student summary report',
        description: `The ${courseInfo.title} course currently has ${students.length} enrolled students. The roster includes students with varied participation levels and active engagement across course discussions.`,
        details: students.map((student) => ({
          label: `${student.firstname} ${student.lastname}`,
          value: `${student.username} • ${student.email} • ${student.id}`,
        })),
      },
      'discussion-activity': {
        title: 'Discussion activity report',
        description: `This report tracks ${discussions.length} active discussions and ${archivedDiscussions.length} archived discussion records for the course.`,
        details: discussions.map((discussion) => ({
          label: discussion.topic,
          value: `${discussion.entries.length} posts • Updated ${discussion.createdAt}`,
        })),
      },
      'archive-requests': {
        title: 'Archive retrieval report',
        description: `${archiveRequests.length} archive requests are pending or approved. All requests are reviewed before archived materials are shared with students.`,
        details: archiveRequests.length > 0
          ? archiveRequests.map((request) => ({
              label: request.topic,
              value: `${request.studentUsername} • ${request.status} • ${request.requestedAt}`,
            }))
          : [{ label: 'No archive requests', value: 'There are currently no pending archive retrieval requests.' }],
      },
      'course-overview': {
        title: 'Course overview report',
        description: `${courseInfo.title} contains ${discussions.length} active topics, ${students.length} active learners, and ${archivedDiscussions.length} archived discussions. The course is live and progressing as expected.`,
        details: [
          { label: 'Course title', value: courseInfo.title },
          { label: 'Instructor', value: defaultInstructor.name },
          { label: 'Current discussions', value: `${discussions.length} active discussion threads` },
          { label: 'Archived records', value: `${archivedDiscussions.length} saved discussion files` },
          { label: 'Enrollment', value: `${students.length} registered students` },
        ],
      },
    }

    setReportMessage(reportMap[reportType] || { title: 'No report selected', description: 'Please choose a report option.', details: [] })
  }

  const renderInstructorOverview = () => (
    <InstructorLayout title="Instructor Dashboard">
      <section className="stats-grid">
        <div className="stat-card accent"><span>Active discussions</span><strong>{discussions.length}</strong></div>
        <div className="stat-card"><span>Students enrolled</span><strong>{students.length}</strong></div>
        <div className="stat-card"><span>Archived</span><strong>{archivedDiscussions.length}</strong></div>
        <div className="stat-card"><span>Course</span><strong>1</strong></div>
      </section>

      {successMessage && <div className="alert-box">{successMessage}</div>}

      <section className="overview-launch-grid">
        <button className="overview-card" onClick={() => navigate('/instructor/discussions')}>
          <span className="overview-card-label">Discussions</span>
          <strong>{discussions.length} active topics</strong>
          <small>Open discussion management</small>
        </button>

        <button className="overview-card" onClick={() => navigate('/instructor/students')}>
          <span className="overview-card-label">Students</span>
          <strong>{students.length} enrolled learners</strong>
          <small>Manage enrollment</small>
        </button>

        <button className="overview-card" onClick={() => navigate('/instructor/archive')}>
          <span className="overview-card-label">Archive</span>
          <strong>{archiveRequests.length} retrieval requests</strong>
          <small>Retrieve and send file</small>
        </button>

        <button className="overview-card" onClick={() => navigate('/instructor/reports')}>
          <span className="overview-card-label">Reports</span>
          <strong>{reportType ? 'Prepared' : 'Ready'}</strong>
          <small>Generate course reports</small>
        </button>
      </section>
    </InstructorLayout>
  )

  const renderStudentPage = () => {
    const visibleArchived = archivedDiscussions.filter((archive) => {
      const allowed = archiveAccess[activeUser?.username] || []
      return allowed.includes(archive.id)
    })

    return (
      <div className="student-shell">
        <header className="student-topbar">
          <div className="title-wrap">
            <div>
              <p className="eyebrow muted">Student portal</p>
              <h1>{courseInfo.title}</h1>
            </div>
          </div>
          <div className="header-actions">
            <button className="back-button" onClick={() => navigate('/change-password')}>Change password</button>
            <button className="back-button" onClick={handleWithdrawalRequest}>Request withdrawal</button>
           {topRightUserBar(activeUser, handleLogout)}
          </div>
        </header>

        {successMessage && <div className="alert-box">{successMessage}</div>}

        <div className="student-layout">
          <section className="student-card">
            <h2>Available discussions</h2>
            {pagedStudentDiscussions.visibleItems.map((discussion) => (
              <div key={discussion.id} className="student-discussion-row">
                <div><strong>{discussion.topic}</strong><p>{discussion.entries.length} messages</p></div>
                <button className="secondary-btn" onClick={() => setSelectedDiscussionId(discussion.id)}>Open</button>
              </div>
            ))}
            {discussions.length > PAGE_SIZE && (
              <PaginationControls
                currentPage={pagedStudentDiscussions.safePage}
                totalPages={pagedStudentDiscussions.totalPages}
                onPrev={() => setStudentDiscussionPage((page) => Math.max(1, page - 1))}
                onNext={() => setStudentDiscussionPage((page) => Math.min(pagedStudentDiscussions.totalPages, page + 1))}
              />
            )}
          </section>

          <section className="student-card">
            <h2>Selected discussion</h2>
            {selectedDiscussion ? (
              <>
                <div className="discussion-header"><h4>{selectedDiscussion.topic}</h4><span>{selectedDiscussion.createdAt}</span></div>
                <div className="entries-list">
                  {selectedDiscussion.entries.map((entry) => (
                    <div key={entry.id} className="entry-box">
                      <div className="entry-title-row"><strong>{entry.username}</strong><span>{entry.postedAt}</span></div>
                      <p>{entry.content}</p>
                      {entry.imageUrl && (
                        <div className="entry-image-wrap">
                          <img src={entry.imageUrl} alt={entry.imageName || 'Posted attachment'} className="entry-image" />
                          <a href={entry.imageUrl} target="_blank" rel="noreferrer">Open image</a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="reply-box">
                  <div className="post-box">
                    <textarea rows="3" placeholder="Write a message to join the discussion" value={newPost} onChange={(event) => setNewPost(event.target.value)} />
                    <label className="attach-button" title="Add image to message">
                      +
                      <input type="file" accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif" onChange={handleAttachmentChange} />
                    </label>
                  </div>
                  {attachment && (
                    <div className="attachment-preview">
                      <span>{attachment.name}</span>
                      <button type="button" className="secondary-btn tiny-inline" onClick={() => setAttachment(null)}>Remove</button>
                    </div>
                  )}
                  <button className="primary-btn" onClick={handlePostMessage}>Post message</button>
                </div>
              </>
            ) : <p>No discussion selected.</p>}
          </section>
        </div>

        <section className="student-card">
          <h2>Request a new discussion</h2>
          <form className="stack-form" onSubmit={handleRequestDiscussion}>
            <input type="text" maxLength={80} placeholder="Topic (80 characters or fewer)" value={requestTopic} onChange={(event) => setRequestTopic(event.target.value)} />
            <button type="submit" className="primary-btn">Send request</button>
          </form>
        </section>

        <section className="archive-card">
          <h2>Request an archived discussion</h2>
          <form className="stack-form" onSubmit={handleRequestArchivedDiscussion}>
            <input type="text" placeholder="Topic or key (example: Jan-24-2024:11:34:28)" value={archiveLookup} onChange={(event) => setArchiveLookup(event.target.value)} />
            <button type="submit" className="primary-btn">Send request</button>
          </form>
          {archiveRequests.map((request) => (
            <div key={request.id} className="student-discussion-row">
              <div><strong>{request.topic}</strong><p>{request.status}</p></div>
            </div>
          ))}
          {visibleArchived.length > 0 && (
            <div className="retrieval-panel">
              <h3>Retrieved archive copies</h3>
              {visibleArchived.map((archive) => (
                <div key={archive.id} className="entry-box">
                  <div className="entry-title-row"><strong>{archive.topic}</strong><span>{archive.createdAt}</span></div>
                  <p>{archive.entries.map((entry) => `${entry.username}: ${entry.content}`).join(' | ')}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

  const renderDiscussionDetail = () => {
    const query = entrySearch.trim().toLowerCase()
    const visibleEntries = (selectedDiscussion?.entries || []).filter(
      (entry) => !query || entry.username.toLowerCase().includes(query) || String(entry.postedAt).toLowerCase().includes(query)
    )

    return (
      <InstructorLayout title="Discussion detail" backTo="/instructor/discussions">
        <section className="content-grid single-column">
          <div className="card-panel discussion-window">
            <div className="panel-header"><h3>Selected discussion</h3></div>
            {selectedDiscussion ? (
              <>
                <div className="discussion-header"><h4>{selectedDiscussion.topic}</h4><span>{selectedDiscussion.createdAt}</span></div>
                <input type="text" placeholder="Search entries by username or date" value={entrySearch} onChange={(event) => setEntrySearch(event.target.value)} />
                <div className="entries-list">
                  {visibleEntries.length === 0 && <p>No entries found.</p>}
                  {visibleEntries.map((entry) => (
                    <div key={entry.id} className="entry-box">
                      <div className="entry-title-row"><strong>{entry.username}</strong><span>{entry.postedAt}</span><button className="tiny-btn" onClick={() => handleRemoveMessage(selectedDiscussion.id, entry.id)}>Remove</button></div>
                      <p>{entry.content}</p>
                      {entry.imageUrl && <div className="entry-image-wrap"><img src={entry.imageUrl} alt={entry.imageName || 'Posted attachment'} className="entry-image" /></div>}
                    </div>
                  ))}
                </div>
                <div className="reply-box">
                  <div className="post-box">
                    <textarea rows="3" placeholder="Post a message to this discussion" value={newPost} onChange={(event) => setNewPost(event.target.value)} />
                    <label className="attach-button" title="Add image to message">
                      +
                      <input type="file" accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif" onChange={handleAttachmentChange} />
                    </label>
                  </div>
                  {attachment && (
                    <div className="attachment-preview">
                      <span>{attachment.name}</span>
                      <button type="button" className="secondary-btn tiny-inline" onClick={() => setAttachment(null)}>Remove</button>
                    </div>
                  )}
                  <button className="primary-btn" onClick={handlePostMessage}>Post message</button>
                </div>
              </>
            ) : <p>No discussion selected.</p>}
          </div>
        </section>
      </InstructorLayout>
    )
  }

  const renderInstructorArchivePage = () => (
    <InstructorLayout title="Archive and retrieval" backTo="/instructor/dashboard">
      <section className="content-grid single-column">
        <div className="card-panel">
          <div className="panel-header"><h3>Archived discussions</h3></div>
          <div className="mini-list">
            {archivedDiscussions.length === 0 ? <p>No archived discussions yet.</p> : archivedDiscussions.map((archive) => (
              <div key={archive.id} className="student-row">
                <div><strong>{archive.topic}</strong><span>{archive.entries?.length || 0} posts</span><small>Key: {archive.createdAt}</small></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-panel">
          <div className="panel-header"><h3>Retrieval requests</h3></div>
          {successMessage && <div className="alert-box">{successMessage}</div>}
          <div className="mini-list">
            {archiveRequests.length === 0 ? <p>No archive requests yet.</p> : pagedArchiveRequests.visibleItems.map((request) => (
              <div key={request.id} className="student-row">
                <div><strong>{request.topic}</strong><span>{request.studentUsername} · {request.status}</span><small>{request.requestedAt}</small></div>
                {request.status !== 'Approved' && <button className="secondary-btn" onClick={() => handleSendArchiveEmail(request)}>Retrieve and send file</button>}
              </div>
            ))}
            {archiveRequests.length > PAGE_SIZE && <PaginationControls currentPage={pagedArchiveRequests.safePage} totalPages={pagedArchiveRequests.totalPages} onPrev={() => setArchiveRequestPage((page) => Math.max(1, page - 1))} onNext={() => setArchiveRequestPage((page) => Math.min(pagedArchiveRequests.totalPages, page + 1))} />}
          </div>
        </div>
      </section>
    </InstructorLayout>
  )

  return (
    <SessionContext.Provider value={{ activeUser, onLogout: handleLogout }}>
    <Routes>
      <Route path="/login" element={activeUser ? <Navigate to={activeUser.role === 'Instructor' ? '/instructor/dashboard' : '/student'} replace /> : renderLoginPage()} />
      <Route path="/student-request" element={activeUser?.role === 'Instructor' ? <Navigate to="/instructor/dashboard" replace /> : renderStudentRequestPage()} />
      <Route path="/change-password" element={activeUser ? renderChangePasswordPage() : <Navigate to="/login" replace />} />
      <Route path="/student" element={activeUser?.role === 'Student' ? renderStudentPage() : <Navigate to="/login" replace />} />
      <Route path="/instructor/dashboard" element={activeUser?.role === 'Instructor' ? renderInstructorOverview() : <Navigate to="/login" replace />} />
      <Route path="/instructor/discussions" element={activeUser?.role === 'Instructor' ? <InstructorLayout title="Discussion management" backTo="/instructor/dashboard"><section className="content-grid single-column"><div className="card-panel"><div className="panel-header"><h3>Discussion management</h3></div><div className="mini-list"><h4>Student requests for new discussions</h4>{discussionRequests.length === 0 ? <p>No requests.</p> : discussionRequests.map((request) => (<div key={`${request.studentId}-${request.topic}`} className="student-row"><div><strong>{request.topic}</strong><span>{request.studentUsername}</span></div><button className="secondary-btn" onClick={() => handleCreateFromRequest(request)}>Create</button></div>))}</div><form className="stack-form" onSubmit={handleNewDiscussion}><input type="text" maxLength={80} placeholder="Discussion topic" value={newDiscussion.topic} onChange={(event) => setNewDiscussion((prev) => ({ ...prev, topic: event.target.value }))} /><textarea rows="3" placeholder="First post or discussion description" value={newDiscussion.content} onChange={(event) => setNewDiscussion((prev) => ({ ...prev, content: event.target.value }))} /><button type="submit" className="primary-btn">Create discussion</button></form><input type="text" placeholder="Search by topic or date (example: Jan-24-2024)" value={discussionSearch} onChange={(event) => { setDiscussionSearch(event.target.value); setDiscussionPage(1) }} /><div className="discussion-list bordered">{pagedDiscussions.visibleItems.map((discussion) => (<div key={discussion.id} className="discussion-item"><div><h4>{discussion.topic}</h4><p>{discussion.entries.length} posts</p></div><div className="button-row"><button className="secondary-btn" onClick={() => { setSelectedDiscussionId(discussion.id); navigate(`/instructor/discussions/${discussion.id}`) }}>View</button><button className="danger-btn" onClick={() => handleArchiveDiscussion(discussion.id)}>Archive</button></div></div>))}{filteredDiscussions.length > PAGE_SIZE && <PaginationControls currentPage={pagedDiscussions.safePage} totalPages={pagedDiscussions.totalPages} onPrev={() => setDiscussionPage((page) => Math.max(1, page - 1))} onNext={() => setDiscussionPage((page) => Math.min(pagedDiscussions.totalPages, page + 1))} />}</div></div></section></InstructorLayout> : <Navigate to="/login" replace />} />
      <Route path="/instructor/students" element={activeUser?.role === 'Instructor' ? <InstructorLayout title="Student enrollment" backTo="/instructor/dashboard"><section className="content-grid single-column"><div className="card-panel"><div className="panel-header"><h3>Student enrollment</h3></div>{successMessage && <div className="alert-box">{successMessage}</div>}<div className="request-list">{courseRequests.length === 0 ? <p>No student requests yet.</p> : courseRequests.map((request) => (<div key={request.id} className="request-item"><div><strong>{request.type === 'enrollment' ? 'Enrollment request' : 'Withdrawal request'}: {request.firstname} {request.lastname}</strong><span>{request.studentId} · {request.email}</span><small>{request.requestedAt} · {request.status}</small></div>{request.status === 'Pending review' && <button className="secondary-btn" onClick={() => handleProcessCourseRequest(request)}>{request.type === 'enrollment' ? 'Approve and email credentials' : 'Approve withdrawal'}</button>}</div>))}</div><h3 className="section-heading">Manual enrollment</h3><form className="stack-form" onSubmit={handleAddStudent}><input type="text" placeholder="Student ID" value={newStudent.studentId} onChange={(event) => setNewStudent((prev) => ({ ...prev, studentId: event.target.value }))} /><input type="text" placeholder="First name" value={newStudent.firstname} onChange={(event) => setNewStudent((prev) => ({ ...prev, firstname: event.target.value }))} /><input type="text" placeholder="Last name" value={newStudent.lastname} onChange={(event) => setNewStudent((prev) => ({ ...prev, lastname: event.target.value }))} /><input type="email" placeholder="Email address" value={newStudent.email} onChange={(event) => setNewStudent((prev) => ({ ...prev, email: event.target.value }))} /><button type="submit" className="primary-btn">Add student</button></form><div className="mini-list">{pagedStudents.visibleItems.map((student) => (<div key={student.id} className="student-row"><div><strong>{student.firstname} {student.lastname}</strong><span>{student.username}</span></div><div className="button-row"><button className="secondary-btn" onClick={() => setSuccessMessage(`Student ${student.username} is enrolled in ${courseInfo.title}.`)}>Active</button><button className="danger-btn" onClick={() => handleRemoveStudent(student.id)}>Remove</button></div></div>))}{students.length > PAGE_SIZE && <PaginationControls currentPage={pagedStudents.safePage} totalPages={pagedStudents.totalPages} onPrev={() => setStudentPage((page) => Math.max(1, page - 1))} onNext={() => setStudentPage((page) => Math.min(pagedStudents.totalPages, page + 1))} />}</div></div></section></InstructorLayout> : <Navigate to="/login" replace />} />
      <Route path="/instructor/archive" element={activeUser?.role === 'Instructor' ? renderInstructorArchivePage() : <Navigate to="/login" replace />} />
      <Route path="/instructor/reports" element={activeUser?.role === 'Instructor' ? <InstructorLayout title="Course reports" backTo="/instructor/dashboard"><section className="content-grid single-column"><div className="card-panel"><div className="panel-header"><h3>Generate report</h3></div><form className="report-controls" onSubmit={handleGenerateReport}><label className="field-label" htmlFor="reportType">Report option</label><select id="reportType" value={reportType} onChange={(event) => setReportType(event.target.value)}><option value="student-summary">Student summary</option><option value="discussion-activity">Discussion activity</option><option value="archive-requests">Archive requests</option><option value="course-overview">Course overview</option></select><button type="submit" className="primary-btn">Generate report</button></form>{reportMessage && <div className="report-box"><strong>{reportMessage.title}</strong><p>{reportMessage.description}</p>{reportMessage.details && reportMessage.details.length > 0 && <ul className="report-list">{reportMessage.details.map((detail) => <li key={`${detail.label}-${detail.value}`}><span>{detail.label}</span><small>{detail.value}</small></li>)}</ul>}</div>}<div className="mini-list"><div className="student-row"><div><strong>Active discussions</strong><span>{discussions.length} current topics</span></div><span className="status-tag active">Live</span></div><div className="student-row"><div><strong>Students enrolled</strong><span>{students.length} registered learners</span></div><span className="status-tag active">Updated</span></div><div className="student-row"><div><strong>Archived discussions</strong><span>{archivedDiscussions.length} saved records</span></div><span className="status-tag archived">Archive</span></div></div></div></section></InstructorLayout> : <Navigate to="/login" replace />} />
      <Route path="/instructor/discussions/:discussionId" element={activeUser?.role === 'Instructor' ? <DiscussionRoute onSelect={setSelectedDiscussionId} render={renderDiscussionDetail} /> : <Navigate to="/login" replace />} />
      <Route path="/" element={<Navigate to={activeUser ? (activeUser.role === 'Instructor' ? '/instructor/dashboard' : '/student') : '/login'} replace />} />
    </Routes>
    </SessionContext.Provider>
  )
}

export default App
