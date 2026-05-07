
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



/**
 * Retourne le HTML d'un spinner de chargement.
 * @param {number} colspan - nombre de colonnes à occuper (pour la grille)
 */
function spinnerHTML(colspan = 1) {
  return `
    <div class="flex items-center justify-center py-12 col-span-${colspan}">
      <div class="spinner"></div>
    </div>`;
}

/**
 * Retourne le HTML d'un message d'erreur.
 * @param {string} msg - message à afficher
 */
function errorHTML(msg = "Impossible de contacter l'API. Assurez-vous que JSON Server est démarré.") {
  return `
    <div class="col-span-3 py-10 text-center">
      <div class="text-4xl mb-3">⚠️</div>
      <p class="text-red-400 font-medium">${msg}</p>
      <p class="text-app-muted text-sm mt-2">Lance : <code class="text-fire">json-server --watch db.json</code></p>
    </div>`;
}

/**
 * Retourne la classe CSS du badge selon le statut.
 * @param {string} status - statut de la commande
 */
function badgeClass(status) {
  const classes = {
    pending:   "badge-pending",
    accepted:  "badge-accepted",
    completed: "badge-completed",
    rejected:  "badge-rejected",
  };
  return classes[status] || "badge-pending";
}


function statusEmoji(status) {
  const emojis = {
    pending:   "⏳",
    accepted:  "✅",
    completed: "🎉",
    rejected:  "❌",
  };
  return emojis[status] || "❓";
}


function statusLabel(status) {
  const labels = {
    pending:   "En attente",
    accepted:  "Acceptée",
    completed: "Terminée",
    rejected:  "Rejetée",
  };
  return labels[status] || status;
}


/**
 * Génère le HTML d'une carte statistique.
 * @param {string} icon      - emoji icône
 * @param {string} label     - libellé de la stat
 * @param {number} value     - valeur numérique
 * @param {string} color     - couleur du chiffre (hex)
 * @param {string} glowColor - couleur du halo de fond (rgba)
 */
function statCard(icon, label, value, color, glowColor) {
  return `
    <div class="stat-card animate-fade-in">
      <div class="orb" style="background:${glowColor};"></div>
      <div class="text-2xl mb-3">${icon}</div>
      <div class="text-3xl font-display font-extrabold mb-1" style="color:${color}">${value}</div>
      <div class="text-xs font-semibold uppercase tracking-widest" style="color:#6B6A82">${label}</div>
    </div>`;
}

/**
 * Génère le HTML d'une ligne de commande compacte (pour le dashboard).
 * @param {object} order - objet commande
 */
function orderRowHTML(order) {
  return `
    <div class="order-card p-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
             style="background:linear-gradient(135deg,rgba(255,107,0,0.2),rgba(255,60,172,0.2)); color:#FF6B00; border:1px solid rgba(255,107,0,0.2);">
          ${order.customerName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div class="font-semibold text-sm text-app-text">${order.customerName}</div>
          <div class="text-xs text-app-muted">${Array.isArray(order.items) ? order.items.join(", ") : order.items}</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="font-bold text-sm" style="color:#FF6B00;">${order.totalPrice} MAD</span>
        <span class="px-2 py-1 rounded-full text-xs font-semibold ${badgeClass(order.status)}">
          ${statusEmoji(order.status)} ${statusLabel(order.status)}
        </span>
      </div>
    </div>`;
}


function getNextActions(status) {
  const actions = {
    pending: [
      { status: "accepted",  emoji: "✅", label: "Accepter",  color: "#10D9A0" },
      { status: "rejected",  emoji: "❌", label: "Rejeter",   color: "#FF4444" },
    ],
    accepted: [
      { status: "completed", emoji: "🎉", label: "Terminer",  color: "#A78BFA" },
    ],
    completed: [],
    rejected:  [],
  };
  return actions[status] || [];
}

/**
 * Génère le HTML d'une card de commande complète avec boutons d'action.
 * @param {object} order - objet commande
 */
