// Stack Implementation
class ActionStack {
    constructor() { this.items = {}; this.count = 0; }
    push(element) { this.items[this.count++] = element; }
    pop() { if(this.isEmpty()) return null; const el = this.items[--this.count]; delete this.items[this.count]; return el; }
    peek() { return this.isEmpty() ? null : this.items[this.count-1]; }
    size() { return this.count; }
    isEmpty() { return this.count === 0; }
    clear() { this.items = {}; this.count = 0; }
    getAll() { const arr=[]; for(let i=0;i<this.count;i++) arr.push(this.items[i]); return arr; }
}

// Stacks
const undoStack = new ActionStack();
const redoStack = new ActionStack();

let lastContent = '';

// Save Action
function saveAction() {
    const editor = document.getElementById('editorArea');
    const content = editor.innerHTML;
    if(content === lastContent) { showToast('⚠️ No changes to save!','warning'); return; }

    undoStack.push({ content: lastContent, timestamp: new Date().toLocaleTimeString() });
    lastContent = content;
    redoStack.clear();

    updateDisplay();
    showToast('✅ Action saved!','success');
}

// Undo
function undoAction() {
    if(undoStack.isEmpty()) { showToast('⚠️ Nothing to undo!','warning'); return; }

    const editor = document.getElementById('editorArea');
    redoStack.push({ content: editor.innerHTML, timestamp: new Date().toLocaleTimeString() });
    const prev = undoStack.pop();
    editor.innerHTML = prev.content;
    lastContent = prev.content;

    updateDisplay();
    showToast('↶ Undo applied','info');
}

// Redo
function redoAction() {
    if(redoStack.isEmpty()) { showToast('⚠️ Nothing to redo!','warning'); return; }

    const editor = document.getElementById('editorArea');
    undoStack.push({ content: editor.innerHTML, timestamp: new Date().toLocaleTimeString() });
    const next = redoStack.pop();
    editor.innerHTML = next.content;
    lastContent = next.content;

    updateDisplay();
    showToast('↷ Redo applied','success');
}

// Clear Editor
function clearEditor() {
    if(confirm('🗑️ Clear all content?')) {
        document.getElementById('editorArea').innerHTML='';
        undoStack.clear();
        redoStack.clear();
        lastContent='';
        updateDisplay();
        showToast('✅ Cleared!','success');
    }
}

// Update Display
function updateDisplay() {
    document.getElementById('undoCount').textContent = undoStack.size();
    document.getElementById('redoCount').textContent = redoStack.size();
    document.getElementById('undoBtn').disabled = undoStack.isEmpty();
    document.getElementById('redoBtn').disabled = redoStack.isEmpty();

    const undoDisplay = document.getElementById('undoStackDisplay');
    undoDisplay.innerHTML = undoStack.isEmpty() ? '<p class="text-muted text-center mb-0 small">Empty</p>' :
        undoStack.getAll().slice().reverse().map((a,i)=>`
            <div class="stack-item p-2 mb-1 bg-light border-start border-warning border-3">
                <div class="d-flex justify-content-between"><small>#${undoStack.size()-i}</small><span class="badge badge-action bg-warning">${a.timestamp}</span></div>
                <small class="text-muted d-block mt-1" style="max-height:40px;overflow:hidden;">${a.content.substring(0,50) || '(empty)'}...</small>
            </div>`).join('');

    const redoDisplay = document.getElementById('redoStackDisplay');
    redoDisplay.innerHTML = redoStack.isEmpty() ? '<p class="text-muted text-center mb-0 small">Empty</p>' :
        redoStack.getAll().slice().reverse().map((a,i)=>`
            <div class="stack-item p-2 mb-1 bg-light border-start border-info border-3">
                <div class="d-flex justify-content-between"><small>#${redoStack.size()-i}</small><span class="badge badge-action bg-info">${a.timestamp}</span></div>
                <small class="text-muted d-block mt-1" style="max-height:40px;overflow:hidden;">${a.content.substring(0,50) || '(empty)'}...</small>
            </div>`).join('');
}

// Keyboard Shortcuts
document.addEventListener('keydown', e=>{
    if(e.ctrlKey && e.key==='z'){ e.preventDefault(); undoAction(); }
    if(e.ctrlKey && e.key==='y'){ e.preventDefault(); redoAction(); }
    if(e.ctrlKey && e.key==='s'){ e.preventDefault(); saveAction(); }
});

// Toast Notification
function showToast(msg,type){
    const alert = document.createElement('div');
    alert.className=`alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex='9999';
    alert.style.minWidth='300px';
    alert.textContent=msg;
    document.body.appendChild(alert);
    setTimeout(()=>alert.remove(),2500);
}

// Init
window.addEventListener('load',()=>{ updateDisplay(); lastContent=document.getElementById('editorArea').innerHTML; });
