// Smart CBC Report Analysis and Health Suggestion System
// Compiled Dashboard Page logic

let chartInstance = null;
let allReportsForChart = [];
let activeTimeframe = 'all';
let activeParameter = 'hemoglobin';

document.addEventListener('DOMContentLoaded', async () => {
    const totalReportsEl = document.getElementById('total-reports');
    if (!totalReportsEl) return;

    // Load entire dashboard data
    const loadDashboard = async () => {
        try {
            const result = await window.API.get('/dashboard/stats');
            
            if (result.success && result.data) {
                const stats = result.data;
                
                // Set simple metric numbers with count-up animation
                if (window.animateCountUp) {
                    window.animateCountUp(totalReportsEl, stats.total_reports, 1000);
                } else {
                    totalReportsEl.textContent = stats.total_reports.toString();
                }
                
                const lowRiskEl = document.getElementById('low-risk-count');
                const medRiskEl = document.getElementById('medium-risk-count');
                const highRiskEl = document.getElementById('high-risk-count');
                
                if (lowRiskEl) {
                    if (window.animateCountUp) window.animateCountUp(lowRiskEl, stats.risk_indicators.low, 800);
                    else lowRiskEl.textContent = stats.risk_indicators.low.toString();
                }
                if (medRiskEl) {
                    if (window.animateCountUp) window.animateCountUp(medRiskEl, stats.risk_indicators.medium, 800);
                    else medRiskEl.textContent = stats.risk_indicators.medium.toString();
                }
                if (highRiskEl) {
                    if (window.animateCountUp) window.animateCountUp(highRiskEl, stats.risk_indicators.high, 800);
                    else highRiskEl.textContent = stats.risk_indicators.high.toString();
                }
                
                const healthSummaryEl = document.getElementById('health-summary-text');
                if (healthSummaryEl) healthSummaryEl.textContent = stats.health_summary;
                
                // Update circular health gauge if a report is available
                const riskGaugeEl = document.getElementById('risk-gauge-circle');
                const riskValueEl = document.getElementById('risk-gauge-value');
                const riskLabelEl = document.getElementById('risk-gauge-label');
                
                if (riskGaugeEl && riskValueEl && riskLabelEl) {
                    if (stats.recent_reports && stats.recent_reports.length > 0) {
                        const latestReport = stats.recent_reports[0];
                        const healthScore = latestReport.health_score;
                        const category = latestReport.health_category;
                        
                        if (window.animateCountUp) {
                            window.animateCountUp(riskValueEl, healthScore, 1200, '%');
                        } else {
                            riskValueEl.textContent = `${healthScore}%`;
                        }
                        riskLabelEl.textContent = category;
                        
                        let healthColor = '#22c55e'; // Excellent
                        if (healthScore >= 90) {
                            healthColor = '#22c55e';
                        } else if (healthScore >= 75) {
                            healthColor = '#FF6B81'; // Good/Accent
                        } else if (healthScore >= 50) {
                            healthColor = '#f59e0b'; // Moderate
                        } else {
                            healthColor = '#ef4444'; // High Risk
                        }
                        
                        riskValueEl.style.color = healthColor;
                        riskGaugeEl.style.background = `conic-gradient(${healthColor} ${healthScore}%, rgba(255, 255, 255, 0.08) ${healthScore}%)`;
                        
                        // Generate clinical notifications based on latest anomalies
                        generateNotifications(latestReport);
                    } else {
                        riskValueEl.textContent = 'N/A';
                        riskLabelEl.textContent = 'No Data';
                        riskValueEl.style.color = 'var(--text-muted)';
                        riskGaugeEl.style.background = `conic-gradient(rgba(255, 255, 255, 0.08) 100%, rgba(0, 0, 0, 0) 0%)`;
                    }
                }
                
                // Populate recent reports table
                const recentTableBody = document.getElementById('recent-reports-body');
                if (recentTableBody) {
                    if (stats.recent_reports && stats.recent_reports.length > 0) {
                        const userJson = localStorage.getItem('user');
                        const userObj = userJson ? JSON.parse(userJson) : null;
                        const userId = userObj ? userObj.id : 0;
                        
                        // Load favorites list
                        const favKey = `favorites_${userId}`;
                        const favorites = JSON.parse(localStorage.getItem(favKey) || '[]');
                        
                        recentTableBody.innerHTML = stats.recent_reports.map((r) => {
                            const dateStr = new Date(r.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });
                            
                            let badgeStyle = 'badge-high';
                            if (r.health_score >= 90) badgeStyle = 'badge-normal';
                            else if (r.health_score >= 75) badgeStyle = 'badge-low';
                            else if (r.health_score >= 50) badgeStyle = 'badge-medium';
                            
                            const isFav = favorites.includes(r.id);
                            const favClass = isFav ? 'active' : '';
                            const favIcon = isFav ? '★' : '☆';
                            
                            return `
                                <tr>
                                    <td>
                                        <button class="fav-btn ${favClass}" data-id="${r.id}" title="Toggle Favorite">${favIcon}</button>
                                    </td>
                                    <td>${dateStr}</td>
                                    <td>${r.hemoglobin}</td>
                                    <td>${r.wbc}</td>
                                    <td>${r.platelets}</td>
                                    <td>${r.rbc}</td>
                                    <td>${r.mcv}</td>
                                    <td><span class="badge ${badgeStyle}">${r.health_category} (${r.health_score}%)</span></td>
                                    <td>
                                        <button class="btn btn-secondary btn-view-report" data-id="${r.id}" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-sm)">View Details</button>
                                    </td>
                                </tr>
                            `;
                        }).join('');
                        
                        // Attach event listeners to details buttons
                        recentTableBody.querySelectorAll('.btn-view-report').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                const reportId = e.target.getAttribute('data-id');
                                if (reportId) {
                                    localStorage.setItem('last_viewed_report_id', reportId);
                                    window.location.href = 'history.html';
                                }
                            });
                        });
                        
                        // Attach event listeners to favorite buttons
                        recentTableBody.querySelectorAll('.fav-btn').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                const btnEl = e.currentTarget;
                                const rId = parseInt(btnEl.getAttribute('data-id') || '0');
                                toggleFavorite(rId, btnEl);
                            });
                        });
                    } else {
                        recentTableBody.innerHTML = `
                            <tr>
                                <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 32px 0;">
                                    No recent reports. Go to "New Analysis" to add one.
                                </td>
                            </tr>
                        `;
                    }
                }
                
            } else {
                window.showToast(result.message || 'Failed to load dashboard metrics.', 'error');
            }
        } catch (e) {
            console.error('Dashboard logic error:', e);
            window.showToast('Error displaying metrics dashboard.', 'error');
        }
    };

    // Load parameter data and render initial trend charts
    const loadTrendData = async () => {
        const result = await window.API.get('/reports?sort=oldest');
        if (result.success && result.data) {
            allReportsForChart = result.data.reports;
            updateTrendChart();
        }
    };

    // Toggle favorite reports local helper
    const toggleFavorite = (reportId, btnEl) => {
        if (!reportId) return;
        const userJson = localStorage.getItem('user');
        const userObj = userJson ? JSON.parse(userJson) : null;
        const userId = userObj ? userObj.id : 0;
        
        const favKey = `favorites_${userId}`;
        let favorites = JSON.parse(localStorage.getItem(favKey) || '[]');
        
        const index = favorites.indexOf(reportId);
        if (index > -1) {
            favorites.splice(index, 1);
            btnEl.classList.remove('active');
            btnEl.textContent = '☆';
            window.showToast('Report removed from favorites.');
        } else {
            favorites.push(reportId);
            btnEl.classList.add('active');
            btnEl.textContent = '★';
            window.showToast('Report added to favorites.', 'success');
        }
        localStorage.setItem(favKey, JSON.stringify(favorites));
    };

    // CSV exporter helper
    const handleCsvExport = () => {
        if (allReportsForChart.length === 0) {
            window.showToast('No blood reports to export.', 'warning');
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Hemoglobin (g/dL),WBC (/µL),Platelets (/µL),RBC (M/µL),MCV (fL),Risk Score,Health Score,Category\n";
        
        allReportsForChart.forEach(r => {
            const dateStr = new Date(r.created_at).toLocaleDateString('en-US');
            const row = [
                dateStr,
                r.hemoglobin,
                r.wbc,
                r.platelets,
                r.rbc,
                r.mcv,
                r.risk_score,
                r.health_score,
                r.health_category
            ].join(",");
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        
        const userJson = localStorage.getItem('user');
        const userName = userJson ? JSON.parse(userJson).name : 'Patient';
        link.setAttribute("download", `CBC_Diagnostic_Report_${userName.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.showToast('CSV Exported successfully!', 'success');
    };

    // Local notifications generator
    const generateNotifications = (report) => {
        const notifContainer = document.getElementById('notifications-list');
        if (!notifContainer) return;
        
        notifContainer.innerHTML = `
            <div class="timeline-item">
                <div class="timeline-icon-box">🔔</div>
                <div class="timeline-content">
                    <div class="timeline-time">System</div>
                    <div class="timeline-title">Welcome to Smart CBC V2!</div>
                    <div class="timeline-desc">Your clinical records are synced securely using BCrypt password cryptography.</div>
                </div>
            </div>
        `;
        
        const addAlert = (title, desc, icon = '⚠️') => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-icon-box">${icon}</div>
                <div class="timeline-content">
                    <div class="timeline-time">Alert</div>
                    <div class="timeline-title" style="color: var(--primary); font-weight: 700;">${title}</div>
                    <div class="timeline-desc">${desc}</div>
                </div>
            `;
            notifContainer.appendChild(item);
        };

        if (report.wbc < 4000.0) {
            addAlert("Leukopenia Warning", "White blood cells are below standard range. Avoid contact with sick individuals.", '🚨');
        } else if (report.wbc > 11000.0) {
            addAlert("Leukocytosis Warning", "Elevated white blood cells detected, which could indicate inflammation or stress.", '🚨');
        }
        
        if (report.platelets < 150000.0) {
            addAlert("Thrombocytopenia Alert", "Low platelet count detected. Practice caution to avoid bleeding injury.", '🚨');
        }
        
        if (report.hemoglobin < 12.0) {
            addAlert("Low Hemoglobin Alert", "Hemoglobin values are low. Increase iron/vitamin C diet intake.", '🚨');
        }
    };

    // Bind event listeners
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', handleCsvExport);
    }

    const paramSelect = document.getElementById('trend-parameter-select');
    if (paramSelect) {
        paramSelect.addEventListener('change', (e) => {
            activeParameter = e.target.value;
            updateTrendChart();
        });
    }

    const timeframeGroup = document.getElementById('chart-timeframe-group');
    if (timeframeGroup) {
        timeframeGroup.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                timeframeGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                const btnEl = e.currentTarget;
                btnEl.classList.add('active');
                activeTimeframe = btnEl.getAttribute('data-timeframe') || 'all';
                updateTrendChart();
            });
        });
    }

    // Call execution
    await loadDashboard();
    await loadTrendData();
});

