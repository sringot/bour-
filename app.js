(() => {
  "use strict";

  const STORE_KEY = "semaine.plans.v1";
  const PROFILE_KEY = "semaine.profile.v1";
  const COLORS = ["#374785", "#F76C6C", "#F8E9A1", "#A8D0E6"];
  const AVATARS = ["🙂", "😎", "🦊", "🐻", "🌸", "🌙", "⭐", "🍀"];

  // ---------- State ----------

  let plans = load();
  let selectedDate = toKey(new Date());
  let weekStart = mondayOf(new Date());
  let editingId = null;
  let selectedColor = COLORS[0];
  let view = "week";
  let profile = loadProfile();
  let obAvatar = AVATARS[0];

  // ---------- Storage ----------

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(plans));
  }

  function loadProfile() {
    try {
      const p = JSON.parse(localStorage.getItem(PROFILE_KEY));
      return p && p.name ? p : null;
    } catch {
      return null;
    }
  }

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  // ---------- Date utils ----------

  function toKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function fromKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function mondayOf(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const shift = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - shift);
    return d;
  }

  function addDays(date, n) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  function weekDays() {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }

  const fmtMonth = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
  const fmtDow = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
  const fmtFull = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const fmtGroup = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "short" });

  // ---------- Elements ----------

  const $ = (id) => document.getElementById(id);
  const monthLabel = $("monthLabel");
  const todayBtn = $("todayBtn");
  const weekStrip = $("weekStrip");
  const dayLabel = $("dayLabel");
  const planList = $("planList");
  const overlay = $("overlay");
  const sheet = $("sheet");
  const form = $("planForm");
  const fTitle = $("fTitle");
  const fStart = $("fStart");
  const fEnd = $("fEnd");
  const fDate = $("fDate");
  const fNote = $("fNote");
  const colorRow = $("colorRow");
  const deleteBtn = $("deleteBtn");
  const saveBtn = $("saveBtn");

  // ---------- Rendering ----------

  function render() {
    $("weekView").hidden = view !== "week";
    $("upcomingView").hidden = view !== "upcoming";
    $("navWeek").classList.toggle("active", view === "week");
    $("navUpcoming").classList.toggle("active", view === "upcoming");

    if (view === "upcoming") {
      renderUpcoming();
      return;
    }

    renderGreeting();

    const days = weekDays();
    const todayKey = toKey(new Date());

    monthLabel.textContent = fmtMonth.format(days[3]);
    todayBtn.hidden = mondayOf(new Date()).getTime() === weekStart.getTime();

    weekStrip.innerHTML = "";
    for (const day of days) {
      const key = toKey(day);
      const pill = document.createElement("button");
      pill.className = "day-pill";
      pill.type = "button";
      if (key === selectedDate) pill.classList.add("selected");
      if (key === todayKey) pill.classList.add("today");
      if (plans.some((p) => p.date === key)) pill.classList.add("has-plans");
      pill.innerHTML = `
        <span class="dow">${fmtDow.format(day).replace(".", "")}</span>
        <span class="num">${day.getDate()}</span>
        <span class="dot"></span>`;
      pill.addEventListener("click", () => {
        selectedDate = key;
        render();
      });
      weekStrip.appendChild(pill);
    }

    dayLabel.textContent = fmtFull.format(fromKey(selectedDate));
    renderList();
  }

  function renderList() {
    const items = plans
      .filter((p) => p.date === selectedDate)
      .sort((a, b) => a.start.localeCompare(b.start));

    planList.innerHTML = "";

    if (items.length === 0) {
      planList.innerHTML = `
        <div class="empty">
          <div class="circle"></div>
          <p>Rien de prévu ce jour</p>
        </div>`;
      return;
    }

    items.forEach((item, i) => planList.appendChild(makeCard(item, i)));
  }

  function makeCard(item, i) {
    const card = document.createElement("button");
    card.className = "plan-card";
    card.type = "button";
    card.style.setProperty("--plan-color", item.color);
    card.style.setProperty("--i", i);
    const time = item.end ? `${item.start} – ${item.end}` : item.start;
    card.innerHTML = `
      <div class="time">${time}</div>
      <div class="title"></div>
      ${item.note ? '<div class="note"></div>' : ""}`;
    card.querySelector(".title").textContent = item.title;
    if (item.note) card.querySelector(".note").textContent = item.note;
    card.addEventListener("click", () => openSheet(item));
    return card;
  }

  function renderGreeting() {
    if (!profile) return;
    const hour = new Date().getHours();
    $("greetWord").textContent = (hour >= 18 || hour < 5 ? "Bonsoir, " : "Bonjour, ");
    $("greetName").textContent = profile.name;
    $("avatarEmoji").textContent = profile.avatar;

    const now = new Date();
    const todayKey = toKey(now);
    const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const next = plans
      .filter((p) => p.date > todayKey || (p.date === todayKey && p.start >= hm))
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))[0];

    if (!next) {
      $("greetSub").textContent = "Rien de prévu pour l'instant";
      return;
    }
    const tomorrowKey = toKey(addDays(now, 1));
    const when =
      next.date === todayKey ? "aujourd'hui" :
      next.date === tomorrowKey ? "demain" :
      fmtGroup.format(fromKey(next.date));
    $("greetSub").textContent = `Prochain plan : ${next.title} · ${when} à ${next.start}`;
  }

  // ---------- Onboarding ----------

  function renderAvatarGrid() {
    const grid = $("avatarGrid");
    grid.innerHTML = "";
    for (const emoji of AVATARS) {
      const btn = document.createElement("button");
      btn.className = "avatar-opt";
      btn.type = "button";
      btn.textContent = emoji;
      if (emoji === obAvatar) btn.classList.add("selected");
      btn.addEventListener("click", () => {
        obAvatar = emoji;
        $("obPreview").textContent = emoji;
        renderAvatarGrid();
      });
      grid.appendChild(btn);
    }
  }

  function openOnboard() {
    obAvatar = profile ? profile.avatar : AVATARS[0];
    $("obName").value = profile ? profile.name : "";
    $("obPreview").textContent = obAvatar;
    $("obDone").textContent = profile ? "Enregistrer" : "Commencer";
    renderAvatarGrid();
    const ob = $("onboard");
    ob.hidden = false;
    ob.classList.remove("hide");
  }

  $("obDone").addEventListener("click", () => {
    const name = $("obName").value.trim();
    if (!name) {
      $("obName").focus();
      return;
    }
    profile = { name, avatar: obAvatar };
    saveProfile();
    const ob = $("onboard");
    ob.classList.add("hide");
    setTimeout(() => { ob.hidden = true; }, 400);
    render();
  });

  $("profileBtn").addEventListener("click", openOnboard);

  function renderUpcoming() {
    const list = $("upcomingList");
    const todayKey = toKey(new Date());
    const items = plans
      .filter((p) => p.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));

    list.innerHTML = "";

    if (items.length === 0) {
      list.innerHTML = `
        <div class="empty">
          <div class="circle"></div>
          <p>Rien de prévu pour le moment</p>
        </div>`;
      return;
    }

    let lastDate = null;
    let i = 0;
    for (const item of items) {
      if (item.date !== lastDate) {
        lastDate = item.date;
        const label = document.createElement("p");
        label.className = "group-label";
        label.style.setProperty("--i", i);
        label.textContent = item.date === todayKey ? "Aujourd'hui" : fmtGroup.format(fromKey(item.date));
        list.appendChild(label);
      }
      list.appendChild(makeCard(item, i));
      i += 1;
    }
  }

  // ---------- Sheet ----------

  function renderColors() {
    colorRow.innerHTML = "";
    for (const color of COLORS) {
      const dot = document.createElement("button");
      dot.className = "color-dot";
      dot.type = "button";
      dot.setAttribute("role", "radio");
      dot.setAttribute("aria-checked", String(color === selectedColor));
      dot.style.background = color;
      if (color === selectedColor) dot.classList.add("selected");
      dot.addEventListener("click", () => {
        selectedColor = color;
        renderColors();
      });
      colorRow.appendChild(dot);
    }
  }

  function openSheet(item) {
    editingId = item ? item.id : null;
    fTitle.value = item ? item.title : "";
    fStart.value = item ? item.start : "19:00";
    fEnd.value = item && item.end ? item.end : "";
    fDate.value = item ? item.date : selectedDate;
    fNote.value = item && item.note ? item.note : "";
    selectedColor = item ? item.color : COLORS[0];
    deleteBtn.hidden = !item;
    saveBtn.textContent = item ? "Enregistrer" : "Ajouter";
    renderColors();

    overlay.hidden = false;
    sheet.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add("visible");
      sheet.classList.add("visible");
    });
  }

  function closeSheet() {
    overlay.classList.remove("visible");
    sheet.classList.remove("visible");
    setTimeout(() => {
      overlay.hidden = true;
      sheet.hidden = true;
    }, 300);
  }

  // ---------- Actions ----------

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      title: fTitle.value.trim(),
      date: fDate.value,
      start: fStart.value,
      end: fEnd.value || null,
      note: fNote.value.trim() || null,
      color: selectedColor,
    };
    if (!data.title || !data.date || !data.start) return;

    if (editingId) {
      const idx = plans.findIndex((p) => p.id === editingId);
      if (idx !== -1) plans[idx] = { ...plans[idx], ...data };
    } else {
      plans.push({ id: crypto.randomUUID(), ...data });
    }
    save();

    selectedDate = data.date;
    weekStart = mondayOf(fromKey(data.date));
    closeSheet();
    render();
  });

  deleteBtn.addEventListener("click", () => {
    plans = plans.filter((p) => p.id !== editingId);
    save();
    closeSheet();
    render();
  });

  $("addBtn").addEventListener("click", () => openSheet(null));
  overlay.addEventListener("click", closeSheet);

  $("navWeek").addEventListener("click", () => {
    view = "week";
    render();
  });

  $("navUpcoming").addEventListener("click", () => {
    view = "upcoming";
    render();
  });

  $("prevWeek").addEventListener("click", () => shiftWeek(-7));
  $("nextWeek").addEventListener("click", () => shiftWeek(7));

  function shiftWeek(days) {
    weekStart = mondayOf(addDays(weekStart, days));
    selectedDate = toKey(weekStart);
    render();
  }

  todayBtn.addEventListener("click", () => {
    weekStart = mondayOf(new Date());
    selectedDate = toKey(new Date());
    render();
  });

  // ---------- PWA ----------

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  render();
  if (!profile) openOnboard();
})();
