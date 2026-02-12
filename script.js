/**
 * SKY EXPRESS — Visual Wonder UI Script (single-file)
 * Copy this entire file into script.js and load with: <script src="script.js" defer></script>
 *
 * Features:
 * - Loader hide and AOS initialization
 * - Lazy-load hero background (WebP preferred, JPG fallback)
 * - Navbar glass effect on scroll (debounced)
 * - Mobile menu toggle with accessible state, outside/escape close
 * - Smooth internal link scrolling with focus management
 * - Pickup form -> WhatsApp prefill, validation, duplicate-prevent, accessible status + toast
 * - Animated stat counters
 * - Subtle hero image parallax
 * - Lightweight, dependency-safe, mobile-first
 */

"use strict";

(() => {
  /* =========================
     Configuration
     ========================= */
  const CONFIG = {
    BUSINESS_NUMBER: "918121592299",      // WhatsApp number without plus
    WA_COOLDOWN_MS: 3000,                 // prevent rapid repeated WA opens
    DUPLICATE_BLOCK_MS: 5 * 60 * 1000,    // block identical submissions for 5 minutes
    LOADER_FADE_MS: 450,
    COUNTER_FRAME_MS: 12,
    NAV_SCROLL_THRESHOLD: 90,
    PARALLAX_MAX_PX: 28
  };

  /* =========================
     DOM helpers & elements
     ========================= */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const isEl = v => v instanceof Element;

  const dom = {
    loader: $("#loader-wrapper"),
    navbar: $("#navbar"),
    mobileToggle: $("#mobile-menu-toggle"),
    primaryMenu: $("#primary-menu"),
    toast: $("#toast"),
    form: $("#skyExpressForm") || $("#pickup-form") || $("#skyExpressForm"),
    formStatus: $("#form-status"),
    statNums: $$(".stat-num"),
    heroImg: $(".main-hero-img"),
    heroSection: $(".hero-section"),
    yearEl: $("#year")
  };

  /* =========================
     Utilities
     ========================= */
  const now = () => Date.now();
  const sleep = ms => new Promise(res => setTimeout(res, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function debounce(fn, wait = 100) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Simple non-cryptographic hash for duplicate detection
  function simpleHash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  }

  // Toast helper
  function showToast(msg, ms = 3500) {
    const t = dom.toast;
    if (!isEl(t)) {
      // fallback
      console.info("Toast:", msg);
      return;
    }
    t.textContent = msg;
    t.hidden = false;
    t.classList.add("show");
    clearTimeout(t._timeout);
    t._timeout = setTimeout(() => {
      t.classList.remove("show");
      t._timeout2 = setTimeout(() => t.hidden = true, 300);
    }, ms);
  }

  // Phone normalization to E.164-ish
  function normalizePhone(raw) {
    if (!raw) return "";
    let s = raw.trim();
    s = s.replace(/[()\s.-]/g, "");
    if (/^0\d{9,}$/.test(s)) s = "+91" + s.slice(1);
    if (/^(\d{10})$/.test(s)) s = "+91" + s;
    if (!s.startsWith("+") && /^\d{7,15}$/.test(s)) s = "+" + s;
    s = s.replace(/[^\d+]/g, "");
    return s;
  }

  function isValidE164(phone) {
    return /^\+\d{7,15}$/.test(phone);
  }

  // LocalStorage duplicate prevention
  const LAST_SUB_KEY = "sky_last_pickup";
  function canSendSubmission(hash) {
    try {
      const raw = localStorage.getItem(LAST_SUB_KEY);
      if (!raw) return true;
      const obj = JSON.parse(raw);
      if (obj.hash === hash && (now() - obj.ts) < CONFIG.DUPLICATE_BLOCK_MS) return false;
      return true;
    } catch {
      return true;
    }
  }
  function recordSubmission(hash) {
    try {
      localStorage.setItem(LAST_SUB_KEY, JSON.stringify({ hash, ts: now() }));
    } catch { /* ignore */ }
  }

  /* =========================
     Loader & AOS
     ========================= */
  function initLoader() {
    if (!isEl(dom.loader)) return;
    window.addEventListener("load", async () => {
      await sleep(CONFIG.LOADER_FADE_MS);
      dom.loader.style.opacity = "0";
      dom.loader.style.pointerEvents = "none";
      setTimeout(() => {
        dom.loader.style.display = "none";
        dom.loader.setAttribute("aria-hidden", "true");
      }, CONFIG.LOADER_FADE_MS);
      if (window.AOS && typeof AOS.refresh === "function") AOS.refresh();
    });
  }

  function initAOS() {
    if (window.AOS && typeof AOS.init === "function") {
      AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
    }
  }

  /* =========================
     Lazy-load hero background
     ========================= */
  function lazyLoadHeroBackground() {
    const hero = dom.heroSection;
    if (!isEl(hero)) return;
    const webp = "assets/hero-bg.webp";
    const jpg = "assets/hero-bg.jpg";
    const img = new Image();
    img.onload = () => {
      hero.style.backgroundImage = `linear-gradient(rgba(255,255,255,0.92), rgba(244,247,255,0.85)), url('${webp}')`;
    };
    img.onerror = () => {
      hero.style.backgroundImage = `linear-gradient(rgba(255,255,255,0.92), rgba(244,247,255,0.85)), url('${jpg}')`;
    };
    img.src = webp;
  }

  /* =========================
     Navbar scroll effect
     ========================= */
  function initNavbarScroll() {
    if (!isEl(dom.navbar)) return;
    const onScroll = () => {
      if (window.scrollY > CONFIG.NAV_SCROLL_THRESHOLD) dom.navbar.classList.add("scrolled");
      else dom.navbar.classList.remove("scrolled");
    };
    window.addEventListener("scroll", debounce(onScroll, 60));
    onScroll();
  }

  /* =========================
     Mobile menu
     ========================= */
  function initMobileMenu() {
    const toggle = dom.mobileToggle;
    const menu = dom.primaryMenu;
    if (!isEl(toggle) || !isEl(menu)) return;

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("open");
      menu.setAttribute("aria-hidden", String(expanded));
      if (!expanded) {
        const first = menu.querySelector("a");
        if (first) first.focus();
      }
    });

    // Close when clicking a link inside menu
    menu.addEventListener("click", e => {
      const a = e.target.closest("a");
      if (!a) return;
      if (menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
      }
    });

    // Close on outside click
    document.addEventListener("click", e => {
      if (!menu.classList.contains("open")) return;
      if (e.target.closest("#primary-menu") || e.target.closest("#mobile-menu-toggle")) return;
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
    });

    // Close on Escape
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
        toggle.focus();
      }
    });
  }

  /* =========================
     Smooth internal link scrolling
     ========================= */
  function initSmoothScroll() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#" || href === "#0") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
      // move focus for accessibility
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.removeAttribute("tabindex");
    });
  }

  /* =========================
     Pickup form -> WhatsApp
     ========================= */
  function initPickupForm() {
    const form = dom.form;
    if (!isEl(form)) return;

    let submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('.submit-wa');
    if (!isEl(submitBtn)) {
      submitBtn = document.createElement("button");
      submitBtn.type = "submit";
      submitBtn.className = "submit-wa btn-main";
      submitBtn.textContent = "Send Request to WhatsApp";
      form.appendChild(submitBtn);
    }

    form.addEventListener("submit", async e => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Collect fields (support both id sets)
      const nameEl = form.querySelector("#cust_name, #name");
      const phoneEl = form.querySelector("#cust_phone, #phone");
      const emailEl = form.querySelector("#email");
      const addressEl = form.querySelector("#cust_address, #pickup-address");
      const serviceEl = form.querySelector("#service_type, #service-type");
      const notesEl = form.querySelector("#notes");

      const data = {
        name: nameEl ? nameEl.value.trim() : "",
        phoneRaw: phoneEl ? phoneEl.value.trim() : "",
        email: emailEl ? emailEl.value.trim() : "",
        address: addressEl ? addressEl.value.trim() : "",
        service: serviceEl ? serviceEl.value : "",
        notes: notesEl ? notesEl.value.trim() : "",
        time: new Date().toLocaleString()
      };

      const phone = normalizePhone(data.phoneRaw);
      if (!isValidE164(phone)) {
        showFormStatus("Please enter a valid phone number including country code.", true);
        return;
      }

      const lines = [
        "SKY EXPRESS — Pickup Request",
        `Name: ${data.name || "N/A"}`,
        `Phone: ${phone}`,
        data.email ? `Email: ${data.email}` : null,
        `Service: ${data.service || "N/A"}`,
        `Address: ${data.address || "N/A"}`,
        data.notes ? `Notes: ${data.notes}` : null,
        `Time: ${data.time}`
      ].filter(Boolean);
      const message = lines.join("\n");

      const hash = simpleHash(message);
      if (!canSendSubmission(hash)) {
        showToast("You already sent this request recently. Our team will contact you shortly.");
        return;
      }

      if (form._lastWa && (now() - form._lastWa) < CONFIG.WA_COOLDOWN_MS) {
        showToast("Please wait a moment before sending another request.");
        return;
      }
      form._lastWa = now();

      // UI feedback
      const originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
      submitBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i> Preparing...`;

      const encoded = encodeURIComponent(message);
      const waUrl = `https://wa.me/${CONFIG.BUSINESS_NUMBER}?text=${encoded}`;

      recordSubmission(hash);

      await sleep(650);
      try {
        window.open(waUrl, "_blank", "noopener");
        showToast("WhatsApp opened. Please confirm and send the message.");
        showFormStatus("WhatsApp opened. Please complete the message to confirm your pickup request.", false);
        form.reset();
      } catch (err) {
        showToast("Unable to open WhatsApp. Please try again or call +91 81215 92299.");
        showFormStatus("Failed to open WhatsApp. Please try again or call +91 81215 92299.", true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        submitBtn.innerHTML = originalHTML;
      }
    });

    function showFormStatus(msg, isError = false) {
      if (!isEl(dom.formStatus)) return;
      dom.formStatus.hidden = false;
      dom.formStatus.textContent = msg;
      dom.formStatus.style.color = isError ? "#b00020" : "";
    }
  }

  /* =========================
     Animated counters
     ========================= */
  function initCounters() {
    const els = dom.statNums || [];
    if (!els.length) return;
    els.forEach(el => {
      const target = parseInt(el.getAttribute("data-target") || el.textContent || "0", 10);
      if (isNaN(target) || target <= 0) return;
      el.textContent = "0";
      let current = 0;
      const step = Math.max(1, Math.floor(target / (1000 / CONFIG.COUNTER_FRAME_MS)));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = String(target);
          clearInterval(timer);
        } else {
          el.textContent = String(current);
        }
      }, CONFIG.COUNTER_FRAME_MS);
    });
  }

  /* =========================
     Hero parallax
     ========================= */
  function initParallax() {
    const img = dom.heroImg;
    if (!isEl(img)) return;
    const onScroll = () => {
      const rect = img.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const center = rect.top + rect.height / 2;
      const progress = clamp((center - vh / 2) / (vh / 2), -1, 1);
      const translate = -progress * CONFIG.PARALLAX_MAX_PX;
      img.style.transform = `translateY(${translate}px)`;
    };
    window.addEventListener("scroll", debounce(onScroll, 12), { passive: true });
    onScroll();
  }

  /* =========================
     Accessibility: focus ring handling
     ========================= */
  function initFocusRing() {
    let mouseMode = false;
    window.addEventListener("mousedown", () => mouseMode = true);
    window.addEventListener("keydown", e => {
      if (e.key === "Tab") mouseMode = false;
    });
    document.documentElement.classList.toggle("show-focus", !mouseMode);
  }

  /* =========================
     Init all
     ========================= */
  function init() {
    initLoader();
    initAOS();
    lazyLoadHeroBackground();
    initNavbarScroll();
    initMobileMenu();
    initSmoothScroll();
    initPickupForm();
    initCounters();
    initParallax();
    initFocusRing();
    if (isEl(dom.yearEl)) dom.yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose a small API for debugging if needed
  window.SkyExpressUI = {
    init,
    showToast,
    normalizePhone
  };
})();
/* ============================================================
   TRACKING & ADMIN SYSTEM LOGIC
   ============================================================ */

