# HelpDesk Lite — Support Ticket Tracker

HelpDesk Lite is a small-business support queue prototype. It lets a team record customer requests, mark priorities, assign ownership, track resolution status, and keep an activity trail in one place.

**Live demo:** [Open HelpDesk Lite](https://helpdesk-lite-wdf-5618s-projects.vercel.app)  
**Source code:** https://github.com/wdf-5618/helpdesk-lite

## Features

- Start with five fictional sample tickets that show different categories, priorities, and statuses.
- Create tickets with customer contact details, subject, issue description, category, priority, target follow-up date, and assignee.
- Filter by status, priority, or category; search the subject, ticket ID, customer, email, and description.
- Sort by newest, oldest, priority, or most recently updated.
- Update status, priority, and assignee from the ticket details.
- Record internal notes and keep a simple activity history for each ticket.
- Review queue counts for Open, In progress, Waiting, and Resolved tickets.
- Export the ticket queue as CSV for further analysis.
- Save tickets in localStorage so the queue survives refreshes in the same browser.
- Responsive layout, semantic controls, visible focus styles, and status announcements.

## Run locally

No build step or package installation is required. From the repository root, run:

~~~bash
python -m http.server 8000
~~~

Then open [http://localhost:8000](http://localhost:8000).

## Project structure

~~~text
helpdesk-lite/
├── index.html   # Queue workspace, filters, and ticket dialogs
├── styles.css   # Responsive dashboard and ticket details
├── app.js       # Ticket state, activity, filters, storage, and CSV export
└── README.md
~~~

## Implementation notes

- The app uses HTML, CSS, Bootstrap 5, and vanilla JavaScript.
- Ticket records are normalized when read from browser storage and bounded to 500 tickets and 30 updates per ticket.
- Ticket content is placed into DOM nodes as text. CSV values are quoted, and spreadsheet formula-like prefixes are neutralized before export.
- The queue data is stored under a versioned localStorage key.

## Scope and limitations

This is a learning prototype, not a real customer support service. Tickets live only in the current browser profile. The app does not send email, notify customers, assign real teammates, sync between devices, or connect to a shared support queue. Example requests and assignees are fictional.

Do not enter confidential customer details into a public demo. A production help desk would need authentication, server-side storage, role-based access, server-side validation, secure audit logs, and a notification process.

## Manual test checklist

- [x] Create a ticket with valid details and check the required fields.
- [x] Change status, priority, and assignee; confirm an activity entry appears.
- [x] Add an update note and confirm it survives refresh.
- [x] Search for a ticket by customer and ticket ID and confirm the filter shows the matching ticket.
- [x] Combine status, priority, and category filters and confirm the matching ticket.
- [x] Export CSV and confirm its column headers and ticket rows.
- [x] Reset the demo and confirm fictional sample data returns.
- [x] Check the layout on a narrow mobile screen and confirm no horizontal overflow.

The source has been checked for JavaScript syntax, duplicate HTML IDs, missing DOM selectors, and the main ticket workflow has been smoke-tested in a headless browser. The public production URL has been smoke-tested with a headless browser. The automated checks cover the main interactions but do not replace testing across a wider range of browsers and devices.
