// Projects Modal Functionality
function initProjects() {
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('click', function () {
            const projectId = this.getAttribute('data-project');
            openProjectModal(projectId);
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.project-modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                const modalId = this.id.split('-')[1];
                closeProjectModal(modalId);
            }
        });
    });

    // Close modal on ESC key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.project-modal.active').forEach(modal => {
                const modalId = modal.id.split('-')[1];
                closeProjectModal(modalId);
            });
        }
    });
}

function openProjectModal(projectId) {
    const modal = document.getElementById(`modal-${projectId}`);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
}

function closeProjectModal(projectId) {
    const modal = document.getElementById(`modal-${projectId}`);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjects);
} else {
    initProjects();
}

// Expose to window for main.js
window.initProjects = initProjects;
