// Visitor Analytics Tracker using Set
const visitorSet = new Set();
let duplicateCount = 0;
let recentLogs = [];

// Visitor Object
class VisitorRecord {
    constructor(key) {
        this.key = key;
        this.timestamp = new Date().toLocaleString();
        this.category = this.getType(key);
    }
    getType(key) {
        if (key.includes('@')) return 'email';
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(key)) return 'ip';
        return 'id';
    }
}

// Log Visitor
function logVisitor() {
    const key = document.getElementById('visitorKey').value.trim();
    if (!key) { showMessage('⚠️ Enter a visitor ID!', 'warning'); return; }

    if (visitorSet.has(key)) {
        duplicateCount++;
        document.getElementById('ignoredCount').textContent = duplicateCount;
        showMessage(`🚫 Duplicate visitor "${key}" ignored!`, 'warning');
        document.getElementById('visitorKey').value = '';
        return;
    }

    visitorSet.add(key);
    const record = new VisitorRecord(key);

    recentLogs.unshift(record);
    if (recentLogs.length > 5) recentLogs.pop();

    document.getElementById('visitorKey').value = '';
    updateDashboard();
    showMessage(`✅ Visitor "${key}" logged!`, 'success');
}

// Quick log helper
function quickLog(val) {
    document.getElementById('visitorKey').value = val;
    logVisitor();
}

// Clear All
function clearVisitors() {
    if (visitorSet.size === 0) { showMessage('📭 No visitors to clear.', 'info'); return; }
    if (confirm('🗑️ Clear all visitors?')) {
        visitorSet.clear();
        duplicateCount = 0;
        recentLogs = [];
        updateDashboard();
        showMessage('✅ All visitors cleared!', 'success');
    }
}

// Export
function exportLogs() {
    if (visitorSet.size === 0) { showMessage('📭 No visitors to export.', 'warning'); return; }
    const arrayData = Array.from(visitorSet).sort();
    const exportData = {
        total: visitorSet.size,
        duplicatesIgnored: duplicateCount,
        exportDate: new Date().toLocaleString(),
        visitors: arrayData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visitor_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showMessage('📤 Visitor list exported!', 'success');
}

// Update display
function updateDashboard() {
    document.getElementById('visitorCount').textContent = visitorSet.size;
    document.getElementById('ignoredCount').textContent = duplicateCount;

    const today = new Date().toDateString();
    const todayCount = recentLogs.filter(r => new Date(r.timestamp).toDateString() === today).length;
    document.getElementById('visitorToday').textContent = todayCount;

    const visitorList = document.getElementById('allVisitors');
    if (visitorSet.size === 0) {
        visitorList.innerHTML = '<p class="empty-state text-center mb-0">No visitors logged yet.</p>';
    } else {
        visitorList.innerHTML = Array.from(visitorSet).sort().map((key, i) => {
            const rec = new VisitorRecord(key);
            const colors = { email:'primary', ip:'accent', id:'info' };
            const icons = { email:'📧', ip:'🌐', id:'👤' };
            return `
                <div class="visitor-item alert alert-light mb-2 d-flex justify-content-between align-items-center">
                    <div><strong>#${i+1}</strong> <span class="ms-2">${icons[rec.category]} ${key}</span>
                    <span class="badge badge-visitor-type bg-${colors[rec.category]} ms-2">${rec.category}</span></div>
                    <small class="text-muted">${rec.timestamp}</small>
                </div>`;
        }).join('');
    }

    const recentDiv = document.getElementById('recentLogs');
    if (recentLogs.length === 0) {
        recentDiv.innerHTML = '<p class="empty-state text-center mb-0 small">No recent visitors</p>';
    } else {
        recentDiv.innerHTML = recentLogs.map(r => `
            <div class="recent-visitor p-2 mb-2 bg-light border-start border-success border-3">
                <div class="d-flex justify-content-between align-items-center">
                    <small><strong>${r.key}</strong></small>
                    <span class="badge bg-success">${r.category}</span>
                </div>
                <small class="text-muted d-block">${r.timestamp}</small>
            </div>`).join('');
    }
}

// Enter key triggers log
document.getElementById('visitorKey').addEventListener('keypress', e => { if(e.key==='Enter') logVisitor(); });

// Notifications
function showMessage(msg,type){
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex='9999'; alert.style.minWidth='300px';
    alert.textContent = msg;
    document.body.appendChild(alert);
    setTimeout(()=>{alert.remove();},3000);
}

// Initialize
updateDashboard();
setTimeout(()=>{if(visitorSet.size===0) showMessage('💡 Add some visitors to see Set in action!', 'info');},1000);
