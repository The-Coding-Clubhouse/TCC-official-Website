# Contributing to The Coding Clubhouse

Thanks for contributing! 🎉  
We welcome bug fixes, new features, UI improvements, and documentation updates.

---

## Table of Contents
1. Branch Workflow
2. Development Setup
3. Code Style Guidelines
4. Component System (IMPORTANT)
5. Pull Request Process
6. Commit Message Format
7. Important Rules

---

## 1. Branch Workflow

We use a simple rule:

> One issue → One branch → One pull request

### Branch naming

- `feature/` → new features
- `bugfix/` → fixes
- `hotfix/` → urgent fixes
- `docs/` → documentation updates
- `refactor/` → code improvements

### Create a branch

```bash
git checkout -b feature/your-feature-name
```

### Keep branch updated

```bash
git fetch origin
git rebase origin/main
```

If you get conflicts:

```bash
git add .
git rebase --continue
```

To cancel rebase:

```bash
git rebase --abort
```

---

## 2. Development Setup

### Install dependencies

```bash
npm install
```

### Run project locally

```bash
npm run dev
```

This starts the Vite development server.

---

## 3. Code Style Guidelines

**HTML**
- Use semantic HTML
- Keep structure clean and readable

**CSS (Tailwind)**
- Use Tailwind utility classes
- Avoid unnecessary custom CSS

**JavaScript**
- Use ES6+
- Keep functions small and reusable
- Use `async/await` instead of raw promises

---

## 4. Component System (IMPORTANT)

We use a shared layout system (navbar + footer) loaded via JavaScript.

**Rule:**  
Do NOT copy navbar or footer into pages manually.

### How it works

Each page must include:

```html
<div id="app">
  <!-- page content only -->
</div>

<script src="/js/layout.js"></script>
```

The system automatically injects:
- Navbar
- Footer

**Shared files:**
- `/components/navbar.html`
- `/components/footer.html`
- `/js/layout.js`

---

## 5. Pull Request Process

1. Push your branch
2. Open a PR to `main`
3. Link the related issue
4. Keep PR focused on ONE feature
5. Ensure it runs locally before submitting

---

## 6. Commit Message Format

We follow [conventional commits](https://www.conventionalcommits.org/):

```
type(scope): description
```

**Examples:**
- `feat(navbar): add mobile menu`
- `fix(layout): resolve footer alignment`
- `docs(readme): update setup instructions`

**Types:**
- `feat` → new feature
- `fix` → bug fix
- `docs` → documentation
- `style` → formatting only
- `refactor` → code restructuring
- `chore` → maintenance

---

## 7. Important Rules

- Do not push directly to `main`
- Do not duplicate layout components
- Always run `npm run dev` before submitting PR
- Keep PRs small and focused