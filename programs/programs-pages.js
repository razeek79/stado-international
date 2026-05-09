document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle Smooth Scroll for CTA buttons
    const findCentreBtn = document.querySelector('a[href="#find-center"]');
    if (findCentreBtn) {
        findCentreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#find-center').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 2. Dynamic Center Search Logic
    // This runs on the specific program page to show local centers
    const searchInput = document.getElementById('centerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value.toLowerCase();
            const programName = document.querySelector('h1').innerText; // Gets "Karate", "Yoga", etc.
            
            const supabase = window.supabaseClient;
            
            // Fetch centers that have this discipline AND match the search city/name
            const { data: centers, error } = await supabase
                .from('centers')
                .select('*')
                .eq('status', 'active')
                .contains('disciplines', [programName]);

            if (centers) {
                const filtered = centers.filter(c => 
                    c.city.toLowerCase().includes(query) || 
                    c.name.toLowerCase().includes(query)
                );
                renderCenterResults(filtered);
            }
        });
    }
});

function renderCenterResults(centers) {
    const resultsGrid = document.getElementById('centerResults');
    if (!resultsGrid) return;

    if (centers.length === 0) {
        resultsGrid.innerHTML = `<p class="glass-card">No centers found for this location.</p>`;
        return;
    }

    resultsGrid.innerHTML = centers.map(c => `
        <div class="glass-card center-item">
            <h3>${c.name}</h3>
            <p>${c.city}</p>
            <a href="../../center/index.html?id=${c.id}" class="btn btn-outline" style="color:#fff; border-color:var(--primary-red);">View Schedule</a>
        </div>
    `).join('');
}