// DOM Elements - All the HTML elements we need to interact with
const bookForm = document.getElementById('book-form');
const bookTitle = document.getElementById('book-title');
const totalPages = document.getElementById('total-pages');
const currentPage = document.getElementById('current-page');
const coverImage = document.getElementById('cover-image');
const progressTracker = document.getElementById('pixel-art-tracker');
const coverImagePreview = document.getElementById('cover-image-preview');
const notesTextarea = document.getElementById('notes');
const saveNotesButton = document.getElementById('save-notes');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const sidebar = document.getElementById('sidebar');
const notesList = document.getElementById('notes-list');
const markdownDisplay = document.getElementById('markdown-display');
const markdownContent = document.getElementById('markdown-content');
const closeMarkdownBtn = document.getElementById('close-markdown');
const clearDataBtn = document.getElementById('clear-data-btn');
const clearOptionsModal = document.getElementById('clear-options-modal');
const confirmClearBtn = document.getElementById('confirm-clear');
const cancelClearBtn = document.getElementById('cancel-clear');
const exportDataBtn = document.getElementById('export-data');
const importDataBtn = document.getElementById('import-data');

// Initialize book data from local storage or create empty object
let bookData = JSON.parse(localStorage.getItem('bookData')) || {};

// Load saved book data when page loads
if (bookData.title) {
    bookTitle.value = bookData.title;
    totalPages.value = bookData.totalPages;
    currentPage.value = bookData.currentPage;
    if (bookData.coverImage) {
        coverImagePreview.src = bookData.coverImage;
    }
    updateProgressTracker();
    notesTextarea.value = bookData.notes || '';
}

// Handle book form submission
bookForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Save book data
    bookData.title = bookTitle.value;
    bookData.totalPages = parseInt(totalPages.value);
    bookData.currentPage = parseInt(currentPage.value);

    // Handle image upload
    if (coverImage.files && coverImage.files[0]) {
        const file = coverImage.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
            bookData.coverImage = reader.result;
            coverImagePreview.src = reader.result;
            localStorage.setItem('bookData', JSON.stringify(bookData));
            updateProgressTracker();
        };
        reader.readAsDataURL(file);
    } else {
        localStorage.setItem('bookData', JSON.stringify(bookData));
        updateProgressTracker();
    }
});

// Update the progress bar visualization
function updateProgressTracker() {
    const currentProgress = (bookData.currentPage / bookData.totalPages) * 100;
    
    // Remove existing progress bar if it exists
    const existingProgressBar = document.getElementById('progress-bar');
    if (existingProgressBar) {
        existingProgressBar.remove();
    }

    // Create new progress bar
    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    progressBar.style.width = `${currentProgress}%`;
    progressTracker.appendChild(progressBar);
}

// Load and display notes from local storage
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('bookNotes')) || {};
    renderNotesList(notes);
}

// Display notes in the sidebar
function renderNotesList(notes) {
    notesList.innerHTML = '';
    
    for (const [bookTitle, noteFiles] of Object.entries(notes)) {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder';
        
        const folderTitle = document.createElement('div');
        folderTitle.className = 'folder-title';
        folderTitle.textContent = bookTitle;
        folderDiv.appendChild(folderTitle);
        
        noteFiles.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.textContent = note.filename || extractTitleFromMarkdown(note.content) || 'Untitled Note';
            noteItem.addEventListener('click', () => openNote(note));
            folderDiv.appendChild(noteItem);
        });
        
        notesList.appendChild(folderDiv);
    }
}

// Extract title from markdown content (first heading)
function extractTitleFromMarkdown(content) {
    if (!content) return null;
    const firstLine = content.split('\n')[0];
    if (firstLine.startsWith('# ')) {
        return firstLine.replace('# ', '').trim();
    } else if (firstLine.startsWith('## ')) {
        return firstLine.replace('## ', '').trim();
    }
    return null;
}

// Open a note in the markdown viewer
function openNote(note) {
    let titleDisplay = document.querySelector('#markdown-display h2');
    if (!titleDisplay) {
        titleDisplay = document.createElement('h2');
        markdownContent.prepend(titleDisplay);
    }
    
    titleDisplay.textContent = note.filename || extractTitleFromMarkdown(note.content) || 'Untitled Note';
    markdownContent.innerHTML = marked.parse(note.content);
    markdownDisplay.classList.remove('hidden');
}

