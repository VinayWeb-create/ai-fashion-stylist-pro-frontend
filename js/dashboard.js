/**
 * dashboard.js — AI Fashion Stylist Pro
 * Populates the user dashboard with wardrobe stats, weather,
 * saved outfits, premium status, and quick-action links.
 * Uses localStorage + auth module + weather module.
 */

import { getWeather } from './weather.js';
import * as Auth from './auth.js';
import { initAuthUI } from './auth-ui.js';

// ============================================================================
// QUICK ACTION LINKS
// ============================================================================

const QUICK_ACTIONS = [
  { icon: '🎯', label: 'Occasion Solver', href: 'occasion-solver.html', desc: 'Get outfit by occasion' },
  { icon: '💰', label: 'Budget Stylist', href: 'budget-stylist.html', desc: 'Filter by price range' },
  { icon: '🪞', label: 'Virtual Try-On', href: 'virtual-tryon.html', desc: 'Preview looks on you' },
  { icon: '👗', label: 'My Wardrobe', href: 'wardrobe.html', desc: 'Manage your clothes' },
  { icon: '✨', label: 'AI Stylist', href: 'index.html#styler', desc: 'Generate outfit ideas' },
  { icon: '⭐', label: 'Go Premium', href: 'premium.html', desc: 'Unlock all features' },
];

// ============================================================================
// STATS FROM LOCALSTORAGE
// ============================================================================

function getDashboardStats() {
  try {
    const wardrobe = JSON.parse(localStorage.getItem('fashion_wardrobe') || '[]');
    const saved = JSON.parse(localStorage.getItem('fsp_saved_outfits') || '[]');
    const tryons = JSON.parse(localStorage.getItem('fsp_tryon_history') || '[]');
    return {
      wardrobeCount: wardrobe.length,
      savedCount: saved.length,
      tryonCount: tryons.length,
      isPremium: localStorage.getItem('fsp_premium') === 'true',
    };
  } catch {
    return { wardrobeCount: 0, savedCount: 0, tryonCount: 0, isPremium: false };
  }
}

// ============================================================================
// WEATHER SECTION RENDER
// ============================================================================

function renderWeatherSection(weather) {
  const section = document.getElementById('dash-weather-section');
  if (!section) return;

  if (!weather || weather.temperature === null) {
    section.innerHTML = `
      <div class="dash-weather-card dash-weather-unavailable">
        <div class="dash-weather-icon">🌡️</div>
        <div>
          <div class="dash-weather-cond">Weather unavailable</div>
          <div class="dash-weather-tip">Grant location access and refresh the page for weather-based styling tips.</div>
        </div>
      </div>`;
    return;
  }

  section.innerHTML = `
    <div class="dash-weather-card">
      <div class="dash-weather-emoji">${weather.emoji}</div>
      <div class="dash-weather-info">
        <div class="dash-weather-temp">${weather.temperature}°C</div>
        <div class="dash-weather-cond">${weather.condition}</div>
      </div>
      <div class="dash-weather-tip">
        <div class="dash-weather-tip-label">Today's Style Tip</div>
        <div class="dash-weather-tip-text">${weather.suggestion}</div>
        <div class="dash-weather-fabrics">
          <b>Best fabrics:</b> ${weather.fabrics ? weather.fabrics.join(', ') : '—'}<br>
          <b>Avoid:</b> ${weather.avoid || '—'}
        </div>
      </div>
    </div>`;
}

// ============================================================================
// STATS SECTION RENDER
// ============================================================================

function renderStatsSection(stats) {
  const el = id => document.getElementById(id);
  if (el('dash-stat-wardrobe')) el('dash-stat-wardrobe').textContent = stats.wardrobeCount;
  if (el('dash-stat-saved')) el('dash-stat-saved').textContent = stats.savedCount;
  if (el('dash-stat-tryon')) el('dash-stat-tryon').textContent = stats.tryonCount;

  // Premium badge
  const premiumBadge = el('dash-premium-badge');
  if (premiumBadge) {
    if (stats.isPremium) {
      premiumBadge.innerHTML = '<span class="dash-badge-premium">⭐ Premium Member</span>';
    } else {
      premiumBadge.innerHTML = '<span class="dash-badge-free">Free Plan &nbsp;<a href="premium.html" class="dash-upgrade-link">Upgrade →</a></span>';
    }
  }
}

// ============================================================================
// QUICK ACTIONS RENDER
// ============================================================================

function renderQuickActions() {
  const container = document.getElementById('dash-quick-actions');
  if (!container) return;
  container.innerHTML = QUICK_ACTIONS.map(a => `
    <a href="${a.href}" class="dash-quick-card">
      <div class="dash-quick-icon">${a.icon}</div>
      <div class="dash-quick-label">${a.label}</div>
      <div class="dash-quick-desc">${a.desc}</div>
    </a>
  `).join('');
}

// ============================================================================
// USER GREETING
// ============================================================================

function renderGreeting() {
  const el = document.getElementById('dash-greeting');
  if (!el) return;
  const user = Auth.getUser();
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user ? (user.name || user.email?.split('@')[0] || 'Stylist') : 'Stylist';
  el.textContent = `${part}, ${name}! 👋`;
}

// ============================================================================
// RECENT ACTIVITY
// ============================================================================

function renderRecentActivity() {
  const container = document.getElementById('dash-activity');
  if (!container) return;

  const activities = [];

  try {
    const wardrobe = JSON.parse(localStorage.getItem('fashion_wardrobe') || '[]');
    wardrobe.slice(-3).reverse().forEach(item => {
      activities.push({ icon: '👗', text: `Added <b>${item.name || 'Item'}</b> to wardrobe`, time: 'Recently' });
    });
  } catch { }

  if (activities.length === 0) {
    container.innerHTML = `
      <div class="dash-activity-empty">
        <p>No recent activity yet.</p>
        <a href="index.html#styler" class="dash-activity-cta">Generate your first outfit →</a>
      </div>`;
    return;
  }

  container.innerHTML = activities.map(a => `
    <div class="dash-activity-item">
      <div class="dash-activity-icon">${a.icon}</div>
      <div class="dash-activity-text">${a.text}</div>
      <div class="dash-activity-time">${a.time}</div>
    </div>
  `).join('');
}

// ============================================================================
// MAIN INIT
// ============================================================================

// Auth UI is now handled by shared initAuthUI from auth-ui.js

async function initDashboard() {
  // If not logged in, show a gentle message but still show dashboard content
  const isLoggedIn = Auth.isLoggedIn();
  const loginBanner = document.getElementById('dash-login-banner');
  if (loginBanner) {
    loginBanner.hidden = isLoggedIn;
  }

  initAuthUI();
  renderGreeting();
  renderQuickActions();
  renderRecentActivity();

  const stats = getDashboardStats();
  renderStatsSection(stats);

  // Fetch weather async
  try {
    const weather = await getWeather();
    renderWeatherSection(weather);
  } catch {
    renderWeatherSection(null);
  }
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
