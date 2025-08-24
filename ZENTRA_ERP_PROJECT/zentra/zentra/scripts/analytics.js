document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('analytics-charts')) return;
    renderAnalytics();
});

function renderAnalytics() {
    const projects = AppState.projects;
    const statusCounts = { "Not Started": 0, "In Progress": 0, "Completed": 0, "On Hold": 0, "Overdue": 0 };
    const riskCounts = { "Low": 0, "Medium": 0, "High": 0 };
    let totalProgress = 0;

    projects.forEach(p => {
        const isOverdue = new Date(p.dueDate) < new Date() && p.status !== "Completed";
        statusCounts[isOverdue ? "Overdue" : p.status]++;
        riskCounts[p.riskLevel]++;
        totalProgress += p.progress;
    });

    // Update summary text
    document.getElementById('total-projects-count').textContent = projects.length;
    document.getElementById('completed-projects-count').textContent = statusCounts.Completed;
    document.getElementById('average-progress-count').textContent = projects.length > 0 ? `${(totalProgress / projects.length).toFixed(1)}%` : '0%';

    // Status Chart
    new Chart(document.getElementById('status-chart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#94a3b8', '#3b82f6', '#22c55e', '#f59e0b', '#dc2626'] }]
        }
    });

    // Risk Chart
    new Chart(document.getElementById('risk-chart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(riskCounts),
            datasets: [{ data: Object.values(riskCounts), backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'] }]
        }
    });
}