/**
 * Authentication Module
 * Handles user registration, login, JWT tokens, and wardrobe operations
 */

const API_BASE_URL = 'https://ai-fashion-stylist-pro-production.up.railway.app';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
    USER: 'fashion_user',
    TOKEN: 'fashion_token',
    WARDROBE: 'fashion_wardrobe'
};

// ============================================================================
// USER AUTHENTICATION STATE
// ============================================================================

let currentUser = null;
let currentToken = null;

// Load from localStorage on module load
function loadAuthState() {
    try {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        if (userStr && token) {
            currentUser = JSON.parse(userStr);
            currentToken = token;
            console.log('✅ Auth state restored:', currentUser.email);
        }
    } catch (error) {
        console.error('Error loading auth state:', error);
        localStorage.clear();
    }
}

// Initial load
loadAuthState();

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Register a new user
 */
export async function register(email, password, profile = {}) {
    try {
        console.log('📝 Registering user:', email);
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.toLowerCase().trim(),
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

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        console.log('✅ Registration successful:', data.user.email);
        
        // Store auth state
        currentUser = data.user;
        currentToken = data.token;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        
        // Dispatch auth change event
        dispatchAuthChange();
        
        return {
            status: 'success',
            message: 'Registration successful',
            user: currentUser,
            token: data.token
        };
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        return {
            status: 'error',
            message: error.message
        };
    }
}

/**
 * Login user with email and password
 */
export async function login(email, password) {
    try {
        console.log('🔑 Logging in user:', email);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.toLowerCase().trim(),
                password
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        console.log('✅ Login successful:', data.user.email);
        
        // Store auth state
        currentUser = data.user;
        currentToken = data.token;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        
        // Dispatch auth change event
        dispatchAuthChange();
        
        return {
            status: 'success',
            message: 'Login successful',
            user: currentUser,
            token: data.token
        };
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return {
            status: 'error',
            message: error.message
        };
    }
}

/**
 * Request magic link for passwordless login
 */
export async function requestMagicLink(email) {
    try {
        console.log('📧 Requesting magic link for:', email);
        
        const response = await fetch(`${API_BASE_URL}/auth/magic-link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.toLowerCase().trim()
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to send magic link');
        }

        console.log('✅ Magic link sent to:', email);
        
        return {
            status: 'success',
            message: 'Magic link sent to your email',
            dev_token: data.dev_token
        };
    } catch (error) {
        console.error('❌ Magic link error:', error.message);
        return {
            status: 'error',
            message: error.message
        };
    }
}

/**
 * Verify magic link token
 */
export async function verifyMagicLink(token) {
    try {
        console.log('✔️ Verifying magic link token');
        
        const response = await fetch(`${API_BASE_URL}/auth/verify-magic`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Invalid or expired token');
        }

        console.log('✅ Magic link verified for:', data.user.email);
        
        // Store auth state
        currentUser = data.user;
        currentToken = data.token;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        
        // Dispatch auth change event
        dispatchAuthChange();
        
        return {
            status: 'success',
            message: 'Login successful',
            user: currentUser,
            token: data.token
        };
    } catch (error) {
        console.error('❌ Magic link verification error:', error.message);
        return {
            status: 'error',
            message: error.message
        };
    }
}

/**
 * Logout user
 */
export function logout() {
    console.log('👋 Logging out user');
    
    currentUser = null;
    currentToken = null;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.WARDROBE);
    
    // Dispatch auth change event
    dispatchAuthChange();
    
    return {
        status: 'success',
        message: 'Logged out successfully'
    };
}

// ============================================================================
// USER PROFILE FUNCTIONS
// ============================================================================

/**
 * Get current user
 */
export function getUser() {
    return currentUser;
}

/**
 * Get current token
 */
export function getToken() {
    return currentToken;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
    return currentUser !== null && currentToken !== null;
}

/**
 * Update user profile
 */
export async function updateProfile(profile) {
    try {
        if (!currentToken) {
            throw new Error('Not authenticated');
        }

        console.log('📝 Updating user profile');
        
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ profile })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        console.log('✅ Profile updated');
        
        // Update current user
        currentUser = data.user;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
        
        return {
            status: 'success',
            message: 'Profile updated',
            user: currentUser
        };
    } catch (error) {
        console.error('❌ Profile update error:', error.message);
        return {
            status: 'error',
            message: error.message
        };
    }
}

// ============================================================================
// WARDROBE FUNCTIONS
// ============================================================================

/**
 * Add item to wardrobe
 */
export async function addWardrobeItem(itemData) {
    try {
        if (!currentToken) {
            throw new Error('Not authenticated');
        }

        console.log('➕ Adding wardrobe item:', itemData.name);
        
        const response = await fetch(`${API_BASE_URL}/wardrobe/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(itemData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to add item');
        }

        console.log('✅ Item added to wardrobe');
        
        // Update local wardrobe cache
        updateLocalWardrobe(data.item);
        
        return {
            status: 'success',
            message: 'Item added to wardrobe',
            item: data.item
        };
    } catch (error) {
        console.error('❌ Add wardrobe item error:', error.message);
        return {
            status: 'error',
            message: error.message
        };
    }
}

/**
 * Get wardrobe items
 */
export async function getWardrobeItems(filters = {}) {
    try {
        if (!currentToken) {
            throw new Error('Not authenticated');
        }

        console.log('📦 Fetching wardrobe items');
        
        let url = `${API_BASE_URL}/wardrobe/items`;
        const params = new URLSearchParams();
        
        if (filters.category) params.append('category', filters.category);
        if (filters.owned !== undefined) params.append('owned', filters.owned);
        if (filters.occasion) params.append('occasion', filters.occasion);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch items');
        }

        console.log('✅ Fetched', data.count, 'wardrobe items');
        
        return {
            status: 'success',
            items: data.items,
            count: data.count
        };
    } catch (error) {
        console.error('❌ Get wardrobe items error:', error.message);
        return {
            status: 'error',
            message: error.message,
            items: [],
            count: 0
        };
    }
}

