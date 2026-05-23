async function fetchHTML(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return await res.text();
}

function initNavbar() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconImg = document.getElementById('hamburger-icon-img');

  if (!hamburger || !mobileMenu) return;

  // =========================
  // HAMBURGER TOGGLE
  // =========================
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');

    hamburger.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
      hamburger.style.background = '#FFD447';
      hamburger.style.borderRadius = '8px';
      hamburger.style.padding = '6px';
      iconImg.style.filter = 'brightness(0)';
    } else {
      hamburger.style.background = 'transparent';
      hamburger.style.padding = '0';
      iconImg.style.filter = 'none';
    }
  });

  // =========================
  // PROGRAMS DROPDOWN (MOBILE ONLY)
  // =========================

  const mobileProgramsToggle = mobileMenu.querySelector('.programs-toggle');
  const mobileProgramsSubmenu = mobileMenu.querySelector('.programs-submenu.mobile-only');
  const mobileProgramsChevron = mobileMenu.querySelector('.programs-chevron');

  if (mobileProgramsToggle && mobileProgramsSubmenu) {
    mobileProgramsToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = mobileProgramsSubmenu.classList.toggle('open');

      mobileProgramsToggle.setAttribute('aria-expanded', isOpen);

      if (mobileProgramsChevron) {
        mobileProgramsChevron.style.transform = isOpen
          ? 'rotate(180deg)'
          : 'rotate(0deg)';
      }
    });
  }

  // =========================
  // CLOSE MENU ON LINK CLICK
  // =========================
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.style.background = 'transparent';
      hamburger.style.padding = '0';
      iconImg.style.filter = 'none';

      // also close submenu when nav closes
      const submenu = mobileMenu.querySelector('.programs-submenu.mobile-only');
      if (submenu) submenu.classList.remove('open');
    });
  });

  // =========================
  // CLOSE ON OUTSIDE CLICK
  // =========================
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.style.background = 'transparent';
      hamburger.style.padding = '0';
      iconImg.style.filter = 'none';

      const submenu = mobileMenu.querySelector('.programs-submenu.mobile-only');
      if (submenu) submenu.classList.remove('open');
    }
  });
}

async function loadLayout() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('No <div id="app"> found.');
    return;
  }

  const mainContent = app.innerHTML;

  try {
    const [navbarHTML, footerHTML] = await Promise.all([
      fetchHTML('/components/navbar.html'),
      fetchHTML('/components/footer.html'),
    ]);

    app.innerHTML = `
      ${navbarHTML}
      <main id="page-content">${mainContent}</main>
      ${footerHTML}
    `;

    await loadPartials();
    initNavbar();

  } catch (err) {
    console.error('Failed to load layout components:', err);
  }
}

async function loadPartials() {
  const partialNodes = document.querySelectorAll('[data-include]');

  await Promise.all(
    [...partialNodes].map(async (node) => {
      const file = node.getAttribute('data-include');
      if (!file) return;

      try {
        node.innerHTML = await fetchHTML(file);
      } catch (err) {
        console.error(`Failed to load partial: ${file}`, err);
      }
    })
  );
}

document.addEventListener('DOMContentLoaded', loadLayout);