// 1. Function for the Home Page (index.html) Tracking Form
window.handleTracking = (event) => {
    event.preventDefault();
    const trackId = document.getElementById('tracking-number').value.trim();
    if (trackId) {
        // Redirects to tracking.html with the ID in the URL
        window.location.href = `tracking.html?id=${encodeURIComponent(trackId)}`;
    }
    return false;
};

// 2. Function for the Admin Page (admin.html) to Save Data
window.saveTracking = () => {
    const id = document.getElementById('new-id').value.toUpperCase().trim();
    const status = document.getElementById('new-status').value.trim();
    
    if (!id || !status) {
        alert("Please enter both ID and Status.");
        return;
    }

    // Get existing data from storage or start empty
    let trackingData = JSON.parse(localStorage.getItem('skyExpressData')) || {};
    
    // Add or Update the ID
    trackingData[id] = status;
    
    // Save back to storage
    localStorage.setItem('skyExpressData', JSON.stringify(trackingData));
    
    alert("Tracking ID " + id + " updated successfully!");
    location.reload(); // Refresh to show in the list
};

// 3. Function to delete an ID (Admin only)
window.deleteId = (id) => {
    let trackingData = JSON.parse(localStorage.getItem('skyExpressData')) || {};
    delete trackingData[id];
    localStorage.setItem('skyExpressData', JSON.stringify(trackingData));
    location.reload();
};