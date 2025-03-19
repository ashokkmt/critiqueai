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
    
    // Download summary functionality
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.addEventListener('click', async function() {
        const summaryContent = document.getElementById('outputContainer');
        const { jsPDF } = window.jspdf;
        
        try {
            // Create PDF document
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(76, 175, 80); // Green color
            doc.text("Document Summary", 105, 20, { align: "center" });

            // Add date
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.setTextColor(100);
            const today = new Date().toLocaleDateString();
            doc.text(`Generated on: ${today}`, 105, 30, { align: "center" });

            // Convert content to image
            const canvas = await html2canvas(summaryContent, {
                scale: 2,
                backgroundColor: '#161a20',
                logging: false
            });

            // Add content
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            doc.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);

            // Save PDF
            const fileName = 'summary-' + new Date().toISOString().slice(0, 10) + '.pdf';
            doc.save(fileName);
            showNotification('PDF downloaded successfully!', 'fa-check-circle');
        } catch (error) {
            console.error('PDF generation failed:', error);
            showNotification('Failed to generate PDF', 'fa-exclamation-circle');
        }
    });
});

// Function to show notifications
function showNotification(message, iconClass) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<i class="fas ${iconClass}"></i> ${message}`;
    
    container.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 3000);
}