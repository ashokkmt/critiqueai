document.addEventListener('DOMContentLoaded', function() {
    // Flag to prevent multiple alerts
    let navigationConfirmed = false;
    
    // Check if this is a reload first, before any alerts can trigger
    if (performance.navigation.type === 1) { // 1 is reload
        navigationConfirmed = true; // Prevent alert on redirect
        window.location.href = '/summary';
        return; // Exit early to prevent event listeners from being added
    }
    
    // Remove any existing beforeunload listeners that might be added by other scripts
    window.onbeforeunload = null;
    
    // Single unified beforeunload handler
    window.addEventListener('beforeunload', function(e) {
        if (!navigationConfirmed) {
            e.preventDefault();
            e.returnValue = 'You may lose your summary results. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
    
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
    
    // Add confirmation dialog to new analysis button
    const newAnalysisBtn = document.getElementById('new-analysis-btn');
    if (newAnalysisBtn) {
        newAnalysisBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('You may lose your summary results. Are you sure you want to leave?')) {
                navigationConfirmed = true; // Prevent beforeunload dialog
                window.location.href = "/summary";
            }
        });
    }
    
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
    
    // Initialize particles.js with proper configuration
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#4CAF50'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#4CAF50',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 1
                    }
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
});