// Save notes with custom title prompt
function saveNewNote() {
    const notes = JSON.parse(localStorage.getItem('bookNotes')) || {};
    const currentBook = bookTitle.value;
    
    if (!currentBook) {
        alert('Please enter a book title first!');
        return;
    }
    
    const defaultTitle = `Notes for ${currentBook} - ${new Date().toLocaleDateString()}`;
    const noteTitle = prompt('Enter a title for this note:', defaultTitle);
    
    if (!noteTitle) return; // User cancelled
    
    if (!notes[currentBook]) {
        notes[currentBook] = [];
    }
    
    notes[currentBook].push({
        filename: noteTitle,
        content: notesTextarea.value,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('bookNotes', JSON.stringify(notes));
    renderNotesList(notes);
}

// Save notes button handler
saveNotesButton.addEventListener('click', function(e) {
    e.preventDefault();
    bookData.notes = notesTextarea.value;
    localStorage.setItem('bookData', JSON.stringify(bookData));
    saveNewNote();
    alert('Notes saved successfully!');
});

// Close markdown viewer
closeMarkdownBtn.addEventListener('click', () => {
    markdownDisplay.classList.add('hidden');
});

// Clear data functionality
clearDataBtn.addEventListener('click', () => {
    document.querySelectorAll('#clear-options-modal input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    clearOptionsModal.classList.remove('hidden');
});

cancelClearBtn.addEventListener('click', () => {
    clearOptionsModal.classList.add('hidden');
});

confirmClearBtn.addEventListener('click', () => {
    const clearCurrentBook = document.getElementById('clear-current-book').checked;
    const clearAllBooks = document.getElementById('clear-all-books').checked;
    const clearCurrentNotes = document.getElementById('clear-current-notes').checked;
    const clearAllNotes = document.getElementById('clear-all-notes').checked;
    const currentBook = bookTitle.value;

    if (!clearCurrentBook && !clearAllBooks && !clearCurrentNotes && !clearAllNotes) {
        alert('Please select at least one option!');
        return;
    }

    if (clearCurrentBook || clearAllBooks) {
        localStorage.removeItem('bookData');
        bookData = {};
        bookTitle.value = '';
        totalPages.value = '';
        currentPage.value = '';
        coverImagePreview.src = '';
        updateProgressTracker();
        notesTextarea.value = '';
    }

    if (clearAllNotes) {
        localStorage.removeItem('bookNotes');
    }

    if (clearCurrentNotes && currentBook) {
        const notes = JSON.parse(localStorage.getItem('bookNotes')) || {};
        delete notes[currentBook];
        localStorage.setItem('bookNotes', JSON.stringify(notes));
    }

    clearOptionsModal.classList.add('hidden');
    loadNotes();
    alert('Selected items cleared successfully!');
});

// Export all data as JSON file
exportDataBtn.addEventListener('click', () => {
    const data = {
        bookData: JSON.parse(localStorage.getItem('bookData') || {}),
        bookNotes: JSON.parse(localStorage.getItem('bookNotes') || {})
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `book-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Import data from JSON file
importDataBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.bookData) localStorage.setItem('bookData', JSON.stringify(data.bookData));
                if (data.bookNotes) localStorage.setItem('bookNotes', JSON.stringify(data.bookNotes));
                alert('Data imported successfully! Reloading...');
                location.reload();
            } catch (err) {
                alert('Error: Invalid file format');
            }
        };
        reader.readAsText(file);
    };
    fileInput.click();
});

// Dark mode toggle
darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.container').classList.toggle('dark-mode');
    document.querySelectorAll('button').forEach((button) => {
        button.classList.toggle('dark-mode');
    });
    sidebar.classList.toggle('dark-mode');
});

// PWA Installation Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.createElement('button');
    installBtn.id = 'install-app';
    installBtn.textContent = '⬇️ Install App';
    document.querySelector('.container').appendChild(installBtn);
    
    installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') {
                installBtn.remove();
            }
        });
    });
});

// Register Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(err => {
                console.log('ServiceWorker failed:', err);
            });
    });
}

// Initialize the app
function initializeApp() {
    loadNotes();
    
    // Add title element to markdown display if it doesn't exist
    if (!document.querySelector('#markdown-display h2')) {
        const titleElement = document.createElement('h2');
        markdownContent.prepend(titleElement);
    }
}

initializeApp();