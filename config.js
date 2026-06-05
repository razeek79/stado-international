

// config.js
const supabaseUrl = 'https://xdgcebrfaofawkdnqbuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZ2NlYnJmYW9mYXdrZG5xYnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzA0NzYsImV4cCI6MjA4ODcwNjQ3Nn0.h-m5jpaTY-a6DRPCnJ73l3tYyPaTjwJShAQO2TIhUPU';



// 1. Attach to window so wellness.js and centers page can see them

window.supabaseUrl = supabaseUrl;

window.supabaseKey = supabaseKey;



// 2. Initialize the client globally

if (typeof supabase !== 'undefined' && !window.supabaseClient) {

    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

}



// 3. Keep this for Node/advanced environments if needed

if (typeof exports !== 'undefined') {

    module.exports = { supabaseUrl, supabaseKey };

}

