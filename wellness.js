// wellness.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('wellnessForm');

    // --- 1. Multi-Step Form Logic ---
    const steps = document.querySelectorAll('.form-step');
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const stepIndicator = document.getElementById('stepIndicator');
    let currentStep = 0;

    function updateStepVisibility() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });
        
        // Update Indicator (Step 0 is Introduction, so we show 1-6)
        if (currentStep === 0) {
            stepIndicator.style.display = 'none';
        } else {
            stepIndicator.style.display = 'block';
            stepIndicator.innerText = `Step ${currentStep} of ${steps.length - 1}`;
        }
    }

    // Validation function for current step before allowing 'Next'
    function validateCurrentStep() {
        const currentStepEl = steps[currentStep];
        
        // Check standard HTML 'required' fields
        const inputs = currentStepEl.querySelectorAll('input[required], textarea[required]');
        for (let input of inputs) {
            if (!input.checkValidity()) {
                input.reportValidity(); // Shows browser warning popup
                return false;
            }
        }

        // Custom Checkbox Group Validation
        if (currentStepEl.id === 'step-2') {
            const checked = currentStepEl.querySelectorAll('input[name="challenge"]:checked');
            if (checked.length === 0) {
                alert("Please select at least one challenge.");
                return false;
            }
            if (document.getElementById('challengeOtherCb').checked && document.getElementById('challengeOtherText').value.trim() === "") {
                alert("Please specify the 'Other' challenge.");
                document.getElementById('challengeOtherText').focus();
                return false;
            }
        }
        
        if (currentStepEl.id === 'step-3') {
            const checked = currentStepEl.querySelectorAll('input[name="solution"]:checked');
            if (checked.length === 0) {
                alert("Please select at least one expected outcome.");
                return false;
            }
            if (document.getElementById('solutionOtherCb').checked && document.getElementById('solutionOtherText').value.trim() === "") {
                alert("Please specify the 'Other' expected outcome.");
                document.getElementById('solutionOtherText').focus();
                return false;
            }
        }

        if (currentStepEl.id === 'step-5') {
            const checked = currentStepEl.querySelectorAll('input[name="frequency"]:checked');
            if (checked.length === 0) {
                alert("Please select a session frequency.");
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
                window.scrollTo({ top: document.querySelector('.card').offsetTop - 100, behavior: 'smooth' });
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateStepVisibility();
            window.scrollTo({ top: document.querySelector('.card').offsetTop - 100, behavior: 'smooth' });
        });
    });

    // --- 2. "Other" Text Input Toggles ---
    function setupOtherToggle(checkboxId, inputId) {
        const checkbox = document.getElementById(checkboxId);
        const input = document.getElementById(inputId);
        if(checkbox && input) {
            checkbox.addEventListener('change', () => {
                if(checkbox.checked) {
                    input.classList.add('visible');
                    input.setAttribute('required', 'true');
                } else {
                    input.classList.remove('visible');
                    input.removeAttribute('required');
                    input.value = ''; // clear if unchecked
                }
            });
        }
    }
    setupOtherToggle('challengeOtherCb', 'challengeOtherText');
    setupOtherToggle('solutionOtherCb', 'solutionOtherText');


    // --- 3. Form Submission Logic ---
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            
            // Show loading screen
            const loadingOverlay = document.getElementById('loading-overlay');
            loadingOverlay.style.display = 'flex';

            try {
                if (typeof supabaseUrl === 'undefined' || typeof supabaseKey === 'undefined') {
                    throw new Error("config.js is missing or keys are not defined.");
                }
                const supabase = window.supabaseClient;

                // Get IP
                const userAgent = navigator.userAgent;
                let ipAddress = 'Unknown';
                try {
                    const ipResponse = await fetch('https://api.ipify.org?format=json');
                    const ipData = await ipResponse.json();
                    ipAddress = ipData.ip;
                } catch (err) {
                    console.log("Could not fetch IP", err);
                }

                const currentYear = new Date().getFullYear();

                // Get Last ID
                const { data: lastApp, error: fetchError } = await supabase
                    .from('wellness_applications')
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
                const applicationId = `SW-${currentYear}-${formattedNumber}`;

                // Extract Checkbox Values + "Other" Logic
                const getExtractedValues = (name, otherCbId, otherTextId) => {
                    let values = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                                      .map(cb => cb.value)
                                      .filter(val => val !== 'Other'); // Filter out the word 'Other'
                    
                    if(document.getElementById(otherCbId).checked) {
                        values.push(`Other: ${document.getElementById(otherTextId).value}`);
                    }
                    return values.join(', ');
                };

                const formData = {
                    application_id: applicationId,
                    application_year: currentYear,
                    organization_name: document.getElementById('orgName').value,
                    industry_type: document.getElementById('industry').value,
                    employees: parseInt(document.getElementById('employees').value),
                    organization_address: document.getElementById('address').value,
                    contact_person_name: document.getElementById('contactName').value,
                    designation: document.getElementById('designation').value,
                    primary_phone: document.getElementById('primaryPhone').value,
                    alternate_phone: document.getElementById('altPhone').value,
                    email: document.getElementById('email').value,
                    challenges: getExtractedValues('challenge', 'challengeOtherCb', 'challengeOtherText'),
                    solution_expectations: getExtractedValues('solution', 'solutionOtherCb', 'solutionOtherText'),
                    preferred_booking_date: document.getElementById('bookingDate').value,
                    program_duration: document.getElementById('duration').value,
                    participants: parseInt(document.getElementById('participants').value),
                    preferred_venue: document.getElementById('venue').value,
                    venue_details: document.getElementById('venueDetails').value,
                    session_frequency: document.querySelector('input[name="frequency"]:checked').value,
                    instagram_id: document.getElementById('instaId').value,
                    signatory_name: document.getElementById('signatoryName').value,
                    signatory_title: document.getElementById('signatoryTitle').value,
                    signatory_date: document.getElementById('signatoryDate').value,
                    // expected_outcomes is removed from payload!
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    status: 'New'
                };

                // Save to Supabase
                const { error: insertError } = await supabase
                    .from('wellness_applications')
                    .insert([formData]);

                if (insertError) throw insertError;

                // Build WhatsApp Message
                const waMessage = `*STADO WELLNESS APPLICATION*

*Application ID:* ${formData.application_id}

*ORGANISATION DETAILS*
Organization: ${formData.organization_name}
Industry: ${formData.industry_type}
Employees: ${formData.employees}
Address: ${formData.organization_address}

Contact Person: ${formData.contact_person_name}
Designation: ${formData.designation}
Primary Phone: ${formData.primary_phone}
Alternate Phone: ${formData.alternate_phone}
Email: ${formData.email}

*PROBLEM IDENTIFICATION*
${formData.challenges}

*EXPECTED SOLUTIONS*
${formData.solution_expectations}

*PROGRAM CUSTOMIZATION*
Preferred Booking Date: ${formData.preferred_booking_date}
Program Duration: ${formData.program_duration}
Participants: ${formData.participants}
Venue: ${formData.preferred_venue}
Venue Details: ${formData.venue_details}

*SESSION FREQUENCY*
${formData.session_frequency}

*COLLABORATION DETAILS*
Instagram: ${formData.instagram_id}
Signatory: ${formData.signatory_name}
Title: ${formData.signatory_title}
Date: ${formData.signatory_date}

_Submitted via STADO Wellness Application System_`;

                const encodedMessage = encodeURIComponent(waMessage);
                const waUrl = `https://wa.me/919496952179?text=${encodedMessage}`;

                // UI Updates & Redirect
                loadingOverlay.style.display = 'none';
                form.style.display = 'none';
                stepIndicator.style.display = 'none';
                
                const successDiv = document.getElementById('successMessage');
                document.getElementById('displayAppId').innerText = formData.application_id;
                successDiv.style.display = 'block';

                setTimeout(() => {
                    window.open(waUrl, '_blank');
                }, 3000);

            } catch (error) {
                loadingOverlay.style.display = 'none';
                console.error("Submission Error:", error);
                alert(`Error: ${error.message}`);
            }
        });
    }

    // Initialize first step
    updateStepVisibility();
});