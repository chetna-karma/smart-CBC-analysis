// Smart CBC Report Analysis and Health Suggestion System
// Compiled CBC Reports History page logic

let currentReports = [];
let currentPage = 1;
const itemsPerPage = 5;
let deleteReportId = null;
let activeReportDetails = null;

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('history-table-body');
    if (!tableBody) return;

    const searchInput = document.getElementById('search-input');
    const riskSelect = document.getElementById('risk-filter');
    const sortSelect = document.getElementById('sort-filter');
    
    // Details Modal
    const detailsModal = document.getElementById('details-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalDownloadPdfBtn = document.getElementById('modal-download-pdf-btn');
    
    // Delete Confirmation Modal
    const deleteModal = document.getElementById('delete-confirm-modal');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    const deleteConfirmBtn = document.getElementById('delete-confirm-btn');

    // Pagination elements
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const paginationInfo = document.getElementById('pagination-info');

    // Fetch and render reports
    const fetchReports = async () => {
        const query = searchInput ? searchInput.value.trim() : '';
        const risk = riskSelect ? riskSelect.value : '';
        const sort = sortSelect ? sortSelect.value : 'newest';
        
        let endpoint = `/reports?sort=${sort}`;
        if (query) endpoint += `&search=${encodeURIComponent(query)}`;
        if (risk && risk !== 'favorites') endpoint += `&risk=${risk}`;

        const result = await window.API.get(endpoint);
        if (result.success && result.data) {
            let reports = result.data.reports;
            
            if (risk === 'favorites') {
                const userJson = localStorage.getItem('user');
                const userObj = userJson ? JSON.parse(userJson) : null;
                const userId = userObj ? userObj.id : 0;
                const favKey = `favorites_${userId}`;
                const favorites = JSON.parse(localStorage.getItem(favKey) || '[]');
                
                reports = reports.filter((r) => favorites.includes(r.id));
            }
            
            currentReports = reports;
            
            const totalPages = Math.ceil(currentReports.length / itemsPerPage);
            if (currentPage > totalPages) {
                currentPage = Math.max(1, totalPages);
            }
            
            renderTable();
        } else {
            window.showToast(result.message || 'Failed to load report history.', 'error');
        }
    };

    // Render list into HTML table with pagination
    const renderTable = () => {
        const totalEntries = currentReports.length;
        const totalPages = Math.ceil(totalEntries / itemsPerPage);
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedReports = currentReports.slice(startIndex, endIndex);

        if (totalEntries === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 32px 0;">
                        No matching reports found.
                    </td>
                </tr>
            `;
            if (paginationInfo) paginationInfo.textContent = 'Showing 0-0 of 0 entries';
            if (prevPageBtn) prevPageBtn.disabled = true;
            if (nextPageBtn) nextPageBtn.disabled = true;
            return;
        }

        const userJson = localStorage.getItem('user');
        const userObj = userJson ? JSON.parse(userJson) : null;
        const userId = userObj ? userObj.id : 0;
        const favKey = `favorites_${userId}`;
        const favorites = JSON.parse(localStorage.getItem(favKey) || '[]');

        tableBody.innerHTML = paginatedReports.map(r => {
            const dateStr = new Date(r.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const score = r.health_score ?? (100 - r.risk_score);
            let riskBadgeClass = 'badge-high';
            let riskLabel = 'High';
            
            if (score >= 90) {
                riskBadgeClass = 'badge-normal';
                riskLabel = 'Excellent';
            } else if (score >= 75) {
                riskBadgeClass = 'badge-normal';
                riskLabel = 'Good';
            } else if (score >= 50) {
                riskBadgeClass = 'badge-low';
                riskLabel = 'Moderate';
            } else {
                riskBadgeClass = 'badge-high';
                riskLabel = 'High Risk';
            }

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
                    <td><span class="badge ${riskBadgeClass}">${riskLabel} (${score}%)</span></td>
                    <td class="no-print">
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-secondary btn-view" data-id="${r.id}" style="padding: 6px 12px; font-size: 0.8rem;">View</button>
                            <button class="btn btn-danger btn-delete" data-id="${r.id}" style="padding: 6px 12px; font-size: 0.8rem;">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        if (paginationInfo) {
            const actualEnd = Math.min(startIndex + itemsPerPage, totalEntries);
            paginationInfo.textContent = `Showing ${startIndex + 1}-${actualEnd} of ${totalEntries} entries`;
        }
        
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

        tableBody.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id') || '0');
                if (id) viewDetails(id);
            });
        });

        tableBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id') || '0');
                if (id) promptDelete(id);
            });
        });

        tableBody.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnEl = e.currentTarget;
                const rId = parseInt(btnEl.getAttribute('data-id') || '0');
                toggleFavorite(rId, btnEl);
            });
        });
    };

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
            if (riskSelect && riskSelect.value === 'favorites') {
                fetchReports();
            }
        } else {
            favorites.push(reportId);
            btnEl.classList.add('active');
            btnEl.textContent = '★';
            window.showToast('Report added to favorites.', 'success');
        }
        localStorage.setItem(favKey, JSON.stringify(favorites));
    };

    const handleCsvExport = () => {
        if (currentReports.length === 0) {
            window.showToast('No filtered blood reports to export.', 'warning');
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Hemoglobin (g/dL),WBC (/µL),Platelets (/µL),RBC (M/µL),MCV (fL),Risk Score,Health Score,Category\n";
        
        currentReports.forEach(r => {
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
        link.setAttribute("download", `CBC_Filtered_History_${userName.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.showToast('CSV Exported successfully!', 'success');
    };

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(currentReports.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
    }

    const viewDetails = async (id) => {
        const result = await window.API.get(`/reports/${id}`);
        if (result.success && result.data && detailsModal) {
            const report = result.data.report;
            activeReportDetails = report;
            
            const userJson = localStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            
            const pdfName = document.getElementById('modal-pdf-patient-name');
            const pdfEmail = document.getElementById('modal-pdf-patient-email');
            const pdfDate = document.getElementById('modal-pdf-report-date');
            
            if (pdfName) pdfName.textContent = user ? user.name : 'Patient';
            if (pdfEmail) pdfEmail.textContent = user ? user.email : 'N/A';
            if (pdfDate) {
                const reportDate = report.created_at ? new Date(report.created_at) : new Date();
                pdfDate.textContent = reportDate.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            const scoreCircle = document.getElementById('modal-score-circle');
            const scoreVal = document.getElementById('modal-score-value');
            const scoreLabel = document.getElementById('modal-score-label');
            
            if (scoreCircle && scoreVal && scoreLabel) {
                const score = report.health_score ?? (100 - report.risk_score);
                scoreVal.textContent = `${score}%`;
                
                let color = '#ef4444'; // High Risk (0-49)
                if (score >= 90) {
                    color = '#22c55e'; // Excellent
                } else if (score >= 75) {
                    color = '#3b82f6'; // Good
                } else if (score >= 50) {
                    color = '#f59e0b'; // Moderate
                }
                
                scoreVal.style.color = color;
                scoreLabel.textContent = report.health_category ?? 'Low Risk';
                scoreCircle.style.background = `conic-gradient(${color} ${score}%, rgba(46, 41, 78, 0.08) ${score}%)`;
            }

            const modalSummary = document.getElementById('modal-summary');
            if (modalSummary) {
                modalSummary.innerHTML = report.summary.split('\n\n').map((p) => `<p style="margin-bottom: 12px;">${p}</p>`).join('');
            }

            const modalRecs = document.getElementById('modal-recommendations');
            if (modalRecs) {
                modalRecs.innerHTML = report.recommendations.split('\n\n').map((p) => `
                    <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">
                        <span style="color:var(--primary); font-weight:bold;">✦</span>
                        <p>${p}</p>
                    </div>
                `).join('');
            }

            const modalBreakdown = document.getElementById('modal-parameters-breakdown');
            if (modalBreakdown && report.analysis) {
                const params = report.analysis;
                modalBreakdown.innerHTML = Object.keys(params).map(key => {
                    const item = params[key];
                    let badgeClass = 'badge-high';
                    if (item.status === 'Normal') badgeClass = 'badge-normal';
                    else if (item.status === 'Low' || item.status === 'High') {
                        badgeClass = item.risk_level === 'Medium' ? 'badge-low' : 'badge-high';
                    }
                    
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
                        <div class="parameter-status-row" style="margin-bottom: 12px; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-glass); background: rgba(255,255,255,0.01);">
                            <div class="parameter-row-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                                <span class="param-name" style="font-weight: 700;">${key.toUpperCase()}</span>
                                <div>
                                    <span style="font-size:0.95rem; font-weight:700; margin-right:8px;">${item.value}</span>
                                    <span class="badge ${badgeClass}">${item.status}</span>
                                </div>
                            </div>
                            
                            <div class="param-bar-wrapper" style="margin: 6px 0; padding: 8px;">
                                <div class="param-bar-track" style="height: 6px;">
                                    <div style="position: absolute; left: ${minPercent}%; width: ${maxPercent - minPercent}%; height: 100%; background: rgba(34, 197, 94, 0.08); border-radius: 2px;"></div>
                                    <div class="param-bar-indicator" style="width: ${userPercent}%; background: ${barColor};"></div>
                                    <div class="param-bar-marker" style="left: ${minPercent}%; height:12px; top:-3px;" title="Normal Min: ${item.min_ref}"></div>
                                    <div class="param-bar-marker" style="left: ${maxPercent}%; height:12px; top:-3px;" title="Normal Max: ${item.max_ref}"></div>
                                </div>
                                <div class="param-bar-range" style="font-size: 0.7rem; margin-top:4px;">
                                    <span>Min: ${item.min_ref}</span>
                                    <span style="font-weight:700;">Value: ${item.value}</span>
                                    <span>Max: ${item.max_ref}</span>
                                </div>
                            </div>
                            
                            <div class="param-description" style="margin-top: 4px; color: var(--text-secondary); font-size: 0.88rem;"><strong>Explanation:</strong> ${item.explanation}</div>
                            <div class="param-description" style="margin-top: 2px; color: var(--text-secondary); font-size: 0.88rem;"><strong>Possible Causes:</strong> ${item.possible_cause}</div>
                            <div class="param-description" style="margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); padding-top:6px; font-style:italic; font-size: 0.88rem;">
                                <strong>Recommendation:</strong> ${item.recommendation}
                            </div>
                        </div>
                    `;
                }).join('');
            }

            detailsModal.classList.add('active');
        } else {
            window.showToast('Failed to retrieve report details.', 'error');
        }
    };

    if (modalDownloadPdfBtn) {
        modalDownloadPdfBtn.addEventListener('click', () => {
            const element = document.getElementById('modal-report-content');
            if (!element || !activeReportDetails) return;
            
            const userJson = localStorage.getItem('user');
            const userName = userJson ? JSON.parse(userJson).name : 'Patient';
            const rawDate = activeReportDetails.created_at ? new Date(activeReportDetails.created_at) : new Date();
            const dateStr = rawDate.toLocaleDateString('en-US', {
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

            document.body.classList.add('pdf-print-mode');
            
            setTimeout(() => {
                window.html2pdf().from(element).set(opt).save().then(() => {
                    document.body.classList.remove('pdf-print-mode');
                }).catch((err) => {
                    console.error('PDF generation error:', err);
                    document.body.classList.remove('pdf-print-mode');
                });
            }, 150);
        });
    }

    const promptDelete = (id) => {
        deleteReportId = id;
        if (deleteModal) {
            deleteModal.classList.add('active');
        }
    };

    const cancelDelete = () => {
        deleteReportId = null;
        if (deleteModal) {
            deleteModal.classList.remove('active');
        }
    };

    const confirmDelete = async () => {
        if (!deleteReportId) return;
        
        const result = await window.API.delete(`/reports/${deleteReportId}`);
        if (result.success) {
            window.showToast('Report deleted successfully');
            cancelDelete();
            fetchReports();
        } else {
            window.showToast(result.message || 'Failed to delete report.', 'error');
            cancelDelete();
        }
    };

    if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', cancelDelete);
    if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', confirmDelete);
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) cancelDelete();
        });
    }

    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                currentPage = 1;
                fetchReports();
            }, 400);
        });
    }

    if (riskSelect) {
        riskSelect.addEventListener('change', () => {
            currentPage = 1;
            fetchReports();
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentPage = 1;
            fetchReports();
        });
    }

    if (modalCloseBtn && detailsModal) {
        modalCloseBtn.addEventListener('click', () => {
            detailsModal.classList.remove('active');
            activeReportDetails = null;
        });
        
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) {
                detailsModal.classList.remove('active');
                activeReportDetails = null;
            }
        });
    }

    const exportHistoryPdfBtn = document.getElementById('export-history-pdf-btn');
    if (exportHistoryPdfBtn) {
        exportHistoryPdfBtn.addEventListener('click', () => {
            const element = document.getElementById('history-main-content');
            if (!element) return;
            
            const userJson = localStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            const userName = user ? user.name : 'Patient';
            const dateStr = new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            const pdfName = document.getElementById('history-pdf-patient-name');
            const pdfEmail = document.getElementById('history-pdf-patient-email');
            const pdfDate = document.getElementById('history-pdf-export-date');
            
            if (pdfName) pdfName.textContent = userName;
            if (pdfEmail) pdfEmail.textContent = user ? user.email : 'N/A';
            if (pdfDate) pdfDate.textContent = dateStr;

            const opt = {
                margin: [10, 10, 10, 10],
                filename: `CBC_History_Report_${userName.replace(/\s+/g, '_')}_${dateStr.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            document.body.classList.add('pdf-print-mode');
            
            setTimeout(() => {
                window.html2pdf().from(element).set(opt).save().then(() => {
                    document.body.classList.remove('pdf-print-mode');
                }).catch((err) => {
                    console.error('PDF export error:', err);
                    document.body.classList.remove('pdf-print-mode');
                });
            }, 150);
        });
    }

    const exportCsvBtn = document.getElementById('export-history-csv-btn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', handleCsvExport);
    }

    fetchReports();

    const lastViewedId = localStorage.getItem('last_viewed_report_id');
    if (lastViewedId) {
        localStorage.removeItem('last_viewed_report_id');
        setTimeout(() => viewDetails(parseInt(lastViewedId)), 500);
    }
});
