// Handle file upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const dragArea = document.querySelector('.drag-area');
    const browseBtn = document.querySelector('.browse-btn');
    const fileInput = document.getElementById('fileInput');
    const fileContainer = document.getElementById('selected-files-container');
    const form = document.getElementById('upload-form');
    const textInput = document.getElementById('textInput');
    const submitBtn = document.querySelector('.submit-btn');
    const previewContainer = document.getElementById('files-preview');
    
    // Store previously selected files
    let selectedFiles = [];
    
    // When browse button is clicked
    browseBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the event from bubbling up to the parent
        fileInput.click();
    });
    
    // Make the entire drag area clickable
    dragArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // When files are selected through the file input
    fileInput.addEventListener('change', function(e) {
        const newFiles = Array.from(e.target.files);
        
        // Add new files to the existing selection
        selectedFiles = [...selectedFiles, ...newFiles];
        
        // Create a new DataTransfer object
        const dataTransfer = new DataTransfer();
        
        // Add all files to the DataTransfer object
        selectedFiles.forEach(file => {
            dataTransfer.items.add(file);
        });
        
        // Update the file input with all files
        document.getElementById('fileInput').files = dataTransfer.files;
        
        // Update the UI
        updateFilesPreview();
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
        
        const droppedFiles = Array.from(event.dataTransfer.files);
        
        // Add new files to the existing selection
        selectedFiles = [...selectedFiles, ...droppedFiles];
        
        // Create a new DataTransfer object
        const dataTransfer = new DataTransfer();
        
        // Add all files to the DataTransfer object
        selectedFiles.forEach(file => {
            dataTransfer.items.add(file);
        });
        
        // Update the file input with all files
        fileInput.files = dataTransfer.files;
        
        // Update the UI
        updateFilesPreview();
    });
    
    // Function to update the files preview section
    function updateFilesPreview() {
        const container = document.getElementById('selected-files-container');
        container.innerHTML = '';
        
        if (selectedFiles.length === 0) {
            container.innerHTML = '<p class="no-files">No files selected</p>';
            previewContainer.classList.remove('active');
            return;
        }
        
        previewContainer.classList.add('active');
        
        selectedFiles.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item'; // This matches our CSS class now
            
            // Determine file icon based on type
            let fileIcon = 'fa-file';
            if (file.type.includes('image')) fileIcon = 'fa-file-image';
            else if (file.type.includes('pdf')) fileIcon = 'fa-file-pdf';
            else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) fileIcon = 'fa-file-word';
            else if (file.type.includes('excel') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) fileIcon = 'fa-file-excel';
            else if (file.type.includes('text') || file.name.endsWith('.txt')) fileIcon = 'fa-file-alt';
            
            fileElement.innerHTML = `
                <i class="fas ${fileIcon}"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
                <button type="button" class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(fileElement);
        });
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                selectedFiles.splice(index, 1);
                
                // Update the file input
                const dataTransfer = new DataTransfer();
                selectedFiles.forEach(file => {
                    dataTransfer.items.add(file);
                });
                document.getElementById('fileInput').files = dataTransfer.files;
                
                // Update the UI
                updateFilesPreview();
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
    
    // Initialize particles.js
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