function orderCardHTML(order) {
  const nextActions = getNextActions(order.status);

  return `
    <div class="order-card p-5 flex flex-col gap-4 animate-fade-in" id="order-${order.id}">

      <!-- En-tête : avatar + nom + date + badge statut -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base"
               style="background:linear-gradient(135deg,rgba(255,107,0,0.2),rgba(255,60,172,0.2)); color:#FF6B00; border:1px solid rgba(255,107,0,0.2);">
            ${order.customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="font-semibold text-app-text">${order.customerName}</div>
            <div class="text-xs text-app-muted">${order.createdAt}</div>
          </div>
        </div>
        <span class="px-2 py-1 rounded-full text-xs font-bold ${badgeClass(order.status)}">
          ${statusEmoji(order.status)} ${statusLabel(order.status)}
        </span>
      </div>

      <!-- Articles commandés -->
      <div>
        <div class="text-xs font-semibold uppercase tracking-widest mb-2 text-app-muted">Articles</div>
        <div class="flex flex-wrap gap-1.5">
          ${(Array.isArray(order.items) ? order.items : [order.items]).map(item =>
            `<span class="text-xs px-2.5 py-1 rounded-lg font-medium"
                   style="background:rgba(255,107,53,0.08); color:#2D1B0E; border:1px solid rgba(255,107,53,0.15);">${item.trim()}</span>`
          ).join("")}
        </div>
      </div>

      <!-- Prix total -->
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-widest text-app-muted">Total</span>
        <span class="text-lg font-display font-bold" style="color:#FF6B00;">${order.totalPrice} MAD</span>
      </div>

      <!-- Boutons d'action (changeStatus / deleteOrder viennent de personne4.js) -->
      <div class="flex flex-wrap gap-2 pt-2" style="border-top:1px solid rgba(255,107,53,0.12);">
        ${nextActions.map(action => `
          <button
            onclick="changeStatus(${order.id}, '${action.status}')"
            class="btn-ghost text-xs flex-1"
            style="color:${action.color}; border-color:${action.color}40;">
            ${action.emoji} ${action.label}
          </button>
        `).join("")}
        <button
          onclick="deleteOrder(${order.id})"
          class="btn-ghost text-xs"
          style="color:#FF4444; border-color:rgba(255,68,68,0.3);">
          🗑️
        </button>
      </div>
    </div>`;
}


async function loadDashboard() {
  const statsContainer  = document.getElementById("stats-container");
  const recentContainer = document.getElementById("recent-orders");

  statsContainer.innerHTML  = spinnerHTML(5);
  recentContainer.innerHTML = spinnerHTML();

  try {
    const orders = await fetchOrders();   
    allOrders = orders;

    
    const stats = {
      total:     orders.length,
      pending:   orders.filter(o => o.status === "pending").length,
      accepted:  orders.filter(o => o.status === "accepted").length,
      completed: orders.filter(o => o.status === "completed").length,
      rejected:  orders.filter(o => o.status === "rejected").length,
    };

  
    statsContainer.innerHTML = `
      ${statCard("📦", "Total",      stats.total,     "#60A5FA", "rgba(96,165,250,0.5)")}
      ${statCard("⏳", "En attente", stats.pending,   "#FFB800", "rgba(255,184,0,0.5)")}
      ${statCard("✅", "Acceptées",  stats.accepted,  "#10D9A0", "rgba(16,217,160,0.5)")}
      ${statCard("🎉", "Terminées",  stats.completed, "#A78BFA", "rgba(167,139,250,0.5)")}
      ${statCard("❌", "Rejetées",   stats.rejected,  "#FF7070", "rgba(255,68,68,0.5)")}
    `;

   
    const recent = [...orders].reverse().slice(0, 3);
    if (recent.length === 0) {
      recentContainer.innerHTML = `<p class="text-app-muted text-sm">Aucune commande pour l'instant.</p>`;
    } else {
      recentContainer.innerHTML = recent.map(orderRowHTML).join("");
    }

  } catch (error) {
    console.error("Erreur dashboard:", error);
    statsContainer.innerHTML  = errorHTML();
    recentContainer.innerHTML = "";
  }
}


async function loadOrders() {
  const container = document.getElementById("orders-container");
  container.innerHTML = spinnerHTML(3);

  try {
    allOrders = await fetchOrders();   
    renderOrders(allOrders);
  } catch (error) {
    console.error("Erreur chargement commandes:", error);
    container.innerHTML = errorHTML();
  }
}

/**
 * Affiche une liste de commandes sous forme de cards.
 * @param {Array} orders - tableau de commandes à afficher
 */
