// portal.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

// Initialize Supabase
var supabase = window.supabaseClient;

// --- FIREBASE CONFIGURATION ---
// REPLACE THIS WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// REPLACE WITH YOUR VAPID KEY FROM FIREBASE CONSOLE
const vapidKey = "YOUR_VAPID_KEY";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const tableBody = document.getElementById('applicationsTableBody');

// --- 1. Auto-Login & Session Check ---
async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showDashboard();
        fetchApplications();
        setupNotifications(); // Ask for push notification access
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

        if (error) {
            loginError.innerText = error.message;
            loginError.style.display = 'block';
            submitBtn.innerText = 'Login';
        } else {
            showDashboard();
            fetchApplications();
            setupNotifications(); // Ask for push notification access after login
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

    tableBody.innerHTML = ''; 
    
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

// --- 5. Push Notification Logic ---
async function setupNotifications() {
    try {
        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            // Get the FCM token
            const currentToken = await getToken(messaging, { vapidKey: vapidKey });
            if (currentToken) {
                console.log('Got FCM token:', currentToken);
                saveTokenToSupabase(currentToken);
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } else {
            console.log('Unable to get permission to notify.');
        }
    } catch (error) {
        console.error('Error getting notification permission:', error);
    }
}

async function saveTokenToSupabase(token) {
    // Attempt to insert the token. If it already exists, Supabase will just ignore it due to the UNIQUE constraint we set.
    const { data, error } = await supabase
        .from('staff_tokens')
        .insert([{ token: token }]);
    
    if (error && error.code !== '23505') { // 23505 is the unique violation error code
        console.error('Error saving token to Supabase:', error);
    }
}

// Handle foreground messages (when app is open)
onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // You could show a custom UI toast/alert here if you wanted!
    alert(`New Application: ${payload.notification.title}\n${payload.notification.body}`);
});

// Initialize App
checkUser();