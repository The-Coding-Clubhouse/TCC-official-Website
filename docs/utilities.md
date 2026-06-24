# Utilities Documentation

This document explains all reusable custom classes created in `input.css`.

It exists to help developers:

- Understand the design system quickly
- Reuse existing utilities instead of duplicating styles
- Maintain consistent UI patterns across the website
- Onboard faster into the project structure

---

# Project Structure

All custom classes are located inside:

```css
@layer components
```

in:

```bash
src/input.css
```

---

# Rules for Contributors

Whenever you create a new reusable class:

1. Add it to `input.css`
2. Document it here
3. Explain:
   - what it does
   - when to use it
   - when NOT to use it
4. Add an HTML example

---

# Utility Categories

This project utilities are grouped into:

- Hero
- Buttons
- Cards
- Layout
- Typography
- Navbar
- Footer
- Forms
- Gallery
- Impact Section
- Programs Dropdown

---

# Quick Reference Table

| Class | Purpose |
|---|---|
| `.hero-section` | Main hero layout wrapper |
| `.hero-header-text` | Large hero heading |
| `.hero-p` | Hero paragraph text |
| `.hero-bg` | Hero background styling |
| `.hero-btn` | Small hero floating buttons |
| `.btn` | Base button system |
| `.btn-primary` | Main CTA button |
| `.btn-secondary` | Secondary button |
| `.btn-outline` | Outline button |
| `.btn-icon` | Button icon sizing |
| `.info-section` | General section wrapper |
| `.info-card` | Generic information card |
| `.info-card-title` | Info card heading |
| `.info-card-body` | Info card body text |
| `.blog-news-card` | Blog/program style card |
| `.blog-news-card-workspace` | Card image styling |
| `.blog-news-card-header` | Card top row |
| `.blog-news-card-title` | Small card title |
| `.profile-card` | Team member card |
| `.profile-card__avatar-wrap` | Avatar outer ring |
| `.profile-card__avatar` | Avatar image |
| `.contact-form` | Contact form wrapper |
| `.contact-title` | Contact section title |
| `.girls-card` | Gallery card |
| `.girls-pic` | Gallery image |
| `.girls-top` | Gallery top row |
| `.navbar-container` | Main navbar wrapper |
| `.navbar-links-wrapper` | Desktop nav links |
| `.navbar-links` | Individual nav link |
| `.hamburger-icon` | Mobile menu trigger |
| `.mobile-menu` | Mobile menu container |
| `.mobile-menu__link` | Mobile nav links |
| `.programs` | Programs dropdown wrapper |
| `.programs-wrapper` | Programs flex container |
| `.programs-toggle` | Dropdown toggle button |
| `.programs-chevron` | Dropdown chevron animation |
| `.mobile-only` | Mobile dropdown menu |
| `.desktop-only` | Desktop dropdown menu |
| `.footer-container` | Footer wrapper |
| `.footer-webpages-link` | Footer links |
| `.media-icons` | Social icons container |
| `.newsletter` | Newsletter layout |
| `.impact-card-background` | Impact section card |
| `.impact-card-h1` | Impact section title |
| `.tiny-codes-snippet` | Decorative code text |
| `.intro-cards-container` | Intro section layout |
| `.card-box-wrapper` | Grid wrapper for feature boxes |
| `.card-box` | Feature tag boxes |
| `.card-bg` | Purple card background |
| `.bg-circle` | Decorative background circles |

---

# HERO UTILITIES

---

## `.hero-section`

### Purpose
Main hero section wrapper.

### Used For
- Landing page hero sections
- Full-width introductory sections

### Tailwind Applied

```css
relative text-white flex flex-col items-center justify-center text-center
```

### Example

```html
<section class="hero-section">
  Content
</section>
```

---

## `.hero-header-text`

### Purpose
Large hero headings.

### Tailwind Applied

```css
text-5xl font-heading mb-6 my-6 md:my-8 lg:my-10
```

### Example

```html
<h1 class="hero-header-text">
  We're The Coding Clubhouse.
</h1>
```

---

## `.hero-p`

### Purpose
Hero supporting paragraph text.

### Tailwind Applied

```css
font-sans p-5 text-3xl
```

### Example

```html
<p class="hero-p">
  Making computer science accessible.
</p>
```

---

## `.hero-bg`

### Purpose
Hero background image behavior.

### Notes
Uses:
- cover image
- blend mode
- centered text
- darkened background

### Tailwind Applied

