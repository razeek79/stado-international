// portal.js

// Initialize Supabase from config.js variables
if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}
var supabase = window.supabaseClient;

const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const tableBody = document.getElementById('applicationsTableBody');

// --- 1. Auto-Login & Session Check ---
async function checkUser() {
    // Supabase automatically checks local storage for active sessions!
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        showDashboard();
        fetchApplications();
    } else {
        showLogin();
    }
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
}

function showLogin() {
    dashboardScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
}

// --- 2. Login Logic ---
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('staffEmail').value;
        const password = document.getElementById('staffPassword').value;
        const submitBtn = loginForm.querySelector('button');

        submitBtn.innerText = 'Logging in...';
        loginError.style.display = 'none';

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        console.log("LOGIN RESULT:", data, error);

        if (error) {
            loginError.innerText = error.message;
            loginError.style.display = 'block';
            submitBtn.innerText = 'Login';
        } else {
            // Success! Session is saved automatically.
            showDashboard();
            fetchApplications();
        }
    });
}

// --- 3. Logout Logic ---
if(logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        showLogin();
    });
}

// --- 4. Fetch Data from Supabase ---
async function fetchApplications() {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading applications...</td></tr>';
    
    // Fetch data, ordered by newest first
    const { data, error } = await supabase
        .from('wellness_applications')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Error fetching data: ${error.message}</td></tr>`;
        return;
    }

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-grey">No applications found.</td></tr>';
        return;
    }

    tableBody.innerHTML = ''; // Clear loading text
    
    data.forEach(app => {
        const dateStr = new Date(app.created_at).toLocaleDateString();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="color: var(--primary-color); font-weight: bold;">${app.application_id}</td>
            <td>${dateStr}</td>
            <td>${app.organization_name}</td>
            <td>${app.contact_person_name}</td>
            <td>${app.primary_phone}</td>
            <td><span class="status-badge">New</span></td>
        `;
        tableBody.appendChild(tr);
    });
}

if(refreshBtn) {
    refreshBtn.addEventListener('click', fetchApplications);
}

// Initialize App
checkUser();