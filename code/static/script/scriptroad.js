document.addEventListener('DOMContentLoaded', function() {
    // Initialize form submission
    document.getElementById("roadmap-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const topic = document.getElementById("topic").value.trim();
        if (!topic) {
            showNotification("Please enter a topic", "error");
            return;
        }

        // Show loading state
        document.getElementById("loading").classList.remove("hidden");
        document.getElementById("roadmap-content").innerHTML = "";
        document.getElementById("download-btn").style.display = 'none';
        
        // Animate loading spinner
        if (document.getElementById("roadmap-result").classList.contains("shown")) {
            document.getElementById("roadmap-result").classList.remove("shown");
        }

        try {
            const response = await fetch('/get_roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `topic=${encodeURIComponent(topic)}`
            });

            if (!response.ok) throw new Error("Server error");
            const text = await response.text();
            
            // Update content
            document.getElementById("roadmap-content").innerHTML = formatRoadmapContent(text);
            
            // Hide initial content and show fullscreen result
            document.querySelectorAll('.initial-content').forEach(el => el.classList.add('hide'));
            document.getElementById("roadmap-box").classList.add('fullscreen');
            
            // Show result section with animation
            setTimeout(() => {
                document.getElementById("roadmap-result").classList.add("shown");
                document.getElementById("download-btn").style.display = 'flex';
                
                // Scroll to the result
                document.getElementById("roadmap-result").scrollIntoView({ behavior: 'smooth' });
            }, 300);
            
            // Add title to the page based on the topic
            document.title = `${topic} Learning Roadmap | Skill Roadmap Generator`;
            
            showNotification(`Roadmap for "${topic}" created successfully!`, "success");
        } catch (error) {
            document.getElementById("roadmap-content").innerHTML = 
                `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Error: ${error.message}</div>`;
            showNotification("Failed to generate roadmap", "error");
        } finally {
            document.getElementById("loading").classList.add("hidden");
        }
    });

    // Enhanced download feature
    document.getElementById("download-btn").addEventListener("click", async () => {
        showNotification("Preparing your PDF...", "info");
        
        try {
            const content = document.getElementById("roadmap-content");
            const topic = document.getElementById("topic").value;
            
            // Set up PDF options
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });
            
            // Add title to the PDF
            doc.setFontSize(24);
            doc.setTextColor(76, 175, 80);
            doc.text(`${topic} Learning Roadmap`, 105, 20, { align: "center" });
            
            // Add date
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            const today = new Date().toLocaleDateString();
            doc.text(`Generated on: ${today}`, 105, 30, { align: "center" });
            
            // Use html2canvas with better quality
            const scale = 2; // Increase for better quality
            const canvas = await html2canvas(content, {
                scale: scale,
                backgroundColor: "#333",
                logging: false,
                useCORS: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            
            // Position the content
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            // Add the image to the PDF
            doc.addImage(imgData, 'PNG', 10, 40, pdfWidth - 20, pdfHeight - 20);
            
            // Add footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("Created with Skill Roadmap Generator", 105, 285, { align: "center" });
            
            // Save with formatted name
            const filename = `${topic.toLowerCase().replace(/\s+/g, '-')}-roadmap.pdf`;
            doc.save(filename);
            
            showNotification("PDF downloaded successfully!", "success");
        } catch (error) {
            console.error("PDF generation error:", error);
            showNotification("Failed to generate PDF", "error");
        }
    });

    // Allow form submission with the Enter key
    document.getElementById("topic").addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            document.querySelector("button[type='submit']").click();
        }
    });
    
    // Initialize tooltips if needed
    initializeTooltips();
});

// Format the roadmap content with enhanced styling
function formatRoadmapContent(content) {
    // This function can be extended to add more formatting
    // For now, we'll just return the content as-is
    return `<div class="styled-content">${content}</div>`;
}

// Show notification
function showNotification(message, type = "info") {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Add CSS for notifications
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            }
            .notification {
                padding: 15px 20px;
                margin-bottom: 10px;
                border-radius: 8px;
                color: white;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease, fadeOut 0.5s ease 3.5s forwards;
                max-width: 300px;
            }
            .notification.success { background-color: #4CAF50; }
            .notification.error { background-color: #F44336; }
            .notification.info { background-color: #2196F3; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon based on type
    let icon = '';
    switch(type) {
        case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
        case 'error': icon = '<i class="fas fa-exclamation-circle"></i>'; break;
        case 'info': icon = '<i class="fas fa-info-circle"></i>'; break;
    }
    
    notification.innerHTML = `${icon} ${message}`;
    notificationContainer.appendChild(notification);
    
    // Remove notification after animation completes
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Initialize tooltips
function initializeTooltips() {
    // Add tooltip functionality if needed
    // This is a placeholder for future enhancement
}
