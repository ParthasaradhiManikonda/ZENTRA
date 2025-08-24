// --- Global Utilities & State Management ---
const AppState = {
    users: JSON.parse(localStorage.getItem("users")) || [],
    projects: JSON.parse(localStorage.getItem("projects")) || [],
    loggedInUser: localStorage.getItem("loggedInUser") || null,
};

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    if (AppState[key] !== undefined) {
        AppState[key] = data;
    }
}

function createDefaultAdmin() {
    if (AppState.users.length === 0) {
        AppState.users.push({
            username: "admin",
            email: "admin@zentra.com",
            password: "admin",
            role: "admin",
            settings: { notifications: true, theme: "light" },
        });
        saveData("users", AppState.users);
    }
}

function applyTheme() {
    const user = AppState.users.find(u => u.username === AppState.loggedInUser);
    const theme = user?.settings?.theme || localStorage.getItem('theme') || 'light';
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${theme}-mode`);
}

function handleLogout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = 'auth.html';
}

function generateSidebar() {
    const sidebar = document.getElementById('sidebar-nav');
    if (!sidebar) return;

    const user = AppState.users.find(u => u.username === AppState.loggedInUser);
    const isAdmin = user?.role === 'admin';
    const currentPage = window.location.pathname.split('/').pop();

    const links = [
        { href: 'home.html', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l-7 7m7-7v10a1 1 0 00-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', text: 'Home' },
        { href: 'all-projects.html', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', text: 'All Projects', admin: true },
        { href: 'analytics.html', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z', text: 'Analytics' },
        { href: 'profile.html', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', text: 'Profile' }
    ];

    let linksHTML = '<h2>ZENTRA</h2>';
    links.forEach(link => {
        if (!link.admin || isAdmin) {
            const activeClass = currentPage === link.href ? 'active' : '';
            linksHTML += `
                <a href="${link.href}" class="sidebar-link ${activeClass}">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${link.icon}"></path></svg>
                    <span>${link.text}</span>
                </a>
            `;
        }
    });

    linksHTML += `
        <a href="#" id="logout-btn" class="sidebar-link">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Logout</span>
        </a>
        <div class="sidebar-footer">
            <span class="user-role-badge role-${user?.role || 'teamMember'}">Role: ${user?.role || 'Team Member'}</span>
        </div>
    `;

    sidebar.innerHTML = linksHTML;
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Redirect to login if not authenticated and not on auth page
    if (!AppState.loggedInUser && window.location.pathname.split('/').pop() !== 'auth.html') {
        window.location.href = 'auth.html';
        return;
    }

    // Redirect to home if authenticated and on auth page
    if (AppState.loggedInUser && window.location.pathname.split('/').pop() === 'auth.html') {
        window.location.href = 'home.html';
        return;
    }
    
    createDefaultAdmin();
    applyTheme();

    if (AppState.loggedInUser) {
        generateSidebar();
        const user = AppState.users.find(u => u.username === AppState.loggedInUser);
        document.body.classList.add(user.role === 'admin' ? 'admin-view' : 'team-member-view');
        
        const logoutBtn = document.getElementById('logout-btn');
        if(logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showCustomModal('Confirm Logout', 'Are you sure you want to log out?', true).then(confirmed => {
                    if (confirmed) handleLogout();
                });
            });
        }
    }
});