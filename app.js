const DATES = [
  ["9/28", "MON", false],
  ["9/29", "TUE", true],
  ["9/30", "WED", false],
  ["10/1", "THU", false],
  ["10/2", "FRI", false],
  ["10/3", "SAT", false, true],
  ["10/4", "SUN", false, true],
  ["10/5", "MON", false],
  ["10/6", "TUE", false],
];

const DEFAULT_ROWS = [
  { type: "row", name: "Possible Weather", cells: ["—","—","—","—","—","—","—","—","—"] },
  { type: "section", name: "CIVIL", kind: "civil" },
  { type: "row", name: "Silt Fence", cells: ["—","—","—","—","—","—","—","—","—"] },
  { type: "row", name: "Clear and Grub", cells: ["Zone 3","Zone 3","Zone 3 & 10","Zone 3 & 10","Zone 3 & 10","—","—","Zone 3 & 10","Zone 3 & 10"] },
  { type: "row", name: "Gravel Laydown", cells: ["QTY","QTY","QTY\nFinal Grade","QTY\nFinal Grade","QTY\nFinal Grade","QTY","QTY","QTY","QTY"] },
  { type: "row", name: "Site Grade", cells: ["QTY","QTY","QTY","QTY","QTY","QTY","QTY","QTY","QTY"] },
  { type: "row", name: "Strip Road Topsoil", cells: ["QTY","QTY","QTY","QTY","QTY","QTY","QTY","QTY","QTY"] },
  { type: "row", name: "Build Road Subgrade", cells: ["Rd 1","Rd 1","Rd 1","QTY","QTY","QTY","QTY","QTY","QTY"] },
  { type: "row", name: "Gravel Road", cells: ["QTY","QTY","QTY","QTY","QTY","QTY","QTY","QTY","QTY"] },
  { type: "row", name: "Low Water Crossing", cells: ["QTY","QTY","QTY","QTY","QTY","QTY","QTY","QTY","QTY"] },
  { type: "row", name: "Substation Pad", cells: ["QTY","QTY","QTY","QTY","QTY","QTY","QTY","QTY","QTY"] },
  { type: "row", name: "Notes", cells: ["+ Add activity…","","","","","","","",""] },
  { type: "section", name: "ELECTRICAL", kind: "elec" },
  { type: "row", name: "Inverter Vault (Excavate)", cells: ["","","","","","","","",""] },
  { type: "row", name: "Inverter Vault (Conduit/Grounding)", cells: ["","","","","","","","",""] },
  { type: "row", name: "Inverter Vault (Backfill/Pea Gravel)", cells: ["","","","","","","","",""] },
  { type: "row", name: "Boring", cells: ["","","","","","","","",""] },
  { type: "row", name: "MV Trench", cells: ["","","","","","","","",""] },
];

const DEFAULT_USERS = [
  { name: "Jenny Holwell", role: "Project admin", email: "demo.jenny@localhost" },
  { name: "Site engineer", role: "Editor", email: "demo.eng@localhost" },
  { name: "Viewer", role: "Read only", email: "demo.view@localhost" },
];

const store = {
  project: "Hackberry Creek",
  owner: "Jenny Holwell",
  rows: JSON.parse(JSON.stringify(DEFAULT_ROWS)),
  users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
};

try {
  const saved = localStorage.getItem("lookahead-admin-demo");
  if (saved) Object.assign(store, JSON.parse(saved));
} catch (e) {}

const view = document.getElementById("viewLookahead");
const drawer = document.getElementById("drawer");
const toast = document.getElementById("toast");

function notify(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 2200);
}

function save() {
  localStorage.setItem("lookahead-admin-demo", JSON.stringify(store));
  document.getElementById("status").textContent = "Saved in this browser";
  notify("Saved locally");
}

function editing() {
  return document.getElementById("editMode").checked;
}

function renderGrid() {
  document.getElementById("projectName").textContent = store.project;
  document.getElementById("ownerName").textContent = store.owner;
  let head = `<tr><th class="act">Activity</th>`;
  DATES.forEach((d) => {
    head += `<th class="${d[2] ? "today" : d[3] ? "wknd" : ""}">${d[0]}<br>${d[1]}</th>`;
  });
  head += "</tr>";
  let body = "";
  store.rows.forEach((row, r) => {
    if (row.type === "section") {
      body += `<tr class="section ${row.kind || ""}"><td class="act ${row.kind || ""}" colspan="${DATES.length + 1}">${esc(row.name)}</td></tr>`;
      return;
    }
    body += `<tr><td class="act" ${editing() ? "contenteditable=\"true\"" : ""} data-r="${r}" data-f="name">${esc(row.name)}</td>`;
    (row.cells || []).forEach((cell, c) => {
      const cls = DATES[c] && DATES[c][2] ? "today-col" : DATES[c] && DATES[c][3] ? "wknd" : "";
      body += `<td class="${cls}" ${editing() ? "contenteditable=\"true\"" : ""} data-r="${r}" data-c="${c}">${esc(cell).replaceAll("\n", "<br>")}</td>`;
    });
    body += "</tr>";
  });
  view.innerHTML = `<table><thead>${head}</thead><tbody>${body}</tbody></table>`;
  view.querySelectorAll("[contenteditable]").forEach(el => {
    el.addEventListener("blur", () => {
      const r = +el.dataset.r;
      if (el.dataset.f === "name") store.rows[r].name = el.innerText.trim();
      else store.rows[r].cells[+el.dataset.c] = el.innerText.replace(/\n$/, "");
      document.getElementById("status").textContent = "Unsaved changes";
    });
  });
}

