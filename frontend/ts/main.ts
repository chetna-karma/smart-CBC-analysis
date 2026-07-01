// Smart CBC Report Analysis and Health Suggestion System
// Global Front-end Utilities & Session Manager

export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    let icon = '✅';
    if (type === 'error') icon = '❌';
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'info') icon = 'ℹ️';
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        (toast as HTMLElement).style.animation = 'slideInToast 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

export function checkSession(requireAuth: boolean = true): boolean {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;
    const isAuthPage = path.includes('login.html') || path.includes('register.html');
    
    if (requireAuth && !token) {
        // Direct unauthorized requests to login
        window.location.href = 'login.html';
        return false;
    }
    
    if (isAuthPage && token) {
        // Logged-in users skip credentials pages
        window.location.href = 'dashboard.html';
        return true;
    }
    
    return true;
}

export function setupNavbar() {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const navLinks = document.getElementById('nav-links');
    
    if (!navLinks) return;
    
    if (token && userJson) {
        const user = JSON.parse(userJson);
        const isDashboard = document.body.classList.contains('dashboard-layout');
        
        if (isDashboard && window.innerWidth >= 992) {
            navLinks.innerHTML = `
                <li><a href="dashboard.html" class="nav-link"><span>📊</span> Dashboard</a></li>
                <li><a href="analyze.html" class="nav-link"><span>🩸</span> New Analysis</a></li>
                <li><a href="history.html" class="nav-link"><span>📂</span> History</a></li>
                <li><a href="profile.html" class="nav-link"><span>⚙️</span> Profile Settings</a></li>
                <li><a href="about.html" class="nav-link"><span>ℹ️</span> About Platform</a></li>
                <li class="sidebar-user-section" style="margin-top: auto; border-top: 1px solid var(--border-glass); padding-top: 20px; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 12px; padding: 4px 16px;">
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; text-transform: uppercase; font-family: 'Outfit', sans-serif;">
                            ${user.name.charAt(0)}
                        </div>
                        <div style="flex: 1; overflow: hidden;">
                            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user.email}</div>
                        </div>
                    </div>
                </li>
                <li style="width: 100%;"><a id="logout-btn" class="nav-link nav-link-btn" style="background: rgba(255, 54, 94, 0.1); color: var(--primary) !important; border: 1px solid rgba(255, 54, 94, 0.2); box-shadow: none; display: block; text-align: center; margin-top: 12px; padding: 10px;">Logout</a></li>
            `;
        } else {
            navLinks.innerHTML = `
                <li><a href="dashboard.html" class="nav-link">Dashboard</a></li>
                <li><a href="analyze.html" class="nav-link">New Analysis</a></li>
                <li><a href="history.html" class="nav-link">History</a></li>
                <li><a href="profile.html" class="nav-link">Profile</a></li>
                <li><a href="about.html" class="nav-link">About</a></li>
                <li><span class="nav-link" style="color: var(--text-primary); font-weight: 600; cursor: default;">Hi, ${user.name}</span></li>
                <li><a id="logout-btn" class="nav-link nav-link-btn">Logout</a></li>
            `;
        }
        
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            showToast('Logged out successfully');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    } else {
        navLinks.innerHTML = `
            <li><a href="about.html" class="nav-link">About</a></li>
            <li><a href="login.html" class="nav-link">Login</a></li>
            <li><a href="register.html" class="nav-link nav-link-btn">Register</a></li>
        `;
    }

    // Auto-highlight active links in navbar
    const links = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && (currentPath.endsWith(href) || currentPath.includes('/' + href))) {
            link.classList.add('active');
        }
    });
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {

    // Add toast container to body automatically
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const path = window.location.pathname;
    const protectedPages = ['dashboard.html', 'analyze.html', 'history.html', 'profile.html'];
    const isProtected = protectedPages.some(page => path.includes(page) || path.endsWith(page));
    
    if (isProtected) {
        checkSession(true);
    } else if (path.includes('login.html') || path.includes('register.html')) {
        checkSession(false);
    }
    
    setupNavbar();
});

// Bind to window for direct browser accessing
(window as any).showToast = showToast;
(window as any).checkSession = checkSession;
(window as any).setupNavbar = setupNavbar;
