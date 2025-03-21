let logs = [];
let fetching = true;

/* Fetch logs from API & update logs */
async function fetchLogs() {
    try {
        const response = await fetch(API);
        const data = (await response.json()) || [];
        if (!data.length) {
            updateTimeline([{
                timestamp: Date.now(),
                method: 'Not found',
                url: '- No logs found at this endpoint',
                status: 404
            }]);
            fetching = false;
            return;
        }
        const newLogs = data.filter(log => !logs.some(l => l.timestamp === log.timestamp && l.url === log.url));
        if (newLogs.length) updateTimeline(logs = [...logs, ...newLogs]);
    } catch (error) {
        console.error('Internal server error:', error);
        updateTimeline([{
            timestamp: Date.now(),
            method: 'Server Error',
            url: ' - ' + error.message,
            status: 500
        }]);
        fetching = false;
    }
}

/* Update the timeline with new logs */
function updateTimeline(newLogs) {
    newLogs.forEach(log => {
        const statusClass = log.status < 300 ? 'status-2' : log.status < 400 ? 'status-3' : log.status < 500 ? 'status-4' : 'status-5';
        const logElement = document.createElement('div');
        logElement.className = 'timeline-item';
        logElement.innerHTML = `
            <div class="timeline-item-content">
                <div class="status ${statusClass}">${log.status}</div>
                <div class="method method-${log.method.toLowerCase().replace(' ', '-')}">${log.method}</div>
                <div class="request">${log.method} ${log.url}</div>
                <div class="subtitle">${new Date(log.timestamp).toLocaleString()} ${log.duration ? '&nbsp;-&nbsp; ' + log.duration : ''} ${log.platform ? '&nbsp;-&nbsp; ' + log.platform : ''}</div>
            </div>`;
        document.getElementById('timeline').prepend(logElement);
    });
}

/* Fetch logs on page load & then every 2 seconds */
setInterval(() => { if (fetching) fetchLogs(); }, 2000);
fetchLogs();