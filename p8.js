// p8.js

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. Start Application Button Reveal ---
    const startApplicationBtn = document.getElementById('startApplicationBtn');
    const p8FormSection = document.getElementById('p8FormSection');
    const p8DetailsSection = document.getElementById('p8DetailsSection'); // Get the new section ID

    if (startApplicationBtn && p8FormSection) {
        startApplicationBtn.addEventListener('click', () => {
            // Hide the ENTIRE details section (Cards + Button)
            if (p8DetailsSection) {
                p8DetailsSection.style.display = 'none';
            }
            
            // Reveal the form section
            p8FormSection.style.display = 'block';
            
            // Smoothly scroll to the top of the form so they can start typing
            window.scrollTo({ top: p8FormSection.offsetTop - 80, behavior: 'smooth' });
        });
    }

    // --- 1. Modal Logic ---
    const tcModal = document.getElementById('tcModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if(openModalBtn && tcModal) {
        openModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            tcModal.classList.add('active');
        });
        closeModalBtn.addEventListener('click', () => {
            tcModal.classList.remove('active');
        });
        // Close if clicking outside the box
        tcModal.addEventListener('click', (e) => {
            if (e.target === tcModal) tcModal.classList.remove('active');
        });
    }

    // --- 2. Multi-Step Form Logic ---
    const form = document.getElementById('p8Form');
    const steps = document.querySelectorAll('#p8Form .form-step');
    const nextBtns = document.querySelectorAll('.p8-next-btn');
    const prevBtns = document.querySelectorAll('.p8-prev-btn');
    const stepIndicator = document.getElementById('p8StepIndicator');
    let currentStep = 0;

    function updateStepVisibility() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });
        if(stepIndicator) {
            stepIndicator.innerText = `Step ${currentStep + 1} of ${steps.length}`;
        }
    }

    function validateCurrentStep() {
        const currentStepEl = steps[currentStep];
        const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        
        for (let input of inputs) {
            if (!input.checkValidity()) {
                input.reportValidity(); // Show browser popup
                return false;
            }
        }
        
        // Radio button specific validation for Step 4
        if (currentStepEl.id === 'p8-step-4') {
            const checked = currentStepEl.querySelector('input[name="p8Commit"]:checked');
            if (!checked) {
                alert("Please select Yes or No regarding your commitment.");
                return false;
            }
        }

        return true;
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateCurrentStep()) {
                currentStep++;
                updateStepVisibility();
                window.scrollTo({ top: document.querySelector('.card').offsetTop - 50, behavior: 'smooth' });
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateStepVisibility();
            window.scrollTo({ top: document.querySelector('.card').offsetTop - 50, behavior: 'smooth' });
        });
    });

    // --- 3. Supabase Submission Logic ---
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); 

            const loadingOverlay = document.getElementById('loading-overlay');
            loadingOverlay.style.display = 'flex';

            try {
                // Ensure Supabase is initialized via config.js
                if (!window.supabaseClient) {
                    throw new Error("Supabase is not configured. Make sure config.js is loaded.");
                }
                const supabase = window.supabaseClient;

                const currentYear = new Date().getFullYear();

                // Fetch the last ID (P8-yyyy-NNN)
                const { data: lastApp, error: fetchError } = await supabase
                    .from('p8_applications')
                    .select('application_id')
                    .eq('application_year', currentYear)
                    .order('created_at', { ascending: false })
                    .limit(1);

                let nextNumber = 1;
                if (lastApp && lastApp.length > 0 && lastApp[0].application_id) {
                    const lastIdStr = lastApp[0].application_id;
                    const parts = lastIdStr.split('-');
                    if(parts.length === 3) {
                        nextNumber = parseInt(parts[2], 10) + 1;
                    }
                }
                const formattedNumber = nextNumber.toString().padStart(3, '0');
                const applicationId = `P8-${currentYear}-${formattedNumber}`;

                // Gather Data
                const p8Data = {
                    application_id: applicationId,
                    application_year: currentYear,
                    full_name: document.getElementById('p8Name').value,
                    age: parseInt(document.getElementById('p8Age').value),
                    phone: document.getElementById('p8Phone').value,
                    email: document.getElementById('p8Email').value,
                    experience: document.getElementById('p8Experience').value || null,
                    current_level: document.getElementById('p8Level').value,
                    why_join: document.getElementById('p8Why').value,
                    career_goal: document.getElementById('p8Goal').value,
                    can_commit: document.querySelector('input[name="p8Commit"]:checked').value,
                    status: 'New'
                };

                // Save to DB
                const { error: insertError } = await supabase
                    .from('p8_applications')
                    .insert([p8Data]);

                if (insertError) throw insertError;

                // Success UI Update
                loadingOverlay.style.display = 'none';
                form.style.display = 'none';
                stepIndicator.style.display = 'none';
                
                document.getElementById('displayP8Id').innerText = applicationId;
                document.getElementById('p8SuccessMessage').style.display = 'block';
                window.scrollTo({ top: document.querySelector('.card').offsetTop - 50, behavior: 'smooth' });

            } catch (error) {
                loadingOverlay.style.display = 'none';
                console.error("P8 Submission Error:", error);
                alert(`Error: ${error.message}`);
            }
        });
    }
});