const dataElement = document.getElementById("song-data");
const SONGS = JSON.parse(dataElement?.textContent || "[]");
const CHROMATIC_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const FLAT_TO_SHARP = { Db: "C#", Eb: "D#", Gb: "D#", Ab: "G#", Bb: "A#" };
const NOTE_RE = /^([A-G])([#b]?)(.*)$/;
const TAB_STRINGS = ["e", "B", "G", "D", "A", "E"];
const els = {
  app: document.getElementById("app"),
  sidebar: document.getElementById("sidebar"),
  backdrop: document.getElementById("backdrop"),
  menuBtn: document.getElementById("menuBtn"),
  list: document.getElementById("songList"),
  search: document.getElementById("songSearch"),
  title: document.getElementById("songTitle"),
  artist: document.getElementById("songArtist"),
  key: document.getElementById("songKey"),
  capo: document.getElementById("songCapo"),
  transposeValue: document.getElementById("transposeValue"),
  sheet: document.getElementById("songSheet"),
  reader: document.getElementById("reader"),
  modeButtons: [...document.querySelectorAll("#viewModes button")],
  fontValue: document.getElementById("fontValue"),
  scrollToggle: document.getElementById("scrollToggle"),
  scrollSpeed: document.getElementById("scrollSpeed"),
  scrollSpeedValue: document.getElementById("scrollSpeedValue"),
  audioFile: document.getElementById("audioFile"),
  audio: document.getElementById("audio"),
  setupToggle: document.getElementById("setupToggle"),
  setupPanel: document.getElementById("setupPanel"),
  setupTempo: document.getElementById("setupTempo"),
  setupTime: document.getElementById("setupTime"),
  setupVersion: document.getElementById("setupVersion"),
  setupStrumming: document.getElementById("setupStrumming"),
  chordChips: document.getElementById("chordChips"),
  columnsToggle: document.getElementById("columnsToggle"),
  tabNotationSwitch: document.getElementById("tabNotationSwitch"),
  tabNotationButtons: [...document.querySelectorAll("[data-tab-notation]")],
  fingeringToggle: document.getElementById("fingeringToggle"),
  fingeringPanel: document.getElementById("fingeringPanel"),
};
let currentSongId = localStorage.getItem("gl.song") || SONGS[0]?.id || "",
  transpose = Number(localStorage.getItem("gl.transpose") || 0),
  mode = localStorage.getItem("gl.mode") || "chords",
  tabNotation = localStorage.getItem("gl.tabNotation") || "pattern",
  fontSize = Number(localStorage.getItem("gl.fontSize") || 20),
  autoScrollOn = false,
  scrollRAF = 0,
  lastTs = 0,
  audioObjectUrl = null,
  desktopSidebarCollapsed = localStorage.getItem("gl.sidebarCollapsed") === "1",
  setupOpen = localStorage.getItem("gl.setupOpen") === "1",
  twoColumns = localStorage.getItem("gl.twoColumns") === "1",
  fingeringOpen = false;
function escapeHtml(t) {
  return String(t)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function transposeChord(c, d) {
  const m = c.match(NOTE_RE);
  if (!m) return c;
  let [, r, a, s] = m,
    n = FLAT_TO_SHARP[r + a] || r + a,
    i = CHROMATIC_SHARP.indexOf(n);
  if (i < 0) return c;
  return CHROMATIC_SHARP[(i + d + 120) % 12] + s;
}
function parseChordProLine(l) {
  const p = [],
    re = /\[([^\]]+)\]([^\[]*)/g;
  let m,
    c = 0;
  while ((m = re.exec(l)) !== null) {
    if (m.index > c) p.push({ chord: "", text: l.slice(c, m.index) });
    p.push({ chord: transposeChord(m[1], transpose), text: m[2] });
    c = re.lastIndex;
  }
  if (c < l.length) p.push({ chord: "", text: l.slice(c) });
  if (!p.length) p.push({ chord: "", text: l });
  return p;
}
function renderLyricLine(l) {
  return parseChordProLine(l)
    .map(
      (p) =>
        `<span class="unit"><span class="chord">${p.chord ? escapeHtml(p.chord) : "&nbsp;"}</span><span class="word">${escapeHtml(p.text || " ")}</span></span>`,
    )
    .join("");
}
function expandPattern(s) {
  let x = String(s || "").trim(),
    p;
  do {
    p = x;
    x = x.replace(/\(([^()]+)\)\s*[x×]\s*(\d+)/gi, (_, b, n) =>
      Array(Number(n)).fill(b.trim()).join(" "),
    );
  } while (x !== p);
  return x
    .replace(/(^|\s)[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|\d)*:\s*/g, "$1")
    .replace(/\s+\+\s+/g, " ")
    .replace(/\s*\|\s*/g, " | ")
    .trim();
}
function parseTabEvent(t) {
  if (t === "|") return { bar: true, notes: {} };
  if (t === "-" || t === "_") return { rest: true, notes: {} };
  const notes = {};
  for (const p of t.split("+")) {
    const m = p.match(/^([eEADGB])(\d{1,2})$/);
    if (m) notes[m[1]] = m[2];
  }
  return { notes };
}
function buildAsciiTab(s) {
  const events = expandPattern(s)
      .split(/\s+/)
      .filter(Boolean)
      .map(parseTabEvent),
    rows = Object.fromEntries(TAB_STRINGS.map((x) => [x, `${x}|`]));
  for (const e of events) {
    if (e.bar) {
      for (const x of TAB_STRINGS) rows[x] += "|";
      continue;
    }
    const fs = Object.values(e.notes || {}),
      w = Math.max(4, ...fs.map((f) => f.length + 2));
    for (const x of TAB_STRINGS) {
      const f = e.notes?.[x];
      rows[x] +=
        f !== undefined
          ? `-${f}${"-".repeat(Math.max(1, w - f.length - 1))}`
          : "-".repeat(w);
    }
  }
  for (const x of TAB_STRINGS) rows[x] += "|";
  return TAB_STRINGS.map((x) => rows[x]).join("\n");
}
function formatPattern(s) {
  return String(s || "")
    .trim()
    .replace(/\s+(?=[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|\d)*:\s)/g, "\n")
    .split(/\s*\|\s*/)
    .map((x) => x.trim())
    .filter(Boolean)
    .join("\n");
}
function renderTabBlock(b) {
  const r = b.repeat > 1 ? `<span class="tab-repeat">×${b.repeat}</span>` : "";
  return `<div class="tab-block"><div class="tab-heading"><strong>${escapeHtml(b.title || "Tab")}</strong>${r}</div><pre class="tab-pattern ${tabNotation === "pattern" ? "active" : ""}">${escapeHtml(formatPattern(b.sequence))}</pre><pre class="tablature ${tabNotation === "ascii" ? "active" : ""}">${escapeHtml(buildAsciiTab(b.sequence))}</pre></div>`;
}
function renderLineBlock(l) {
  return `<div class="line-block"><div class="lyric-line">${renderLyricLine(l.lyric)}</div>${l.ipa ? `<div class="ipa">${escapeHtml(l.ipa)}</div>` : ""}</div>`;
}
function extractChords(s) {
  const seen = new Set(),
    out = [];
  for (const sec of s.sections)
    for (const l of sec.lines)
      for (const m of l.lyric.matchAll(/\[([^\]]+)\]/g)) {
        const c = m[1].trim();
        if (!seen.has(c)) {
          seen.add(c);
          out.push(c);
        }
      }
  return out;
}
function fingeringTokens(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}
function renderFingeringTable(f) {
  const rows = [
      ["notes", fingeringTokens(f.notes)],
      ["LH", fingeringTokens(f.lh)],
      ["RH", fingeringTokens(f.rh)],
    ],
    cols = Math.max(...rows.map(([, t]) => t.length));
  return `<div class="fingering-table-wrap"><table class="fingering-table"><tbody>${rows.map(([label, tokens]) => `<tr><th>${escapeHtml(label)}</th>${Array.from({ length: cols }, (_, i) => `<td>${escapeHtml(tokens[i] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function renderFingerings(song) {
  const fs = song.fingerings || [];
  els.fingeringToggle.hidden = !fs.length;
  if (!fs.length) {
    els.fingeringPanel.innerHTML = "";
    return;
  }
  els.fingeringPanel.innerHTML = fs
    .map(
      (f) =>
        `<div class="fingering-card"><div class="fingering-title">${escapeHtml(f.title)}</div>${f.used ? `<div class="fingering-used">${escapeHtml(f.used)}</div>` : ""}${renderFingeringTable(f)}</div>`,
    )
    .join("");
  els.fingeringPanel.classList.toggle("open", fingeringOpen);
  els.fingeringToggle.setAttribute("aria-expanded", String(fingeringOpen));
  els.fingeringToggle.textContent = fingeringOpen
    ? "Fingering ▾"
    : "Fingering ▸";
}
function renderSongList(f = "") {
  const q = f.trim().toLowerCase(),
    items = SONGS.filter((s) =>
      `${s.title} ${s.artist}`.toLowerCase().includes(q),
    );
  els.list.innerHTML =
    items
      .map(
        (s) =>
          `<li class="song-item ${s.id === currentSongId ? "active" : ""}"><button data-song-id="${escapeHtml(s.id)}"><div class="song-title-small">${escapeHtml(s.title)}</div><div class="song-artist-small">${escapeHtml(s.artist)}</div></button></li>`,
      )
      .join("") || '<li class="empty">Brak wyników</li>';
  els.list.querySelectorAll("[data-song-id]").forEach((b) =>
    b.addEventListener("click", () => {
      currentSongId = b.dataset.songId;
      transpose = 0;
      fingeringOpen = false;
      localStorage.setItem("gl.song", currentSongId);
      localStorage.setItem("gl.transpose", "0");
      renderAll();
      closeSidebar();
    }),
  );
}
function currentSong() {
  return SONGS.find((s) => s.id === currentSongId) || SONGS[0];
}
function renderSetup(s) {
  els.setupTempo.textContent = s.tempo ? `${s.tempo} bpm` : "—";
  els.setupTime.textContent = s.time || "—";
  els.setupVersion.textContent = s.version || "—";
  els.setupStrumming.textContent = s.strumming || "—";
  const c = extractChords(s);
  els.chordChips.innerHTML = c.length
    ? c
        .map(
          (x) =>
            `<span class="chord-chip">${escapeHtml(transposeChord(x, transpose))}</span>`,
        )
        .join("")
    : '<span class="setup-empty">No chords entered yet</span>';
  renderFingerings(s);
}
function applyColumnMode() {
  const a = twoColumns && matchMedia("(min-width: 761px)").matches;
  els.sheet.classList.toggle("columns-2", a);
  els.columnsToggle.classList.toggle("active", a);
  els.columnsToggle.setAttribute("aria-pressed", String(a));
  els.columnsToggle.textContent = a ? "1 Col" : "2 Col";
}
function renderSong() {
  const s = currentSong();
  if (!s) return;
  els.title.textContent = s.title;
  els.artist.textContent = s.artist;
  els.key.textContent = transposeChord(s.key, transpose);
  els.capo.textContent = s.capo;
  els.transposeValue.textContent = `${transpose > 0 ? "+" : ""}${transpose}`;
  renderSetup(s);
  els.sheet.className = `song-sheet mode-${mode}`;
  els.sheet.innerHTML = s.sections
    .map((sec) => {
      const bs = sec.blocks?.length ? sec.blocks : sec.lines,
        h = bs.some((b) => b.type === "tab");
      return `<section class="section ${h ? "has-tab" : ""}"><h2 class="section-title">${escapeHtml(sec.title)}</h2>${bs.map((b) => (b.type === "tab" ? renderTabBlock(b) : renderLineBlock(b))).join("")}</section>`;
    })
    .join("");
  els.modeButtons.forEach((b) =>
    b.classList.toggle("active", b.dataset.mode === mode),
  );
  els.tabNotationButtons.forEach((b) =>
    b.classList.toggle("active", b.dataset.tabNotation === tabNotation),
  );
  els.tabNotationSwitch.classList.toggle(
    "visible",
    mode === "tab" || mode === "all",
  );
  applyColumnMode();
  els.reader.scrollTop = 0;
  document.title = `${s.title} — Guitar Lab`;
}
function applyFontSize() {
  fontSize = Math.max(14, Math.min(34, fontSize));
  document.documentElement.style.setProperty("--song-size", `${fontSize}px`);
  els.fontValue.textContent = `${fontSize} px`;
  localStorage.setItem("gl.fontSize", String(fontSize));
}
function renderAll() {
  renderSongList(els.search.value);
  renderSong();
  applyFontSize();
}
function changeTranspose(d) {
  transpose = Math.max(-11, Math.min(11, transpose + d));
  localStorage.setItem("gl.transpose", String(transpose));
  renderSong();
}
function stopAutoScroll() {
  autoScrollOn = false;
  cancelAnimationFrame(scrollRAF);
  lastTs = 0;

  const icon = els.scrollToggle.querySelector(".scroll-icon");
  if (icon) icon.textContent = "▶";

  els.scrollToggle.setAttribute("aria-label", "Auto-scroll");
  els.scrollToggle.setAttribute("title", "Auto-scroll");
}
function frame(ts) {
  if (!autoScrollOn) return;
  if (!lastTs) lastTs = ts;
  const dt = Math.min(64, ts - lastTs);
  lastTs = ts;
  els.reader.scrollTop += Number(els.scrollSpeed.value) * 6 * (dt / 1000);
  if (
    els.reader.scrollTop + els.reader.clientHeight >=
    els.reader.scrollHeight - 3
  )
    return stopAutoScroll();
  scrollRAF = requestAnimationFrame(frame);
}
function toggleAutoScroll() {
  if (autoScrollOn) {
    stopAutoScroll();
  } else {
    autoScrollOn = true;
    lastTs = 0;

    const icon = els.scrollToggle.querySelector(".scroll-icon");
    if (icon) icon.textContent = "⏸";

    els.scrollToggle.setAttribute("aria-label", "Stop auto-scroll");
    els.scrollToggle.setAttribute("title", "Stop auto-scroll");

    scrollRAF = requestAnimationFrame(frame);
  }
}
function isMobileSidebar() {
  return matchMedia("(max-width: 760px)").matches;
}
function closeSidebar() {
  els.sidebar.classList.remove("open");
  els.backdrop.classList.remove("show");
}
function applyDesktopSidebarState() {
  els.app.classList.toggle(
    "sidebar-collapsed",
    desktopSidebarCollapsed && !isMobileSidebar(),
  );
}
function toggleSidebar() {
  if (isMobileSidebar()) {
    els.sidebar.classList.toggle("open");
    els.backdrop.classList.toggle("show");
    return;
  }
  desktopSidebarCollapsed = !desktopSidebarCollapsed;
  localStorage.setItem(
    "gl.sidebarCollapsed",
    desktopSidebarCollapsed ? "1" : "0",
  );
  applyDesktopSidebarState();
}
function applySetupState() {
  els.setupPanel.classList.toggle("collapsed", !setupOpen);
  els.setupToggle.setAttribute("aria-expanded", String(setupOpen));
}
document.getElementById("transposeDown").onclick = () => changeTranspose(-1);
document.getElementById("transposeUp").onclick = () => changeTranspose(1);
document.getElementById("fontDown").onclick = () => {
  fontSize--;
  applyFontSize();
};
document.getElementById("fontUp").onclick = () => {
  fontSize++;
  applyFontSize();
};
els.modeButtons.forEach(
  (b) =>
    (b.onclick = () => {
      mode = b.dataset.mode;
      localStorage.setItem("gl.mode", mode);
      renderSong();
    }),
);
els.tabNotationButtons.forEach(
  (b) =>
    (b.onclick = () => {
      tabNotation = b.dataset.tabNotation;
      localStorage.setItem("gl.tabNotation", tabNotation);
      renderSong();
    }),
);
els.search.oninput = (e) => renderSongList(e.target.value);
els.scrollToggle.onclick = toggleAutoScroll;
els.columnsToggle.onclick = () => {
  twoColumns = !twoColumns;
  localStorage.setItem("gl.twoColumns", twoColumns ? "1" : "0");
  applyColumnMode();
};
els.scrollSpeed.oninput = () => {
  els.scrollSpeedValue.textContent = els.scrollSpeed.value;
  localStorage.setItem("gl.scrollSpeed", els.scrollSpeed.value);
};
els.menuBtn.onclick = toggleSidebar;
els.backdrop.onclick = closeSidebar;
els.setupToggle.onclick = () => {
  setupOpen = !setupOpen;
  localStorage.setItem("gl.setupOpen", setupOpen ? "1" : "0");
  applySetupState();
};
els.fingeringToggle.onclick = () => {
  fingeringOpen = !fingeringOpen;
  renderFingerings(currentSong());
};
els.audioFile.onchange = () => {
  const f = els.audioFile.files?.[0];
  if (!f) return;
  if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
  audioObjectUrl = URL.createObjectURL(f);
  els.audio.src = audioObjectUrl;
};
window.addEventListener("keydown", (e) => {
  if (
    e.code === "Space" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)
  ) {
    e.preventDefault();
    toggleAutoScroll();
  }
  if (e.key === "Escape") closeSidebar();
});
window.addEventListener("resize", () => {
  closeSidebar();
  applyDesktopSidebarState();
  applyColumnMode();
});
const sp = localStorage.getItem("gl.scrollSpeed");
if (sp) els.scrollSpeed.value = sp;
els.scrollSpeedValue.textContent = els.scrollSpeed.value;
applySetupState();
applyDesktopSidebarState();
renderAll();
