/**
 * Authentication Module for AI Fashion Stylist Pro Frontend
 * Handles JWT tokens, login, registration, magic links, and user state
 */

const API_URL = 'https://ai-fashion-stylist-pro-production.up.railway.app';
const TOKEN_KEY = 'fashion_stylist_token';
const USER_KEY = 'fashion_stylist_user';

// ============================================
// TOKEN MANAGEMENT
// ============================================

export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function isTokenValid() {
    const token = getToken();
    if (!token) return false;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        const payload = JSON.parse(atob(parts[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

// ============================================
// USER MANAGEMENT
// ============================================

export function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

export function clearUser() {
    localStorage.removeItem(USER_KEY);
}

export function logout() {
    clearToken();
    clearUser();
    triggerAuthStateChange();
    window.location.href = '/';
}

export function isLoggedIn() {
    return isTokenValid() && getUser() !== null;
}

// ============================================
// API REQUESTS WITH AUTHENTICATION
// ============================================

export async function authenticatedFetch(endpoint, options = {}) {
    const token = getToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        clearToken();
        clearUser();
        triggerAuthStateChange();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
    }

    return response;
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

export async function register(email, password, profile = {}) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            profile: {
                body_type: profile.body_type || 'regular',
                lifestyle: profile.lifestyle || 'mixed',
                budget_preference: profile.budget_preference || 'medium',
                age_group: profile.age_group || 'adult',
                ...profile
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    
    if (data.token) {
        saveToken(data.token);
        saveUser(data.user);
        triggerAuthStateChange();
    }

    return data;
}

export async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    if (data.token) {
        saveToken(data.token);
        saveUser(data.user);
        triggerAuthStateChange();
    }

    return data;
}

export async function requestMagicLink(email) {
    const response = await fetch(`${API_URL}/auth/magic-link`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send magic link');
    }

    return await response.json();
}

export async function verifyMagicLink(token) {
    const response = await fetch(`${API_URL}/auth/verify-magic`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid or expired magic link');
    }

    const data = await response.json();
    
    if (data.token) {
        saveToken(data.token);
        saveUser(data.user);
        triggerAuthStateChange();
    }

    return data;
}

export async function getCurrentUser() {
    const response = await authenticatedFetch('/auth/me');

    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    saveUser(data.user);
    return data.user;
}

export async function updateProfile(profileData) {
    const response = await authenticatedFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ profile: profileData })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
    }

    const data = await response.json();
    saveUser(data.user);
    return data.user;
}

// ============================================
// WARDROBE ENDPOINTS
// ============================================

export async function getWardrobeItems(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.occasion) params.append('occasion', filters.occasion);
    if (filters.owned !== undefined) params.append('owned', filters.owned);

    const response = await authenticatedFetch(
        `/wardrobe/items?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch wardrobe items');
    }

    return await response.json();
}

export async function addWardrobeItem(itemData) {
    const response = await authenticatedFetch('/wardrobe/add', {
        method: 'POST',
        body: JSON.stringify(itemData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add item');
    }

    return await response.json();
}

export async function markItemOwned(itemId, owned = true) {
    const response = await authenticatedFetch(
        `/wardrobe/mark-owned/${itemId}`,
        {
            method: 'PUT',
            body: JSON.stringify({ owned })
        }
    );

    if (!response.ok) {
        throw new Error('Failed to update item');
    }

    return await response.json();
}

export async function removeWardrobeItem(itemId) {
    const response = await authenticatedFetch(
        `/wardrobe/remove/${itemId}`,
        {
            method: 'DELETE'
        }
    );

    if (!response.ok) {
        throw new Error('Failed to remove item');
    }

    return await response.json();
}

export async function getWardrobeStats() {
    const response = await authenticatedFetch('/wardrobe/stats');

    if (!response.ok) {
        throw new Error('Failed to fetch wardrobe statistics');
    }

    return await response.json();
}

// ============================================
// INSIGHTS ENDPOINTS
// ============================================

export async function getWardrobeGaps() {
    const response = await authenticatedFetch('/insights/gaps');

    if (!response.ok) {
        throw new Error('Failed to fetch wardrobe gaps');
    }

    return await response.json();
}

export async function getWardrobeBalance() {
    const response = await authenticatedFetch('/insights/balance');

    if (!response.ok) {
        throw new Error('Failed to fetch balance metrics');
    }

    return await response.json();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getUserProfile() {
    const user = getUser();
    return user?.profile || {
        body_type: 'regular',
        lifestyle: 'mixed',
        budget_preference: 'medium',
        age_group: 'adult'
    };
}

export function triggerAuthStateChange() {
    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: {
            isLoggedIn: isLoggedIn(),
            user: getUser()
        }
    }));
}

export function ensureAuthenticated() {
    if (!isLoggedIn()) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

export function ensureNotAuthenticated() {
    if (isLoggedIn()) {
        window.location.href = '/dashboard';
        return false;
    }
    return true;
}
