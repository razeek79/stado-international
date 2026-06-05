

// config.js
const supabaseUrl = 'https://xdgceb***dnqbuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi***TjwJShAQO2TIhUPU';



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

