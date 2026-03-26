// school.js

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. Start Application Button Reveal ---
    const startSchoolBtn = document.getElementById('startSchoolBtn');
    const schoolFormSection = document.getElementById('schoolFormSection');
    const schoolDetailsSection = document.getElementById('schoolDetailsSection');

    if (startSchoolBtn && schoolFormSection) {
        startSchoolBtn.addEventListener('click', () => {
            if (schoolDetailsSection) schoolDetailsSection.style.display = 'none';
            schoolFormSection.style.display = 'block';
            window.scrollTo({ top: schoolFormSection.offsetTop - 80, behavior: 'smooth' });
        });
    }

    // --- 1. Multi-Step Form Logic ---
    const form = document.getElementById('schoolForm');
    const steps = document.querySelectorAll('#schoolForm .form-step');
    const nextBtns = document.querySelectorAll('.sch-next-btn');
    const prevBtns = document.querySelectorAll('.sch-prev-btn');
    const stepIndicator = document.getElementById('schoolStepIndicator');
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
        const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
        
        for (let input of inputs) {
            if (!input.checkValidity()) {
                input.reportValidity();
                return false;
            }
        }
        
        // Custom Radio Validation
        if (currentStepEl.id === 'sch-step-3') {
            const checked = currentStepEl.querySelector('input[name="schExistingPE"]:checked');
            if (!checked) {
                alert("Please select whether you have an existing PE program.");
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

    // --- 2. Supabase Submission Logic ---
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); 

            const loadingOverlay = document.getElementById('loading-overlay');
            loadingOverlay.style.display = 'flex';

            try {
                if (!window.supabaseClient) throw new Error("Supabase is not configured. Make sure config.js is loaded.");
                const supabase = window.supabaseClient;

                const currentYear = new Date().getFullYear();

                // Fetch the last ID (SCH-yyyy-NNN)
                const { data: lastApp, error: fetchError } = await supabase
                    .from('school_partnerships')
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
                const applicationId = `SCH-${currentYear}-${formattedNumber}`;

                // Gather Data
                const schData = {
                    application_id: applicationId,
                    application_year: currentYear,
                    school_name: document.getElementById('schName').value,
                    address: document.getElementById('schAddress').value,
                    city: document.getElementById('schCity').value,
                    contact_name: document.getElementById('schContactName').value,
                    designation: document.getElementById('schDesignation').value,
                    phone: document.getElementById('schPhone').value,
                    email: document.getElementById('schEmail').value,
                    number_of_students: parseInt(document.getElementById('schStudents').value),
                    existing_pe_program: document.querySelector('input[name="schExistingPE"]:checked').value,
                    interested_programs: document.getElementById('schPrograms').value,
                    status: 'New'
                };

                // Save to DB
                const { error: insertError } = await supabase
                    .from('school_partnerships')
                    .insert([schData]);

                if (insertError) throw insertError;

                // Success UI Update
                loadingOverlay.style.display = 'none';
                form.style.display = 'none';
                stepIndicator.style.display = 'none';
                
                document.getElementById('displaySchId').innerText = applicationId;
                document.getElementById('schSuccessMessage').style.display = 'block';
                window.scrollTo({ top: document.querySelector('.card').offsetTop - 50, behavior: 'smooth' });

            } catch (error) {
                loadingOverlay.style.display = 'none';
                console.error("School Submission Error:", error);
                alert(`Error: ${error.message}`);
            }
        });
    }
});