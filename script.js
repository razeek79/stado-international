// script.js

// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// 🌟 Scroll Reveal Animation (Intersection Observer)
const revealElements = document.querySelectorAll('.reveal');

const revealOptions = {
    threshold: 0.15, // Triggers when 15% of the element is visible
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Stop observing once revealed
        }
    });
}, revealOptions);

revealElements.forEach(el => {
    revealOnScroll.observe(el);
});

// Lightbox for Gallery
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightbox = document.getElementById('close-lightbox');

if (galleryItems.length > 0) {
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            lightbox.style.display = 'flex';
            lightboxImg.src = item.src;
        });
    });

    closeLightbox.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
}

// 🌟 Expandable Program Cards Logic
const toggleBtns = document.querySelectorAll('.toggle-btn');

toggleBtns.forEach(btn => {
    btn.addEventListener('click', function () {

        const details = this.nextElementSibling;

        // Toggle content
        details.classList.toggle('expanded');

        // Toggle button active state
        this.classList.toggle('active');

        // Change text
        this.innerText = details.classList.contains('expanded')
            ? "View Less"
            : "View More";

    });
});

// 🌟 Contact Form Validation & Submission
const contactForm = document.getElementById('contactForm');
const successMessage = document.getElementById('contactSuccessMessage');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Stop page reload

        // Basic JS Validation
        let isValid = true;
        const inputs = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'red';
                isValid = false;
            } else {
                input.style.borderColor = 'rgba(212, 175, 55, 0.3)'; // Reset to gold border
            }
        });

        if (isValid) {
            // Hide the form and show the success message
            contactForm.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Optional: You can easily add WhatsApp redirection here later if you want!
        } else {
            alert('Please fill out all required fields correctly.');
        }
    });
}