```css
w-full h-[900px] font-sans text-brand-white text-center
bg-no-repeat bg-cover bg-brand-purple bg-blend-darken
```

---

## `.hero-btn`

### Purpose
Small decorative code-style buttons inside hero.

### Tailwind Applied

```css
text-sm font-light bg-brand-white/10 text-brand-aqua
p-1.5 px-4 py-2 rounded-md
```

---

# BUTTON SYSTEM

---

## `.btn`

### Purpose
Base reusable button system.

### Notes
Never use directly alone.
Always combine with:
- `.btn-primary`
- `.btn-secondary`
- `.btn-outline`

### Tailwind Applied

```css
inline-flex items-center justify-center gap-2 rounded-lg
font-medium transition-all duration-200
```

---

## `.btn-primary`

### Purpose
Primary call-to-action button.

### Used For
- Donate
- Join
- Register
- Main actions

### Tailwind Applied

```css
btn bg-brand-yellow text-brand-charcoal px-6 py-3 text-sm
```

### Example

```html
<button class="btn-primary">
  Donate Now
</button>
```

---

## `.btn-secondary`

### Purpose
Secondary action button.

### Tailwind Applied

```css
btn bg-brand-white text-brand-charcoal border-2
border-brand-purple px-6 py-3 text-sm
```

---

## `.btn-outline`

### Purpose
Transparent outline button.

### Tailwind Applied

```css
btn bg-transparent text-brand-charcoal border-2
border-brand-purple px-4 py-2 text-sm
```

---

## `.btn-icon`

### Purpose
Standard icon size inside buttons.

### Tailwind Applied

```css
w-4 h-4 shrink-0
```

---

# CARD UTILITIES

---

## `.info-section`

### Purpose
Generic section wrapper.

### Tailwind Applied

```css
text-center p-10
```

---

## `.info-card`

### Purpose
Reusable information cards.

### Tailwind Applied

```css
px-6 py-4 shadow-md rounded-xl
max-w-[350px] min-h-[550px] w-full
```

---

## `.info-card-title`

### Purpose
Card title styling.

### Tailwind Applied

```css
text-xl font-semibold mt-2 mb-4 text-left text-brand-charcoal
```

---

## `.info-card-body`

### Purpose
Body text inside info cards.

### Tailwind Applied

```css
text-base text-left text-brand-charcoal
```

---

## `.blog-news-card`

### Purpose
Main reusable content card.

### Used For
- Programs
- About cards
- Mission/Vision cards

### Tailwind Applied

```css
px-4 py-5 shadow-2xl rounded-xl max-w-[500px] w-full
```

---

## `.blog-news-card-workspace`

### Purpose
Image inside blog/program cards.

### Important
This class controls sizing only.

To prevent image cropping issues, wrap image inside:

```html
<div class="blog-news-card-workspace-wrap">
  <img class="blog-news-card-workspace">
</div>
```

### Tailwind Applied

```css
w-full h-48 mt-4 mb-1 rounded-md
```

---

## `.blog-news-card-header`

### Purpose
Top row inside cards.

### Tailwind Applied

```css
flex items-center gap-2
```

---

## `.blog-news-card-title`

### Purpose
Small card title text.

### Tailwind Applied

```css
text-sm font-semibold text-brand-gray
```

---

# PROFILE CARDS

---

## `.profile-card`

### Purpose
Team member cards.

### Tailwind Applied

```css
w-full max-w-sm flex flex-col items-center rounded-xl border-2
pt-6 pb-6 px-5 text-center shadow-sm
bg-brand-blue50 border-brand-gray
```

---

## `.profile-card__avatar-wrap`

### Purpose
Avatar outer wrapper.

### Tailwind Applied

```css
w-32 h-32 rounded-full bg-brand-white p-1.5 shadow-md
```

---

## `.profile-card__avatar`

### Purpose
Profile image styling.

### Tailwind Applied

```css
w-full h-full rounded-full object-cover
```

---

# GALLERY UTILITIES

---

## `.girls-card`

### Purpose
Gallery image card.

### Tailwind Applied

```css
w-full rounded-2xl overflow-hidden
```

---

## `.girls-pic`

### Purpose
Gallery image behavior.

### Tailwind Applied

```css
w-full h-[220px] sm:h-[260px] md:h-[315px] object-cover
```

---

## `.girls-top`

### Purpose
Gallery card top section.

### Tailwind Applied

```css
w-full flex items-center justify-between px-4 py-4
```

---

# NAVBAR

---

