// FIFO Queue Class
class JobQueue {
    constructor() {
        this.jobs = {};
        this.head = 0;
        this.tail = 0;
    }

    enqueue(job) {
        this.jobs[this.tail] = job;
        this.tail++;
    }

    dequeue() {
        if (this.isEmpty()) return null;
        const job = this.jobs[this.head];
        delete this.jobs[this.head];
        this.head++;
        return job;
    }

    peekFront() {
        return this.isEmpty() ? null : this.jobs[this.head];
    }

    peekEnd() {
        return this.isEmpty() ? null : this.jobs[this.tail - 1];
    }

    size() {
        return this.tail - this.head;
    }

    getAll() {
        const arr = [];
        for (let i = this.head; i < this.tail; i++) arr.push(this.jobs[i]);
        return arr;
    }

    clear() {
        this.jobs = {};
        this.head = 0;
        this.tail = 0;
    }

    isEmpty() {
        return this.size() === 0;
    }
}

// Task Manager Logic
const jobQueue = new JobQueue();
const completedJobs = [];

const icons = { email: '📧', upload: '📤', message: '💬' };
const colors = { email: 'warning', upload: 'success', message: 'info' };

// Add Job
function enqueueJob() {
    const title = document.getElementById('jobTitle').value.trim();
    const category = document.getElementById('jobCategory').value;

    if (!title) { alert('⚠️ Enter a job name!'); return; }

    const job = { id: Date.now(), title, category, added: new Date().toLocaleTimeString() };
    jobQueue.enqueue(job);
    document.getElementById('jobTitle').value = '';

    updateDisplay();
    showToast(`✅ Job "${title}" added!`, 'success');
}

// Process Next Job
function processJob() {
    if (jobQueue.isEmpty()) { showToast('⚠️ No jobs to process!', 'warning'); return; }

    const job = jobQueue.dequeue();
    job.completed = new Date().toLocaleTimeString();
    completedJobs.unshift(job);
    if (completedJobs.length > 20) completedJobs.pop();

    updateDisplay();
    updateLog();
    showToast(`⚙️ Processed: "${job.title}"`, 'info');
}

// View Queue
function showQueue() {
    if (jobQueue.isEmpty()) { showToast('📭 Queue empty!', 'info'); return; }

    const tasks = jobQueue.getAll();
    const list = tasks.map((job,i) => `${i+1}. ${icons[job.category]} ${job.title}`).join('\n');
    alert(`📋 Queue (${tasks.length} jobs):\n\n${list}`);
}

// Clear Queue
function clearJobQueue() {
    if (jobQueue.isEmpty()) { showToast('📭 Queue already empty!', 'info'); return; }

    if (confirm('🗑️ Clear all jobs?')) {
        jobQueue.clear();
        updateDisplay();
        showToast('✅ Queue cleared!', 'success');
    }
}

// Update Display
function updateDisplay() {
    document.getElementById('jobCount').textContent = jobQueue.size();
    const next = jobQueue.peekFront();
    const last = jobQueue.peekEnd();
    document.getElementById('upNext').textContent = next ? `${icons[next.category]} ${next.title}` : 'None';
    document.getElementById('recentJob').textContent = last ? `${icons[last.category]} ${last.title}` : 'None';

    const display = document.getElementById('queueDisplay');
    if (jobQueue.isEmpty()) {
        display.innerHTML = '<p class="empty-state text-center mb-0">No jobs in queue yet.</p>';
    } else {
        const jobs = jobQueue.getAll();
        display.innerHTML = jobs.map((job,i) => `
            <div class="job-item alert alert-${colors[job.category]} mb-2 d-flex justify-content-between align-items-center">
                <div>
                    <strong>#${i+1}</strong> <span class="ms-2">${icons[job.category]} ${job.title}</span>
                    <span class="badge badge-job-type bg-${colors[job.category]} ms-2">${job.category}</span>
                </div>
                <small class="text-muted">Added: ${job.added}</small>
            </div>
        `).join('');
    }
}

// Update Log
function updateLog() {
    const log = document.getElementById('logDisplay');
    if (completedJobs.length === 0) {
        log.innerHTML = '<p class="empty-state text-center mb-0">No jobs processed yet.</p>';
    } else {
        log.innerHTML = completedJobs.map(job => `
            <div class="alert alert-success mb-2 d-flex justify-content-between align-items-center">
                <div>${icons[job.category]} ${job.title} <span class="badge bg-success ms-2">${job.category}</span></div>
                <small class="text-muted">Processed: ${job.completed}</small>
            </div>
        `).join('');
    }
}

// Show Notification
function showToast(msg,type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.textContent = msg;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Enter key to add job
document.getElementById('jobTitle').addEventListener('keypress', e => { if(e.key==='Enter') enqueueJob(); });

// Initialize
updateDisplay();
