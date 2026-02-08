import * as Auth from './auth.js';
import { initializeStyler } from './script.js';

// Initialize authentication UI
function initAuthUI() {
    const authNav = document.getElementById('authNav');
    const userNav = document.getElementById('userNav');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInitial = document.getElementById('userInitial');

    function updateAuthUI() {
        if (Auth.isLoggedIn()) {
            const user = Auth.getUser();
            authNav.hidden = true;
            userNav.hidden = false;
            
            // Set user initial
            if (user && user.email) {
                userInitial.textContent = user.email.charAt(0).toUpperCase();
            }
        } else {
            authNav.hidden = false;
            userNav.hidden = true;
            userDropdown.hidden = true;
        }
    }

    // Toggle dropdown
    userMenuBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        userDropdown.hidden = !userDropdown.hidden;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenuBtn?.contains(e.target)) {
            userDropdown.hidden = true;
        }
    });

    // Logout handler
    logoutBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
    });

    // Listen for auth state changes
    window.addEventListener('authStateChanged', updateAuthUI);

    // Initial UI update
    updateAuthUI();
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    initializeStyler();
});

export { Auth };
