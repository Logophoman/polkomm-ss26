document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('interviewfg-visualization');
    if (!container) {
        console.error("Interview/Focus Group container not found!");
        return;
    }

    // --- Get Elements ---
    const scene = container.querySelector('#ifg-scene');
    const interviewBtn = container.querySelector('#ifg-btn-interview');
    const focusGroupBtn = container.querySelector('#ifg-btn-focusgroup');

    if (!scene || !interviewBtn || !focusGroupBtn) {
        console.error("Required elements for Interview/Focus Group animation missing.");
        return;
    }

    // --- Config & State ---
    let currentMode = null; // 'interview' or 'focusgroup'
    let animationInterval;
    let elementsInScene = []; // Keep track of dynamically added elements

    const interviewInsights = ["Motive", "Kontext", "Erfahrung", "Wahrnehmung", "Meinung"];
    const focusGroupInsights = ["Diskurs", "Konsens", "Kontroverse", "Gruppendynamik", "Argumente", "Vielfalt"];

    // --- Functions ---
    function clearScene() {
        clearInterval(animationInterval);
        scene.innerHTML = ''; // Remove all content (figures, bubbles)
        elementsInScene = [];
        console.log("Scene cleared.");
    }

    // Creates a figure (interviewer, participant)
    function createFigure(id, emoji, top, left, roleClass) {
        const figure = document.createElement('div');
        figure.id = id;
        figure.className = `ifg-figure ${roleClass || ''}`;
        figure.style.top = top;
        figure.style.left = left;
        figure.textContent = emoji;
        scene.appendChild(figure);
        elementsInScene.push(figure); // Track element
        return figure;
    }

    // Creates an animated speech bubble with insight keyword
    function createInsightBubble(text, figureElement) {
        if (!figureElement) return;

        const bubble = document.createElement('div');
        bubble.className = 'ifg-insight-bubble';
        bubble.textContent = text;

        // Position near the figure that "said" it
        const figureRect = figureElement.getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect(); // Position relative to scene

        // Base position - adjust x/y offsets as needed
        let bubbleTop = (figureRect.top - sceneRect.top) + (Math.random() * 10 - 15); // Slightly above
        let bubbleLeft = (figureRect.left - sceneRect.left) + figureRect.width + (Math.random() * 20 - 10); // Right side mostly

        // Ensure bubble stays mostly within scene bounds (simple boundary check)
        bubbleTop = Math.max(5, bubbleTop); // Prevent going too high
        bubbleLeft = Math.max(5, bubbleLeft);
        bubbleLeft = Math.min(sceneRect.width - 60, bubbleLeft); // Prevent going too far right (adjust width approx)


        bubble.style.top = `${bubbleTop}px`;
        bubble.style.left = `${bubbleLeft}px`;

        scene.appendChild(bubble);
        elementsInScene.push(bubble); // Track element

        // Trigger animation via class, then remove element
        requestAnimationFrame(() => {
            bubble.classList.add('active');
        });

        setTimeout(() => {
            // Check if bubble still exists before removing
            if (bubble && bubble.parentNode) {
                bubble.classList.remove('active'); // Start fade out
                setTimeout(() => bubble.remove(), 500); // Remove after fade out
            }
            // Clean up tracker array - less critical but good practice
            elementsInScene = elementsInScene.filter(el => el !== bubble);
        }, 2500 + Math.random() * 500); // Keep bubble visible for a duration
    }


    function setupInterviewScene() {
        if (currentMode === 'interview') return; // Don't rebuild if already active
        clearScene();
        currentMode = 'interview';
        console.log("Setting up Interview Scene");
        interviewBtn.classList.add('active');
        focusGroupBtn.classList.remove('active');

        const interviewer = createFigure('interviewer', '🧑‍🏫', '40%', '20%', 'figure-interviewer');
        const participant = createFigure('participant-1', '👤', '40%', '70%', 'figure-participant');
        elementsInScene.push(interviewer, participant);

        // Start animation loop for interview
        let insightIndex = 0;
        let lastSpeaker = null;
        animationInterval = setInterval(() => {
            // Alternate speakers for visual effect
            const speaker = (lastSpeaker === interviewer) ? participant : interviewer;
            createInsightBubble(interviewInsights[insightIndex % interviewInsights.length], speaker);
            insightIndex++;
            lastSpeaker = speaker;
        }, 1800); // Time between insights appearing
    }

    function setupFocusGroupScene() {
        if (currentMode === 'focusgroup') return;
        clearScene();
        currentMode = 'focusgroup';
        console.log("Setting up Focus Group Scene");
        focusGroupBtn.classList.add('active');
        interviewBtn.classList.remove('active');

        const moderator = createFigure('moderator', '🧑‍🏫', '15%', '50%', 'figure-moderator');
        const participants = [
            createFigure('fg-p1', '👤', '55%', '25%', 'figure-participant'),
            createFigure('fg-p2', '👤', '55%', '75%', 'figure-participant'),
            createFigure('fg-p3', '👤', '80%', '50%', 'figure-participant') // Example positions
        ];
        elementsInScene.push(moderator, ...participants);

        // Start animation loop for focus group (more random speaker/insight)
        let insightIndex = 0;
        animationInterval = setInterval(() => {
            // Pick a random participant (excluding moderator) to "speak"
            const speakerIndex = Math.floor(Math.random() * participants.length);
            createInsightBubble(focusGroupInsights[insightIndex % focusGroupInsights.length], participants[speakerIndex]);
            insightIndex++;
        }, 1200); // Insights appear faster/more dynamically
    }


    // --- Event Listeners ---
    interviewBtn.addEventListener('click', setupInterviewScene);
    focusGroupBtn.addEventListener('click', setupFocusGroupScene);

    // --- Initial State ---
    console.log("Interview/Focus Group Animation Ready.");
    setupInterviewScene(); // Start in Interview mode by default

});