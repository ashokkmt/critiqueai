document.addEventListener('DOMContentLoaded', function() {
    // Set the current date
    const currentDate = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', dateOptions);
    
    // Copy to clipboard functionality
    const copyBtn = document.getElementById('copy-btn');
    copyBtn.addEventListener('click', function() {
        const summaryContent = document.getElementById('summary').innerText;
        
        navigator.clipboard.writeText(summaryContent).then(() => {
            showNotification('Summary copied to clipboard!', 'fa-check-circle');
        }).catch(err => {
            showNotification('Failed to copy. Please try again.', 'fa-exclamation-circle');
            console.error('Could not copy text: ', err);
        });
    });
    
    // Notification function
    function showNotification(message, iconClass) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="notification-message">${message}</div>
        `;
        
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                container.removeChild(notification);
            }, 500);
        }, 3000);
    }
});