document.addEventListener('DOMContentLoaded', () => {
    // This script should only run on the auth page.
    if (!document.getElementById('auth-section')) return;

    const authTitle = document.getElementById('auth-title');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const roleOptions = document.querySelectorAll('.role-option');
    let selectedRole = 'admin';

    // Role selection logic
    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            roleOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedRole = option.dataset.role;
        });
    });

    // Form switching
    showSignupLink.addEventListener('click', e => {
        e.preventDefault();
        authTitle.textContent = 'Sign Up for Zentra';
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', e => {
        e.preventDefault();
        authTitle.textContent = 'Login to Zentra';
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // Login form submission
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (user && user.role === selectedRole) {
            localStorage.setItem('loggedInUser', user.username);
            window.location.href = 'home.html';
        } else {
            errorEl.textContent = 'Invalid credentials or incorrect role selected.';
        }
    });

    // Signup form submission
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const errorEl = document.getElementById('signup-error');

        if (password !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match.';
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.some(u => u.username === username || u.email === email)) {
            errorEl.textContent = 'Username or email already exists.';
            return;
        }

        users.push({
            username,
            email,
            password,
            role: selectedRole,
            settings: { notifications: true, theme: 'light' }
        });
        localStorage.setItem('users', JSON.stringify(users));
        
        showCustomModal('Success', 'Account created! Please log in.').then(() => {
            showLoginLink.click();
            document.getElementById('login-username').value = username;
        });
    });
});