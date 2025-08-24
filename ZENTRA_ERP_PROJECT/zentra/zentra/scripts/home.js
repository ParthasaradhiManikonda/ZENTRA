document.addEventListener('DOMContentLoaded', () => {
  // This script should only run on the home page.
  if (!document.getElementById('create-project-section')) return;

  const welcomeUsername = document.getElementById('welcome-username');
  const welcomeRole = document.getElementById('welcome-role');
  const projectFormEl = document.getElementById('project-form');
  const projectIdField = document.getElementById('project-id-field');
  const saveProjectBtn = document.getElementById('save-project-btn');

  const user = AppState.users.find(u => u.username === AppState.loggedInUser);
  welcomeUsername.textContent = user.username;
  welcomeRole.textContent = user.role;
  welcomeRole.className = `user-role-badge role-${user.role}`;

  populateProjectForm();
  renderRecentProjects();
  setupTaskAssignment();

  const editProjectId = localStorage.getItem('editProjectId');
  if (editProjectId) {
    const projectToEdit = AppState.projects.find(p => p.id === editProjectId);
    if (projectToEdit) {
      fillFormForEditing(projectToEdit);
      saveProjectBtn.textContent = 'Save Changes';
      document.getElementById('create-project-section').scrollIntoView();
    }
    localStorage.removeItem('editProjectId');
  }

  projectFormEl.addEventListener('submit', handleProjectFormSubmit);
});

/* ============================
   Populate Project Form
=============================== */
function populateProjectForm() {
  const formGrid = document.querySelector('#project-form .form-grid');

  const fields = [
    { id: 'project-name', label: 'Project Name', type: 'text', required: true, placeholder: 'e.g., Website Redesign' },
    { id: 'project-budget', label: 'Budget', type: 'number', placeholder: 'e.g., 50000' },
    { id: 'project-risk', label: 'Risk Level', type: 'select', options: ['Low', 'Medium', 'High'], required: true },
    { id: 'project-timeline', label: 'Timeline', type: 'text', placeholder: 'e.g., 6 months' },
    { id: 'project-due-date', label: 'Due Date', type: 'date', required: true },
    { id: 'project-members-available', label: 'Members Available', type: 'number', placeholder: 'e.g., 3' }, // ADDED
    { id: 'project-members-required', label: 'Members Required', type: 'number', placeholder: 'e.g., 5' },
    { id: 'project-team-lead', label: 'Team Lead', type: 'text', required: true, placeholder: 'e.g., Jane Doe' },
    { id: 'project-techstack', label: 'Tech Stack (comma-separated)', type: 'text', required: true, placeholder: 'e.g., React, Node.js, MongoDB' },
    { id: 'project-required-resources', label: 'Required Resources (comma-separated)', type: 'text', placeholder: 'e.g., AWS Credits, Figma License' }, // ADDED
    { id: 'project-description', label: 'Description', type: 'textarea', required: true, placeholder: 'Detailed description of the project...' },
    { id: 'project-status', label: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Completed', 'On Hold'], required: true },
    { id: 'project-progress', label: 'Progress (%)', type: 'number', required: true, min: 0, max: 100 },
  ];

  let html = '';
  fields.forEach(f => {
    const requiredSpan = f.required ? ' <span style="color:red">*</span>' : '';
    const placeholderText = f.placeholder ? `placeholder="${f.placeholder}"` : '';

    if (f.type === 'select') {
      html += `
        <div>
          <label for="${f.id}" class="form-label">${f.label}${requiredSpan}</label>
          <select id="${f.id}" ${f.required ? 'required' : ''}>
            <option value="">Select ${f.label.replace(' *', '')}...</option>
            ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
          </select>
        </div>`;
    } else if (f.type === 'textarea') {
      html += `
        <div style="grid-column: 1 / -1;">
          <label for="${f.id}" class="form-label">${f.label}${requiredSpan}</label>
          <textarea id="${f.id}" rows="3" ${placeholderText} ${f.required ? 'required' : ''}></textarea>
        </div>`;
    } else {
      html += `
        <div>
          <label for="${f.id}" class="form-label">${f.label}${requiredSpan}</label>
          <input 
            type="${f.type}" 
            id="${f.id}" 
            ${placeholderText} 
            ${f.required ? 'required' : ''} 
            ${f.min !== undefined ? `min="${f.min}"` : ''} 
            ${f.max !== undefined ? `max="${f.max}"` : ''} 
          />
        </div>`;
    }
  });

  formGrid.innerHTML = html;
}

/* ============================
   Handle Form Submission
=============================== */
function handleProjectFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('project-id-field').value || Date.now().toString();
  const isEditing = !!document.getElementById('project-id-field').value;

  const projectData = {
    id,
    name: document.getElementById('project-name').value,
    budget: parseFloat(document.getElementById('project-budget').value) || 0,
    riskLevel: document.getElementById('project-risk').value,
    timeline: document.getElementById('project-timeline').value,
    dueDate: document.getElementById('project-due-date').value,
    membersAvailable: parseInt(document.getElementById('project-members-available').value) || 0, // ADDED
    membersRequired: parseInt(document.getElementById('project-members-required').value) || 0,
    teamLead: document.getElementById('project-team-lead').value,
    techStack: document.getElementById('project-techstack').value,
    requiredResources: document.getElementById('project-required-resources').value, // ADDED
    description: document.getElementById('project-description').value,
    status: document.getElementById('project-status').value,
    progress: parseInt(document.getElementById('project-progress').value),
    lastUpdated: new Date().toISOString(),
    members: isEditing ? AppState.projects.find(p => p.id === id).members : []
  };

  let updatedProjects = [...AppState.projects];
  if (isEditing) {
    updatedProjects = updatedProjects.map(p => (p.id === id ? projectData : p));
  } else {
    updatedProjects.push(projectData);
  }

  saveData('projects', updatedProjects);
  showCustomModal('Success', `Project ${isEditing ? 'updated' : 'created'}!`);

  e.target.reset();
  document.getElementById('project-id-field').value = '';
  document.getElementById('save-project-btn').textContent = 'Save Project';
  renderRecentProjects();
}

