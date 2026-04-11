// config.js

const supabaseUrl = 'https://xdgcebrfaofawkdnqbuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZ2NlYnJmYW9mYXdrZG5xYnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzA0NzYsImV4cCI6MjA4ODcwNjQ3Nn0.h-m5jpaTY-a6DRPCnJ73l3tYyPaTjwJShAQO2TIhUPU';

// ✅ Create ONLY ONE global instance
if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}