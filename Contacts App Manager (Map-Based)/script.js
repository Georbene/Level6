// Contacts Manager using JavaScript Map (DSA Project)
// Core operations: set, get, has, delete, clear

const phoneBook = new Map(); // renamed from contactsMap
let activeEditName = null;

// Contact model
class ContactRecord {
    constructor(fullName, phoneNumber) {
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.createdOn = new Date().toLocaleString();
        this.modifiedOn = new Date().toLocaleString();
    }

    modifyPhone(newPhone) {
        this.phoneNumber = newPhone;
        this.modifiedOn = new Date().toLocaleString();
    }
}

// Add new contact
function addContact() {
    const nameInput = document.getElementById('contactName').value.trim();
    const phoneInput = document.getElementById('contactPhone').value.trim();

    if (!nameInput || !phoneInput) {
        displayAlert('⚠️ Name and phone number are required!', 'warning');
        return;
    }

    if (phoneBook.has(nameInput)) {
        displayAlert(`🚫 "${nameInput}" already exists.`, 'warning');
        return;
    }

    const newEntry = new ContactRecord(nameInput, phoneInput);
    phoneBook.set(nameInput, newEntry);

    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';

    refreshUI();
    displayAlert(`✅ "${nameInput}" added successfully`, 'success');
}

// Quick add helper
function quickAdd(name, phone) {
    document.getElementById('contactName').value = name;
    document.getElementById('contactPhone').value = phone;
    addContact();
}

// Search contacts
function searchContacts() {
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
    const resultBox = document.getElementById('searchResults');
    const resultCount = document.getElementById('searchCount');

    if (!keyword) {
        resultBox.style.display = 'none';
        renderContacts();
        document.getElementById('searchResultsCount').textContent = '-';
        return;
    }

    const matches = [];
    for (const [key, value] of phoneBook) {
        if (key.toLowerCase().includes(keyword) ||
            value.phoneNumber.includes(keyword)) {
            matches.push([key, value]);
        }
    }

    resultCount.textContent = matches.length;
    document.getElementById('searchResultsCount').textContent = matches.length;
    resultBox.style.display = 'block';

    renderContacts(matches);
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchResultsCount').textContent = '-';
    renderContacts();
}

// Edit contact
function editContact(name) {
    const record = phoneBook.get(name);
    if (!record) return;

    activeEditName = name;
    document.getElementById('editName').value = name;
    document.getElementById('editPhone').value = record.phoneNumber;
    document.getElementById('contactDetails').style.display = 'block';

    document.getElementById('contactDetails')
        .scrollIntoView({ behavior: 'smooth' });
}

// Update contact
function updateContact() {
    if (!activeEditName) return;

    const newPhone = document.getElementById('editPhone').value.trim();
    if (!newPhone) {
        displayAlert('⚠️ Phone number cannot be empty!', 'warning');
        return;
    }

    const record = phoneBook.get(activeEditName);
    record.modifyPhone(newPhone);
    phoneBook.set(activeEditName, record);

    cancelEdit();
    refreshUI();
    displayAlert(`✅ "${activeEditName}" updated`, 'success');
}

// Cancel edit
function cancelEdit() {
    activeEditName = null;
    document.getElementById('editName').value = '';
    document.getElementById('editPhone').value = '';
    document.getElementById('contactDetails').style.display = 'none';
}

// Delete single contact
function deleteContact(name) {
    if (confirm(`🗑️ Delete "${name}"?`)) {
        phoneBook.delete(name);
        refreshUI();
        displayAlert(`✅ "${name}" deleted`, 'success');
    }
}

// Clear all contacts
function clearAllContacts() {
    if (phoneBook.size === 0) {
        displayAlert('📭 No contacts available', 'info');
        return;
    }

    if (confirm('🗑️ Remove all contacts?')) {
        phoneBook.clear();
        refreshUI();
        displayAlert('✅ All contacts removed', 'success');
    }
}

// Export contacts
function exportContacts() {
    if (phoneBook.size === 0) {
        displayAlert('📭 Nothing to export', 'warning');
        return;
    }

    const data = {};
    for (const [key, value] of phoneBook) {
        data[key] = {
            name: value.fullName,
            phone: value.phoneNumber,
            createdOn: value.createdOn,
            modifiedOn: value.modifiedOn
        };
    }

    const payload = {
        count: phoneBook.size,
        exportedAt: new Date().toLocaleString(),
        contacts: data
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contacts_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Refresh statistics and list
function refreshUI() {
    document.getElementById('totalContacts').textContent = phoneBook.size;

    const last24hrs = new Date(Date.now() - 86400000);
    let recent = 0;

    for (const record of phoneBook.values()) {
        if (new Date(record.createdOn) > last24hrs) recent++;
    }

    document.getElementById('recentContacts').textContent = recent;
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();

    renderContacts();
}

// Render contact list
function renderContacts(list = null) {
    const container = document.getElementById('contactsList');
    const data = list || Array.from(phoneBook.entries());

    if (data.length === 0) {
        container.innerHTML = '<p class="empty-state text-center">No contacts found.</p>';
        return;
    }

    data.sort((a, b) => a[0].localeCompare(b[0]));

    container.innerHTML = data.map(([name, record], index) => `
        <div class="contact-item alert alert-light d-flex justify-content-between">
            <div>
                <strong>#${index + 1}</strong> ${name}
                <span class="badge bg-primary ms-2">📞 ${record.phoneNumber}</span>
                <br>
                <small class="text-muted">
                    Added: ${record.createdOn}
                    ${record.modifiedOn !== record.createdOn ? ` | Updated: ${record.modifiedOn}` : ''}
                </small>
            </div>
            <div class="contact-actions">
                <button class="btn btn-sm btn-outline-warning me-1"
                    onclick="editContact('${name.replace(/'/g, "\\'")}')">✏️</button>
                <button class="btn btn-sm btn-outline-danger"
                    onclick="deleteContact('${name.replace(/'/g, "\\'")}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Keyboard shortcuts
document.getElementById('contactName').addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('contactPhone').focus();
});

document.getElementById('contactPhone').addEventListener('keypress', e => {
    if (e.key === 'Enter') addContact();
});

// Notification helper
function displayAlert(msg, type) {
    const note = document.createElement('div');
    note.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    note.style.zIndex = 9999;
    note.textContent = msg;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3000);
}

// Initialize
refreshUI();
