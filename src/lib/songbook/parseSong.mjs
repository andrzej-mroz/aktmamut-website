export function parseSong(source, fallbackId = 'song') {
  const metadata = {};
  const sections = [];
  let currentSection = null;
  let currentLine = null;
  let currentTab = null;

  const ensureSection = () => {
    if (!currentSection) {
      currentSection = { title: 'Song', lines: [], blocks: [] };
      sections.push(currentSection);
    }
    if (!currentSection.blocks) currentSection.blocks = [];
    return currentSection;
  };

  const finishTab = () => {
    if (!currentTab) return;
    currentTab.sequence = currentTab.sequence.join(' ').trim();
    currentTab = null;
  };

  for (const rawLine of String(source).replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (currentTab) {
      if (trimmed === '@endtab') {
        finishTab();
        continue;
      }
      if (!trimmed || trimmed.startsWith('//')) continue;
      currentTab.sequence.push(trimmed);
      continue;
    }

    if (!trimmed || trimmed.startsWith('//')) continue;

    if (trimmed.startsWith('# ')) {
      currentSection = { title: trimmed.slice(2).trim(), lines: [], blocks: [] };
      sections.push(currentSection);
      currentLine = null;
      continue;
    }

    const tabStart = trimmed.match(/^@tab(?:\s+(.*?))?(?:\s+\(?x(\d+)\)?)?$/i);
    if (tabStart) {
      const section = ensureSection();
      currentTab = {
        type: 'tab',
        title: (tabStart[1] || 'Tab').trim(),
        repeat: tabStart[2] ? Number.parseInt(tabStart[2], 10) : 1,
        sequence: [],
      };
      section.blocks.push(currentTab);
      currentLine = null;
      continue;
    }

    const directive = trimmed.match(/^@([a-zA-Z][\w-]*)\s+(.*)$/);
    if (directive) {
      const [, key, value] = directive;
      if (key === 'ipa') {
        if (!currentLine) throw new Error('@ipa must follow a lyric line');
        currentLine.ipa = value.trim();
      } else {
        metadata[key] = value.trim();
      }
      continue;
    }

    currentLine = { type: 'line', lyric: line.trim(), ipa: '' };
    const section = ensureSection();
    section.lines.push(currentLine);
    section.blocks.push(currentLine);
  }

  if (currentTab) finishTab();

  const capo = Number.parseInt(metadata.capo ?? '0', 10);
  const tempo = metadata.tempo ? Number.parseInt(metadata.tempo, 10) : undefined;

  return {
    id: metadata.id || fallbackId,
    title: metadata.title || fallbackId,
    artist: metadata.artist || '',
    key: metadata.key || 'C',
    capo: Number.isFinite(capo) ? capo : 0,
    ...(Number.isFinite(tempo) ? { tempo } : {}),
    ...(metadata.time ? { time: metadata.time } : {}),
    ...(metadata.version ? { version: metadata.version } : {}),
    ...(metadata.strumming ? { strumming: metadata.strumming } : {}),
    sections,
  };
}
