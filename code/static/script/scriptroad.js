document.addEventListener('DOMContentLoaded', function() {
    const inputSection = document.getElementById("input-section");
    const loadingScreen = document.getElementById("loading-screen");
    const roadmapResult = document.getElementById("roadmap-result");
    const form = document.getElementById("roadmap-form");
    const topicInput = document.getElementById("topic");
    const roadmapContent = document.getElementById("roadmap-content");
    const downloadBtn = document.getElementById("download-btn");
    const backBtn = document.getElementById("back-btn");

    // Form Submission Handler
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const topic = topicInput.value.trim();
        if (!topic) {
            showNotification("Please enter a topic", "error");
            return;
        }

        // Hide input section and show loading screen
        inputSection.classList.add("hidden");
        loadingScreen.classList.remove("hidden");
        
        try {
            const response = await fetch('/get_roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `topic=${encodeURIComponent(topic)}`
            });

            if (!response.ok) throw new Error("Server error");
            const text = await response.text();
            
            // Hide loading screen, show roadmap result
            loadingScreen.classList.add("hidden");
            roadmapResult.classList.remove("hidden");
            
            // Update result content
            document.getElementById("roadmap-title").textContent = `${topic} Learning Roadmap`;
            roadmapContent.innerHTML = text;
            downloadBtn.style.display = 'flex';
            
            showNotification(`Roadmap for "${topic}" created successfully!`, "success");
        } catch (error) {
            loadingScreen.classList.add("hidden");
            inputSection.classList.remove("hidden");
            
            roadmapContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error: Unable to generate roadmap. Please try again.
                </div>
            `;
            showNotification("Failed to generate roadmap", "error");
        }
    });

    // Back Button Handler
    backBtn.addEventListener("click", () => {
        roadmapResult.classList.add("hidden");
        inputSection.classList.remove("hidden");
        topicInput.value = "";
        downloadBtn.style.display = 'none';
    });

    // Download Button Handler (similar to previous implementation)
    downloadBtn.addEventListener("click", async () => {
        showNotification("Preparing your PDF...", "info");
        
        try {
            const topic = topicInput.value;
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });
            
            // PDF generation logic (same as before)
            doc.setFontSize(24);
            doc.setTextColor(63, 228, 147);
            doc.text(`${topic} Learning Roadmap`, 105, 20, { align: "center" });
            
            const today = new Date().toLocaleDateString();
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${today}`, 105, 30, { align: "center" });
            
            const scale = 2;
            const canvas = await html2canvas(roadmapContent, {
                scale: scale,
                backgroundColor: "#0d1117",
                logging: false,
                useCORS: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            doc.addImage(imgData, 'PNG', 10, 40, pdfWidth - 20, pdfHeight);
            
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("Created with Skill Roadmap Generator", 105, 285, { align: "center" });
            
            const filename = `${topic.toLowerCase().replace(/\s+/g, '-')}-roadmap.pdf`;
            doc.save(filename);
            
            showNotification("PDF downloaded successfully!", "success");
        } catch (error) {
            console.error("PDF generation error:", error);
            showNotification("Failed to generate PDF", "error");
        }
    });

    // Notification Function (similar to previous implementation)
    function showNotification(message, type = "info") {
        const notificationContainer = document.createElement('div');
        notificationContainer.className = `notification ${type}`;
        notificationContainer.innerHTML = `
            <div class="notification-icon">
                ${getNotificationIcon(type)}
            </div>
            <div class="notification-message">${message}</div>
        `;

        const existingContainer = document.querySelector('.notification-wrapper');
        const container = existingContainer || createNotificationContainer();
        container.appendChild(notificationContainer);

        setTimeout(() => {
            notificationContainer.classList.add('fade-out');
            setTimeout(() => {
                notificationContainer.remove();
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 500);
        }, 3000);
    }

    function createNotificationContainer() {
        const container = document.createElement('div');
        container.className = 'notification-wrapper';
        document.body.appendChild(container);
        return container;
    }

    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return '<i class="fas fa-check-circle"></i>';
            case 'error': return '<i class="fas fa-exclamation-circle"></i>';
            case 'info': return '<i class="fas fa-info-circle"></i>';
            default: return '<i class="fas fa-bell"></i>';
        }
    }
});