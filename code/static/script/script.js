// Initialize AOS animations
AOS.init({
    duration: 800,
    offset: 100,
    once: true
});

// Typing effect words
const words = [
    "AI-Powered Evaluation",
    "Smart Document Analysis",
    "Learning Roadmaps",
    "Instant Feedback"
];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeDelay = 100;

// Enhanced typing effect
function typeEffect() {
    const currentWord = words[wordIndex];
    const display = document.getElementById('typing-effect-text');
    
    if (!display) return;
    
    if (isDeleting) {
        display.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 50;
    } else {
        display.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 150;
    }
    
    const cursor = document.querySelector('.typing-effect-cursor');
    if (cursor) {
        cursor.style.opacity = '1';
        setTimeout(() => {
            cursor.style.opacity = '0';
        }, typeDelay / 2);
    }
    
    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typeDelay = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeDelay = 500;
    }
    
    setTimeout(typeEffect, typeDelay);
}

// Start typing effect when document loads
document.addEventListener('DOMContentLoaded', () => {
    typeEffect();
    initSmoothScroll();
    initParticles();
    initAOS();
});

// Smooth scroll function
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 60;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollBy({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Add navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Initialize particles.js with optimized config
particlesJS('particles-js',
  {
    "particles": {
      "number": {
        "value": 50,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": "#3fe493"
      },
      "shape": {
        "type": "circle"
      },
      "opacity": {
        "value": 0.5,
        "random": true
      },
      "size": {
        "value": 3,
        "random": true
      },
      "line_linked": {
        "enable": true,
        "distance": 150,
        "color": "#3fe493",
        "opacity": 0.2,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 2,
        "direction": "none",
        "random": true,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "grab"
        },
        "resize": true
      }
    },
    "retina_detect": true
  }
);

// Animate statistics numbers
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCount = () => {
            if (current < target) {
                current += increment;
                stat.textContent = Math.ceil(current);
                requestAnimationFrame(updateCount);
            } else {
                stat.textContent = target;
            }
        };

        updateCount();
    });
}

// Initialize AOS with more options
AOS.init({
    duration: 1000,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50
});

// Add scroll-triggered animations
document.addEventListener('scroll', () => {
    const parallaxSections = document.querySelectorAll('.parallax-section');
    window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        parallaxSections.forEach(section => {
            const rate = scrolled * -0.3;
            if(section.getBoundingClientRect().top < window.innerHeight && 
               section.getBoundingClientRect().bottom > 0) {
                section.style.transform = `translate3d(0, ${rate}px, 0)`;
            }
        });
    });
}, { passive: true });

// Initialize particles
function initParticles() {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 50,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#3fe493"
            },
            "shape": {
                "type": "circle"
            },
            "opacity": {
                "value": 0.5,
                "random": true
            },
            "size": {
                "value": 3,
                "random": true
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#3fe493",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "resize": true
            }
        },
        "retina_detect": true
    });
}

// Initialize AOS
function initAOS() {
    AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
    });
}