## `.navbar-container`

### Purpose
Main navbar wrapper.

### Tailwind Applied

```css
bg-brand-purple text-brand-white w-full flex
justify-between items-center sticky top-0 p-2
```

---

## `.navbar-links-wrapper`

### Purpose
Desktop nav links wrapper.

### Tailwind Applied

```css
hidden md:flex items-center gap-4 text-sm
font-medium mr-4
```

---

## `.navbar-links`

### Purpose
Individual nav link.

### Tailwind Applied

```css
p-2 hover:text-brand-yellow
```

---

## `.hamburger-icon`

### Purpose
Mobile menu icon.

### Tailwind Applied

```css
mt-2 cursor-pointer md:hidden
```

---

## `.mobile-menu`

### Purpose
Dropdown mobile navigation container.

### Notes
Hidden by default.
JS adds `.open`.

---

## `.mobile-menu.open`

### Purpose
Shows mobile menu.

### Tailwind Applied

```css
flex flex-col
```

---

# PROGRAMS DROPDOWN

---

## `.programs`

Wrapper for dropdown logic.

---

## `.programs-wrapper`

Flex alignment for dropdown trigger.

---

## `.programs-toggle`

Clickable dropdown toggle button.

---

## `.programs-chevron`

Chevron rotation animation.

---

## `.mobile-only`

Mobile-only dropdown menu.

---

## `.desktop-only`

Desktop-only dropdown menu.

---

# FOOTER

---

## `.footer-container`

### Purpose
Footer wrapper.

### Tailwind Applied

```css
bg-brand-white text-brand-charcoal w-full px-10 pt-20
```

---

## `.footer-webpages-link`

### Purpose
Footer navigation links.

### Tailwind Applied

```css
flex flex-wrap gap-3 text-sm font-bold py-5
```

---

## `.media-icons`

### Purpose
Social media icons container.

### Tailwind Applied

```css
flex justify-center md:justify-start gap-6
```

---

## `.newsletter`

### Purpose
Newsletter layout wrapper.

### Tailwind Applied

```css
flex flex-col md:flex-row md:items-center gap-3 my-10
```

---

# IMPACT SECTION

---

## `.impact-card-background`

### Purpose
Purple impact section card.

### Tailwind Applied

```css
text-center bg-brand-purple bg-cover bg-blend-soft-light
shadow-xl rounded-lg mx-8 md:mx-20 mt-20 mb-2 p-8
```

---

## `.impact-card-h1`

### Purpose
Impact section heading.

### Tailwind Applied

```css
font-bold text-xl md:text-3xl text-brand-charcoal font-heading
```

---

## `.tiny-codes-snippet`

### Purpose
Decorative background code snippets.

### Tailwind Applied

```css
text-right text-sm flex justify-end text-brand-blue mb-10
```

---

# INTRO CARD UTILITIES

---

## `.intro-cards-container`

### Purpose
Layout wrapper for intro/about cards.

### Tailwind Applied

```css
m-10 text-brand-charcoal block md:flex gap-8
```

---

## `.card-box-wrapper`

### Purpose
Grid wrapper for mini feature cards.

### Tailwind Applied

```css
grid md:grid-cols-2 gap-2 p-2
```

---

## `.card-box`

### Purpose
Mini tag/feature boxes.

### Tailwind Applied

```css
border-2 border-brand-gray p-2 rounded-xl
```

---

## `.card-bg`

### Purpose
Purple section background card.

### Tailwind Applied

```css
mx-8 md:mx-20 mt-20 shadow-xl rounded-lg
bg-brand-purple text-center
```

---

## `.bg-circle`

### Purpose
Decorative background circles.

### Tailwind Applied

```css
w-16 h-16 rounded-full bg-brand-purple50 absolute
```

---

# IMAGE CROPPING GUIDE

If images appear cropped unexpectedly:

## BAD

```html
<img class="w-full h-full object-cover">
```

`object-cover` fills the container and crops overflow.

---

## BETTER

```html
<div class="blog-news-card-workspace-wrap">
  <img
    src="/image.png"
    class="blog-news-card-workspace"
  />
</div>
```

This project now uses wrapper containers for workspace images to preserve aspect ratio more naturally.

---

# Final Notes

Before creating a new utility:

✅ Check if an existing class already solves the problem.

Prefer:
- reusable components
- semantic class names
- consistent spacing
- shared card systems

Avoid:
- one-off utility duplication
- inline styles unless absolutely necessary
- random spacing values outside the design system