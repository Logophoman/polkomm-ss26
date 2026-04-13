document.addEventListener('DOMContentLoaded', () => {
    const toolContainer = document.getElementById('brainstorm-tool');
    if (!toolContainer) return;

    // --- Get UI Elements ---
    const topicInput = toolContainer.querySelector('#brainstorm-input-topic');
    const platformInput = toolContainer.querySelector('#brainstorm-input-platform');
    const methodInput = toolContainer.querySelector('#brainstorm-input-method');

    const topicList = toolContainer.querySelector('#brainstorm-list-topic');
    const platformList = toolContainer.querySelector('#brainstorm-list-platform');
    const methodList = toolContainer.querySelector('#brainstorm-list-method');

    const addTopicBtn = toolContainer.querySelector('#btn-add-topic');
    const addPlatformBtn = toolContainer.querySelector('#btn-add-platform');
    const addMethodBtn = toolContainer.querySelector('#btn-add-method');

    const visualizeBtn = toolContainer.querySelector('#btn-visualize');
    const exportCsvBtn = toolContainer.querySelector('#btn-export-csv');
    const exportPngBtn = toolContainer.querySelector('#btn-export-png');
    //const fullscreenBtn = toolContainer.querySelector('#btn-fullscreen');
    const closeModalBtn = toolContainer.querySelector('#btn-close-modal'); // Needs to be inside the modal part if cloned

    const vizContainer = toolContainer.querySelector('#brainstorm-visualization');
    const listsContainer = toolContainer.querySelector('.brainstorm-lists');
    let statusText = "";

    if (!topicInput || !platformInput || !methodInput || !topicList || !platformList || !methodList || !visualizeBtn || !exportCsvBtn || !exportPngBtn  || !vizContainer || !listsContainer || !addTopicBtn || !addPlatformBtn || !addMethodBtn ) { //|| !fullscreenBtn || !closeModalBtn
        console.error("Brainstorm Tool: Critical UI elements missing!");
        // Optionally disable the tool or parts of it
        return;
    }

    // --- Data Storage ---
    let brainstormData = {
        topics: [],
        platforms: [],
        methods: []
    };

    // --- Functions ---

    // Render List Items
    function renderLists() {
        renderSingleList(topicList, brainstormData.topics, 'topics');
        renderSingleList(platformList, brainstormData.platforms, 'platforms');
        renderSingleList(methodList, brainstormData.methods, 'methods');
        toggleExportButtons(); // Enable/disable based on data presence
    }

    function renderSingleList(listElement, items, category) {
        listElement.innerHTML = ''; // Clear current items
        if (!items || items.length === 0) {
            listElement.innerHTML = '<li class="empty-list">Noch keine Ideen...</li>';
            return;
        }
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item;
            const removeBtn = document.createElement('span');
            removeBtn.textContent = '×';
            removeBtn.className = 'remove-item';
            removeBtn.title = 'Idee entfernen';
            removeBtn.onclick = () => removeItem(category, index);
            li.appendChild(removeBtn);
            listElement.appendChild(li);
        });
    }

    // Add Item Logic
    function addItem(category, inputElement) {
        const value = inputElement.value.trim();
        if (value) {
            if (!brainstormData[category].includes(value)) { // Prevent duplicates
                brainstormData[category].push(value);
                brainstormData[category].sort(); // Keep sorted
                inputElement.value = ''; // Clear input
                renderLists(); // Update display
                visualizeData(); // Optional: auto-update visualization
                console.log(`Added to ${category}: ${value}`);
            } else {
                // Optional feedback for duplicates
                inputElement.style.borderColor = 'orange';
                setTimeout(() => inputElement.style.borderColor = '', 1000);
            }
        } else {
            inputElement.style.borderColor = 'red';
            setTimeout(() => inputElement.style.borderColor = '', 1000);
        }
    }

    // Remove Item Logic
    function removeItem(category, index) {
        if (brainstormData[category] && brainstormData[category][index] !== undefined) {
            const removedItem = brainstormData[category].splice(index, 1);
            console.log(`Removed from ${category}: ${removedItem}`);
            renderLists();
            visualizeData(); // Optional: auto-update visualization
        }
    }

    // Enable/Disable Export Buttons
    function toggleExportButtons() {
        const hasData = brainstormData.topics.length > 0 || brainstormData.platforms.length > 0 || brainstormData.methods.length > 0;
        exportCsvBtn.disabled = !hasData;
        exportPngBtn.disabled = !hasData;
        visualizeBtn.disabled = !hasData; // Also disable visualize if no data
    }

    // Basic Visualization (Simulated Tag Cloud)
    function visualizeData() {
        vizContainer.innerHTML = ''; // Clear previous viz
        vizContainer.classList.add('active'); // Make sure it's visible

        const allItems = [
            ...brainstormData.topics.map(t => ({ text: t, category: 'topic' })),
            ...brainstormData.platforms.map(p => ({ text: p, category: 'platform' })),
            ...brainstormData.methods.map(m => ({ text: m, category: 'method' }))
        ];

        if (allItems.length === 0) {
            vizContainer.innerHTML = '<p class="empty-viz">Keine Daten zum Visualisieren.</p>';
            return;
        }

        // Shuffle for better visual distribution
        allItems.sort(() => Math.random() - 0.5);

        const containerWidth = vizContainer.offsetWidth;
        const containerHeight = vizContainer.offsetHeight;

        // Simple positioning (better algorithms exist for real clouds)
        let currentX = 20; let currentY = 30; let maxHeightInRow = 0;

        allItems.forEach(item => {
            const span = document.createElement('span');
            span.className = `viz-item viz-${item.category}`;
            span.textContent = item.text;

            span.style.fontSize = `1em`;
            span.style.opacity = 1;

            // Crude positioning: Wrap to next line if needed
            // Append temporarily to measure width, then position
            span.style.visibility = 'hidden';
            vizContainer.appendChild(span);
            const itemWidth = span.offsetWidth;
            const itemHeight = span.offsetHeight;
            span.style.visibility = 'visible';


            if (currentX + itemWidth + 15 > containerWidth) { // Wrap?
                currentX = 20 + Math.random() * 10; // Reset X with slight jitter
                currentY += maxHeightInRow + 10 + Math.random() * 5; // Move Y down
                maxHeightInRow = 0;
            }
            if (currentY + itemHeight > containerHeight - 10) { // Don't draw off bottom
                console.warn("Viz container overflow, some items might be hidden");
                span.remove(); // Don't append if it doesn't fit easily
                return; // Skip this item
            }


            span.style.position = 'absolute'; // Requires vizContainer relative
            span.style.left = `${currentX}px`;
            span.style.top = `${currentY}px`;

            // Random rotation (optional, can look messy)
            // span.style.transform = `rotate(${Math.random()*10 - 5}deg)`;

            // Update position for next item
            currentX += itemWidth + 15 + Math.random() * 10; // Add width and random spacing
            maxHeightInRow = Math.max(maxHeightInRow, itemHeight); // Track height for line wrap

            // No, don't re-append, just keep it if it fit
        });
    }

    // CSV Export
    function exportCSV() {
        const { topics, platforms, methods } = brainstormData;
        const numRows = Math.max(topics.length, platforms.length, methods.length);
        let csvContent = "data:text/csv;charset=utf-8,Themen,Plattformen/Medien,Methoden\n";

        function escapeCsv(str) {
            if (str === undefined || str === null) return '';
            // Escape quotes by doubling them and wrap in quotes if comma, newline, or quote exists
            str = String(str);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }


        for (let i = 0; i < numRows; i++) {
            const row = [
                escapeCsv(topics[i]), // Get topic or empty string
                escapeCsv(platforms[i]), // Get platform or empty string
                escapeCsv(methods[i])  // Get method or empty string
            ];
            csvContent += row.join(",") + "\n";
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "brainstorming_ergebnisse.csv");
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link); // Clean up
    }

    // Image Export (Requires html2canvas)
    function exportPNG() {
        if (typeof html2canvas !== 'function') {
            alert('Fehler: html2canvas Bibliothek nicht gefunden. Export als Bild nicht möglich.');
            console.error("html2canvas not loaded. Cannot export PNG.");
            return;
        }

        // Capture the visualization container
        const captureTarget = vizContainer;
        statusText.textContent = 'Generiere Bild...';

        html2canvas(captureTarget, {
            backgroundColor: '#ffffff', // Ensure background isn't transparent
            useCORS: true // If using external resources/fonts (usually not needed here)
        }).then(canvas => {
            const imageURL = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = 'brainstorming_visualisierung.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            statusText.textContent = 'Bereit.'; // Reset status
        }).catch(err => {
            console.error("PNG Export failed:", err);
            alert("Fehler beim Exportieren des Bildes.");
            statusText.textContent = 'Fehler beim Export.';
        });
    }

    // Fullscreen Toggle
/*     function toggleFullscreen() {
        // More robust approach: Clone the tool into a modal overlay
        // Simple approach for now: toggle class on main container & body
        toolContainer.classList.toggle('fullscreen-mode');
        document.body.classList.toggle('brainstorm-fullscreen-active'); // Prevents body scroll
    } */


    // --- Event Listeners ---
    addTopicBtn.addEventListener('click', () => addItem('topics', topicInput));
    addPlatformBtn.addEventListener('click', () => addItem('platforms', platformInput));
    addMethodBtn.addEventListener('click', () => addItem('methods', methodInput));

    // Add via Enter key
    topicInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addItem('topics', topicInput); });
    platformInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addItem('platforms', platformInput); });
    methodInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addItem('methods', methodInput); });

    visualizeBtn.addEventListener('click', visualizeData);
    exportCsvBtn.addEventListener('click', exportCSV);
    exportPngBtn.addEventListener('click', exportPNG);
    //fullscreenBtn.addEventListener('click', toggleFullscreen);
    //closeModalBtn.addEventListener('click', toggleFullscreen); // Close button acts same as toggle

    // --- Initial Render ---
    renderLists();
    visualizeData(); // Initial empty viz state


    console.log("Brainstorm Tool Initialized.");
});