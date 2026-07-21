(() => {
  "use strict";

  const STORE_KEY = "semaine.plans.v1";
  const COLORS = ["#5B51E8", "#E8657A", "#E8A94C", "#4CAF9C"];

  // ---------- State ----------

  let plans = load();
  let selectedDate = toKey(new Date());
  let weekStart = mondayOf(new Date());
  let editingId = null;
  let selectedColor = COLORS[0];

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

    items.forEach((item, i) => {
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
      planList.appendChild(card);
    });
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
})();