function renderOrders(orders) {
  const container = document.getElementById("orders-container");

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="col-span-3 py-16 text-center">
        <div class="text-5xl mb-4">🍽️</div>
        <p class="text-app-muted font-medium">Aucune commande trouvée</p>
      </div>`;
    return;
  }

  container.innerHTML = orders.map(order => orderCardHTML(order)).join("");
}


/**
 * Affiche une page et cache les autres.
 * @param {string} pageName - "dashboard", "orders", ou "new-order"
 */
function showPage(pageName) {
  // 1. Cacher toutes les pages
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  // 2. Afficher la page demandée avec animation
  const target = document.getElementById("page-" + pageName);
  if (target) {
    target.classList.add("active");
    target.classList.remove("animate-fade-in");
    void target.offsetWidth; // force reflow pour relancer l'animation CSS
    target.classList.add("animate-fade-in");
  }

  // 3. Mettre à jour le lien actif dans la navbar
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
    if (link.dataset.page === pageName) {
      link.classList.add("active");
    }
  });

  // 4. Charger les données selon la page affichée
  if (pageName === "dashboard") loadDashboard();   // ← personne2.js
  if (pageName === "orders")    loadOrders();       // ← personne2.js
}

// ══════════════════════════════════════════════════════════════
//  🔍  FILTRAGE DES COMMANDES
//  Filtrage côté client (sans nouveau fetch)
// ══════════════════════════════════════════════════════════════

/**
 * Filtre les commandes affichées selon le select de statut.
 * Utilise allOrders déjà chargé en mémoire (pas de fetch).
 */
function filterOrders() {
  const selectedStatus = document.getElementById("filter-select").value;

  if (selectedStatus === "all") {
    renderOrders(allOrders);           // ← personne2.js
  } else {
    const filtered = allOrders.filter(order => order.status === selectedStatus);
    renderOrders(filtered);            // ← personne2.js
  }
}

// ══════════════════════════════════════════════════════════════
//  🔄  MODIFIER LE STATUT D'UNE COMMANDE
// ══════════════════════════════════════════════════════════════

/**
 * Envoie un PATCH pour changer le statut d'une commande
 * puis rafraîchit l'affichage.
 *
 * @param {number|string} id     - identifiant de la commande
 * @param {string}        status - nouveau statut
 */
async function changeStatus(id, status) {
  try {
    await patchOrder(id, { status });   // ← personne3.js

    // Recharger les données et re-rendre
    allOrders = await fetchOrders();    // ← personne3.js
    renderOrders(allOrders);            // ← personne2.js
    filterOrders();                     // Réappliquer le filtre actif

    // Mettre à jour le dashboard si c'est la page active
    if (document.getElementById("page-dashboard").classList.contains("active")) {
      await loadDashboard();            // ← personne2.js
    }

  } catch (error) {
    console.error("Erreur changement statut:", error);
    alert("❌ Impossible de modifier le statut.");
  }
}

// ══════════════════════════════════════════════════════════════
//  🗑️  SUPPRIMER UNE COMMANDE
// ══════════════════════════════════════════════════════════════

/**
 * Demande confirmation puis supprime la commande via l'API.
 * @param {number|string} id - identifiant de la commande à supprimer
 */
async function deleteOrder(id) {
  if (!confirm("🗑️ Supprimer cette commande ? Cette action est irréversible.")) return;

  try {
    await removeOrder(id);   // ← personne3.js
    filterOrders();          // Re-rendre avec le filtre actif
  } catch (error) {
    console.error("Erreur suppression:", error);
    alert("❌ Impossible de supprimer.");
  }
}

// ══════════════════════════════════════════════════════════════
//  ➕  FORMULAIRE — CRÉER UNE NOUVELLE COMMANDE
// ══════════════════════════════════════════════════════════════

/**
 * Lit les champs du formulaire, valide les données,
 * puis envoie un POST à l'API.
 */
async function submitOrder() {
  const name  = document.getElementById("input-name").value.trim();
  const items = document.getElementById("input-items").value.trim();
  const price = document.getElementById("input-price").value.trim();

  const successMsg = document.getElementById("success-msg");
  const errorMsg   = document.getElementById("form-error-msg");

  // Réinitialiser les messages
  successMsg.classList.add("hidden");
  errorMsg.classList.add("hidden");

  // ── Validation ──
  if (!name || !items || !price) {
    errorMsg.textContent = "⚠️ Tous les champs sont obligatoires.";
    errorMsg.classList.remove("hidden");
    return;
  }

  if (Number(price) <= 0) {
    errorMsg.textContent = "⚠️ Le prix doit être supérieur à 0.";
    errorMsg.classList.remove("hidden");
    return;
  }

  // ── Construire l'objet commande ──
  const newOrder = {
    customerName: name,
    items: items.split(",").map(item => item.trim()).filter(item => item !== ""),
    totalPrice: Number(price),
    status: "pending",
    createdAt: new Date().toISOString().split("T")[0],
  };

  try {
    const created = await postOrder(newOrder);   // ← personne3.js

    successMsg.textContent = `✅ Commande #${created.id} créée pour ${created.customerName} !`;
    successMsg.classList.remove("hidden");

    resetForm();

  } catch (error) {
    console.error("Erreur création commande:", error);
    errorMsg.textContent = "❌ Erreur lors de la création.";
    errorMsg.classList.remove("hidden");
  }
}

/**
 * Vide tous les champs du formulaire.
 */
function resetForm() {
  document.getElementById("input-name").value  = "";
  document.getElementById("input-items").value = "";
  document.getElementById("input-price").value = "";
}

// ══════════════════════════════════════════════════════════════
//  🦶  FOOTER DYNAMIQUE
// ══════════════════════════════════════════════════════════════

/**
 * Charge les informations du footer depuis /settings.
 */
async function loadFooter() {
  try {
    const settings = await fetchSettings();   // ← personne3.js

    document.getElementById("footer-name").textContent  = settings.restaurantName;
    document.getElementById("footer-email").textContent = settings.contactEmail;
    document.getElementById("footer-email").href        = "mailto:" + settings.contactEmail;

  } catch (error) {
    console.warn("Impossible de charger les settings:", error);
  }
}

// ══════════════════════════════════════════════════════════════
//  🚀  INITIALISATION
//  Point d'entrée de l'application
// ══════════════════════════════════════════════════════════════

/**
 * Initialise l'application au chargement de la page.
 */
function init() {
  loadFooter();       // Charger le footer
  loadDashboard();    // Afficher le dashboard par défaut
  console.log("🍽️ Foodiez Dashboard démarré !");
}

// Attendre que le DOM soit prêt avant d'initialiser
document.addEventListener("DOMContentLoaded", init);
