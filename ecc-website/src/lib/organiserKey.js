export const KEY_STORE = "ecc-organiser-key";

/** The organiser key remembered on this device ("" if none). */
export function readKey() {
  try {
    return localStorage.getItem(KEY_STORE) || "";
  } catch {
    return "";
  }
}

export function storeKey(key) {
  try {
    localStorage.setItem(KEY_STORE, key);
  } catch {
    /* storage unavailable */
  }
}
