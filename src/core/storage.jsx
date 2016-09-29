// simple wrapper for local storage

export function get (key) {
  return window.localStorage.getItem(key);
}

export function set (key, value) {
  window.localStorage.setItem(key, value);
}

export function remove (key) {
  return window.localStorage.removeItem(key);
}

export function clear () {
  window.localStorage.clear();
}
