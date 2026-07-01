// Smart CBC Report Analysis and Health Suggestion System
// CBC Analyzer page logic

import { API } from './api.js';
import { showToast } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analyzer-form') as HTMLFormElement | null;
    const resultsSection = document.getElementById('results-section');
    const formSection = document.getElementById('form-section');
    
    if (!form || !resultsSection || !formSection) return;

    const validateField = (inputEl: HTMLInputElement, val: number, min: number, max: number, name: string) => {
        const errEl = document.getElementById(`${inputEl.id}-error`);
        if (isNaN(val)) {
            inputEl.classList.add('invalid');
            if (errEl) {
                errEl.textContent = `${name} is required and must be a valid number.`;
                errEl.style.display = 'block';
            }
            return false;
        } else if (val < min || val > max) {
            inputEl.classList.add('invalid');
            if (errEl) {
                errEl.textContent = `${name} must be between ${min} and ${max}.`;
                errEl.style.display = 'block';
            }
            return false;
        } else {
            inputEl.classList.remove('invalid');
            if (errEl) {
                errEl.textContent = '';
                errEl.style.display = 'none';
            }
            return true;
        }
    };

    // Helper to bind slider and number inputs together
    const bindSliderInput = (inputId: string, rangeId: string, min: number, max: number, name: string) => {
        const numInput = document.getElementById(inputId) as HTMLInputElement;
        const rangeInput = document.getElementById(rangeId) as HTMLInputElement;
        if (numInput && rangeInput) {
            // Sync initial values
            if (numInput.value) {
                rangeInput.value = numInput.value;
            } else {
                numInput.value = rangeInput.value;
            }
            
            // Listen to slider changes
            rangeInput.addEventListener('input', () => {
                numInput.value = rangeInput.value;
                validateField(numInput, parseFloat(numInput.value), min, max, name);
            });
            
            // Listen to number input changes
            numInput.addEventListener('input', () => {
                const val = parseFloat(numInput.value);
                if (!isNaN(val)) {
                    rangeInput.value = numInput.value;
                }
                validateField(numInput, val, min, max, name);
            });

            // Listen to blur events for empty inputs
            numInput.addEventListener('blur', () => {
                const val = parseFloat(numInput.value);
                validateField(numInput, val, min, max, name);
            });
        }
    };

    bindSliderInput('hemoglobin', 'hemoglobin-range', 1, 30, 'Hemoglobin');
    bindSliderInput('wbc', 'wbc-range', 100, 150000, 'White Blood Cells');
    bindSliderInput('platelets', 'platelets-range', 1000, 2000000, 'Platelet Count');
    bindSliderInput('rbc', 'rbc-range', 0.5, 15, 'Red Blood Cells');
    bindSliderInput('mcv', 'mcv-range', 30, 180, 'Mean Corpuscular Volume');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset errors
        document.querySelectorAll('.error-msg').forEach(el => {
            (el as HTMLElement).style.display = 'none';
            (el as HTMLElement).textContent = '';
        });
        document.querySelectorAll('.form-input').forEach(el => el.classList.remove('invalid'));
        
        const hemoglobinInput = document.getElementById('hemoglobin') as HTMLInputElement;
        const wbcInput = document.getElementById('wbc') as HTMLInputElement;
        const plateletsInput = document.getElementById('platelets') as HTMLInputElement;
        const rbcInput = document.getElementById('rbc') as HTMLInputElement;
        const mcvInput = document.getElementById('mcv') as HTMLInputElement;

        const hemoglobin = parseFloat(hemoglobinInput.value);
        const wbc = parseFloat(wbcInput.value);
        const platelets = parseFloat(plateletsInput.value);
        const rbc = parseFloat(rbcInput.value);
        const mcv = parseFloat(mcvInput.value);
        
        // Comprehensive client validation
        let hasErrors = false;
        if (!validateField(hemoglobinInput, hemoglobin, 1, 30, 'Hemoglobin')) hasErrors = true;
        if (!validateField(wbcInput, wbc, 100, 150000, 'White Blood Cells')) hasErrors = true;
        if (!validateField(plateletsInput, platelets, 1000, 2000000, 'Platelet Count')) hasErrors = true;
        if (!validateField(rbcInput, rbc, 0.5, 15, 'Red Blood Cells')) hasErrors = true;
        if (!validateField(mcvInput, mcv, 30, 180, 'Mean Corpuscular Volume')) hasErrors = true;
        
        if (hasErrors) {
            showToast('Please correct form errors before submitting.', 'error');
            return;
        }

        const submitBtn = document.getElementById('btn-submit-analysis') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Analyzing Blood Parameters...';

        const result = await API.post('/reports', {
            hemoglobin,
            wbc,
            platelets,
            rbc,
            mcv
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Generate Health Suggestion';

        if (result.success && result.data) {
            showToast('CBC Report analyzed successfully!', 'success');
            const report = result.data.report;
            renderResults(report);
            
            // Toggle view panels
            formSection.style.display = 'none';
            resultsSection.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showToast(result.message || 'Analysis failed. Please check inputs.', 'error');
            if (result.errors) {
                Object.keys(result.errors).forEach(key => {
                    const inputEl = document.getElementById(key) as HTMLInputElement;
                    if (inputEl) inputEl.classList.add('invalid');
                    const errEl = document.getElementById(`${key}-error`);
                    if (errEl) {
                        errEl.textContent = result.errors![key];
                        errEl.style.display = 'block';
                    }
                });
            }
        }
    });

    const resetBtn = document.getElementById('new-analysis-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            // Reset sliders to defaults
            document.querySelectorAll('.form-range').forEach(el => {
                const rangeInput = el as HTMLInputElement;
                const min = rangeInput.getAttribute('min') || '0';
                const max = rangeInput.getAttribute('max') || '100';
                rangeInput.value = String((parseFloat(min) + parseFloat(max)) / 2);
            });
            resultsSection.style.display = 'none';
            formSection.style.display = 'block';
            
            // Reset wizard to Step 1
            if ((window as any).showStep) {
                (window as any).showStep(1);
            }
        });
    }

    // Add PDF download listener
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            const element = document.getElementById('pdf-report-content');
            if (!element) return;
            
            const userJson = localStorage.getItem('user');
            const userName = userJson ? JSON.parse(userJson).name : 'Patient';
            const dateStr = new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `CBC_Analysis_Report_${userName.replace(/\s+/g, '_')}_${dateStr.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Switch to PDF print theme styles
            document.body.classList.add('pdf-print-mode');
            
            // Trigger download via CDN global library with visual-recovery handlers
            setTimeout(() => {
                (window as any).html2pdf().from(element).set(opt).save().then(() => {
                    document.body.classList.remove('pdf-print-mode');
                }).catch((err: any) => {
                    console.error('PDF generation error:', err);
                    document.body.classList.remove('pdf-print-mode');
                });
            }, 150);
        });
    }
});

function renderResults(report: any) {
    // Fill Patient details inside printable layout
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    const pdfName = document.getElementById('pdf-patient-name');
    const pdfEmail = document.getElementById('pdf-patient-email');
    const pdfDate = document.getElementById('pdf-report-date');
    
    if (pdfName) pdfName.textContent = user ? user.name : 'Guest Patient';
    if (pdfEmail) pdfEmail.textContent = user ? user.email : 'N/A';
    if (pdfDate) {
        const createdDate = report.created_at ? new Date(report.created_at) : new Date();
        pdfDate.textContent = createdDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const scoreValEl = document.getElementById('result-score-value');
    const scoreLabelEl = document.getElementById('result-score-label');
    const scoreCircleEl = document.getElementById('result-score-circle');
    
    if (scoreValEl && scoreLabelEl && scoreCircleEl) {
        const score = report.health_score;
        scoreValEl.textContent = `${score}%`;
        
        let color = '#ef4444'; // High Risk (0-49)
        if (score >= 90) {
            color = '#22c55e'; // Excellent
        } else if (score >= 75) {
            color = '#3b82f6'; // Good
        } else if (score >= 50) {
            color = '#f59e0b'; // Moderate
        }
        
        scoreValEl.style.color = color;
        scoreLabelEl.textContent = report.health_category;
        scoreCircleEl.style.background = `conic-gradient(${color} ${score}%, rgba(46, 41, 78, 0.08) ${score}%)`;
    }

    // Populate Risk Score elements
    const riskValEl = document.getElementById('result-risk-score');
    const riskBarEl = document.getElementById('result-risk-bar');
    const riskBadgeTextEl = document.getElementById('result-risk-badge-text');
    if (riskValEl) riskValEl.textContent = `${report.risk_score}%`;
    if (riskBarEl) riskBarEl.style.width = `${report.risk_score}%`;
    if (riskBadgeTextEl) {
        riskBadgeTextEl.textContent = `A risk score of ${report.risk_score}% indicates a ${report.health_category === 'Excellent' || report.health_category === 'Good' ? 'minimal' : report.health_category === 'Moderate' ? 'moderate' : 'elevated'} level of physiological deviations.`;
    }

    const summaryEl = document.getElementById('result-summary');
    if (summaryEl) {
        summaryEl.innerHTML = report.summary.split('\n\n').map((p: string) => `<p style="margin-bottom: 12px;">${p}</p>`).join('');
    }

    const recsEl = document.getElementById('result-recommendations');
    if (recsEl) {
        recsEl.innerHTML = report.recommendations.split('\n\n').map((p: string) => `
            <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">
                <span style="color:var(--primary); font-weight:bold;">✦</span>
                <p>${p}</p>
            </div>
        `).join('');
    }

    // FOOD & LIFESTYLE SUGGESTIONS DICTIONARY lookup
    const FOOD_SUGGESTIONS: Record<string, { low: string[]; high: string[] }> = {
        hemoglobin: {
            low: ["Spinach & Leafy Greens", "Red Meat & Poultry", "Beans & Lentils", "Citrus Fruits (Vitamin C)"],
            high: ["Stay well hydrated (Water)", "Limit alcohol & caffeine", "Reduce iron-rich foods temporarily", "Avoid iron supplements"]
        },
        wbc: {
            low: ["Garlic & Ginger", "Yogurt & Probiotics", "Citrus Fruits (Vitamin C)", "Zinc-rich foods (Seeds, nuts)"],
            high: ["Anti-inflammatory foods", "Berries & Green Tea", "Omega-3 rich fish", "Leafy green vegetables"]
        },
        platelets: {
            low: ["Papaya Leaf extract", "Leafy Greens (Vitamin K)", "Folate-rich foods", "Avoid alcohol completely"],
            high: ["Anti-inflammatory foods", "Garlic & Tomato", "Ginseng", "Berries & Grapes"]
        },
        rbc: {
            low: ["Iron-rich foods", "Folate-rich foods (Lentils)", "Vitamin B-12 (Dairy, Eggs, Meat)", "Copper-rich foods (Nuts, Seeds)"],
            high: ["Increase water intake", "Avoid alcohol", "Low-sodium foods", "Grapefruit"]
        },
        mcv: {
            low: ["Iron-rich foods", "Vitamin C foods", "Red meat", "Spinach"],
            high: ["Folate-rich foods (Asparagus, Broccoli)", "Vitamin B12 foods (Fish, Milk)", "Avoid alcohol", "Fortified cereals"]
        }
    };

    const LIFESTYLE_SUGGESTIONS: Record<string, { low: string[]; high: string[] }> = {
        hemoglobin: {
            low: ["Get adequate rest / sleep", "Avoid strenuous cardiovascular exercise", "Avoid drinking tea/coffee with meals", "Monitor energy levels"],
            high: ["Avoid smoking and tobacco", "Cardio exercise (if cleared by doctor)", "Adequate daily hydration", "Manage high altitude transition"]
        },
        wbc: {
            low: ["Strict hand hygiene", "Avoid contact with sick people", "Eat fully cooked foods only", "Prioritize sleep & recovery"],
            high: ["Manage stress (meditation)", "Gentle walk / moderate activity", "Avoid intensive overtraining", "Rest & sleep"]
        },
        platelets: {
            low: ["Avoid contact sports & injuries", "Use a soft toothbrush", "Avoid aspirin or NSAIDs", "Use electric razors"],
            high: ["Regular moderate exercise", "Avoid smoking", "Keep hydrated during travel", "Consult a doctor about blood thinners"]
        },
        rbc: {
            low: ["Manage fatigue levels", "Get fresh air & deep breathing", "Gentle stretching", "Avoid rapid position changes"],
            high: ["Quit smoking", "Check for sleep apnea", "Hydrate before & after exercise", "Monitor blood pressure"]
        },
        mcv: {
            low: ["Avoid coffee/tea with meals", "Check ferritin levels", "Regular blood monitoring", "Gentle physical activity"],
            high: ["Limit alcohol intake", "Check thyroid levels", "Get screened for B12 absorption issues", "Daily multivitamin check"]
        }
    };

    // Populate Food and Lifestyle
    const foodEl = document.getElementById('result-food-suggestions');
    const lifestyleEl = document.getElementById('result-lifestyle-suggestions');
    
    if (foodEl && lifestyleEl && report.analysis) {
        const params = report.analysis;
        let foodTips: string[] = [];
        let lifestyleTips: string[] = [];
        
        Object.keys(params).forEach(key => {
            const item = params[key];
            if (item.status === 'Low' && FOOD_SUGGESTIONS[key]) {
                foodTips = [...foodTips, ...FOOD_SUGGESTIONS[key].low];
                lifestyleTips = [...lifestyleTips, ...LIFESTYLE_SUGGESTIONS[key].low];
            } else if (item.status === 'High' && FOOD_SUGGESTIONS[key]) {
                foodTips = [...foodTips, ...FOOD_SUGGESTIONS[key].high];
                lifestyleTips = [...lifestyleTips, ...LIFESTYLE_SUGGESTIONS[key].high];
            }
        });
        
        // Remove duplicates
        foodTips = [...new Set(foodTips)];
        lifestyleTips = [...new Set(lifestyleTips)];
        
        if (foodTips.length === 0) {
            foodTips = [
                "Maintain balanced nutrition with a wide variety of whole foods.",
                "Prioritize fresh vegetables, lean proteins, and healthy fats.",
                "Stay well hydrated by drinking 8-10 glasses of water daily."
            ];
        }
        if (lifestyleTips.length === 0) {
            lifestyleTips = [
                "Get 7-8 hours of quality sleep daily to support cellular recovery.",
                "Engage in at least 150 minutes of moderate aerobic activity per week.",
                "Manage stress levels with relaxation techniques or meditation."
            ];
        }
        
        foodEl.innerHTML = `
            <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px;">
                ${foodTips.map(tip => `
                    <li style="display: flex; gap: 8px; align-items: flex-start;">
                        <span style="color: var(--color-normal);">✔</span>
                        <span>${tip}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        
        lifestyleEl.innerHTML = `
            <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px;">
                ${lifestyleTips.map(tip => `
                    <li style="display: flex; gap: 8px; align-items: flex-start;">
                        <span style="color: var(--info);">✦</span>
                        <span>${tip}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    // Render detailed parameter breakdown with progress indicators
    const breakdownEl = document.getElementById('result-parameters-breakdown');
    if (breakdownEl && report.analysis) {
        const params = report.analysis;
        breakdownEl.innerHTML = Object.keys(params).map(key => {
            const item = params[key];
            let badgeClass = 'badge-high';
            if (item.status === 'Normal') badgeClass = 'badge-normal';
            else if (item.status === 'Low' || item.status === 'High') {
                badgeClass = item.risk_level === 'Medium' ? 'badge-low' : 'badge-high';
            }
            
            // Calculate progress bars parameters dynamically
            let maxScale = 100;
            if (key === 'hemoglobin') maxScale = 25;
            else if (key === 'wbc') maxScale = 20000;
            else if (key === 'platelets') maxScale = 800000;
            else if (key === 'rbc') maxScale = 10;
            else if (key === 'mcv') maxScale = 150;
            
            const userPercent = Math.min(100, Math.max(0, (item.value / maxScale) * 100));
            const minPercent = (item.min_ref / maxScale) * 100;
            const maxPercent = (item.max_ref / maxScale) * 100;
            
            let barColor = '#ef4444'; // Red
            if (item.status === 'Normal') barColor = '#22c55e'; // Green
            else if (item.risk_level === 'Medium') barColor = '#f59e0b'; // Amber
            
            return `
                <div class="parameter-status-row" style="margin-bottom: 20px; padding: 20px; border-radius: var(--radius-sm); border: 1px solid var(--border-glass); background: rgba(255,255,255,0.01);">
                    <div class="parameter-row-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                        <span class="param-name" style="font-weight: 700; font-size:1.05rem; letter-spacing:0.02em;">${key.toUpperCase()}</span>
                        <div>
                            <span style="font-size:1.1rem; font-weight:700; margin-right:8px;">${item.value}</span>
                            <span class="badge ${badgeClass}">${item.status}</span>
                        </div>
                    </div>
                    
                    <!-- Colored Progress Bar with Normal Reference Ticks -->
                    <div class="param-bar-wrapper">
                        <div class="param-bar-track">
                            <!-- Normal Reference range background block -->
                            <div style="position: absolute; left: ${minPercent}%; width: ${maxPercent - minPercent}%; height: 100%; background: rgba(34, 197, 94, 0.08); border-radius: 2px;"></div>
                            <!-- User value color progress -->
                            <div class="param-bar-indicator" style="width: ${userPercent}%; background: ${barColor};"></div>
                            <!-- Left tick marker (Min Range) -->
                            <div class="param-bar-marker" style="left: ${minPercent}%;" title="Normal Min: ${item.min_ref}"></div>
                            <!-- Right tick marker (Max Range) -->
                            <div class="param-bar-marker" style="left: ${maxPercent}%;" title="Normal Max: ${item.max_ref}"></div>
                        </div>
                        <div class="param-bar-range">
                            <span>Min Ref: ${item.min_ref}</span>
                            <span style="color: ${item.status === 'Normal' ? '#22c55e' : 'var(--text-secondary)'}; font-weight:700;">Your Value: ${item.value}</span>
                            <span>Max Ref: ${item.max_ref}</span>
                        </div>
                    </div>
                    
                    <div class="param-description" style="margin-top: 6px; color: var(--text-secondary); font-size:0.92rem;">
                        <strong>Explanation:</strong> ${item.explanation}
                    </div>
                    <div class="param-description" style="margin-top: 4px; color: var(--text-secondary); font-size:0.92rem;">
                        <strong>Possible Causes:</strong> ${item.possible_cause}
                    </div>
                    <div class="param-description" style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); padding-top:8px; font-style:italic; color: var(--text-primary); font-size:0.92rem;">
                        <strong>Recommendation:</strong> ${item.recommendation}
                    </div>
                </div>
            `;
        }).join('');
    }
}
