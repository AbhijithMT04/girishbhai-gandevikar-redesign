const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const menuToggle = document.querySelector('#menuToggle');
const mainNav = document.querySelector('#mainNav');

/**
 * Update header style based on scroll position:
 * - Transparent app bar ONLY when screening the hero section
 * - Solid white app bar when scrolling down past the hero section
 */
function updateHeaderOnScroll() {
  if (!header) return;

  if (hero) {
    const heroRect = hero.getBoundingClientRect();
    const headerHeight = header.offsetHeight || 64;
    // Hero is actively screening if its bottom is still below the app bar
    const isScreeningHero = heroRect.bottom > headerHeight;

    if (isScreeningHero) {
      header.classList.remove('is-scrolled');
    } else {
      header.classList.add('is-scrolled');
    }
  } else {
    if (window.scrollY > 60) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
}

window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
window.addEventListener('resize', updateHeaderOnScroll);
// Run immediately on page load
updateHeaderOnScroll();

// Mobile navigation drawer toggle
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    });
  });
}

// Current copyright year
const yearEl = document.querySelector('#year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// -------------------------------------------------------------
// Interactive Scheme Calculator (Suvarna Vruddhi Yojana)
// -------------------------------------------------------------
const schemeSlider = document.querySelector('#schemeSlider');
const monthlyDisplay = document.querySelector('#monthlyDisplay');
const userDepositDisplay = document.querySelector('#userDepositDisplay');
const bonusDisplay = document.querySelector('#bonusDisplay');
const totalMaturityDisplay = document.querySelector('#totalMaturityDisplay');
const amountPills = document.querySelectorAll('.amount-chip');

function formatRupee(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function updateSchemeCalculator(monthlyAmount) {
  const deposit = Number(monthlyAmount);
  const userPays = deposit * 11;
  const bonus = deposit; // 12th month free bonus
  const total = userPays + bonus;

  if (monthlyDisplay) monthlyDisplay.textContent = formatRupee(deposit);
  if (userDepositDisplay) userDepositDisplay.textContent = formatRupee(userPays);
  if (bonusDisplay) bonusDisplay.textContent = '+ ' + formatRupee(bonus);
  if (totalMaturityDisplay) totalMaturityDisplay.textContent = formatRupee(total);

  // Sync active pill
  amountPills.forEach((chip) => {
    if (Number(chip.getAttribute('data-amount')) === deposit) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

if (schemeSlider) {
  schemeSlider.addEventListener('input', (e) => {
    updateSchemeCalculator(e.target.value);
  });
}

amountPills.forEach((chip) => {
  chip.addEventListener('click', () => {
    const val = chip.getAttribute('data-amount');
    if (schemeSlider) schemeSlider.value = val;
    updateSchemeCalculator(val);
  });
});


// -------------------------------------------------------------
// "Jewellery for Life's Many Moments" — floating photo parallax
// The copy is pinned with CSS (position: sticky). Here each photo
// drifts at its own speed and fades in/out near the screen edges.
// Skipped on small screens and for reduced-motion users, where the
// photos are simply stacked under the copy (see style.css).
// -------------------------------------------------------------
const momentsSection = document.querySelector('.moments');
const floatImgs = Array.from(document.querySelectorAll('.float-img'));
const parallaxQuery = window.matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');

let floatMetrics = [];
let frameQueued = false;

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const smooth = (t) => t * t * (3 - 2 * t);

function measureFloats() {
  // Layout position (transforms excluded) so we don't re-measure on every scroll tick
  floatMetrics = floatImgs.map((el) => ({
    el,
    top: el.offsetTop,
    height: el.offsetHeight,
    speed: parseFloat(el.dataset.speed) || 0,
  }));
}

function resetFloats() {
  floatImgs.forEach((el) => {
    el.style.transform = '';
    el.style.opacity = '';
  });
}

function renderFloats() {
  frameQueued = false;
  if (!momentsSection || !parallaxQuery.matches) return;

  const rect = momentsSection.getBoundingClientRect();
  const vh = window.innerHeight;
  if (rect.bottom < -vh || rect.top > vh * 2) return; // far off-screen, nothing to do

  const scrolled = -rect.top;
  floatMetrics.forEach(({ el, top, height, speed }) => {
    const shift = scrolled * speed;
    const centerY = rect.top + top + shift + height / 2; // photo centre, in screen px
    const fadeZone = vh * 0.22;
    const visibility = Math.min(
      (centerY - vh * 0.04) / fadeZone,   // fading out through the top
      (vh * 0.98 - centerY) / fadeZone    // fading in from the bottom
    );
    el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    el.style.opacity = smooth(clamp01(visibility)).toFixed(3);
  });
}

function queueRender() {
  if (frameQueued) return;
  frameQueued = true;
  requestAnimationFrame(renderFloats);
}

function setupFloats() {
  if (!momentsSection || !floatImgs.length) return;
  if (parallaxQuery.matches) {
    measureFloats();
    renderFloats();
  } else {
    resetFloats();
  }
}

if (momentsSection && floatImgs.length) {
  window.addEventListener('scroll', queueRender, { passive: true });
  window.addEventListener('resize', setupFloats);
  window.addEventListener('load', setupFloats);
  parallaxQuery.addEventListener('change', setupFloats);
  setupFloats();
}

// -------------------------------------------------------------
// Category cards: fade up once as they scroll into view
// -------------------------------------------------------------
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
}

// -------------------------------------------------------------
// Interactive Category Filter Tabs (UI/UX)
// -------------------------------------------------------------
const catTabBtns = document.querySelectorAll('.cat-tab-btn');
const categoryCards = document.querySelectorAll('.category-card');

if (catTabBtns.length && categoryCards.length) {
  catTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state on tab buttons
      catTabBtns.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });

      // Filter category cards with fluid stagger
      let visibleIdx = 0;
      categoryCards.forEach((card) => {
        const cardCat = card.dataset.category;
        const matches = filter === 'all' || cardCat === filter;

        if (matches) {
          card.classList.remove('is-filtered-out');
          card.style.setProperty('--i', visibleIdx++);
          // Re-trigger reveal animation smoothly
          card.classList.remove('is-visible');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.classList.add('is-visible');
            });
          });
        } else {
          card.classList.add('is-filtered-out');
        }
      });
    });
  });
}