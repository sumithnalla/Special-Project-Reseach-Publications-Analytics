const toastEl = document.getElementById("toast");
const dialog = document.getElementById("appDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogBody = document.getElementById("dialogBody");

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastEl.classList.remove("show"), 2600);
}
function showDialog(title, html) {
  dialogTitle.textContent = title;
  dialogBody.innerHTML = html;
  dialog.showModal();
}
document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const page = button.dataset.page;
    document.getElementById("pageTitle").textContent = page;
    document.getElementById("sidebar").classList.remove("open");
    if (page !== "Dashboard") {
      const messages = {
        "Statistics": "Statistics overview: Total earning is 242.65K and the conversation rate is 74.86%.",
        "Transaction": "Recent transactions are represented in the Top Store table. Export the table to download a CSV.",
        "My Team": "Your sales team currently has four members. Select a member to view their profile.",
        "Sell Reports": "Weekly sales are displayed in the Regular Sell chart. Use Export to download store data.",
        "Settings": "Settings panel: dashboard notifications are enabled. Contact your administrator to change account settings."
      };
      showDialog(page, `<p>${messages[page]}</p>`);
    }
  });
});
document.getElementById("mobileMenu").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("helpBtn").addEventListener("click", () => showDialog("Dashboard help", "<p>Use the left navigation to switch dashboard sections. Select Export to download the store table, or select a team member to view their details.</p>"));
document.getElementById("notificationBtn").addEventListener("click", () => showDialog("Notifications", "<p><strong>Daily meeting:</strong> Your team meeting is scheduled for today.</p><p><strong>Sales update:</strong> Weekly sales report is ready to review.</p>"));
document.getElementById("logoutBtn").addEventListener("click", () => showDialog("Log out", "<p>This is a demo dashboard. Connect an authentication service to enable real account logout.</p>"));
document.getElementById("upgradeBtn").addEventListener("click", () => showDialog("Upgrade to Pro", "<p>Pro plan: $4.20 per month, billed annually at $50. This demo does not process payments.</p>"));
document.getElementById("meetingBtn").addEventListener("click", () => showDialog("Daily meeting", "<p>Your meeting link will appear here when a video-conferencing URL is connected.</p>"));
document.getElementById("storeRatioBtn").addEventListener("click", () => showDialog("Store Sell Ratio", "<p>Solaris Sparkle: 25%<br>Crimson Rush: 18%<br>Indigo Zephyr: 27%<br>Roseate Crest: 30%</p>"));
document.getElementById("topItemBtn").addEventListener("click", () => showDialog("Top items sold", "<p>1. Residential listings<br>2. Commercial spaces<br>3. Featured property packages</p>"));
document.getElementById("shareBtn").addEventListener("click", async () => {
  const text = "Top Store — Solaris Sparkle, Crimson Rush, Indigo Zephyr, Roseate Crest";
  if (navigator.share) {
    try { await navigator.share({title:"Top Store", text}); } catch (_) {}
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    toast("Top store summary copied");
  } else toast("Sharing is not supported in this browser");
});
document.getElementById("exportBtn").addEventListener("click", () => {
  const rows = [...document.querySelectorAll("#storeTable tr")].map(row =>
    [...row.querySelectorAll("th,td")].map(cell => `"${cell.textContent.trim().replaceAll('"','""')}"`).join(",")
  );
  const blob = new Blob([rows.join("\n")], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "top-stores.csv"; a.click();
  URL.revokeObjectURL(url);
  toast("CSV report downloaded");
});
document.querySelectorAll(".team-row").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.person;
    showDialog(name, `<p><strong>Department:</strong> Sales</p><p><strong>Status:</strong> Active</p><p><strong>Role:</strong> Sales associate</p>`);
  });
});
document.getElementById("addMemberBtn").addEventListener("click", () => {
  showDialog("Add team member", `<form id="memberForm"><label>Name</label><input name="name" required placeholder="Enter member name"><label>Role</label><input name="role" required placeholder="e.g. Sales associate"><button class="dark-btn" type="submit">Add member</button></form>`);
  document.getElementById("memberForm").addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get("name").trim();
    const role = data.get("role").trim();
    if (!name || !role) return;
    const initials = name.split(/\s+/).map(part => part[0]).join("").slice(0,2).toUpperCase();
    const row = document.createElement("button");
    row.className = "team-row";
    row.dataset.person = name;
    const avatar = document.createElement("span");
    avatar.className = "person-avatar";
    avatar.textContent = initials;
    const label = document.createElement("span");
    label.textContent = name;
    const arrow = document.createElement("b");
    arrow.textContent = "›";
    row.append(avatar,label,arrow);
    row.addEventListener("click", () => showDialog(name, `<p><strong>Department:</strong> Sales</p><p><strong>Role:</strong> ${escapeHtml(role)}</p><p><strong>Status:</strong> Active</p>`));
    document.getElementById("teamList").appendChild(row);
    dialog.close();
    toast(`${name} added to the team`);
  });
});
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