/**
 * Remove wardrobe item
 */
export async function removeWardrobeItem(itemId) {
    try {
        if (!currentToken) {
            throw new Error('Not authenticated');
        }

        console.log('🗑️ Removing wardrobe item:', itemId);
        
        const response = await fetch(`${API_BASE_URL}/wardrobe/remove/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to remove item');
        }

        console.log('✅ Item removed from wardrobe');
        
        return {
            status: 'success',
            message: 'Item removed'
        };
    } catch (error) {
        console.error('❌ Remove item error:', error.message);
        return {
            status: 'error',
            message: error.message
        };
    }
}

/**
 * Get wardrobe statistics
 */
export async function getWardrobeStats() {
    try {
        if (!currentToken) {
            throw new Error('Not authenticated');
        }

        console.log('📊 Fetching wardrobe stats');
        
        const response = await fetch(`${API_BASE_URL}/wardrobe/stats`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch stats');
        }

        console.log('✅ Stats fetched');
        
        return {
            status: 'success',
            stats: data.stats
        };
    } catch (error) {
        console.error('❌ Get stats error:', error.message);
        return {
            status: 'error',
            message: error.message,
            stats: {}
        };
    }
}

/**
 * Get wardrobe gaps
 */
export async function getWardrobeGaps() {
    try {
        if (!currentToken) {
            throw new Error('Not authenticated');
        }

        console.log('🔍 Analyzing wardrobe gaps');
        
        const response = await fetch(`${API_BASE_URL}/insights/gaps`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to analyze gaps');
        }

        console.log('✅ Gap analysis complete:', data.count, 'gaps found');
        
        return {
            status: 'success',
            gaps: data.gaps,
            count: data.count
        };
    } catch (error) {
        console.error('❌ Get gaps error:', error.message);
        return {
            status: 'error',
            message: error.message,
            gaps: [],
            count: 0
        };
    }
}

/**
 * Get wardrobe balance
 */
export async function getWardrobeBalance() {
    try {
        if (!currentToken) {
            throw new Error('Not authenticated');
        }

        console.log('⚖️ Calculating wardrobe balance');
        
        const response = await fetch(`${API_BASE_URL}/insights/balance`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to calculate balance');
        }

        console.log('✅ Balance calculated');
        
        return {
            status: 'success',
            balance: data.balance
        };
    } catch (error) {
        console.error('❌ Get balance error:', error.message);
        return {
            status: 'error',
            message: error.message,
            balance: {}
        };
    }
}

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

/**
 * Update local wardrobe cache
 */
function updateLocalWardrobe(item) {
    try {
        const wardrobeStr = localStorage.getItem(STORAGE_KEYS.WARDROBE) || '[]';
        const wardrobe = JSON.parse(wardrobeStr);
        wardrobe.push(item);
        localStorage.setItem(STORAGE_KEYS.WARDROBE, JSON.stringify(wardrobe));
    } catch (error) {
        console.warn('Warning: Could not update local wardrobe cache:', error);
    }
}

/**
 * Get local wardrobe cache
 */
export function getLocalWardrobe() {
    try {
        const wardrobeStr = localStorage.getItem(STORAGE_KEYS.WARDROBE) || '[]';
        return JSON.parse(wardrobeStr);
    } catch (error) {
        console.warn('Warning: Could not read local wardrobe cache:', error);
        return [];
    }
}

// ============================================================================
// EVENT DISPATCHING
// ============================================================================

/**
 * Dispatch auth state change event
 */
function dispatchAuthChange() {
    const event = new Event('authStateChanged');
    window.dispatchEvent(event);
    console.log('📢 Auth state changed');
}

/**
 * Listen for auth changes (for external listeners)
 */
export function onAuthStateChanged(callback) {
    window.addEventListener('authStateChanged', callback);
    
    // Return unsubscribe function
    return () => {
        window.removeEventListener('authStateChanged', callback);
    };
}

// ============================================================================
// EXPORTS SUMMARY
// ============================================================================

console.log('✅ Auth module loaded');
