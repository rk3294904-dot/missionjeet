// ClearKey protection data for lecture playback.
//
// The stream API hands back keys as { keyIdHex: keyHex }, while dash.js builds
// its EME init data from the enumerable keys of this map and later looks values
// up by whatever key id the browser's CDM returns. So base64url ids must be the
// enumerable ones, while hex / UUID spellings still need to resolve.

function hexToBase64Url(hex) {
  let binary = "";
  for (let i = 0; i < hex.length; i += 2) {
    binary += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// A 32-char hex value is a raw 16-byte id/key and becomes base64url; anything
// else is assumed to be base64 that merely needs normalising.
function normalizeId(value) {
  if (!value) return "";
  const hex = String(value).replace(/[^0-9a-fA-F]/g, "");
  if (hex.length === 32) return hexToBase64Url(hex);
  return String(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toUuid(value) {
  const hex = String(value).replace(/[^0-9a-fA-F]/g, "").toLowerCase();
  if (hex.length !== 32) return String(value);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function buildClearKeyMap(keys) {
  if (!keys || typeof keys !== "object") return null;

  const primary = {};
  const aliases = {};

  Object.entries(keys).forEach(([rawId, rawKey]) => {
    if (typeof rawKey !== "string") return;
    const id = normalizeId(rawId);
    const key = normalizeId(rawKey);
    if (!id || !key) return;
    primary[id] = key;
    aliases[id] = key;
    aliases[rawId] = key;
    aliases[String(rawId).toLowerCase()] = key;
    aliases[toUuid(rawId)] = key;
  });

  if (Object.keys(primary).length === 0) return null;

  // Own keys stay base64url-only (that is what seeds the CDM init data), while
  // reads resolve every spelling the CDM might hand back.
  return new Proxy(primary, {
    get(target, prop) {
      if (prop === "hasOwnProperty") {
        return (id) => {
          const normalized = normalizeId(id);
          return (
            id in primary ||
            id in aliases ||
            normalized in primary ||
            normalized in aliases
          );
        };
      }
      if (typeof prop === "string") {
        if (prop in primary) return primary[prop];
        if (prop in aliases) return aliases[prop];
        const normalized = normalizeId(prop);
        if (normalized in primary) return primary[normalized];
        if (normalized in aliases) return aliases[normalized];
      }
      return target[prop];
    },
    has(target, prop) {
      if (typeof prop === "string") {
        if (prop in primary || prop in aliases) return true;
        const normalized = normalizeId(prop);
        return normalized in primary || normalized in aliases;
      }
      return prop in target;
    },
    ownKeys() {
      return Object.keys(primary);
    },
    getOwnPropertyDescriptor(target, prop) {
      if (typeof prop === "string" && prop in primary) {
        return { value: primary[prop], writable: true, enumerable: true, configurable: true };
      }
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
  });
}