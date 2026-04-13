document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('datagen-visualization');
    if (!container) {
        console.error("Data Generation container not found!");
        return;
    }

    // --- Get Elements ---
    const researcher = container.querySelector('#datagen-researcher');
    const participantArea = container.querySelector('#datagen-participants');
    const interactionArea = container.querySelector('#datagen-interaction-area');
    const newDataArea = container.querySelector('#datagen-newdata-area');
    const surveyBtn = container.querySelector('#datagen-btn-survey');
    const experimentBtn = container.querySelector('#datagen-btn-experiment');
    const statusText = container.querySelector('#datagen-status');

    if (!researcher || !participantArea || !interactionArea || !newDataArea || !surveyBtn || !experimentBtn || !statusText) {
        console.error("Required elements for Data Generation animation missing.");
        return;
    }

    // --- Config & State ---
    let currentMode = null; // 'survey' or 'experiment'
    let animationInterval;
    let elementCounter = 0; // Unique IDs for dynamic elements

    const surveyQuestions = [
        "Wie oft?", // Frequency
        "Ihre Meinung?",     // Opinion Open
        "Zustimmung?",   // Agreement
        "Wie wichtig?", // Importance
        "Vertrauen?",    // Trust
        "Diskussion?",     // Behavior / Participation
        "Quelle?",            // Source
        "Bewertung?"          // Evaluation
    ];
    const surveyAnswers = [
        "✅", "📝", "👍", "⭐️",        // Check, Write, Like, Rating
        "🤔", "👎", "💬", "🔗",        // Thinking, Dislike, Comment, Link/Share
        "💯", "🤷", "📊"              // Score, Shrug, Data/Stats
    ];

    const experimentStimuli = [
        // Version A / B type stimuli
        { id: 'A-Ad', icon: '📢', class: 'stimulus-ad-a', text: 'Ad V1' },        // Ad Variant A
        { id: 'B-Ad', icon: '🎯', class: 'stimulus-ad-b', text: 'Ad V2' },        // Ad Variant B
        { id: 'A-News', icon: '📰', class: 'stimulus-news-a', text: 'News Frame A' }, // News Frame A
        { id: 'B-News', icon: '🧐', class: 'stimulus-news-b', text: 'News Frame B' }, // News Frame B
        // Different content types
        { id: 'Text', icon: '📄', class: 'stimulus-text', text: 'Text Post' },   // Text content
        { id: 'Image', icon: '🖼️', class: 'stimulus-image', text: 'Image Post' }, // Image content
        { id: 'Video', icon: '▶️', class: 'stimulus-video', text: 'Video Clip' },  // Video content
        // UI Elements
        { id: 'UI-Easy', icon: '✅', class: 'stimulus-ui-easy', text: 'Simple Interface' }, // Easy UI
        { id: 'UI-Complex', icon: '🧩', class: 'stimulus-ui-complex', text: 'Complex Interface' } // Complex UI
    ];

    const experimentReactions = [
        "🖱️", "👁️", "⏱️", "❤️", // Click, View, Time, Like
        "👍", "😠", "😂", "😲", // Thumbs Up, Angry, Laugh, Wow (Social Media Reactions)
        "✍️", "🔄", "⏭️", "❓"  // Comment, Share/Retweet, Skip/ScrollPast, Question/Confused
    ];

    // --- Functions ---
    function clearInteractionArea() {
        interactionArea.innerHTML = ''; // Remove stimuli or questions
        participantArea.innerHTML = ''; // Remove participants or answer bubbles
        container.querySelectorAll('.datagen-datapoint').forEach(el => el.remove()); // Clear old data points
        statusText.textContent = 'Bereit.';
        researcher.classList.remove('asking', 'presenting'); // Remove researcher states
    }

    function resetState() {
        clearTimeout(animationInterval); // Clear existing timeouts
        clearInterval(animationInterval); // Clear existing intervals
        currentMode = null;
        clearInteractionArea();
        surveyBtn.classList.remove('active');
        experimentBtn.classList.remove('active');
        newDataArea.classList.remove('receiving');
        console.log("Data Generation Reset");
    }


    // Generic function to create a flying data point
    function createDataPoint(startX, startY) {
        const dp = document.createElement('div');
        dp.className = 'datagen-datapoint';
        dp.textContent = '•'; // Simple dot for data
        dp.id = `dp-${elementCounter++}`;
        dp.style.left = `${startX}px`;
        dp.style.top = `${startY}px`;

        // Target center of New Data Area
        const newDataRect = newDataArea.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const destX = (newDataRect.left - containerRect.left + newDataRect.width / 2) - startX - 5; // Adjust for dot size
        const destY = (newDataRect.top - containerRect.top + newDataRect.height / 2) - startY - 5;

        dp.style.setProperty('--dest-x', `${destX}px`);
        dp.style.setProperty('--dest-y', `${destY}px`);

        container.appendChild(dp);

        // Animate receiving area briefly
        newDataArea.classList.add('receiving');
        setTimeout(() => newDataArea.classList.remove('receiving'), 400);

        // Remove data point after animation
        setTimeout(() => dp.remove(), 1200); // Matches CSS animation time
    }


    // --- Survey Mode ---
    function startSurveyMode() {
        if (currentMode === 'survey') return;
        resetState();
        currentMode = 'survey';
        surveyBtn.classList.add('active');
        console.log("Starting Survey Mode");
        statusText.textContent = 'Umfrage: Stelle Fragen...';
        researcher.classList.add('asking');

        // Add a participant figure (ensure participantArea itself is positioned reasonably)
        const participant = document.createElement('div');
        participant.className = 'datagen-participant';
        participant.textContent = '👤';
        participantArea.appendChild(participant);

        let qIndex = 0;
        let aIndex = 0;

        // Adjust timings slightly for better flow visibility
        const questionTravelTimeCSS = '0.8s'; // Duration defined in CSS
        const questionPauseVisible = 1000;    // How long question STAYS after moving
        const answerVisibleTime = 1000;       // How long answer STAYS

        animationInterval = setInterval(() => {
            // --- Create Question ---
            const question = document.createElement('div');
            question.className = 'datagen-bubble question';
            question.textContent = surveyQuestions[qIndex % surveyQuestions.length];

            // Append to interaction area FIRST, then get its size/position
            interactionArea.appendChild(question);

            // ** FIX: Calculate positions RELATIVE to the interaction area **
            const iAreaRect = interactionArea.getBoundingClientRect();
            // Start near left-middle of interaction area
            const startX = iAreaRect.width * 0.1;
            const startY = iAreaRect.height * 0.5 - (question.offsetHeight / 2); // Center vertically roughly
            question.style.left = `${startX}px`;
            question.style.top = `${startY}px`;
            // IMPORTANT: Apply transition DURATION from CSS
            question.style.transition = `transform ${questionTravelTimeCSS} cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease-out`;

            // Target near right-middle of interaction area
            const endX = iAreaRect.width * 0.8;
            // Calculate the difference for translate
            const moveX = endX - startX - (question.offsetWidth * 0.1); // Adjust target X slightly due to scale(0.9) maybe? Or ignore scale effect here.
            const moveY = 0; // No vertical movement in this setup

            // --- Animate Question ---
            // 1. Make it appear (needs frame for opacity transition to trigger)
            requestAnimationFrame(() => {
                question.style.opacity = '1';
            });

            // 2. Move it after a very short delay
            setTimeout(() => {
                if (question && question.parentNode) {
                    question.style.transform = `translate(${moveX}px, ${moveY}px) scale(0.9)`;
                }
            }, 50); // Delay movement slightly after appearing

            // --- Schedule Answer ---
            // Delay = Approx Travel time from CSS transition + Desired Pause Time
            const answerDelay = parseFloat(questionTravelTimeCSS) * 1000 + questionPauseVisible;

            setTimeout(() => {
                if (question && question.parentNode) {
                    question.style.opacity = '0'; // Start fading question
                    setTimeout(() => { if (question) question.remove() }, 300); // Remove after fade
                }

                // --- Create Answer Bubble (positioning relative to PARTICIPANT AREA) ---
                const answer = document.createElement('div');
                answer.className = 'datagen-bubble answer';
                answer.textContent = surveyAnswers[aIndex % surveyAnswers.length];

                participantArea.appendChild(answer); // Append before getting participantRect

                const pAreaRect = participantArea.getBoundingClientRect(); // Area where participant sits
                const containerRect = container.getBoundingClientRect(); // Main visualization container

                // Position near participant figure (bottom-left of the participant area)
                const ansStartX = 0; // Start near left edge of participant area
                const ansStartY = participantArea.offsetHeight - answer.offsetHeight - 5; // Near bottom
                answer.style.left = `${ansStartX}px`;
                answer.style.top = `${ansStartY}px`;

                // Make answer appear
                requestAnimationFrame(() => answer.style.opacity = '1');

                // --- Answer transforms into data point ---
                setTimeout(() => {
                    if (!answer || !answer.parentNode) return; // Check answer exists
                    answer.style.opacity = '0'; // Fade out answer bubble

                    // Calculate data point start relative to the CONTAINER, based on answer's absolute pos
                    const answerRect = answer.getBoundingClientRect();
                    const dataStartX = answerRect.left - containerRect.left + (answerRect.width / 2);
                    const dataStartY = answerRect.top - containerRect.top + (answerRect.height / 2);
                    createDataPoint(dataStartX, dataStartY); // Create data point where bubble was

                    setTimeout(() => { if (answer) answer.remove() }, 300); // Remove bubble after fade
                }, answerVisibleTime); // How long answer bubble is visible

            }, answerDelay); // Total time before answer logic begins


            qIndex++; aIndex++; // Cycle through questions/answers

        }, parseFloat(questionTravelTimeCSS) * 1000 + questionPauseVisible + answerVisibleTime + 800); // Adjust total interval

    }


    // --- Experiment Mode ---
    function startExperimentMode() {
        if (currentMode === 'experiment') return;
        resetState();
        currentMode = 'experiment';
        experimentBtn.classList.add('active');
        console.log("Starting Experiment Mode");
        statusText.textContent = 'Experiment: Präsentiere Stimuli...';
        researcher.classList.add('presenting');

        // Add a participant figure
        const participant = document.createElement('div');
        participant.className = 'datagen-participant';
        participant.textContent = '👤';
        participantArea.appendChild(participant);

        let sIndex = 0;
        let rIndex = 0;
        animationInterval = setInterval(() => {
            // 1. Present Stimulus
            const stimulusData = experimentStimuli[sIndex % experimentStimuli.length];
            const stimulus = document.createElement('div');
            stimulus.className = `datagen-stimulus ${stimulusData.class}`;
            stimulus.textContent = stimulusData.icon;
            stimulus.style.opacity = '1'; // Appear
            interactionArea.appendChild(stimulus);

            // Position researcher to "point" or observe interaction area? (optional)

            // 2. Record Reaction after stimulus is shown
            setTimeout(() => {
                stimulus.classList.add('inactive'); // Dim stimulus slightly

                // Create reaction icon near participant
                const pRect = participant.getBoundingClientRect();
                const cRect = container.getBoundingClientRect();
                const reaction = document.createElement('div');
                reaction.className = 'datagen-reaction';
                reaction.textContent = experimentReactions[rIndex % experimentReactions.length];
                const reactX = pRect.left - cRect.left - 40; // Position left of participant
                const reactY = pRect.top - cRect.top + pRect.height / 2 - 15;
                reaction.style.left = `${reactX}px`;
                reaction.style.top = `${reactY}px`;
                participantArea.appendChild(reaction);
                reaction.classList.add('active'); // Trigger its animation

                // Generate data point from reaction location
                createDataPoint(reactX + 15, reactY + 15);

                // Clean up stimulus and reaction after a bit
                setTimeout(() => {
                    stimulus.remove();
                    reaction.remove();
                }, 1000); // Duration reaction/dimmed stimulus shown


            }, 1200); // How long stimulus is presented before reaction

            sIndex++; rIndex++;

        }, 2800); // Interval between presenting stimuli
    }

    // --- Event Listeners ---
    surveyBtn.addEventListener('click', startSurveyMode);
    experimentBtn.addEventListener('click', startExperimentMode);

    // --- Initial State ---
    console.log("Data Generation Animation Ready.");
    startSurveyMode(); // Start with survey mode default

});