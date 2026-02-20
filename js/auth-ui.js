import * as Auth from './auth.js';

/**
 * Shared Authentication UI Initialization
 * Handles header navigation states, user menus, and logout logic.
 */
export function initAuthUI() {
    const authNav = document.getElementById('authNav');
    const userNav = document.getElementById('userNav');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    const avatarSmall = document.getElementById("userAvatarImg");
    const avatarLarge = document.getElementById("userAvatarLarge");
    const userNameText = document.getElementById("userNameText");

    function updateAuthUI() {
        if (Auth.isLoggedIn()) {
            const user = Auth.getUser();

            if (authNav) authNav.hidden = true;
            if (userNav) userNav.hidden = false;

            if (user) {
                const name = user.name || user.email || "User";

                // show username
                if (userNameText) userNameText.innerText = name;

                // avatar logic
                const avatarUrl =
                    user.profile_pic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111&color=fff&size=128`;

                if (avatarSmall) avatarSmall.src = avatarUrl;
                if (avatarLarge) avatarLarge.src = avatarUrl;
            }

        } else {
            if (authNav) authNav.hidden = false;
            if (userNav) userNav.hidden = true;
            if (userDropdown) userDropdown.hidden = true;
        }
    }

    // avatar click dropdown
    userMenuBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (userDropdown) userDropdown.hidden = !userDropdown.hidden;
    });

    // click outside close
    document.addEventListener("click", (e) => {
        if (userDropdown && !userMenuBtn.contains(e.target)) {
            userDropdown.hidden = true;
        }
    });

    // logout
    logoutBtn?.addEventListener("click", () => {
        if (confirm("Logout now?")) {
            Auth.logout();
            // Redirect to index.html with relative path
            window.location.href = "index.html";
        }
    });

    window.addEventListener("authStateChanged", updateAuthUI);
    updateAuthUI();
}
