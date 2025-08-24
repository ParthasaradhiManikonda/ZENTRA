document.addEventListener('DOMContentLoaded', () => {
    // This script should run on both home and all-projects pages.
    if (window.location.pathname.endsWith('all-projects.html')) {
        renderAllProjects();
    }
});

function renderRecentProjects() {
    const container = document.getElementById('recent-projects-list');
    if (!container) return;
    
    const recent = [...AppState.projects]
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
        .slice(0, 3);

    renderProjectList(container, recent, 'no-recent-projects-message');
}

function renderAllProjects() {
    const container = document.getElementById('all-projects-list');
    if (!container) return;
    renderProjectList(container, AppState.projects, 'no-all-projects-message');
}

function renderProjectList(container, projectList, noProjectsMessageId) {
    const noProjectsMessage = document.getElementById(noProjectsMessageId);
    container.innerHTML = '';
    
    if (projectList.length === 0) {
        container.innerHTML = `<p id="${noProjectsMessageId}">${noProjectsMessage.textContent}</p>`;
        return;
    }
    
    // Determine which page we are on to render the correct card style
    const isAllProjectsPage = window.location.pathname.endsWith('all-projects.html');
    
    projectList.forEach(project => {
        const card = document.createElement('div');
        const isOverdue = new Date(project.dueDate) < new Date() && project.status !== "Completed";
        // Convert status to a CSS-friendly class name by replacing spaces with hyphens
        const statusClass = isOverdue ? "Overdue" : project.status.replace(/\s/g, '-');
        
        card.className = isAllProjectsPage ? `all-projects-card status-${statusClass}` : `project-card status-${statusClass}`;
        
        let cardHtml = '';
        if (isAllProjectsPage) {
            // Detailed card for All Projects page
            const membersText = project.members && project.members.length > 0
                ? `<strong>Members & Tasks:</strong> ${project.members.length} member(s) assigned.`
                : '<strong>Members & Tasks:</strong> No members or tasks assigned.';

            cardHtml = `
                <div class="card-header">
                    <h3>${project.name}</h3>
                    <p class="project-description">${project.description || 'No description provided.'}</p>
                </div>
                <div class="card-details-grid">
                    <p><span class="detail-label">Status:</span> <span class="highlight-badge status-${statusClass}">${project.status}</span></p>
                    <p><span class="detail-label">Risk:</span> <span class="highlight-badge risk-${project.riskLevel.toLowerCase()}">${project.riskLevel}</span></p>
                    <p><span class="detail-label">Due:</span> ${new Date(project.dueDate).toLocaleDateString()}</p>
                    <p><span class="detail-label">Lead:</span> ${project.teamLead}</p>
                    <p><span class="detail-label">Members:</span> ${project.membersAvailable} / ${project.membersRequired}</p>
                    <p><span class="detail-label">Budget:</span> $${project.budget.toLocaleString()}</p>
                </div>
                <div class="members-tasks-summary">
                    ${membersText}
                </div>
                <div class="project-card-actions">
                    <button class="btn-secondary view-details-btn full-width">View Details</button>
                </div>
            `;
        } else {
            // Simple card for Home page
            cardHtml = `
                <h3>${project.name}</h3>
                <p><strong>Lead:</strong> ${project.teamLead}</p>
                <p><strong>Progress:</strong> ${project.progress}%</p>
                <p><strong>Due:</strong> ${new Date(project.dueDate).toLocaleDateString()}</p>
                <div class="project-card-actions">
                    <button class="btn-secondary view-details-btn">Details</button>
                    <button class="btn-primary assign-task-select-btn admin-only">Assign Task</button>
                </div>
            `;
        }
        
        card.innerHTML = cardHtml;
        
        card.querySelector('.view-details-btn').addEventListener('click', () => showProjectDetailModal(project.id));
        
        if (!isAllProjectsPage) {
            const assignBtn = card.querySelector('.assign-task-select-btn');
            if (assignBtn) {
                assignBtn.addEventListener('click', () => {
                    const assignTaskSection = document.getElementById('assign-task-section');
                    document.getElementById('selected-project-for-task').textContent = project.name;
                    
                    const assignTaskBtn = document.getElementById('assign-task-btn');
                    assignTaskBtn.dataset.projectId = project.id;
                    assignTaskBtn.disabled = false;
                    
                    populateMemberDropdown(project);
                    assignTaskSection.scrollIntoView({ behavior: 'smooth' });
                });
            }
        }

        container.appendChild(card);
    });
}

function populateMemberDropdown(project) {
    const memberSelect = document.getElementById('member-select');
    memberSelect.innerHTML = '<option value="">Select Member...</option>';
    let members = new Set(project.members.map(m => m.name));
    for (let i = 1; i <= project.membersRequired; i++) {
        members.add(`Team Member ${i}`);
    }
    members.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        memberSelect.appendChild(option);
    });
}

window.renderRecentProjects = renderRecentProjects;
window.renderAllProjects = renderAllProjects;