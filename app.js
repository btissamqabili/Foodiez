// ============================================================
//  🟥  PERSONNE 4 — SPA & INTERACTIONS
//  Responsabilité : Navigation, formulaire, actions, initialisation
//  Ce fichier doit être chargé APRÈS personne3.js ET personne2.js
//  Dépend de :
//    - fetchOrders, patchOrder, removeOrder, postOrder, fetchSettings (personne3.js)
//    - allOrders, offlineMode (personne3.js)
//    - loadDashboard, loadOrders, renderOrders (personne2.js)
// ============================================================

// ══════════════════════════════════════════════════════════════
//  🧭  NAVIGATION SPA (Single Page Application)
//  Affiche/cache les sections HTML sans recharger la page
// ══════════════════════════════════════════════════════════════

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