// Update chart rendering with ApexCharts
function updateTrendChart() {
    if (allReportsForChart.length === 0) {
        document.querySelector("#trend-chart").innerHTML = `
            <div style="display: flex; height: 200px; justify-content: center; align-items: center; color: var(--text-muted);">
                Need at least one CBC report analysis to plot trend line graphs.
            </div>
        `;
        return;
    }
    
    let filtered = [...allReportsForChart];
    const now = new Date();
    
    if (activeTimeframe === 'weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        filtered = allReportsForChart.filter(r => new Date(r.created_at) >= oneWeekAgo);
    } else if (activeTimeframe === 'monthly') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(now.getDate() - 30);
        filtered = allReportsForChart.filter(r => new Date(r.created_at) >= oneMonthAgo);
    }
    
    if (filtered.length === 0) {
        document.querySelector("#trend-chart").innerHTML = `
            <div style="display: flex; height: 200px; justify-content: center; align-items: center; color: var(--text-muted); font-size: 0.9rem;">
                No blood reports analyzed in the selected timeframe.
            </div>
        `;
        return;
    }
    
    const dates = filtered.map(r => new Date(r.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    }));
    
    const values = filtered.map(r => r[activeParameter]);
    
    let label = 'Value';
    if (activeParameter === 'hemoglobin') label = 'Hemoglobin (g/dL)';
    else if (activeParameter === 'wbc') label = 'WBC (/µL)';
    else if (activeParameter === 'platelets') label = 'Platelets (/µL)';
    else if (activeParameter === 'rbc') label = 'RBC (M/µL)';
    else if (activeParameter === 'mcv') label = 'MCV (fL)';
    
    const options = {
        series: [{
            name: label,
            data: values
        }],
        chart: {
            type: 'line',
            height: 250,
            foreColor: 'var(--text-secondary)',
            background: 'transparent',
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3.5
        },
        colors: ['#FF365E'],
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.08)',
            strokeDashArray: 4,
            yaxis: {
                lines: { show: true }
            }
        },
        xaxis: {
            categories: dates,
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        markers: {
            size: 5,
            colors: ['#FF365E'],
            strokeColors: '#050816',
            strokeWidth: 2,
            hover: { size: 7 }
        },
        tooltip: {
            theme: 'dark'
        }
    };
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const chartEl = document.querySelector("#trend-chart");
    if (chartEl) {
        chartEl.innerHTML = '';
        chartInstance = new window.ApexCharts(chartEl, options);
        chartInstance.render();
    }
}
