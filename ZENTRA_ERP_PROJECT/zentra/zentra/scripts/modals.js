document.addEventListener('DOMContentLoaded', () => {
    window.showCustomModal = showCustomModal;
    window.showProjectDetailModal = showProjectDetailModal;
});

function showCustomModal(title, message, isConfirm = false) {
    return new Promise((resolve) => {
        const modalContainer = document.getElementById('message-modal');
        modalContainer.innerHTML = `
            <div class="modal-content">
                <button class="modal-close-btn">&times;</button>
                <h3>${title}</h3>
                <p>${message}</p>
                <div id="message-modal-actions">
                    ${isConfirm ? '<button id="modal-confirm" class="btn-primary">Confirm</button>' : ''}
                    <button id="modal-cancel" class="btn-secondary">Close</button>
                </div>
            </div>
        `;
        modalContainer.classList.add('show');

        const close = () => {
            modalContainer.classList.remove('show');
            resolve(false);
        };
        const confirm = () => {
            modalContainer.classList.remove('show');
            resolve(true);
        };

        modalContainer.querySelector('.modal-close-btn').addEventListener('click', close);
        modalContainer.querySelector('#modal-cancel').addEventListener('click', close);
        if (isConfirm) {
            modalContainer.querySelector('#modal-confirm').addEventListener('click', confirm);
        }
    });
}

function showProjectDetailModal(projectId) {
    const project = AppState.projects.find(p => p.id === projectId);
    if (!project) return;
    
    const user = AppState.users.find(u => u.username === AppState.loggedInUser);
    const isAdmin = user?.role === 'admin';

    const modalContainer = document.getElementById('project-detail-modal');
    const isOverdue = new Date(project.dueDate) < new Date() && project.status !== "Completed";
    const displayStatus = isOverdue ? "Overdue" : project.status;

    let membersHtml = '<p>No members or tasks assigned to this project yet.</p>';
    if (project.members && project.members.length > 0) {
        membersHtml = '<ul>' + project.members.map(m => `<li><strong>${m.name}:</strong> ${m.tasks.join(', ') || 'No tasks'}</li>`).join('') + '</ul>';
    }

    modalContainer.innerHTML = `
        <div class="modal-content">
            <button class="modal-close-btn">&times;</button>
            <h3>${project.name}</h3>
            <div class="detail-grid">
                <p><span class="detail-label">Progress:</span> <span class="highlight-badge progress-badge">${project.progress}%</span></p>
                <p><span class="detail-label">Status:</span> <span class="highlight-badge status-badge status-${displayStatus.replace(' ', '-')}">${displayStatus}</span></p>
                <p><span class="detail-label">Risk Level:</span> <span class="highlight-badge risk-badge risk-${project.riskLevel.toLowerCase()}">${project.riskLevel}</span></p>
                <p><span class="detail-label">Due Date:</span> ${new Date(project.dueDate).toLocaleDateString()}</p>
                <p><span class="detail-label">Budget:</span> $${project.budget.toLocaleString()}</p>
                <p><span class="detail-label">Timeline:</span> ${project.timeline || 'N/A'}</p>
                <p><span class="detail-label">Members:</span> ${project.membersAvailable} available / ${project.membersRequired} required</p>
                <p><span class="detail-label">Team Lead:</span> ${project.teamLead}</p>
            </div>
            <p><span class="detail-label">Tech Stack:</span> ${project.techStack || 'N/A'}</p>
            <p><span class="detail-label">Required Resources:</span> ${project.requiredResources || 'N/A'}</p>
            <p><span class="detail-label">Description:</span><br>${project.description}</p>

            <h4>Project Progress</h4>
            <canvas id="project-progress-chart" style="max-width: 250px; margin: 1rem auto;"></canvas>
            
            <h4>Team Members & Tasks</h4>
            ${membersHtml}

            ${isAdmin ? `
            <div class="actions">
                <button id="edit-project-btn" class="btn-secondary">Edit Project</button>
                <button id="delete-project-btn" class="btn-danger">Delete Project</button>
            </div>` : ''}
        </div>
    `;
    modalContainer.classList.add('show');

    // Render chart
    new Chart(document.getElementById('project-progress-chart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{ 
                data: [project.progress, 100 - project.progress], 
                backgroundColor: ['#3b82f6', '#e5e7eb'] 
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Project Completion'
                }
            }
        }
    });
    
    // Event listeners
    modalContainer.querySelector('.modal-close-btn').addEventListener('click', () => modalContainer.classList.remove('show'));
    if (isAdmin) {
        document.getElementById('edit-project-btn').addEventListener('click', () => {
            localStorage.setItem('editProjectId', projectId);
            window.location.href = 'home.html';
        });
        document.getElementById('delete-project-btn').addEventListener('click', () => {
             showCustomModal('Confirm Delete', `Delete project "${project.name}"?`, true).then(confirmed => {
                 if(confirmed) {
                     const updatedProjects = AppState.projects.filter(p => p.id !== projectId);
                     saveData('projects', updatedProjects);
                     modalContainer.classList.remove('show');
                     // This relies on the projects.js file having a render function
                     if(window.renderAllProjects) renderAllProjects();
                     if(window.renderRecentProjects) renderRecentProjects();
                 }
             });
        });
    }
}