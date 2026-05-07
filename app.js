
const API_URL = "http://localhost:3000";

let allOrders = [];
let localIdCounter = 100;
const MOCK_ORDERS = [
  { id: 1, customerName: "Ahmed",   items: ["Pizza Margherita", "Soda"],           totalPrice: 120, status: "pending",   createdAt: "2025-03-16" },
  { id: 2, customerName: "Fatima",  items: ["Burger Classic", "Frites", "Jus"],    totalPrice: 95,  status: "accepted",  createdAt: "2025-03-16" },
  { id: 3, customerName: "Youssef", items: ["Salade César", "Eau"],                totalPrice: 65,  status: "completed", createdAt: "2025-03-15" },
  { id: 4, customerName: "Nadia",   items: ["Tajine Poulet", "Pain"],              totalPrice: 110, status: "rejected",  createdAt: "2025-03-15" },
  { id: 5, customerName: "Karim",   items: ["Couscous Royal", "Thé à la menthe"], totalPrice: 145, status: "pending",   createdAt: "2025-03-14" },
];
const MOCK_SETTINGS = {
  restaurantName: "Foodiez",
  contactEmail: "contact@foodiez.ma",
};
function showOfflineBanner() {
  if (document.getElementById("offline-banner")) return;

  const banner = document.createElement("div");
  banner.id = "offline-banner";
  banner.innerHTML = `
    <div style="
      background: rgba(255,184,0,0.08);
      border-bottom: 1px solid rgba(255,184,0,0.2);
      color: #FFB800;
      font-size: 13px;
      font-family: 'DM Sans', sans-serif;
      padding: 8px 16px;
      text-align: center;
      position: sticky;
      top: 61px;
      z-index: 40;
    ">
      ⚡ Mode démo — JSON Server non détecté.
      Lance : <code style="color:#FF6B00; background:rgba(255,107,0,0.12); padding:2px 6px; border-radius:4px;">json-server --watch db.json</code>
      pour activer l'API. Les données sont simulées localement.
    </div>
  `;
  const nav = document.querySelector("nav");
  nav.insertAdjacentElement("afterend", banner);
}


async function fetchOrders() {
  if (offlineMode) return [...(allOrders.length ? allOrders : MOCK_ORDERS)];

  try {
    const res = await fetch(`${API_URL}/orders`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    offlineMode = false;
    return await res.json();
  } catch {
    offlineMode = true;
    showOfflineBanner();
    if (allOrders.length === 0) allOrders = [...MOCK_ORDERS];
    return [...allOrders];
  }
}

async function fetchSettings() {
  if (offlineMode) return { ...MOCK_SETTINGS };
  try {
    const res = await fetch(`${API_URL}/settings`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch {
    offlineMode = true;
    return { ...MOCK_SETTINGS };
  }
}

async function patchOrder(id, data) {
  if (offlineMode) {
    allOrders = allOrders.map(o => o.id === id ? { ...o, ...data } : o);
    return true;
  }
  try {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return true;
  } catch {
    offlineMode = true;
    showOfflineBanner();
    allOrders = allOrders.map(o => o.id === id ? { ...o, ...data } : o);
    return true;
  }
}

async function removeOrder(id) {
  if (offlineMode) {
    allOrders = allOrders.filter(o => o.id !== id);
    return true;
  }
  try {
    const res = await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return true;
  } catch {
    offlineMode = true;
    showOfflineBanner();
    allOrders = allOrders.filter(o => o.id !== id);
    return true;
  }
}

async function postOrder(newOrder) {
  if (offlineMode) {
    const created = { ...newOrder, id: ++localIdCounter };
    allOrders.push(created);
    return created;
  }
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch {
    offlineMode = true;
    showOfflineBanner();
    const created = { ...newOrder, id: ++localIdCounter };
    allOrders.push(created);
    return created;
  }
}
