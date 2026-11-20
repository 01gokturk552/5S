export type CfxServer = {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  locale: string;
  tags: string[];
  iconUrl: string | null;
  bannerUrl: string | null;
  joinEndpoint: string | null;
  lastSeen: string | null;
};

export function isTurkishServer(server: {
  locale?: string;
  name?: string;
  tags?: string[];
}): boolean {
  const locale = (server.locale ?? '').toLowerCase();
  const name = (server.name ?? '').toLocaleLowerCase('tr');
  const tags = (server.tags ?? []).join(' ').toLocaleLowerCase('tr');

  if (locale === 'tr-tr' || locale === 'tr') return true;

  const turkishTerms =
    /\b(türkiye|turkiye|turkish|türk|turk)\b|\b(tr)\b/i;

  return turkishTerms.test(name) || turkishTerms.test(tags);
}

let turkishServerCache:
  | { expiresAt: number; servers: CfxServer[] }
  | null = null;

function readVarint(bytes: Uint8Array, offset: number) {
  let value = 0;
  let shift = 0;
  for (; offset < bytes.length && shift < 35; offset += 1) {
    const byte = bytes[offset];
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return { value: value >>> 0, offset: offset + 1 };
    shift += 7;
  }
  return null;
}

function readLengthDelimited(bytes: Uint8Array, offset: number) {
  const lengthResult = readVarint(bytes, offset);
  if (!lengthResult) return null;
  const start = lengthResult.offset;
  const end = start + lengthResult.value;
  if (end > bytes.length) return null;
  return {
    bytes: bytes.subarray(start, end),
    offset: end,
  };
}

function readText(bytes: Uint8Array) {
  return new TextDecoder('utf-8').decode(bytes);
}

function parseVars(dataBytes: Uint8Array) {
  let offset = 0;
  let key = '';
  let value = '';
  while (offset < dataBytes.length) {
    const tag = readVarint(dataBytes, offset);
    if (!tag) break;
    offset = tag.offset;
    const field = tag.value >>> 3;
    const wireType = tag.value & 7;
    if (wireType !== 2) break;
    const result = readLengthDelimited(dataBytes, offset);
    if (!result) break;
    offset = result.offset;
    if (field === 1) key = readText(result.bytes);
    if (field === 2) value = readText(result.bytes);
  }
  return key ? { [key]: value } : {};
}

function parseServerFrame(frame: Uint8Array) {
  let id = '';
  let hostname = '';
  let players = 0;
  let maxPlayers = 0;
  let vars: Record<string, string> = {};
  let joinEndpoint: string | null = null;
  let offset = 0;

  while (offset < frame.length) {
    const tag = readVarint(frame, offset);
    if (!tag) break;
    offset = tag.offset;
    const field = tag.value >>> 3;
    const wireType = tag.value & 7;

    if (field === 1 && wireType === 2) {
      const result = readLengthDelimited(frame, offset);
      if (!result) break;
      offset = result.offset;
      id = readText(result.bytes);
      continue;
    }

    if (field === 2 && wireType === 2) {
      const result = readLengthDelimited(frame, offset);
      if (!result) break;
      offset = result.offset;
      const data = result.bytes;
      let dataOffset = 0;
      while (dataOffset < data.length) {
        const dataTag = readVarint(data, dataOffset);
        if (!dataTag) break;
        dataOffset = dataTag.offset;
        const dataField = dataTag.value >>> 3;
        const dataWire = dataTag.value & 7;

        if (dataWire === 0) {
          const value = readVarint(data, dataOffset);
          if (!value) break;
          dataOffset = value.offset;
          if (dataField === 1) maxPlayers = value.value;
          if (dataField === 2) players = value.value;
          continue;
        }

        if (dataWire === 2) {
          const value = readLengthDelimited(data, dataOffset);
          if (!value) break;
          dataOffset = value.offset;
          if (dataField === 4) hostname = readText(value.bytes);
          if (dataField === 12) {
            const entryVars = parseVars(value.bytes);
            vars = { ...vars, ...entryVars };
          }
          if (dataField === 18) joinEndpoint = readText(value.bytes);
          continue;
        }
        break;
      }
      continue;
    }
    break;
  }

  return { id, hostname, players, maxPlayers, vars, joinEndpoint };
}

export async function getCfxTurkishServers(): Promise<CfxServer[]> {
  try {
    if (turkishServerCache && turkishServerCache.expiresAt > Date.now()) {
      return turkishServerCache.servers;
    }

    const response = await fetch(
      'https://frontend.cfx-services.net/api/servers/streamRedir/',
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(20000),
        headers: { Accept: 'application/octet-stream' },
      },
    );
    if (!response.ok || !response.body) return [];

    const servers: CfxServer[] = [];
    const reader = response.body.getReader();
    let pending = new Uint8Array();

    while (true) {
      const { done, value } = await reader.read();
      if (value?.length) {
        const combined = new Uint8Array(pending.length + value.length);
        combined.set(pending);
        combined.set(value, pending.length);
        pending = combined;
      }

      let offset = 0;
      while (pending.length - offset >= 4) {
        const length =
          pending[offset] |
          (pending[offset + 1] << 8) |
          (pending[offset + 2] << 16) |
          (pending[offset + 3] << 24);

        if (length <= 0 || length > 65535) {
          offset = pending.length;
          break;
        }
        if (pending.length - offset - 4 < length) break;

        const frame = pending.subarray(offset + 4, offset + 4 + length);
        offset += 4 + length;

        const decoded = parseServerFrame(frame);
        if (decoded.id && decoded.vars) {
          const name =
            decoded.vars.sv_projectName ||
            decoded.vars.hostname ||
            decoded.hostname ||
            '';
          const locale = decoded.vars.locale || 'Belirtilmemiş';
          const tags =
            typeof decoded.vars.tags === 'string'
              ? decoded.vars.tags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .slice(0, 4)
              : [];

          if (name && isTurkishServer({ locale, name, tags })) {
            servers.push({
              id: decoded.id,
              name,
              players: decoded.players,
              maxPlayers: decoded.maxPlayers,
              locale,
              tags,
              iconUrl: decoded.vars.icon_url || null,
              bannerUrl: decoded.vars.banner_detail || null,
              joinEndpoint: decoded.joinEndpoint,
              lastSeen: null,
            });
          }
        }
      }

      if (done) break;

      if (offset > 0) {
        pending = pending.slice(offset);
      }
    }

    const sortedServers = servers.sort((a, b) => b.players - a.players);
    turkishServerCache = {
      expiresAt: Date.now() + 60_000,
      servers: sortedServers,
    };
    return sortedServers;
  } catch {
    return [];
  }
}
