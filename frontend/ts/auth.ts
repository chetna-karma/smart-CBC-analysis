// Smart CBC Report Analysis and Health Suggestion System
// Credentials Authorization handler

import { API } from './api.js';
import { showToast } from './main.js';

function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function clearErrors(form: HTMLFormElement) {
    form.querySelectorAll('.error-msg').forEach(el => {
        (el as HTMLElement).style.display = 'none';
        (el as HTMLElement).textContent = '';
    });
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
}

function clearInputError(input: HTMLInputElement) {
    input.classList.remove('invalid');
    const errEl = document.getElementById(`${input.id}-error`);
    if (errEl) {
        errEl.textContent = '';
        errEl.style.display = 'none';
    }
}

function showError(input: HTMLInputElement, message: string) {
    input.classList.add('invalid');
    const errEl = document.getElementById(`${input.id}-error`);
    if (errEl) {
        errEl.textContent = message;
        errEl.style.display = 'block';
    } else {
        const err = document.createElement('div');
        err.className = 'error-msg';
        err.id = `${input.id}-error`;
        err.innerText = message;
        err.style.display = 'block';
        input.parentElement?.appendChild(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form') as HTMLFormElement | null;
    const registerForm = document.getElementById('register-form') as HTMLFormElement | null;

    if (loginForm) {
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;

        // Real-time email validation
        emailInput.addEventListener('input', () => {
            const email = emailInput.value.trim();
            if (email && validateEmail(email)) {
                clearInputError(emailInput);
            }
        });
        emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            if (!email) {
                showError(emailInput, 'Email address is required');
            } else if (!validateEmail(email)) {
                showError(emailInput, 'Please enter a valid email address');
            }
        });

        // Real-time password validation
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value) {
                clearInputError(passwordInput);
            }
        });
        passwordInput.addEventListener('blur', () => {
            if (!passwordInput.value) {
                showError(passwordInput, 'Password is required');
            }
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors(loginForm);
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            let hasError = false;
            
            if (!email) {
                showError(emailInput, 'Email address is required');
                hasError = true;
            } else if (!validateEmail(email)) {
                showError(emailInput, 'Please enter a valid email address');
                hasError = true;
            }
            
            if (!password) {
                showError(passwordInput, 'Password is required');
                hasError = true;
            }
            
            if (hasError) {
                return;
            }
            
            const submitBtn = loginForm.querySelector('button[type="submit"]') as HTMLButtonElement;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
            
            const result = await API.post('/auth/login', { email, password });
            
            if (result.success && result.data) {
                showToast(result.data.message || 'Login successful!');
                
                // Store JWT token and user info
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showToast(result.message || 'Login failed. Please check your credentials.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        });
    }

    if (registerForm) {
        const nameInput = document.getElementById('name') as HTMLInputElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;

        const nextBtns = registerForm.querySelectorAll('.next-step-btn');
        const prevBtns = registerForm.querySelectorAll('.prev-step-btn');
        const progressBarFill = document.getElementById('progress-bar-fill');
        
        const nameDisplay = document.getElementById('confirm-name-display');
        const emailDisplay = document.getElementById('confirm-email-display');

        // Setup password visibility toggle
        const toggleBtn = document.getElementById('password-toggle-btn');
        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const isPw = passwordInput.type === 'password';
                passwordInput.type = isPw ? 'text' : 'password';
                if (confirmPasswordInput) confirmPasswordInput.type = isPw ? 'text' : 'password';
                toggleBtn.textContent = isPw ? '🙈' : '👁️';
            });
        }

        const updateStepProgress = (step: number) => {
            if (progressBarFill) {
                const percent = (step - 1) * 50;
                progressBarFill.style.width = `${percent}%`;
            }
            for (let i = 1; i <= 3; i++) {
                const indEl = document.getElementById(`step-ind-${i}`);
                if (indEl) {
                    if (i <= step) {
                        indEl.style.background = 'var(--primary)';
                        indEl.style.borderColor = 'var(--primary)';
                        indEl.style.color = '#fff';
                    } else {
                        indEl.style.background = 'var(--surface)';
                        indEl.style.borderColor = 'var(--border-glass)';
                        indEl.style.color = 'var(--text-secondary)';
                    }
                }
            }
        };

        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetStep = parseInt(btn.getAttribute('data-next') || '1');
                const currentStep = targetStep - 1;
                let hasError = false;

                if (currentStep === 1) {
                    const name = nameInput.value.trim();
                    const email = emailInput.value.trim();

                    if (!name) {
                        showError(nameInput, 'Full name is required');
                        hasError = true;
                    } else {
                        clearInputError(nameInput);
                    }

                    if (!email) {
                        showError(emailInput, 'Email address is required');
                        hasError = true;
                    } else if (!validateEmail(email)) {
                        showError(emailInput, 'Please enter a valid email address');
                        hasError = true;
                    } else {
                        clearInputError(emailInput);
                    }
                } else if (currentStep === 2) {
                    const password = passwordInput.value;
                    const confirmPassword = confirmPasswordInput.value;

                    if (!password) {
                        showError(passwordInput, 'Password is required');
                        hasError = true;
                    } else if (password.length < 6) {
                        showError(passwordInput, 'Password must be at least 6 characters long');
                        hasError = true;
                    } else {
                        clearInputError(passwordInput);
                    }

                    if (confirmPassword !== password) {
                        showError(confirmPasswordInput, 'Passwords do not match');
                        hasError = true;
                    } else {
                        clearInputError(confirmPasswordInput);
                    }
                }

                if (hasError) return;

                const currentSection = document.getElementById(`step-section-${currentStep}`);
                const nextSection = document.getElementById(`step-section-${targetStep}`);
                if (currentSection && nextSection) {
                    currentSection.style.display = 'none';
                    nextSection.style.display = 'block';
                    
                    // Framer Motion-grade fluid visual slide animation
                    nextSection.style.opacity = '0';
                    nextSection.style.transform = 'translateY(8px)';
                    nextSection.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                    setTimeout(() => {
                        nextSection.style.opacity = '1';
                        nextSection.style.transform = 'translateY(0)';
                    }, 30);
                }

                if (targetStep === 3) {
                    if (nameDisplay) nameDisplay.textContent = nameInput.value.trim();
                    if (emailDisplay) emailDisplay.textContent = emailInput.value.trim();
                }

                updateStepProgress(targetStep);
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetStep = parseInt(btn.getAttribute('data-prev') || '1');
                const currentStep = targetStep + 1;

                const currentSection = document.getElementById(`step-section-${currentStep}`);
                const prevSection = document.getElementById(`step-section-${targetStep}`);
                if (currentSection && prevSection) {
                    currentSection.style.display = 'none';
                    prevSection.style.display = 'block';
                    
                    prevSection.style.opacity = '0';
                    prevSection.style.transform = 'translateY(8px)';
                    prevSection.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                    setTimeout(() => {
                        prevSection.style.opacity = '1';
                        prevSection.style.transform = 'translateY(0)';
                    }, 30);
                }

                updateStepProgress(targetStep);
            });
        });

        // Real-time validation listeners
        nameInput.addEventListener('input', () => {
            if (nameInput.value.trim()) clearInputError(nameInput);
        });
        emailInput.addEventListener('input', () => {
            if (emailInput.value.trim() && validateEmail(emailInput.value.trim())) clearInputError(emailInput);
        });
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.length >= 6) clearInputError(passwordInput);
        });
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                if (confirmPasswordInput.value === passwordInput.value) clearInputError(confirmPasswordInput);
            });
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors(registerForm);
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            const submitBtn = registerForm.querySelector('button[type="submit"]') as HTMLButtonElement;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';
            
            const result = await API.post('/auth/register', { name, email, password });
            
            if (result.success && result.data) {
                showToast(result.data.message || 'Registration successful!');
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showToast(result.message || 'Registration failed. Try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
            }
        });
    }
});
