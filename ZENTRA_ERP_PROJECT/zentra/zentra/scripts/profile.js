document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('profile-username')) return;
    
    const user = AppState.users.find(u => u.username === AppState.loggedInUser);
    if (!user) return;

    // Populate fields
    document.getElementById('profile-username').textContent = user.username;
    document.getElementById('profile-email').textContent = user.email;
    const roleEl = document.getElementById('profile-role');
    roleEl.textContent = user.role;
    roleEl.className = `user-role-badge role-${user.role}`;
    document.getElementById('notifications-toggle').checked = user.settings.notifications;

    // Event Listeners
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('save-preferences-btn').addEventListener('click', savePreferences);
    document.getElementById('change-email-form').addEventListener('submit', handleChangeEmail);
    document.getElementById('change-password-form').addEventListener('submit', handleChangePassword);
});

function toggleTheme() {
    const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    const updatedUsers = AppState.users.map(u => {
        if (u.username === AppState.loggedInUser) {
            u.settings.theme = newTheme;
        }
        return u;
    });
    saveData('users', updatedUsers);
    localStorage.setItem('theme', newTheme);
    applyTheme();
}

function savePreferences() {
    const notifications = document.getElementById('notifications-toggle').checked;
    const updatedUsers = AppState.users.map(u => {
        if (u.username === AppState.loggedInUser) {
            u.settings.notifications = notifications;
        }
        return u;
    });
    saveData('users', updatedUsers);
    showCustomModal('Success', 'Preferences saved!');
}

function handleChangeEmail(e) {
    e.preventDefault();
    const newEmail = document.getElementById('new-email').value;
    const password = document.getElementById('current-password-email').value;
    const statusEl = document.getElementById('email-change-status');
    
    let userFound = false;
    const updatedUsers = AppState.users.map(u => {
        if (u.username === AppState.loggedInUser && u.password === password) {
            u.email = newEmail;
            userFound = true;
        }
        return u;
    });

    if (userFound) {
        saveData('users', updatedUsers);
        document.getElementById('profile-email').textContent = newEmail;
        statusEl.textContent = 'Email updated successfully!';
        statusEl.className = 'status-message success';
        e.target.reset();
    } else {
        statusEl.textContent = 'Incorrect password.';
        statusEl.className = 'status-message error';
    }
}

function handleChangePassword(e) {
    e.preventDefault();
    const oldPass = document.getElementById('old-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-new-password').value;
    const statusEl = document.getElementById('password-change-status');

    if (newPass !== confirmPass) {
        statusEl.textContent = 'New passwords do not match.';
        statusEl.className = 'status-message error';
        return;
    }

    let userFound = false;
    const updatedUsers = AppState.users.map(u => {
        if (u.username === AppState.loggedInUser && u.password === oldPass) {
            u.password = newPass;
            userFound = true;
        }
        return u;
    });

    if (userFound) {
        saveData('users', updatedUsers);
        statusEl.textContent = 'Password updated successfully!';
        statusEl.className = 'status-message success';
        e.target.reset();
    } else {
        statusEl.textContent = 'Incorrect old password.';
        statusEl.className = 'status-message error';
    }
}