function esc(s) {
  return String(s ?? "").replace(/[&<>]/g, ch => ({ "&": "&", "<": "<", ">": ">" }[ch]));
}

function openDrawer(title, html) {
  drawer.classList.add("open");
  drawer.innerHTML = `<h2>${title}</h2>${html}`;
}

document.getElementById("editMode").addEventListener("change", renderGrid);
document.getElementById("addActivity").onclick = () => {
  store.rows.push({ type: "row", name: "New activity", cells: DATES.map(() => "") });
  renderGrid();
};
document.getElementById("addSection").onclick = () => {
  store.rows.push({ type: "section", name: "NEW SECTION", kind: "civil" });
  renderGrid();
};
document.getElementById("saveBtn").onclick = save;
document.getElementById("resetBtn").onclick = () => {
  if (!confirm("Reset demo data in this browser?")) return;
  localStorage.removeItem("lookahead-admin-demo");
  store.project = "Hackberry Creek";
  store.owner = "Jenny Holwell";
  store.rows = JSON.parse(JSON.stringify(DEFAULT_ROWS));
  store.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
  renderGrid();
  notify("Demo reset");
};
document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "lookahead-demo.json";
  a.click();
};
document.getElementById("usersBtn").onclick = () => {
  openDrawer("Users & roles (demo)", store.users.map((u, i) => `
    <div class="user-row">
      <div><strong>${esc(u.name)}</strong><br><span style="color:#8aa0b5">${esc(u.email)} · ${esc(u.role)}</span></div>
      <button class="btn danger" data-del="${i}">Remove</button>
    </div>`).join("") + `
    <div class="field"><label>Name</label><input id="un" /></div>
    <div class="field"><label>Email</label><input id="ue" /></div>
    <div class="field"><label>Role</label>
      <select id="ur"><option>Project admin</option><option>Editor</option><option>Read only</option></select>
    </div>
    <button class="btn primary" id="addUser">Add demo user</button>
    <p style="color:#8aa0b5;font-size:12px">Demo accounts only. They cannot sign into the private Replit app.</p>`);
  drawer.querySelector("#addUser").onclick = () => {
    store.users.push({
      name: drawer.querySelector("#un").value || "New user",
      email: drawer.querySelector("#ue").value || "demo@localhost",
      role: drawer.querySelector("#ur").value,
    });
    document.getElementById("usersBtn").click();
  };
  drawer.querySelectorAll("[data-del]").forEach(btn => {
    btn.onclick = () => { store.users.splice(+btn.dataset.del, 1); document.getElementById("usersBtn").click(); };
  });
};
document.getElementById("settingsBtn").onclick = () => {
  openDrawer("Project settings (demo)", `
    <div class="field"><label>Project</label><input id="sp" value="${esc(store.project)}" /></div>
    <div class="field"><label>Owner display name</label><input id="so" value="${esc(store.owner)}" /></div>
    <button class="btn primary" id="applySet">Apply</button>
  `);
  drawer.querySelector("#applySet").onclick = () => {
    store.project = drawer.querySelector("#sp").value;
    store.owner = drawer.querySelector("#so").value;
    renderGrid();
    notify("Settings updated in demo");
  };
};
document.getElementById("todayBtn").onclick = () => {
  const el = view.querySelector(".today-col");
  if (el) el.scrollIntoView({ inline: "center", block: "nearest" });
};
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const v = btn.dataset.view;
    if (v === "lookahead") {
      document.getElementById("pageTitle").textContent = "3-Week Look Ahead";
      renderGrid();
    } else if (v === "admin") {
      document.getElementById("usersBtn").click();
      document.getElementById("pageTitle").textContent = "Admin console";
    } else {
      view.innerHTML = `<div style="padding:24px"><h2>${btn.textContent}</h2><p>Placeholder screen in the local demo.</p></div>`;
    }
  };
});
document.getElementById("menuBtn").onclick = () => {
  document.querySelector("aside").classList.toggle("open");
};
renderGrid();
