export function parseSong(source, fallbackId = 'song') {
  const metadata = {};
  const sections = [];
  let currentSection = null;
  let currentLine = null;

  const ensureSection = () => {
    if (!currentSection) {
      currentSection = { title: 'Song', lines: [] };
      sections.push(currentSection);
    }
    return currentSection;
  };

  for (const rawLine of String(source).replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('//')) continue;

    if (trimmed.startsWith('# ')) {
      currentSection = { title: trimmed.slice(2).trim(), lines: [] };
      sections.push(currentSection);
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

    currentLine = { lyric: line.trim(), ipa: '' };
    ensureSection().lines.push(currentLine);
  }

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
