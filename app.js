"use strict";

const STORAGE_KEY = "helpdesk-lite.tickets.v1";
const MAX_TICKETS = 500;
const MAX_UPDATES_PER_TICKET = 30;
const STATUSES = ["Open", "In progress", "Waiting", "Resolved"];
const PRIORITIES = ["Urgent", "High", "Normal", "Low"];
const CATEGORIES = ["Technical issue", "Billing", "Account access", "How-to question", "Other"];
const ASSIGNEES = ["Unassigned", "Maya", "Ko Aung", "Support team"];
const PRIORITY_SCORE = { Urgent: 4, High: 3, Normal: 2, Low: 1 };

const els = {
  storageStatus: document.querySelector("#storage-status"),
  ticketList: document.querySelector("#ticket-list"),
  resultCount: document.querySelector("#result-count"),
  filterSummary: document.querySelector("#filter-summary"),
  search: document.querySelector("#ticket-search"),
  statusFilter: document.querySelector("#status-filter"),
  priorityFilter: document.querySelector("#priority-filter"),
  categoryFilter: document.querySelector("#category-filter"),
  sortOrder: document.querySelector("#sort-order"),
  detail: document.querySelector("#ticket-detail"),
  newDialog: document.querySelector("#new-ticket-dialog"),
  newForm: document.querySelector("#new-ticket-form"),
  resetDialog: document.querySelector("#reset-dialog"),
  newMessage: document.querySelector("#new-ticket-message"),
  dueDate: document.querySelector("#ticket-due-date"),
};

function nowISO() {
  return new Date().toISOString();
}

function localDateISO(date) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateISO(date);
}

els.dueDate.min = localDateISO(new Date());

function makeSampleTickets() {
  return [
    {
      id: "HD-2026-1042",
      requesterName: "May Thiri",
      requesterEmail: "may@example.com",
      subject: "Order confirmation email never arrived",
      category: "Technical issue",
      priority: "High",
      status: "Open",
      assignee: "Maya",
      description: "I placed an order this morning, but I did not receive the confirmation email. The payment page said the order was successful. Could you check whether the order went through?",
      dueDate: daysFromNow(1),
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2),
      updates: [
        { author: "System", text: "Ticket created from the support queue sample.", createdAt: hoursAgo(2) }
      ],
    },
    {
      id: "HD-2026-1038",
      requesterName: "Ko Min",
      requesterEmail: "min@example.com",
      subject: "Need a copy of last month's invoice",
      category: "Billing",
      priority: "Normal",
      status: "In progress",
      assignee: "Ko Aung",
      description: "Please send a copy of the invoice for last month. I need it for our internal expense records.",
      dueDate: daysFromNow(2),
      createdAt: hoursAgo(19),
      updatedAt: hoursAgo(4),
      updates: [
        { author: "System", text: "Ticket created from the support queue sample.", createdAt: hoursAgo(19) },
        { author: "Ko Aung", text: "Checking the billing history before sending the invoice copy.", createdAt: hoursAgo(4) },
      ],
    },
    {
      id: "HD-2026-1031",
      requesterName: "Aye Chan",
      requesterEmail: "aye@example.com",
      subject: "Cannot sign in after changing phone",
      category: "Account access",
      priority: "Urgent",
      status: "Waiting",
      assignee: "Maya",
      description: "I changed my phone and can no longer complete sign-in verification. I can access my email account, but the old number is unavailable.",
      dueDate: localDateISO(new Date()),
      createdAt: hoursAgo(42),
      updatedAt: hoursAgo(9),
      updates: [
        { author: "System", text: "Ticket created from the support queue sample.", createdAt: hoursAgo(42) },
        { author: "Maya", text: "Asked the customer to confirm the account email and provide an alternate verification detail.", createdAt: hoursAgo(9) },
      ],
    },
    {
      id: "HD-2026-1026",
      requesterName: "Nandar Win",
      requesterEmail: "nandar@example.com",
      subject: "How can I update the shop opening hours?",
      category: "How-to question",
      priority: "Low",
      status: "Resolved",
      assignee: "Support team",
      description: "I need to change the opening hours shown on my shop profile for the upcoming holiday.",
      dueDate: "",
      createdAt: hoursAgo(72),
      updatedAt: hoursAgo(27),
      updates: [
        { author: "System", text: "Ticket created from the support queue sample.", createdAt: hoursAgo(72) },
        { author: "Support team", text: "Shared the profile-editing steps and the customer confirmed the change worked.", createdAt: hoursAgo(27) },
      ],
    },
    {
      id: "HD-2026-1019",
      requesterName: "Thant Zin",
      requesterEmail: "thant@example.com",
      subject: "Product page displays the wrong thumbnail",
      category: "Technical issue",
      priority: "Normal",
      status: "Open",
      assignee: "Unassigned",
      description: "One product page is displaying an older photo. The product details look correct, only the thumbnail seems out of date.",
      dueDate: daysFromNow(-1),
      createdAt: hoursAgo(98),
      updatedAt: hoursAgo(98),
      updates: [
        { author: "System", text: "Ticket created from the support queue sample.", createdAt: hoursAgo(98) }
      ],
    },
  ];
}