/* ============================
   Fill Form for Editing
=============================== */
function fillFormForEditing(project) {
  document.getElementById('project-id-field').value = project.id;
  document.getElementById('project-name').value = project.name;
  document.getElementById('project-budget').value = project.budget;
  document.getElementById('project-risk').value = project.riskLevel;
  document.getElementById('project-timeline').value = project.timeline;
  document.getElementById('project-due-date').value = project.dueDate;
  document.getElementById('project-members-available').value = project.membersAvailable; // ADDED
  document.getElementById('project-members-required').value = project.membersRequired;
  document.getElementById('project-team-lead').value = project.teamLead;
  document.getElementById('project-techstack').value = project.techStack;
  document.getElementById('project-required-resources').value = project.requiredResources; // ADDED
  document.getElementById('project-description').value = project.description;
  document.getElementById('project-status').value = project.status;
  document.getElementById('project-progress').value = project.progress;
}

/* ============================
   Task Assignment
=============================== */
function setupTaskAssignment() {
  const assignBtn = document.getElementById('assign-task-btn');
  const memberSelect = document.getElementById('member-select');
  const taskInput = document.getElementById('task-input');

  assignBtn.addEventListener('click', () => {
    const projectId = assignBtn.dataset.projectId;
    const memberName = memberSelect.value;
    const taskDesc = taskInput.value.trim();

    if (!projectId || !memberName || !taskDesc) {
      showCustomModal('Error', 'Please select a project, member, and enter a task.');
      return;
    }

    const updatedProjects = AppState.projects.map(p => {
      if (p.id === projectId) {
        let member = p.members.find(m => m.name === memberName);
        if (!member) {
          member = { name: memberName, tasks: [] };
          p.members.push(member);
        }
        member.tasks.push(taskDesc);
        p.lastUpdated = new Date().toISOString();
      }
      return p;
    });

    saveData('projects', updatedProjects);
    showCustomModal('Success', `Task assigned to ${memberName}.`);
    taskInput.value = '';
    renderRecentProjects();
  });
}
