(() => {
  "use strict";

  const STORE_KEY = "semaine.plans.v1";
  const PROFILE_KEY = "semaine.profile.v1";
  const ENVIES_KEY = "semaine.envies.v1";
  const SYNC_KEY = "semaine.sync.v1";
  const COLORS = ["#374785", "#F76C6C", "#F8E9A1", "#A8D0E6"];

  // ---------- Avatar ----------

  const SKINS = ["#5C3A2E", "#8D5524", "#C68642", "#E8B98A", "#F6D7B0"];
  const HAIR_COLORS = ["#EDE3B4", "#2A2A2A", "#6B4423", "#A5462C", "#F567C8"];
  const HAIR_STYLES = [["long", "Longs"], ["short", "Courts"], ["bun", "Chignon"], ["curly", "Bouclés"], ["none", "Rasé"]];
  const HAT_COLORS = ["none", "#F567C8", "#F76C6C", "#374785", "#F8E9A1"];
  const TOP_COLORS = ["#F79256", "#F567C8", "#374785", "#4C9A6E", "#A89BE0"];
  const BG_COLORS = ["#4A7C59", "#B9AEE8", "#A8D0E6", "#F5A9A0", "#F2D06B"];

  const DEFAULT_AVATAR = {
    skin: SKINS[0],
    hairStyle: "long",
    hairColor: HAIR_COLORS[0],
    hat: HAT_COLORS[1],
    top: TOP_COLORS[0],
    bg: BG_COLORS[0],
  };

  function avatarSVG(c) {
    const S = 'stroke="#1F1B16" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"';
    let hairBack = "";
    let hairFront = "";

    if (c.hairStyle === "long") {
      hairBack = `<path d="M22,98 C13,64 18,42 30,30 L70,30 C82,42 87,64 78,98
        C72,80 74,66 70,58 C66,74 60,72 62,88 C50,80 50,80 38,88 C40,72 34,74 30,58 C26,66 28,80 22,98 Z"
        fill="${c.hairColor}" ${S}/>`;
    }

    if (c.hat === "none" && c.hairStyle !== "none") {
      if (c.hairStyle === "short" || c.hairStyle === "long") {
        hairFront = `<path d="M32.5,34 C32,18 42,13.5 50,13.5 C58,13.5 68,18 67.5,34 C61,25.5 39,25.5 32.5,34 Z" fill="${c.hairColor}" ${S}/>`;
      } else if (c.hairStyle === "bun") {
        hairFront = `<circle cx="50" cy="12.5" r="6.8" fill="${c.hairColor}" ${S}/>
          <path d="M32.5,34 C32,18 42,13.5 50,13.5 C58,13.5 68,18 67.5,34 C61,25.5 39,25.5 32.5,34 Z" fill="${c.hairColor}" ${S}/>`;
      } else if (c.hairStyle === "curly") {
        hairFront = `<path d="M31.5,31 Q26.5,17 39,13.5 Q43,5.5 53,8.5 Q63.5,6 65.5,16 Q72.5,20 68.5,31 Q50,22 31.5,31 Z" fill="${c.hairColor}" ${S}/>`;
      }
    }

    const hat = c.hat === "none" ? "" : `
      <path d="M31,28.5 C31,13 41,7.5 50,7.5 C59,7.5 69,13 69,28.5 Z" fill="${c.hat}" ${S}/>
      <path d="M40,10.5 L40,25 M50,8.5 L50,25 M60,10.5 L60,25" fill="none" stroke="#1F1B16" stroke-width="1" opacity="0.35"/>
      <rect x="29.5" y="24.5" width="41" height="8" rx="4" fill="${c.hat}" ${S}/>`;

    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${c.bg}"/>
      ${hairBack}
      <rect x="43.5" y="48" width="13" height="20" rx="5.5" fill="${c.skin}" ${S}/>
      <path d="M17,102 L17,89 C17,77 30,70.5 50,70.5 C70,70.5 83,77 83,89 L83,102 Z" fill="${c.top}" ${S}/>
      <path d="M38,74 L34,102 M62,74 L66,102" fill="none" stroke="#1F1B16" stroke-width="1" opacity="0.25"/>
      <ellipse cx="50" cy="38" rx="17.5" ry="19.5" fill="${c.skin}" ${S}/>
      <ellipse cx="43.5" cy="37.5" rx="2.1" ry="3" fill="#1F1B16"/>
      <ellipse cx="56.5" cy="37.5" rx="2.1" ry="3" fill="#1F1B16"/>
      <path d="M39.5,30.5 Q43.5,28.5 47,30.3 M53,30.3 Q56.5,28.5 60.5,30.5" fill="none" stroke="#1F1B16" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M50,40 Q48.4,42.6 50.4,43.4" fill="none" stroke="#1F1B16" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M44.5,47 Q50,49.5 55.5,47 Q53.5,53.5 50,53.5 Q46.5,53.5 44.5,47 Z" fill="#1F1B16"/>
      <path d="M46.5,51.5 Q50,53.8 53.5,51.5 Q52,53.5 50,53.5 Q48,53.5 46.5,51.5 Z" fill="#F567C8"/>
      ${hairFront}
      ${hat}
    </svg>`;
  }

  // ---------- State ----------

  let plans = load();
  let selectedDate = toKey(new Date());
  let weekStart = mondayOf(new Date());
  let editingId = null;
  let selectedColor = COLORS[0];
  let view = "week";
  let profile = loadProfile();
  let envies = loadEnvies();
  let avatarCfg = { ...DEFAULT_AVATAR };
  let pendingEnvieId = null;
  let syncSpace = loadSync();
  let lastSyncAt = null;

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
    scheduleSync();
  }

  function loadProfile() {
    try {
      const p = JSON.parse(localStorage.getItem(PROFILE_KEY));
      if (!p || !p.name) return null;
      if (typeof p.avatar !== "object" || !p.avatar) p.avatar = { ...DEFAULT_AVATAR };
      return p;
    } catch {
      return null;
    }
  }

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  function loadEnvies() {
    try {
      return JSON.parse(localStorage.getItem(ENVIES_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveEnvies() {
    localStorage.setItem(ENVIES_KEY, JSON.stringify(envies));
    scheduleSync();
  }

  function persist() {
    localStorage.setItem(STORE_KEY, JSON.stringify(plans));
    localStorage.setItem(ENVIES_KEY, JSON.stringify(envies));
  }

  const livePlans = () => plans.filter((p) => !p.del);
  const liveEnvies = () => envies.filter((e) => !e.del);

  // Purge des suppressions synchronisées depuis plus de 60 jours
  {
    const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
    const keep = (it) => !it.del || (it.u || 0) > cutoff;
    plans = plans.filter(keep);
    envies = envies.filter(keep);
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
    for (const v of ["week", "upcoming", "envies"]) {
      $(v + "View").hidden = view !== v;
    }
    if (render.lastView !== view) {
      const el = $(view + "View");
      el.classList.remove("view-enter");
      void el.offsetWidth;
      el.classList.add("view-enter");
      render.lastView = view;
      window.scrollTo({ top: 0 });
    }
    if (view !== "week") $("topBar").textContent = view === "envies" ? "Envies" : "À venir";
    $("navWeek").classList.toggle("active", view === "week");
    $("navUpcoming").classList.toggle("active", view === "upcoming");
    $("navEnvies").classList.toggle("active", view === "envies");

    if (view === "upcoming") {
      renderUpcoming();
      return;
    }
    if (view === "envies") {
      renderEnvies();
      return;
    }

    renderGreeting();

    const days = weekDays();
    const todayKey = toKey(new Date());

    monthLabel.textContent = fmtMonth.format(days[3]);
    $("topBar").textContent = monthLabel.textContent;
    todayBtn.hidden = mondayOf(new Date()).getTime() === weekStart.getTime();

    weekStrip.innerHTML = "";
    for (const day of days) {
      const key = toKey(day);
      const pill = document.createElement("button");
      pill.className = "day-pill";
      pill.type = "button";
      if (key === selectedDate) pill.classList.add("selected");
      if (key === todayKey) pill.classList.add("today");
      if (plans.some((p) => p.date === key && !p.del)) pill.classList.add("has-plans");
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
    const items = livePlans()
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

  function miniAvatar(by) {
    if (!by || !by.a) return null;
    const el = document.createElement("span");
    el.className = "mini-avatar";
    el.title = by.n || "";
    el.innerHTML = avatarSVG(by.a);
    return el;
  }

  function makeCard(item, i) {
    const card = document.createElement("button");
    card.className = "plan-card";
    card.type = "button";
    card.style.setProperty("--plan-color", item.color);
    card.style.setProperty("--i", i);
    const time = item.end ? `${item.start} – ${item.end}` : item.start;
    card.innerHTML = `
      <div class="meta"><span class="cdot"></span><span class="time">${time}</span></div>
      <div class="title"></div>
      ${item.note ? '<div class="note"></div>' : ""}`;
    card.querySelector(".title").textContent = item.title;
    if (item.note) card.querySelector(".note").textContent = item.note;
    const avatar = miniAvatar(item.by);
    if (avatar) card.appendChild(avatar);
    card.addEventListener("click", () => openSheet(item));
    return card;
  }

  function renderGreeting() {
    if (!profile) return;
    const hour = new Date().getHours();
    $("greetWord").textContent = (hour >= 18 || hour < 5 ? "Bonsoir, " : "Bonjour, ");
    $("greetName").textContent = profile.name;
    $("avatarEmoji").innerHTML = avatarSVG(profile.avatar);

    const now = new Date();
    const todayKey = toKey(now);
    const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const next = livePlans()
      .filter((p) => p.date > todayKey || (p.date === todayKey && p.start >= hm))
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))[0];

    if (!next) {
      $("greetSub").textContent = "Rien de prévu pour l'instant";
      return;
    }
    const days = Math.round((fromKey(next.date) - fromKey(todayKey)) / 86400000);
    const when =
      days === 0 ? `aujourd'hui à ${next.start}` :
      days === 1 ? `demain à ${next.start}` :
      `dans ${days} jours`;
    const sub = $("greetSub");
    sub.textContent = `${next.title} · `;
    const chip = document.createElement("span");
    chip.className = "countdown";
    chip.textContent = when;
    sub.appendChild(chip);
  }

  // ---------- Onboarding ----------

  const BUILDER_ROWS = [
    { key: "skin", label: "Peau", colors: SKINS },
    { key: "hairStyle", label: "Cheveux", chips: HAIR_STYLES },
    { key: "hairColor", label: "Couleur des cheveux", colors: HAIR_COLORS },
    { key: "hat", label: "Bonnet", colors: HAT_COLORS },
    { key: "top", label: "Haut", colors: TOP_COLORS },
    { key: "bg", label: "Fond", colors: BG_COLORS },
  ];

  function renderBuilder() {
    $("obAvatar").innerHTML = avatarSVG(avatarCfg);
    const root = $("builder");
    root.innerHTML = "";
    for (const row of BUILDER_ROWS) {
      const label = document.createElement("p");
      label.className = "builder-label";
      label.textContent = row.label;
      root.appendChild(label);

      const wrap = document.createElement("div");
      wrap.className = "builder-row";

      if (row.colors) {
        for (const color of row.colors) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "swatch";
          if (color === "none") dot.classList.add("swatch-none");
          else dot.style.background = color;
          if (avatarCfg[row.key] === color) dot.classList.add("selected");
          dot.addEventListener("click", () => {
            avatarCfg[row.key] = color;
            renderBuilder();
          });
          wrap.appendChild(dot);
        }
      } else {
        for (const [value, text] of row.chips) {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "chip";
          chip.textContent = text;
          if (avatarCfg[row.key] === value) chip.classList.add("selected");
          chip.addEventListener("click", () => {
            avatarCfg[row.key] = value;
            renderBuilder();
          });
          wrap.appendChild(chip);
        }
      }
      root.appendChild(wrap);
    }
  }

  function openOnboard(step) {
    avatarCfg = profile ? { ...profile.avatar } : { ...DEFAULT_AVATAR };
    $("obName").value = profile ? profile.name : "";
    $("obNext").textContent = profile ? "Continuer" : "Continuer";
    $("obDone").textContent = profile ? "Enregistrer" : "Commencer";
    $("obStep1").hidden = step === 2;
    $("obStep2").hidden = step !== 2;
    $("obInvite").hidden = !profile;
    if (profile) refreshNotifBtn();
    if (step === 2) renderBuilder();
    const ob = $("onboard");
    ob.hidden = false;
    ob.classList.remove("hide");
  }

  $("obNext").addEventListener("click", () => {
    const name = $("obName").value.trim();
    if (!name) {
      $("obName").focus();
      return;
    }
    $("obStep1").hidden = true;
    $("obStep2").hidden = false;
    renderBuilder();
  });

  $("obName").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("obNext").click();
  });

  $("obDone").addEventListener("click", () => {
    profile = { name: $("obName").value.trim(), avatar: { ...avatarCfg } };
    saveProfile();
    const ob = $("onboard");
    ob.classList.add("hide");
    setTimeout(() => { ob.hidden = true; }, 400);
    render();
  });

  $("profileBtn").addEventListener("click", () => openOnboard(1));

  function refreshNotifBtn() {
    const btn = $("notifBtn");
    if (!("Notification" in window)) {
      btn.textContent = "Notifications non disponibles ici";
      btn.disabled = true;
      return;
    }
    if (Notification.permission === "granted") btn.textContent = "Notifications activées ✓";
    else if (Notification.permission === "denied") btn.textContent = "Notifications refusées (voir Réglages)";
    else btn.textContent = "Activer les notifications";
  }

  $("notifBtn").addEventListener("click", async () => {
    if (!("Notification" in window) || Notification.permission !== "default") return;
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") toast("Notifications activées ✓");
    } catch {
      /* refus */
    }
    refreshNotifBtn();
  });

  // ---------- Envies ----------

  function renderEnvies() {
    const list = $("envieList");
    list.innerHTML = "";
    const items = liveEnvies();

    if (items.length === 0) {
      list.innerHTML = `
        <div class="empty">
          <div class="circle"></div>
          <p>Aucune envie pour l'instant</p>
        </div>`;
      return;
    }

    items.forEach((envie, i) => {
      const card = document.createElement("div");
      card.className = "plan-card envie-card";
      card.style.setProperty("--plan-color", "#F8E9A1");
      card.style.setProperty("--i", i);

      const title = document.createElement("div");
      title.className = "title";
      title.textContent = envie.title;
      const avatar = miniAvatar(envie.by);

      const plan = document.createElement("button");
      plan.type = "button";
      plan.className = "envie-action";
      plan.setAttribute("aria-label", "Planifier");
      plan.innerHTML = '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="15" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5M12 12.5v5M9.5 15h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      plan.addEventListener("click", () => {
        openSheet(null);
        fTitle.value = envie.title;
        pendingEnvieId = envie.id;
      });

      const del = document.createElement("button");
      del.type = "button";
      del.className = "envie-action danger";
      del.setAttribute("aria-label", "Supprimer");
      del.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      del.addEventListener("click", () => {
        envie.del = 1;
        envie.u = Date.now();
        saveEnvies();
        renderEnvies();
      });

      card.append(title);
      if (avatar) card.append(avatar);
      card.append(plan, del);
      list.appendChild(card);
    });
  }

  $("envieForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("envieInput").value.trim();
    if (!title) return;
    envies.push({
      id: crypto.randomUUID(),
      title,
      u: Date.now(),
      by: profile ? { n: profile.name, a: profile.avatar } : null,
    });
    saveEnvies();
    $("envieInput").value = "";
    renderEnvies();
  });

  // ---------- Duo (synchro automatique) ----------

  const API_BASE = localStorage.getItem("semaine.apiBase") || "https://jsonblob.com/api/jsonBlob";

  function loadSync() {
    try {
      return JSON.parse(localStorage.getItem(SYNC_KEY));
    } catch {
      return null;
    }
  }

  function saveSync() {
    if (syncSpace) localStorage.setItem(SYNC_KEY, JSON.stringify(syncSpace));
    else localStorage.removeItem(SYNC_KEY);
  }

  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("visible"));
    clearTimeout(toast.t);
    toast.t = setTimeout(() => {
      el.classList.remove("visible");
      setTimeout(() => { el.hidden = true; }, 350);
    }, 3500);
  }

  function mergeLists(local, incoming) {
    const map = new Map(local.map((it) => [it.id, it]));
    let changed = false;
    const fresh = [];
    for (const it of incoming || []) {
      if (!it || !it.id) continue;
      const cur = map.get(it.id);
      if (!cur) {
        map.set(it.id, it);
        changed = true;
        if (!it.del) fresh.push(it);
      } else if ((it.u || 0) > (cur.u || 0)) {
        map.set(it.id, it);
        changed = true;
      }
    }
    return [Array.from(map.values()), changed, fresh];
  }

  function notifyFresh(fresh) {
    const fromPartner = fresh.filter((it) => it.by && it.by.n && (!profile || it.by.n !== profile.name));
    if (fromPartner.length === 0) return;
    const first = fromPartner[0];
    const msg = fromPartner.length === 1
      ? `${first.by.n} a ajouté : ${first.title}`
      : `${first.by.n} a ajouté ${fromPartner.length} nouveautés`;
    if ("Notification" in window && Notification.permission === "granted" && document.visibilityState === "hidden") {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification("Semaine", { body: msg, icon: "icons/icon-192.png", badge: "icons/icon-192.png" }))
        .catch(() => {});
    } else {
      toast(msg);
    }
  }

  let syncing = false;

  async function syncNow() {
    if (!syncSpace || syncing) return;
    syncing = true;
    try {
      const res = await fetch(`${API_BASE}/${syncSpace.id}`, { cache: "no-store" });
      let changed = false;
      let fresh = [];
      if (res.ok) {
        const remote = await res.json();
        let c1, c2, f1, f2;
        [plans, c1, f1] = mergeLists(plans, remote.p);
        [envies, c2, f2] = mergeLists(envies, remote.e);
        changed = c1 || c2;
        fresh = [...f1, ...f2];
      }
      await fetch(`${API_BASE}/${syncSpace.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ v: 1, p: plans, e: envies }),
      });
      lastSyncAt = Date.now();
      if (changed) {
        persist();
        render();
        notifyFresh(fresh);
      }
    } catch {
      /* hors ligne : nouvelle tentative au prochain déclencheur */
    } finally {
      syncing = false;
    }
  }

  function scheduleSync() {
    if (!syncSpace) return;
    clearTimeout(scheduleSync.t);
    scheduleSync.t = setTimeout(syncNow, 1500);
  }

  async function ensureSpace() {
    if (syncSpace) return syncSpace.id;
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ v: 1, p: plans, e: envies }),
    });
    const loc = res.headers.get("Location") || "";
    const id = loc.split("/").filter(Boolean).pop();
    if (!res.ok || !id) throw new Error();
    syncSpace = { id };
    saveSync();
    lastSyncAt = Date.now();
    return id;
  }

  async function joinSpace(id) {
    const res = await fetch(`${API_BASE}/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    const remote = await res.json();
    if (!remote || remote.v !== 1) throw new Error();
    syncSpace = { id };
    saveSync();
    [plans] = mergeLists(plans, remote.p);
    [envies] = mergeLists(envies, remote.e);
    persist();
    await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ v: 1, p: plans, e: envies }),
    });
    lastSyncAt = Date.now();
    render();
  }

  $("inviteBtn").addEventListener("click", async () => {
    try {
      const id = await ensureSpace();
      const url = `${location.origin}${location.pathname}#s=${id}`;
      const text = `Rejoins-moi sur Semaine : ouvre ce lien puis ajoute l'app à ton écran d'accueil.\n${url}`;
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        toast("Lien d'invitation copié ✓");
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
      toast("Impossible pour l'instant · vérifie ta connexion");
    }
  });

  // Ouverture via un lien d'invitation : connexion silencieuse des deux téléphones
  async function handleInviteLink() {
    const match = location.hash.match(/s=([A-Za-z0-9]+)/);
    if (!match) return;
    const id = match[1];
    history.replaceState(null, "", location.pathname);
    if (syncSpace && syncSpace.id === id) return;
    try {
      await joinSpace(id);
      toast("Téléphones connectés ✓ La synchronisation est automatique.");
    } catch {
      toast("Connexion impossible · réouvre le lien d'invitation");
    }
  }

  // ---------- Gestes & détails ----------

  window.addEventListener("scroll", () => {
    $("topBar").classList.toggle("visible", window.scrollY > 64);
  }, { passive: true });

  let swipeX = null;
  let swipeY = null;
  weekStrip.addEventListener("touchstart", (e) => {
    swipeX = e.touches[0].clientX;
    swipeY = e.touches[0].clientY;
  }, { passive: true });
  weekStrip.addEventListener("touchend", (e) => {
    if (swipeX === null) return;
    const dx = e.changedTouches[0].clientX - swipeX;
    const dy = e.changedTouches[0].clientY - swipeY;
    swipeX = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 2) shiftWeek(dx < 0 ? 7 : -7);
  }, { passive: true });

  let dragY = null;
  sheet.addEventListener("touchstart", (e) => {
    if (e.target.closest("input, button, .color-row")) return;
    dragY = e.touches[0].clientY;
    sheet.classList.add("dragging");
  }, { passive: true });
  sheet.addEventListener("touchmove", (e) => {
    if (dragY === null) return;
    const dy = Math.max(0, e.touches[0].clientY - dragY);
    sheet.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  sheet.addEventListener("touchend", (e) => {
    if (dragY === null) return;
    const dy = Math.max(0, e.changedTouches[0].clientY - dragY);
    dragY = null;
    sheet.classList.remove("dragging");
    sheet.style.transform = "";
    if (dy > 110) closeSheet();
  });

  setInterval(() => {
    if (syncSpace && document.visibilityState === "visible") syncNow();
  }, 30000);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") syncNow();
  });

  function renderUpcoming() {
    const list = $("upcomingList");
    const todayKey = toKey(new Date());
    const items = livePlans()
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
    pendingEnvieId = null;
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
      u: Date.now(),
    };
    if (!data.title || !data.date || !data.start) return;

    if (editingId) {
      const idx = plans.findIndex((p) => p.id === editingId);
      if (idx !== -1) plans[idx] = { ...plans[idx], ...data };
    } else {
      const by = profile ? { n: profile.name, a: profile.avatar } : null;
      plans.push({ id: crypto.randomUUID(), ...data, by });
    }
    save();

    if (pendingEnvieId) {
      const envie = envies.find((e) => e.id === pendingEnvieId);
      if (envie) {
        envie.del = 1;
        envie.u = Date.now();
      }
      saveEnvies();
      pendingEnvieId = null;
      view = "week";
    }

    selectedDate = data.date;
    weekStart = mondayOf(fromKey(data.date));
    closeSheet();
    render();
  });

  deleteBtn.addEventListener("click", () => {
    const plan = plans.find((p) => p.id === editingId);
    if (plan) {
      plan.del = 1;
      plan.u = Date.now();
    }
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

  $("navEnvies").addEventListener("click", () => {
    view = "envies";
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
  if (!profile) openOnboard(1);
  handleInviteLink().then(() => {
    if (syncSpace) syncNow();
  });
})();
