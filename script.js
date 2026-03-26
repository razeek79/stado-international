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

// 🌟 Contact Form Validation & Submission (Connected to Supabase)
const contactForm = document.getElementById('contactForm');
const successMessage = document.getElementById('contactSuccessMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Stop page reload

        // Show loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if(loadingOverlay) loadingOverlay.style.display = 'flex';

        try {
            // Ensure Supabase is initialized
            if (!window.supabaseClient) throw new Error("Supabase is not configured.");
            const supabase = window.supabaseClient;

            // Gather Data
            const inquiryData = {
                full_name: document.getElementById('contactName').value,
                phone: document.getElementById('contactPhone').value,
                email: document.getElementById('contactEmail').value,
                inquiry_type: document.getElementById('inquiryType').value,
                message: document.getElementById('contactMessage').value,
                status: 'Not Answered'
            };

            // Insert into Supabase
            const { error } = await supabase
                .from('inquiries')
                .insert([inquiryData]);

            if (error) throw error;

            // Success UI
            if(loadingOverlay) loadingOverlay.style.display = 'none';
            contactForm.style.display = 'none';
            successMessage.style.display = 'block';

        } catch (error) {
            if(loadingOverlay) loadingOverlay.style.display = 'none';
            console.error("Inquiry Submission Error:", error);
            alert(`Error: ${error.message}`);
        }
    });
}