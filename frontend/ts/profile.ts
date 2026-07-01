// Smart CBC Report Analysis and Health Suggestion System
// Profile Settings Page logic

import { API } from './api.js';
import { showToast, setupNavbar } from './main.js';

document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profile-form') as HTMLFormElement | null;
    if (!profileForm) return;

    const nameInput = document.getElementById('profile-name') as HTMLInputElement;
    const emailInput = document.getElementById('profile-email') as HTMLInputElement;
    const passwordInput = document.getElementById('profile-password') as HTMLInputElement;
    const submitBtn = document.getElementById('profile-submit-btn') as HTMLButtonElement;
    
    const nameHeader = document.getElementById('profile-name-header');
    const emailHeader = document.getElementById('profile-email-header');
    const countEl = document.getElementById('profile-reports-count');

    // 1. Fetch current profile statistics
    const loadProfile = async () => {
        const result = await API.get('/auth/profile');
        if (result.success && result.data) {
            const user = result.data.user;
            
            // Populate inputs
            nameInput.value = user.name;
            emailInput.value = user.email;
            
            // Populate headers
            if (nameHeader) nameHeader.textContent = user.name;
            if (emailHeader) emailHeader.textContent = user.email;
            if (countEl) countEl.textContent = user.reports_count.toString();
            
            // Populate avatar monogram
            const avatarEl = document.getElementById('profile-avatar');
            if (avatarEl && user.name) {
                avatarEl.textContent = user.name.charAt(0);
            }
            
            const memberSinceEl = document.getElementById('profile-member-since');
            if (memberSinceEl && user.created_at) {
                const regDate = new Date(user.created_at);
                memberSinceEl.textContent = regDate.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                });
            }
            
            // 2. Fetch reports statistics
            const reportsResult = await API.get('/reports');
            let reports: any[] = [];
            if (reportsResult.success && reportsResult.data) {
                reports = reportsResult.data.reports || [];
            }
            
            const avgScoreEl = document.getElementById('profile-avg-score');
            const peakScoreEl = document.getElementById('profile-peak-score');
            
            if (avgScoreEl) {
                if (reports.length > 0) {
                    const sum = reports.reduce((acc, r) => acc + (r.health_score || (100 - r.risk_score)), 0);
                    avgScoreEl.textContent = `${Math.round(sum / reports.length)}%`;
                } else {
                    avgScoreEl.textContent = '0%';
                }
            }
            if (peakScoreEl) {
                if (reports.length > 0) {
                    const peak = Math.max(...reports.map(r => r.health_score || (100 - r.risk_score)));
                    peakScoreEl.textContent = `${peak}%`;
                } else {
                    peakScoreEl.textContent = '0%';
                }
            }
            
            // Achievements unlocking
            const unlockAchievement = (id: string) => {
                const el = document.getElementById(id);
                if (el) el.classList.add('unlocked');
            };
            
            unlockAchievement('ach-guardian');
            if (reports.length >= 1) unlockAchievement('ach-first');
            if (reports.some(r => (r.health_score || (100 - r.risk_score)) >= 90)) unlockAchievement('ach-healthy');
            if (reports.length >= 5) unlockAchievement('ach-master');
            
            // Recent activity feed
            const feedEl = document.getElementById('profile-activity-feed');
            if (feedEl) {
                if (reports.length > 0) {
                    const limitReports = reports.slice(0, 4);
                    feedEl.innerHTML = limitReports.map(r => {
                        const score = r.health_score || (100 - r.risk_score);
                        const category = r.health_category;
                        const date = new Date(r.created_at);
                        const dateStr = date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        let statusColor = 'var(--success)';
                        if (score < 50) statusColor = 'var(--danger)';
                        else if (score < 75) statusColor = 'var(--warning)';
                        else if (score < 90) statusColor = 'var(--info)';
                        
                        return `
                            <div class="timeline-item">
                                <div class="timeline-icon-box" style="border-color: ${statusColor}; color: ${statusColor};">
                                    🩸
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-time">${dateStr}</div>
                                    <div class="timeline-title">Complete Blood Count Analysis Run</div>
                                    <div class="timeline-desc">
                                        Generated report health score of <strong style="color: ${statusColor};">${score}%</strong> classified as <strong>${category}</strong>.
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    feedEl.innerHTML = `<div style="color: var(--text-secondary); padding: 10px;">No historical report entries found. Run your first parameter analysis to start your feed.</div>`;
                }
            }
            
            // Render trends chart
            const chartEl = document.getElementById('profile-trends-chart');
            if (chartEl) {
                chartEl.innerHTML = '';
                if (reports.length > 0) {
                    const chronologicalReports = [...reports].reverse();
                    const chartData = chronologicalReports.map(r => r.health_score || (100 - r.risk_score));
                    const chartCategories = chronologicalReports.map(r => {
                        const date = new Date(r.created_at);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    });
                    
                    const options = {
                        series: [{
                            name: 'Health Score',
                            data: chartData
                        }],
                        chart: {
                            type: 'line',
                            height: 280,
                            toolbar: { show: false },
                            background: 'transparent'
                        },
                        colors: ['#FF365E'],
                        stroke: {
                            curve: 'smooth',
                            width: 3
                        },
                        markers: {
                            size: 4,
                            colors: ['#FF365E'],
                            strokeColors: '#0B1220',
                            strokeWidth: 2,
                            hover: { size: 6 }
                        },
                        grid: {
                            borderColor: 'rgba(255,255,255,0.05)',
                            strokeDashArray: 4,
                            yaxis: { lines: { show: true } },
                            xaxis: { lines: { show: false } }
                        },
                        theme: { mode: 'dark' },
                        xaxis: {
                            categories: chartCategories,
                            labels: {
                                style: { colors: '#94A3B8', fontFamily: 'Inter' }
                            },
                            axisBorder: { show: false },
                            axisTicks: { show: false }
                        },
                        yaxis: {
                            min: 0,
                            max: 100,
                            labels: {
                                style: { colors: '#94A3B8', fontFamily: 'Inter' }
                            }
                        },
                        tooltip: {
                            theme: 'dark',
                            x: { show: true }
                        }
                    };
                    
                    const chart = new (window as any).ApexCharts(chartEl, options);
                    chart.render();
                } else {
                    chartEl.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No medical analysis history yet. Run your first blood test to plot trend maps.</div>`;
                }
            }
        } else {
            showToast(result.message || 'Failed to load profile details.', 'error');
        }
    };

    const clearInputError = (input: HTMLInputElement, errorId: string) => {
        input.classList.remove('invalid');
        const errEl = document.getElementById(errorId);
        if (errEl) {
            errEl.textContent = '';
            errEl.style.display = 'none';
        }
    };

    const showInputError = (input: HTMLInputElement, errorId: string, message: string) => {
        input.classList.add('invalid');
        const errEl = document.getElementById(errorId);
        if (errEl) {
            errEl.textContent = message;
            errEl.style.display = 'block';
        }
    };

    // Attach real-time validation listeners
    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim()) {
            clearInputError(nameInput, 'profile-name-error');
        }
    });
    nameInput.addEventListener('blur', () => {
        if (!nameInput.value.trim()) {
            showInputError(nameInput, 'profile-name-error', 'Name is required');
        }
    });

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    emailInput.addEventListener('input', () => {
        const email = emailInput.value.trim();
        if (email && emailRegex.test(email)) {
            clearInputError(emailInput, 'profile-email-error');
        }
    });
    emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        if (!email) {
            showInputError(emailInput, 'profile-email-error', 'Email is required');
        } else if (!emailRegex.test(email)) {
            showInputError(emailInput, 'profile-email-error', 'Invalid email address format');
        }
    });

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (!password || password.length >= 6) {
            clearInputError(passwordInput, 'profile-password-error');
        }
    });
    passwordInput.addEventListener('blur', () => {
        const password = passwordInput.value;
        if (password && password.length < 6) {
            showInputError(passwordInput, 'profile-password-error', 'Password must be at least 6 characters');
        }
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        let hasErrors = false;
        
        if (!name) {
            showInputError(nameInput, 'profile-name-error', 'Name is required');
            hasErrors = true;
        }
        
        if (!email || !emailRegex.test(email)) {
            showInputError(emailInput, 'profile-email-error', 'Invalid email address format');
            hasErrors = true;
        }
        
        if (password && password.length < 6) {
            showInputError(passwordInput, 'profile-password-error', 'Password must be at least 6 characters');
            hasErrors = true;
        }
        
        if (hasErrors) {
            showToast('Please correct form errors.', 'error');
            return;
        }

        // Prepare request body
        const payload: Record<string, string> = { name, email };
        if (password) payload.password = password;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Changes...';

        const result = await API.request('/auth/profile', {
            method: 'PUT',
            headers: API.getHeaders(),
            body: JSON.stringify(payload)
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';

        if (result.success && result.data) {
            showToast(result.data.message || 'Profile updated successfully.');
            
            // Save updated user/token details
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            
            // Reset password input
            passwordInput.value = '';
            
            // Reload updated layout
            loadProfile();
            setupNavbar();
        } else {
            showToast(result.message || 'Failed to save changes.', 'error');
        }
    });

    // Run initial load
    loadProfile();
});
