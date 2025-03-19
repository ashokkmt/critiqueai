// Initialize particles.js background
document.addEventListener('DOMContentLoaded', function() {
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

// Handle file upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const dragArea = document.querySelector('.drag-area');
    const browseBtn = document.querySelector('.browse-btn');
    const fileInput = document.getElementById('fileInput');
    const fileContainer = document.getElementById('selected-files-container');
    const form = document.getElementById('upload-form');
    const textInput = document.getElementById('textInput');
    const submitBtn = document.querySelector('.submit-btn');
    
    // When browse button is clicked
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // When files are selected through the file input
    fileInput.addEventListener('change', function() {
        showFiles(this.files);
    });
    
    // Drag over event
    dragArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dragArea.classList.add('active');
    });
    
    // Drag leave event
    dragArea.addEventListener('dragleave', () => {
        dragArea.classList.remove('active');
    });
    
    // Drop event
    dragArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dragArea.classList.remove('active');
        showFiles(event.dataTransfer.files);
    });
    
    // Function to display selected files
    function showFiles(files) {
        fileContainer.innerHTML = '';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileSize = (file.size / 1024).toFixed(2);
            
            // Create a file chip element
            const fileChip = document.createElement('div');
            fileChip.className = 'file-chip';
            
            // Set the icon based on file type
            let iconClass = 'fa-file';
            if (file.type.includes('pdf')) {
                iconClass = 'fa-file-pdf';
            } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                iconClass = 'fa-file-word';
            } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
                iconClass = 'fa-file-alt';
            }
            
            // Set the HTML content of the file chip
            fileChip.innerHTML = `
                <i class="fas ${iconClass}"></i>
                ${file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                <span class="remove-file" data-index="${i}"><i class="fas fa-times"></i></span>
            `;
            
            fileContainer.appendChild(fileChip);
        }
        
        // Add remove button functionality
        const removeButtons = document.querySelectorAll('.remove-file');
        removeButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                const index = parseInt(event.currentTarget.getAttribute('data-index'));
                const dt = new DataTransfer();
                
                for (let i = 0; i < fileInput.files.length; i++) {
                    if (i !== index) {
                        dt.items.add(fileInput.files[i]);
                    }
                }
                
                fileInput.files = dt.files;
                showFiles(fileInput.files);
                
                event.stopPropagation();
            });
        });
    }
    
    // Form submission validation
    form.addEventListener('submit', function(event) {
        // Check if either files are selected or text is entered
        if (fileInput.files.length === 0 && textInput.value.trim() === '') {
            event.preventDefault();
            alert('Please either upload files or enter detailed notes.');
            return false;
        }
        
        // Show loading animation
        submitBtn.innerHTML = '<div class="spinner"></div> Processing...';
        submitBtn.disabled = true;
    });
});