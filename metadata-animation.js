document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('metadata-visualization');
    if (!container) {
        console.error("Metadata container #metadata-visualization not found!");
        return;
    }

    // --- Elements (find or create if needed) ---
    function getOrCreate(id, className, parent, tag = 'div') {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement(tag);
            el.id = id;
            if (className) el.className = className;
            parent.appendChild(el);
        }
        return el;
    }

    const contentArea = getOrCreate('meta-content-area', 'meta-content-area', container);
    const item1 = getOrCreate('meta-item-1', 'meta-item', contentArea);
    const item2 = getOrCreate('meta-item-2', 'meta-item', contentArea);
    const item3 = getOrCreate('meta-item-3', 'meta-item', contentArea); // Added a third item for variety
    const cursor = getOrCreate('meta-cursor', 'meta-cursor', container);
    const dataStore = getOrCreate('meta-datastore', 'meta-datastore', container);
    const resultsDisplay = getOrCreate('meta-results-display', 'meta-results-display', container);

    // Add some content to items
    item1.innerHTML = `<span>📰 Artikel lesen</span> <button class="meta-action-btn" data-action="like">👍</button>`;
    item2.innerHTML = `<span>🔗 Link teilen</span> <button class="meta-action-btn" data-action="share">🔗</button>`;
    item3.innerHTML = `<span>⏱️ Video anschauen</span> <span class="meta-duration"></span> <button class="meta-action-btn" data-action="view">👀</button>`;

    const actions = [
        { element: item1.querySelector('[data-action="like"]'), type: 'like', traceIcon: '👍', resultText: 'Likes +1' },
        { element: item1, type: 'click', traceIcon: '🖱️', resultText: 'Click Rate +0.5%' }, // Simulate click on whole item
        { element: item2.querySelector('[data-action="share"]'), type: 'share', traceIcon: '🔗', resultText: 'Shares +1' },
        { element: item3.querySelector('[data-action="view"]'), type: 'view', traceIcon: '👀', resultText: 'Avg. View +3s' },
    ];

    let currentActionIndex = 0;
    let animationTimeout;

    // --- Animation Functions ---
    function resetAnimationState() {
        clearTimeout(animationTimeout);
        cursor.style.opacity = '0'; // Hide cursor initially
        resultsDisplay.textContent = 'Analysiere Nutzerverhalten...';
        resultsDisplay.classList.remove('active');
        dataStore.classList.remove('active');
        // Remove any lingering particles or trace icons (optional, if not self-removing)
        container.querySelectorAll('.meta-particle, .meta-trace-icon').forEach(el => el.remove());
        console.log("Metadata Animation Reset");
    }

    function createParticle(startX, startY) {
        const particle = document.createElement('div');
        particle.className = 'meta-particle';
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;

        // Calculate destination (center of data store icon)
        const dsRect = dataStore.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const destX = (dsRect.left - containerRect.left + dsRect.width / 2) - startX; // Relative difference
        const destY = (dsRect.top - containerRect.top + dsRect.height / 2) - startY;

        particle.style.setProperty('--dest-x', `${destX}px`);
        particle.style.setProperty('--dest-y', `${destY}px`);

        container.appendChild(particle);

        // Remove particle after animation finishes (adjust timing based on CSS)
        setTimeout(() => {
            particle.remove();
        }, 1500); // Matches CSS animation duration + small buffer
    }

    function showTrace(targetElement, icon) {
        const trace = document.createElement('span');
        trace.className = 'meta-trace-icon';
        trace.textContent = icon;

        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // Position near the target element
        trace.style.left = `${targetRect.right - containerRect.left - 10}px`; // Slightly right of target
        trace.style.top = `${targetRect.top - containerRect.top + 5}px`; // Slightly above target middle

        container.appendChild(trace);

        // Add class to trigger fade in/out animation from CSS
        trace.classList.add('fade-in-out');

        // Remove after animation (duration defined in CSS)
        setTimeout(() => {
            trace.remove();
        }, 1000); // Match CSS animation-duration
    }

    function animateAction() {
        resetAnimationState(); // Clean up previous state
        const action = actions[currentActionIndex];
        const targetElement = action.element;

        if (!targetElement) {
            console.error("Target element for action index", currentActionIndex, "not found.");
            currentActionIndex = (currentActionIndex + 1) % actions.length;
            animationTimeout = setTimeout(animateAction, 500); // Try next action quickly
            return;
        }

        console.log(`Animating Action: ${action.type}`);

        // Calculate cursor target position (e.g., center of the button or item)
        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const cursorX = targetRect.left - containerRect.left + targetRect.width / 2;
        const cursorY = targetRect.top - containerRect.top + targetRect.height / 2;

        // 1. Move Cursor to target
        cursor.style.left = `${cursorX - 5}px`; // Offset slightly to point tip
        cursor.style.top = `${cursorY - 2}px`;
        cursor.style.opacity = '1'; // Show cursor

        // 2. Simulate Interaction & Generate Trace (after cursor arrives)
        animationTimeout = setTimeout(() => {
            // Simulate click/hover effect
            cursor.style.transform = 'scale(0.8)';
            setTimeout(() => cursor.style.transform = 'scale(1)', 150); // Reset scale

            // Show the trace icon near the element
            showTrace(targetElement, action.traceIcon);

            // Generate data particles flowing to datastore
            for (let i = 0; i < 5; i++) { // Create 5 particles per interaction
                createParticle(cursorX + (Math.random() * 10 - 5), cursorY + (Math.random() * 10 - 5));
            }

            // Pulse the datastore icon
            dataStore.classList.add('active');
            setTimeout(() => dataStore.classList.remove('active'), 600); // Remove pulse after a bit


            // Update results display (simulated)
            resultsDisplay.textContent = action.resultText;
            resultsDisplay.classList.add('active');


            // Schedule next action
            currentActionIndex = (currentActionIndex + 1) % actions.length; // Loop through actions
            animationTimeout = setTimeout(animateAction, 2000); // Pause before next action

        }, 700); // Time for cursor to move + small pause
    }

    // Start the animation loop
    animateAction();

    // Optional: Pause on hover (like before)
    container.addEventListener('mouseenter', () => clearTimeout(animationTimeout));
    container.addEventListener('mouseleave', () => {
        // Simple resume by scheduling the next action
        clearTimeout(animationTimeout);
        animationTimeout = setTimeout(animateAction, 500);
    });

});