function cleanString(value, maxLength) {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

function normalizeTicket(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = cleanString(raw.id, 40);
  const subject = cleanString(raw.subject, 140).trim();
  if (!id || !subject) return null;

  const updates = Array.isArray(raw.updates)
    ? raw.updates.slice(-MAX_UPDATES_PER_TICKET).map(function (item) {
      return {
        author: cleanString(item && item.author, 80) || "Team",
        text: cleanString(item && item.text, 1000),
        createdAt: cleanString(item && item.createdAt, 40) || nowISO(),
      };
    }).filter(function (item) { return item.text.trim(); })
    : [];

  return {
    id,
    requesterName: cleanString(raw.requesterName, 100),
    requesterEmail: cleanString(raw.requesterEmail, 160),
    subject,
    category: CATEGORIES.includes(raw.category) ? raw.category : "Other",
    priority: PRIORITIES.includes(raw.priority) ? raw.priority : "Normal",
    status: STATUSES.includes(raw.status) ? raw.status : "Open",
    assignee: ASSIGNEES.includes(raw.assignee) ? raw.assignee : "Unassigned",
    description: cleanString(raw.description, 2400),
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(raw.dueDate || "") ? raw.dueDate : "",
    createdAt: cleanString(raw.createdAt, 40) || nowISO(),
    updatedAt: cleanString(raw.updatedAt, 40) || cleanString(raw.createdAt, 40) || nowISO(),
    updates,
  };
}

function readStoredTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tickets)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.tickets.slice(0, MAX_TICKETS).map(normalizeTicket).filter(Boolean);
  } catch (error) {
    setStorageStatus("Browser storage unavailable");
    return null;
  }
}

function setStorageStatus(text) {
  els.storageStatus.textContent = text;
}

let tickets = readStoredTickets();
if (tickets === null) tickets = makeSampleTickets();
let selectedId = tickets.length ? tickets[0].id : null;

function saveTickets() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tickets: tickets.slice(0, MAX_TICKETS) }));
    setStorageStatus("Saved in this browser");
    return true;
  } catch (error) {
    setStorageStatus("Could not save to browser storage");
    return false;
  }
}

function getTicket(id) {
  return tickets.find(function (ticket) { return ticket.id === id; }) || null;
}

function createId() {
  const taken = new Set(tickets.map(function (ticket) { return ticket.id; }));
  const year = new Date().getFullYear();
  let id;
  do {
    id = "HD-" + year + "-" + String(Math.floor(1000 + Math.random() * 9000));
  } while (taken.has(id));
  return id;
}

