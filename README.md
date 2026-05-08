Foodiez — Restaurant Order Management SPA
A single-page application for managing restaurant orders in real time.

---

Stack
HTML5 — semantic structure
Tailwind CSS (CDN) — all styling, custom design tokens
Vanilla JS (ES6+) — SPA logic, DOM, Fetch API
JSON Server — simulated REST API
Mock fallback — works offline without JSON Server

---

Project Structure
foodiez/
├── index.html   → markup + Tailwind classes
├── scripts.js   → all JS logic (12 modules)
└── db.json      → JSON Server database


---

Getting Started
Install JSON Server

npm install -g json-server


Start the API

json-server --watch db.json --port 3000


Open index.html
 in your browser or via Live Server.

No JSON Server? The app auto-switches to built-in mock data.

---

Features
| Feature | Description |
|---|---|
| Dashboard | Live stats: total, pending, accepted, rejected, completed, revenue |
| Orders list | Cards with status strip, items, price |
| Filter | By status — instant DOM update |
| New order | Form with tag-based item input |
| Status update | Dropdown → PATCH API + instant DOM |
| Delete | Confirm modal → DELETE API + fade-out animation |
| Toasts | Slide-in notifications (success / error / info) |
| SPA | Zero page reloads, full JS navigation |

---

API Endpoints (JSON Server)
| Method | Endpoint | Action |
|---|---|---|
| GET | /orders | Fetch all orders |
| POST | /orders | Create new order |
| PATCH | /orders/:id | Update order status |
| DELETE | /orders/:id | Delete an order |
| GET | /settings | Fetch restaurant info |

---

Order Schema
{
  "id": 1,
  "customerName": "Ahmed Benali",
  "items": ["Pizza Margherita", "Soda"],
  "totalPrice": 120,
  "status": "pending",
  "createdAt": "2025-03-16"
}


Status values: pending · accepted · completed · rejected

---

©️ 2025 Foodiez — All rights reserved.