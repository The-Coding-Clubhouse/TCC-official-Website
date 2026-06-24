# The Coding Clubhouse 🌍

A collaborative web platform for showcasing programs, initiatives, and learning experiences focused on empowering young people through technology education.

---

## 🚀 Tech Stack

- HTML5
- CSS (Tailwind)
- JavaScript (ES6+)
- Vite
- Node.js + npm

---

## 📁 Project Structure

```
/components  → Shared UI components (navbar, footer)
/js          → JavaScript utilities (layout system)
/pages       → Website pages
/styles      → Tailwind input/output CSS
```

---

## ⚙️ Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

This starts the local development environment (Vite).

---

## 🧩 Layout System (IMPORTANT)

This project uses a JavaScript-based layout system to avoid repeating navbar and footer code. Instead of duplicating layout elements on every page, they are automatically injected.

### How it works

Each page must include:

```html
<div id="app">
  <!-- page content only -->
</div>

<script src="/js/layout.js"></script>
```

The system automatically loads:
- Navbar from `/components/navbar.html`
- Footer from `/components/footer.html`

---

## 📌 Available Pages

- Home
- About
- Programs
- Resources
- Contact Us
- Get Involved
- Dream Beyond Limit
- Teacher Training & Youth Empowerment
- Virtual Summer Classes
- Young Builders Program

---

## 🧑‍💻 Contributing

Please read `CONTRIBUTING.md` before contributing to this project.

---

## 📦 Scripts

```bash
npm run dev    # Start development server
npm run build  # Build production assets
```

---

## ⚠️ Important Rules

- Do not duplicate navbar or footer in pages
- Always run `npm run dev` before submitting PRs
- Keep pull requests small and focused
- Work only on feature branches (never `main`)

---

## 📜 License

ISC License