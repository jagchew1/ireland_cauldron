export async function fetchHealth() {
  const r = await fetch('/health');
  return r.json();
}

export async function fetchAssets() {
  const r = await fetch('/assets/list');
  return r.json();
}

export async function fetchRooms() {
  const r = await fetch('/rooms');
  return r.json();
}
