const dataElement = document.getElementById('song-data');
const SONGS = JSON.parse(dataElement?.textContent || '[]');

const CHROMATIC_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLAT_TO_SHARP = { Db:'C#', Eb:'D#', Gb:'D#', Ab:'G#', Bb:'A#' };
const NOTE_RE = /^([A-G])([#b]?)(.*)$/;
const TAB_STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];

const els = {
  app: document.getElementById('app'), sidebar: document.getElementById('sidebar'), backdrop: document.getElementById('backdrop'),
  menuBtn: document.getElementById('menuBtn'), list: document.getElementById('songList'), search: document.getElementById('songSearch'),
  title: document.getElementById('songTitle'), artist: document.getElementById('songArtist'), key: document.getElementById('songKey'),
  capo: document.getElementById('songCapo'), transposeValue: document.getElementById('transposeValue'), sheet: document.getElementById('songSheet'),
  reader: document.getElementById('reader'), modeButtons: [...document.querySelectorAll('#viewModes button')], fontValue: document.getElementById('fontValue'),
  scrollToggle: document.getElementById('scrollToggle'), scrollSpeed: document.getElementById('scrollSpeed'), scrollSpeedValue: document.getElementById('scrollSpeedValue'),
  audioFile: document.getElementById('audioFile'), audio: document.getElementById('audio'), setupToggle: document.getElementById('setupToggle'),
  setupPanel: document.getElementById('setupPanel'), setupTempo: document.getElementById('setupTempo'), setupTime: document.getElementById('setupTime'),
  setupVersion: document.getElementById('setupVersion'), setupStrumming: document.getElementById('setupStrumming'), chordChips: document.getElementById('chordChips'),
  performanceToggle: document.getElementById('performanceToggle'), columnsToggle: document.getElementById('columnsToggle'),
  tabNotationSwitch: document.getElementById('tabNotationSwitch'), tabNotationButtons: [...document.querySelectorAll('[data-tab-notation]')]
};

let currentSongId = localStorage.getItem('gl.song') || SONGS[0]?.id || '';
let transpose = Number(localStorage.getItem('gl.transpose') || 0);
let mode = localStorage.getItem('gl.mode') || 'all';
let tabNotation = localStorage.getItem('gl.tabNotation') || 'pattern';
let fontSize = Number(localStorage.getItem('gl.fontSize') || 20);
let autoScrollOn = false, scrollRAF = 0, lastTs = 0, audioObjectUrl = null;
let desktopSidebarCollapsed = localStorage.getItem('gl.sidebarCollapsed') === '1';
let setupOpen = localStorage.getItem('gl.setupOpen') !== '0';
let performanceMode = false;
let twoColumns = localStorage.getItem('gl.twoColumns') === '1';

function escapeHtml(text) { return String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function transposeChord(chord, delta) { const m=chord.match(NOTE_RE); if(!m)return chord; let[,root,accidental,suffix]=m; let normalized=FLAT_TO_SHARP[root+accidental]||root+accidental; let idx=CHROMATIC_SHARP.indexOf(normalized); if(idx<0)return chord; idx=(idx+delta+120)%12; return CHROMATIC_SHARP[idx]+suffix; }
function parseChordProLine(line) { const parts=[]; const re=/\[([^\]]+)\]([^\[]*)/g; let match,cursor=0; while((match=re.exec(line))!==null){if(match.index>cursor)parts.push({chord:'',text:line.slice(cursor,match.index)});parts.push({chord:transposeChord(match[1],transpose),text:match[2]});cursor=re.lastIndex;} if(cursor<line.length)parts.push({chord:'',text:line.slice(cursor)}); if(!parts.length)parts.push({chord:'',text:line}); return parts; }
function renderLyricLine(line) { return parseChordProLine(line).map(part=>`<span class="unit"><span class="chord">${part.chord?escapeHtml(part.chord):'&nbsp;'}</span><span class="word">${escapeHtml(part.text||' ')}</span></span>`).join(''); }

function expandPattern(sequence) {
  let source=String(sequence||'').trim();
  let previous;
  do {
    previous=source;
    source=source.replace(/\(([^()]+)\)\s*[x×]\s*(\d+)/gi,(_,body,count)=>Array(Number(count)).fill(body.trim()).join(' '));
  } while(source!==previous);
  return source.replace(/\s+\+\s+/g,' ').replace(/\s*\|\s*/g,' | ').trim();
}
function parseTabEvent(token) { if(token==='|')return{bar:true,notes:{}}; if(token==='-'||token==='_')return{rest:true,notes:{}}; const notes={}; for(const part of token.split('+')){const match=part.match(/^([eEADGB])(\d{1,2})$/);if(match)notes[match[1]]=match[2];} return{notes}; }
function buildAsciiTab(sequence) { const tokens=expandPattern(sequence).split(/\s+/).filter(Boolean); const events=tokens.map(parseTabEvent); const rows=Object.fromEntries(TAB_STRINGS.map(string=>[string,`${string}|`])); for(const event of events){if(event.bar){for(const string of TAB_STRINGS)rows[string]+='|';continue;} const frets=Object.values(event.notes||{});const cellWidth=Math.max(4,...frets.map(fret=>fret.length+2));for(const string of TAB_STRINGS){const fret=event.notes?.[string];rows[string]+=fret!==undefined?`-${fret}${'-'.repeat(Math.max(1,cellWidth-fret.length-1))}`:'-'.repeat(cellWidth);}} for(const string of TAB_STRINGS)rows[string]+='|';return TAB_STRINGS.map(string=>rows[string]).join('\n'); }
function formatPattern(sequence) { return String(sequence||'').trim().split(/\s*\|\s*/).map(part=>part.trim()).filter(Boolean).join('\n'); }
function renderTabBlock(block) { const repeat=block.repeat>1?`<span class="tab-repeat">×${block.repeat}</span>`:''; const pattern=escapeHtml(formatPattern(block.sequence)); const ascii=escapeHtml(buildAsciiTab(block.sequence)); return `<div class="tab-block"><div class="tab-heading"><strong>${escapeHtml(block.title||'Tab')}</strong>${repeat}</div><pre class="tab-pattern ${tabNotation==='pattern'?'active':''}">${pattern}</pre><pre class="tablature ${tabNotation==='ascii'?'active':''}">${ascii}</pre></div>`; }
function renderLineBlock(line) { return `<div class="line-block"><div class="lyric-line">${renderLyricLine(line.lyric)}</div>${line.ipa?`<div class="ipa">${escapeHtml(line.ipa)}</div>`:''}</div>`; }
function extractChords(song) { const seen=new Set(),chords=[];for(const section of song.sections)for(const line of section.lines)for(const match of line.lyric.matchAll(/\[([^\]]+)\]/g)){const chord=match[1].trim();if(!seen.has(chord)){seen.add(chord);chords.push(chord);}}return chords; }
function renderSongList(filter=''){const q=filter.trim().toLowerCase();const items=SONGS.filter(song=>`${song.title} ${song.artist}`.toLowerCase().includes(q));els.list.innerHTML=items.map(song=>`<li class="song-item ${song.id===currentSongId?'active':''}"><button data-song-id="${escapeHtml(song.id)}"><div class="song-title-small">${escapeHtml(song.title)}</div><div class="song-artist-small">${escapeHtml(song.artist)}</div></button></li>`).join('')||'<li class="empty">Brak wyników</li>';els.list.querySelectorAll('[data-song-id]').forEach(btn=>btn.addEventListener('click',()=>{currentSongId=btn.dataset.songId;transpose=0;localStorage.setItem('gl.song',currentSongId);localStorage.setItem('gl.transpose','0');renderAll();closeSidebar();}));}
function currentSong(){return SONGS.find(song=>song.id===currentSongId)||SONGS[0];}
function renderSetup(song){els.setupTempo.textContent=song.tempo?`${song.tempo} bpm`:'—';els.setupTime.textContent=song.time||'—';els.setupVersion.textContent=song.version||'—';els.setupStrumming.textContent=song.strumming||'—';const chords=extractChords(song);els.chordChips.innerHTML=chords.length?chords.map(chord=>`<span class="chord-chip">${escapeHtml(transposeChord(chord,transpose))}</span>`).join(''):'<span class="setup-empty">No chords entered yet</span>';}
function applyColumnMode(){const active=twoColumns&&window.matchMedia('(min-width: 761px)').matches;els.sheet.classList.toggle('columns-2',active);els.columnsToggle.classList.toggle('active',active);els.columnsToggle.setAttribute('aria-pressed',String(active));els.columnsToggle.textContent=active?'1 Col':'2 Col';}
function toggleColumns(){twoColumns=!twoColumns;localStorage.setItem('gl.twoColumns',twoColumns?'1':'0');applyColumnMode();els.reader.scrollTop=0;}
function renderSong(){const song=currentSong();if(!song){els.sheet.innerHTML='<div class="empty">Brak utworów w data/songbook.</div>';return;}els.title.textContent=song.title;els.artist.textContent=song.artist;els.key.textContent=transposeChord(song.key,transpose);els.capo.textContent=song.capo;els.transposeValue.textContent=`${transpose>0?'+':''}${transpose}`;renderSetup(song);els.sheet.className=`song-sheet mode-${mode}`;els.sheet.innerHTML=song.sections.map(section=>{const blocks=section.blocks?.length?section.blocks:section.lines;const hasTab=blocks.some(block=>block.type==='tab');return `<section class="section ${hasTab?'has-tab':''}"><h2 class="section-title">${escapeHtml(section.title)}</h2>${blocks.map(block=>block.type==='tab'?renderTabBlock(block):renderLineBlock(block)).join('')}</section>`;}).join('');els.modeButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===mode));els.tabNotationButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.tabNotation===tabNotation));els.tabNotationSwitch.classList.toggle('visible',mode==='tab'||mode==='all');applyColumnMode();els.reader.scrollTop=0;document.title=`${song.title} — Guitar Lab`;}
function applyFontSize(){fontSize=Math.max(14,Math.min(34,fontSize));document.documentElement.style.setProperty('--song-size',`${fontSize}px`);els.fontValue.textContent=`${fontSize} px`;localStorage.setItem('gl.fontSize',String(fontSize));}
function renderAll(){renderSongList(els.search.value);renderSong();applyFontSize();}
function setMode(nextMode){mode=nextMode;localStorage.setItem('gl.mode',mode);renderSong();}
function setTabNotation(next){tabNotation=next;localStorage.setItem('gl.tabNotation',tabNotation);renderSong();}
function changeTranspose(delta){transpose=Math.max(-11,Math.min(11,transpose+delta));localStorage.setItem('gl.transpose',String(transpose));renderSong();}
function autoScrollFrame(ts){if(!autoScrollOn)return;if(!lastTs)lastTs=ts;const dt=Math.min(64,ts-lastTs);lastTs=ts;els.reader.scrollTop+=Number(els.scrollSpeed.value)*6*(dt/1000);if(els.reader.scrollTop+els.reader.clientHeight>=els.reader.scrollHeight-3){stopAutoScroll();return;}scrollRAF=requestAnimationFrame(autoScrollFrame);}
function startAutoScroll(){autoScrollOn=true;lastTs=0;els.scrollToggle.textContent='⏸ Auto-scroll';scrollRAF=requestAnimationFrame(autoScrollFrame);}
function stopAutoScroll(){autoScrollOn=false;cancelAnimationFrame(scrollRAF);lastTs=0;els.scrollToggle.textContent='▶ Auto-scroll';}
function toggleAutoScroll(){autoScrollOn?stopAutoScroll():startAutoScroll();}
function isMobileSidebar(){return window.matchMedia('(max-width: 760px)').matches;}
function applyDesktopSidebarState(){const collapsed=desktopSidebarCollapsed&&!isMobileSidebar();els.app.classList.toggle('sidebar-collapsed',collapsed);els.menuBtn.setAttribute('aria-expanded',String(!collapsed));}
function openSidebar(){els.sidebar.classList.add('open');els.backdrop.classList.add('show');els.menuBtn.setAttribute('aria-expanded','true');}
function closeSidebar(){els.sidebar.classList.remove('open');els.backdrop.classList.remove('show');if(isMobileSidebar())els.menuBtn.setAttribute('aria-expanded','false');}
function toggleSidebar(){if(isMobileSidebar()){els.sidebar.classList.contains('open')?closeSidebar():openSidebar();return;}desktopSidebarCollapsed=!desktopSidebarCollapsed;localStorage.setItem('gl.sidebarCollapsed',desktopSidebarCollapsed?'1':'0');applyDesktopSidebarState();}
function collapseDesktopSidebar(){if(isMobileSidebar())return;desktopSidebarCollapsed=true;localStorage.setItem('gl.sidebarCollapsed','1');applyDesktopSidebarState();}
function applySetupState(){els.setupPanel.classList.toggle('collapsed',!setupOpen);els.setupToggle.setAttribute('aria-expanded',String(setupOpen));els.setupToggle.textContent=setupOpen?'Setup ▾':'Setup ▸';}
function toggleSetup(){setupOpen=!setupOpen;localStorage.setItem('gl.setupOpen',setupOpen?'1':'0');applySetupState();}
function applyPerformanceMode(){els.app.classList.toggle('performance-mode',performanceMode);els.performanceToggle.classList.toggle('active',performanceMode);els.performanceToggle.textContent=performanceMode?'Exit performance':'Performance';if(performanceMode)closeSidebar();}
function togglePerformanceMode(){performanceMode=!performanceMode;applyPerformanceMode();}