function formatDate(dateString) {
  if (!dateString) return "Not set";
  const date = new Date(dateString.length === 10 ? dateString + "T12:00:00" : dateString);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function relativeDate(dateString) {
  const date = new Date(dateString);
  const elapsed = Date.now() - date.getTime();
  if (!Number.isFinite(elapsed)) return "Date unknown";
  if (elapsed < 60 * 60 * 1000) return "Updated recently";
  if (elapsed < 24 * 60 * 60 * 1000) return Math.floor(elapsed / (60 * 60 * 1000)) + "h ago";
  if (elapsed < 48 * 60 * 60 * 1000) return "Yesterday";
  return Math.floor(elapsed / (24 * 60 * 60 * 1000)) + "d ago";
}

function initials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map(function (part) {
    return part.charAt(0).toUpperCase();
  }).join("") || "?";
}

function classSlug(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function makeChip(text, className) {
  const chip = document.createElement("span");
  chip.className = className;
  chip.textContent = text;
  return chip;
}

function currentFilters() {
  return {
    query: els.search.value.trim().toLowerCase(),
    status: els.statusFilter.value,
    priority: els.priorityFilter.value,
    category: els.categoryFilter.value,
    sort: els.sortOrder.value,
  };
}

function filteredTickets() {
  const filter = currentFilters();
  const result = tickets.filter(function (ticket) {
    const matchesQuery = !filter.query || [
      ticket.id, ticket.subject, ticket.requesterName, ticket.requesterEmail, ticket.description, ticket.category,
    ].some(function (value) { return String(value || "").toLowerCase().includes(filter.query); });
    return matchesQuery &&
      (filter.status === "all" || ticket.status === filter.status) &&
      (filter.priority === "all" || ticket.priority === filter.priority) &&
      (filter.category === "all" || ticket.category === filter.category);
  });

  result.sort(function (a, b) {
    if (filter.sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (filter.sort === "priority") {
      const diff = PRIORITY_SCORE[b.priority] - PRIORITY_SCORE[a.priority];
      return diff || (new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (filter.sort === "updated") return new Date(b.updatedAt) - new Date(a.updatedAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return result;
}

function renderMetrics() {
  const count = function (status) {
    return tickets.filter(function (ticket) { return ticket.status === status; }).length;
  };
  document.querySelector("#metric-total").textContent = String(tickets.length);
  document.querySelector("#metric-open").textContent = String(count("Open"));
  document.querySelector("#metric-progress").textContent = String(count("In progress"));
  document.querySelector("#metric-waiting").textContent = String(count("Waiting"));
  document.querySelector("#metric-resolved").textContent = String(count("Resolved"));
}

function renderQueue(visible) {
  els.ticketList.replaceChildren();
  els.resultCount.textContent = visible.length + (visible.length === 1 ? " ticket" : " tickets");
  els.filterSummary.textContent = visible.length === tickets.length ? "Showing all tickets" : "Showing " + visible.length + " of " + tickets.length;

  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = tickets.length ? "No tickets match these filters. Try changing your search or filters." : "No tickets yet. Create a new ticket to start the queue.";
    els.ticketList.append(empty);
    selectedId = null;
    return;
  }

  visible.forEach(function (ticket) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "ticket-card" + (ticket.id === selectedId ? " is-selected" : "");
    card.dataset.ticketId = ticket.id;
    card.setAttribute("aria-pressed", ticket.id === selectedId ? "true" : "false");

    const head = document.createElement("span");
    head.className = "ticket-card-head";
    const number = document.createElement("span");
    number.className = "ticket-number";
    number.textContent = ticket.id;
    const date = document.createElement("span");
    date.className = "ticket-date";
    date.textContent = relativeDate(ticket.updatedAt);
    head.append(number, date);

    const subject = document.createElement("span");
    subject.className = "ticket-subject";
    subject.textContent = ticket.subject;

    const description = document.createElement("span");
    description.className = "ticket-description";
    description.textContent = ticket.description;

    const bottom = document.createElement("span");
    bottom.className = "ticket-card-bottom";
    const tags = document.createElement("span");
    tags.className = "ticket-tags";
    tags.append(
      makeChip(ticket.status, "status-chip status-" + classSlug(ticket.status)),
      makeChip(ticket.priority, "priority-chip priority-" + classSlug(ticket.priority)),
      makeChip(ticket.category, "category-chip")
    );
    const person = document.createElement("span");
    person.className = "ticket-person";
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = initials(ticket.assignee === "Unassigned" ? "?" : ticket.assignee);
    const assignee = document.createElement("span");
    assignee.textContent = ticket.assignee;
    person.append(avatar, assignee);
    bottom.append(tags, person);
    card.append(head, subject, description, bottom);
    els.ticketList.append(card);
  });
}

function addActivityNode(parent, update) {
  const item = document.createElement("div");
  item.className = "activity-item";
  const mark = document.createElement("span");
  mark.className = "activity-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = initials(update.author);
  const body = document.createElement("div");
  body.className = "activity-body";
  const title = document.createElement("p");
  title.className = "activity-title";
  title.textContent = update.author;
  const text = document.createElement("p");
  text.className = "activity-text";
  text.textContent = update.text;
  const date = document.createElement("p");
  date.className = "activity-date";
  date.textContent = formatDateTime(update.createdAt);
  body.append(title, text, date);
  item.append(mark, body);
  parent.append(item);
}

function addActivity(ticket, author, text) {
  ticket.updates.push({ author: author, text: text, createdAt: nowISO() });
  ticket.updates = ticket.updates.slice(-MAX_UPDATES_PER_TICKET);
  ticket.updatedAt = nowISO();
}

function renderDetail(ticket) {
  if (!ticket) {
    els.detail.innerHTML = '<div class="empty-detail"><span class="empty-detail-icon" aria-hidden="true">▤</span><h2 id="detail-heading">Select a ticket</h2><p>Choose a request from the queue to see its details, update its status, and add a note.</p></div>';
    return;
  }

  els.detail.innerHTML =
    '<div class="detail-heading-row"><div><p class="detail-ticket-id" id="detail-ticket-id"></p><h2 class="detail-subject" id="detail-subject"></h2><div class="detail-chips" id="detail-chips"></div></div><button class="link-button" id="delete-ticket-btn" type="button">Delete</button></div>' +
    '<div class="detail-requester"><span class="requester-avatar" id="detail-requester-avatar" aria-hidden="true"></span><div><p class="requester-name" id="detail-requester-name"></p><p class="requester-email" id="detail-requester-email"></p></div></div>' +
    '<section><p class="detail-label">Issue details</p><p class="detail-description" id="detail-description"></p></section>' +
    '<div class="detail-meta-grid"><div class="meta-cell"><label>Created</label><strong id="detail-created"></strong></div><div class="meta-cell"><label>Target follow-up</label><strong id="detail-due"></strong></div></div>' +
    '<div class="detail-controls"><div><label for="detail-status">Status</label><select class="form-select" id="detail-status"><option>Open</option><option>In progress</option><option>Waiting</option><option>Resolved</option></select></div>' +
    '<div><label for="detail-priority">Priority</label><select class="form-select" id="detail-priority"><option>Urgent</option><option>High</option><option>Normal</option><option>Low</option></select></div>' +
    '<div class="control-full"><label for="detail-assignee">Assigned to</label><select class="form-select" id="detail-assignee"><option>Unassigned</option><option>Maya</option><option>Ko Aung</option><option>Support team</option></select></div></div>' +
    '<div class="timeline-heading"><h3>Activity and updates</h3><span class="timeline-count" id="activity-count"></span></div>' +
    '<div class="activity-list" id="activity-list"></div>' +
    '<form class="update-form" id="update-form"><label for="update-note">Add an internal update</label><textarea class="form-control" id="update-note" maxlength="1000" rows="3" placeholder="Record a step taken, question asked, or next action..." required></textarea><button class="btn btn-primary w-100" type="submit">Add update</button></form>' +
    '<p class="detail-message" id="detail-message" role="status" aria-live="polite"></p>';

  document.querySelector("#detail-ticket-id").textContent = ticket.id;
  document.querySelector("#detail-subject").textContent = ticket.subject;
  document.querySelector("#detail-requester-avatar").textContent = initials(ticket.requesterName);
  document.querySelector("#detail-requester-name").textContent = ticket.requesterName;
  document.querySelector("#detail-requester-email").textContent = ticket.requesterEmail;
  document.querySelector("#detail-description").textContent = ticket.description;
  document.querySelector("#detail-created").textContent = formatDateTime(ticket.createdAt);
  document.querySelector("#detail-due").textContent = dueLabel(ticket);
  document.querySelector("#detail-status").value = ticket.status;
  document.querySelector("#detail-priority").value = ticket.priority;
  document.querySelector("#detail-assignee").value = ticket.assignee;

  const chips = document.querySelector("#detail-chips");
  chips.append(
    makeChip(ticket.status, "status-chip status-" + classSlug(ticket.status)),
    makeChip(ticket.priority + " priority", "priority-chip priority-" + classSlug(ticket.priority)),
    makeChip(ticket.category, "category-chip")
  );

  const activityList = document.querySelector("#activity-list");
  const updates = ticket.updates.slice().reverse();
  document.querySelector("#activity-count").textContent = updates.length + (updates.length === 1 ? " update" : " updates");
  if (!updates.length) {
    const empty = document.createElement("p");
    empty.className = "activity-date";
    empty.textContent = "No updates yet. Add the first note below.";
    activityList.append(empty);
  } else {
    updates.forEach(function (update) { addActivityNode(activityList, update); });
  }

  document.querySelector("#detail-status").addEventListener("change", function (event) {
    const nextStatus = event.target.value;
    if (!STATUSES.includes(nextStatus) || nextStatus === ticket.status) return;
    const previous = ticket.status;
    ticket.status = nextStatus;
    addActivity(ticket, "System", "Status changed from " + previous + " to " + nextStatus + ".");
    saveTickets();
    renderAll();
  });

  document.querySelector("#detail-priority").addEventListener("change", function (event) {
    const nextPriority = event.target.value;
    if (!PRIORITIES.includes(nextPriority) || nextPriority === ticket.priority) return;
    const previous = ticket.priority;
    ticket.priority = nextPriority;
    addActivity(ticket, "System", "Priority changed from " + previous + " to " + nextPriority + ".");
    saveTickets();
    renderAll();
  });

  document.querySelector("#detail-assignee").addEventListener("change", function (event) {
    const nextAssignee = event.target.value;
    if (!ASSIGNEES.includes(nextAssignee) || nextAssignee === ticket.assignee) return;
    const previous = ticket.assignee;
    ticket.assignee = nextAssignee;
    addActivity(ticket, "System", "Assignment changed from " + previous + " to " + nextAssignee + ".");
    saveTickets();
    renderAll();
  });

  document.querySelector("#update-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const input = document.querySelector("#update-note");
    const note = input.value.trim();
    if (!note) {
      input.focus();
      return;
    }
    addActivity(ticket, ticket.assignee === "Unassigned" ? "Support team" : ticket.assignee, note);
    saveTickets();
    renderAll();
  });

  document.querySelector("#delete-ticket-btn").addEventListener("click", function () {
    if (!window.confirm("Delete ticket " + ticket.id + " and its local update history?")) return;
    tickets = tickets.filter(function (item) { return item.id !== ticket.id; });
    selectedId = tickets.length ? tickets[0].id : null;
    saveTickets();
    renderAll();
  });
}

function dueLabel(ticket) {
  if (!ticket.dueDate) return "Not set";
  const due = new Date(ticket.dueDate + "T00:00:00");
  const today = new Date(localDateISO(new Date()) + "T00:00:00");
  if (ticket.status !== "Resolved" && due < today) return formatDate(ticket.dueDate) + " · overdue";
  return formatDate(ticket.dueDate);
}

function renderAll() {
  renderMetrics();
  const visible = filteredTickets();
  if (!visible.some(function (ticket) { return ticket.id === selectedId; })) {
    selectedId = visible.length ? visible[0].id : null;
  }
  renderQueue(visible);
  renderDetail(getTicket(selectedId));
}

function makeCsvCell(value) {
  let text = String(value == null ? "" : value);
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function exportCsv() {
  if (!tickets.length) {
    setStorageStatus("There are no tickets to export");
    return;
  }
  const headers = ["Ticket ID", "Subject", "Customer", "Customer Email", "Category", "Priority", "Status", "Assignee", "Created", "Target Follow-up", "Issue Details", "Latest Update"];
  const rows = tickets.map(function (ticket) {
    const latest = ticket.updates.length ? ticket.updates[ticket.updates.length - 1].text : "";
    return [
      ticket.id, ticket.subject, ticket.requesterName, ticket.requesterEmail, ticket.category,
      ticket.priority, ticket.status, ticket.assignee, ticket.createdAt, ticket.dueDate,
      ticket.description, latest,
    ].map(makeCsvCell).join(",");
  });
  const csv = [headers.map(makeCsvCell).join(",")].concat(rows).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "helpdesk-tickets-" + localDateISO(new Date()) + ".csv";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  setStorageStatus("CSV exported");
}

document.querySelector("#open-ticket-btn").addEventListener("click", function () {
  els.newMessage.textContent = "";
  els.newForm.reset();
  els.dueDate.min = localDateISO(new Date());
  if (typeof els.newDialog.showModal === "function") els.newDialog.showModal();
});

document.querySelectorAll("[data-close-dialog]").forEach(function (button) {
  button.addEventListener("click", function () {
    const dialog = document.getElementById(button.dataset.closeDialog);
    if (dialog) dialog.close();
  });
});

els.newForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!els.newForm.checkValidity()) {
    els.newForm.reportValidity();
    return;
  }
  if (tickets.length >= MAX_TICKETS) {
    els.newMessage.textContent = "The local demo limit is 500 tickets. Delete an older ticket before creating another.";
    return;
  }

  const data = Object.fromEntries(new FormData(els.newForm).entries());
  const created = nowISO();
  const ticket = {
    id: createId(),
    requesterName: data.requesterName.trim(),
    requesterEmail: data.requesterEmail.trim(),
    subject: data.subject.trim(),
    category: CATEGORIES.includes(data.category) ? data.category : "Other",
    priority: PRIORITIES.includes(data.priority) ? data.priority : "Normal",
    status: "Open",
    assignee: ASSIGNEES.includes(data.assignee) ? data.assignee : "Unassigned",
    description: data.description.trim(),
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(data.dueDate || "") ? data.dueDate : "",
    createdAt: created,
    updatedAt: created,
    updates: [{ author: "System", text: "Ticket created.", createdAt: created }],
  };

  tickets.unshift(ticket);
  selectedId = ticket.id;
  saveTickets();
  els.newForm.reset();
  els.newDialog.close();
  renderAll();
});

els.ticketList.addEventListener("click", function (event) {
  const button = event.target.closest("[data-ticket-id]");
  if (!button) return;
  selectedId = button.dataset.ticketId;
  renderAll();
});

[els.search, els.statusFilter, els.priorityFilter, els.categoryFilter, els.sortOrder].forEach(function (control) {
  control.addEventListener(control === els.search ? "input" : "change", renderAll);
});

document.querySelector("#clear-filters-btn").addEventListener("click", function () {
  els.search.value = "";
  els.statusFilter.value = "all";
  els.priorityFilter.value = "all";
  els.categoryFilter.value = "all";
  els.sortOrder.value = "newest";
  renderAll();
});

document.querySelector("#export-csv-btn").addEventListener("click", exportCsv);

document.querySelector("#sample-reset-btn").addEventListener("click", function () {
  if (typeof els.resetDialog.showModal === "function") els.resetDialog.showModal();
  else if (window.confirm("Reset all tickets to the original fictional sample data?")) resetToSamples();
});

els.resetDialog.addEventListener("close", function () {
  if (els.resetDialog.returnValue === "confirm") resetToSamples();
});

function resetToSamples() {
  tickets = makeSampleTickets();
  selectedId = tickets.length ? tickets[0].id : null;
  saveTickets();
  renderAll();
}

function init() {
  saveTickets();
  renderAll();
}

init();