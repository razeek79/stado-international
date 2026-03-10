// script.js

// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

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