document.getElementById('transposeDown').addEventListener('click',()=>changeTranspose(-1));document.getElementById('transposeUp').addEventListener('click',()=>changeTranspose(1));document.getElementById('fontDown').addEventListener('click',()=>{fontSize--;applyFontSize();});document.getElementById('fontUp').addEventListener('click',()=>{fontSize++;applyFontSize();});els.modeButtons.forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.mode)));els.tabNotationButtons.forEach(btn=>btn.addEventListener('click',()=>setTabNotation(btn.dataset.tabNotation)));els.search.addEventListener('input',e=>renderSongList(e.target.value));els.scrollToggle.addEventListener('click',toggleAutoScroll);els.columnsToggle.addEventListener('click',toggleColumns);els.scrollSpeed.addEventListener('input',()=>{els.scrollSpeedValue.textContent=els.scrollSpeed.value;localStorage.setItem('gl.scrollSpeed',els.scrollSpeed.value);});els.menuBtn.addEventListener('click',toggleSidebar);els.backdrop.addEventListener('click',closeSidebar);els.setupToggle.addEventListener('click',toggleSetup);els.performanceToggle.addEventListener('click',togglePerformanceMode);
els.audioFile.addEventListener('change',()=>{const file=els.audioFile.files?.[0];if(!file)return;if(audioObjectUrl)URL.revokeObjectURL(audioObjectUrl);audioObjectUrl=URL.createObjectURL(file);els.audio.src=audioObjectUrl;els.audio.play().catch(()=>{});});
window.addEventListener('keydown',e=>{const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if(e.code==='Space'&&!typing){e.preventDefault();toggleAutoScroll();}if(e.key==='Escape'){if(performanceMode){performanceMode=false;applyPerformanceMode();}else{isMobileSidebar()?closeSidebar():collapseDesktopSidebar();}}});
window.addEventListener('resize',()=>{closeSidebar();applyDesktopSidebarState();applyColumnMode();});const savedSpeed=localStorage.getItem('gl.scrollSpeed');if(savedSpeed)els.scrollSpeed.value=savedSpeed;els.scrollSpeedValue.textContent=els.scrollSpeed.value;applySetupState();applyDesktopSidebarState();applyPerformanceMode();renderAll();
