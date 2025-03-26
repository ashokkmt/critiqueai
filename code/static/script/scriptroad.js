document.addEventListener('DOMContentLoaded', function() {
    const inputSection = document.getElementById("input-section");
    const loadingScreen = document.getElementById("loading-screen");
    const roadmapResult = document.getElementById("roadmap-result");
    const form = document.getElementById("roadmap-form");
    const topicInput = document.getElementById("topic");
    const roadmapContent = document.getElementById("roadmap-content");
    const copyBtn = document.getElementById("copy-btn");
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
            copyBtn.style.display = 'flex';
            
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
    if (backBtn) {
        backBtn.addEventListener("click", function(e) {
            e.preventDefault();
            if (!confirm('You may lose your roadmap results. Are you sure you want to leave?')) {
                return; // Stay on current page if user cancels
            }
            window.location.href = "/roadmap";
        });
    }

    // Copy Button Handler
    copyBtn.addEventListener("click", function() {
        const content = roadmapContent.innerText;
        
        navigator.clipboard.writeText(content).then(() => {
            showNotification("Roadmap copied to clipboard!", "success");
        }).catch(err => {
            showNotification("Failed to copy. Please try again.", "error");
            console.error('Could not copy text: ', err);
        });
    });

    // Notification Function
    function showNotification(message, type = "success") {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            </div>
            <div class="notification-message">${message}</div>
        `;
        
        // Get or create the notification container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = createNotificationContainer();
        }
        
        container.appendChild(notification);
        
        // Show with slight delay for animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-remove after delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                container.removeChild(notification);
            }, 500);
        }, 3000);
    }

    function createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
        return container;
    }
});