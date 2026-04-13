// survey-animation.js (Revised for Robustness)

document.addEventListener('DOMContentLoaded', function () {
    console.log("Survey Animation Script Loaded"); // Debug: Script loaded?

    const container = document.getElementById('survey-visualization');
    if (!container) {
        console.error("ERROR: Survey container #survey-visualization not found!");
        return;
    } else {
        console.log("Survey container found:", container); // Debug: Container OK
    }

    const buttons = container.querySelectorAll('.likert-scale button');
    const resultsDiv = container.querySelector('#survey-results');
    const feedbackP = container.querySelector('#survey-feedback');
    const barContainers = container.querySelectorAll('.results-bars .bar-container');
    const bars = {}; // Store bar elements by value (e.g., bars['1'], bars['2'])
    const values = {}; // Store value text elements by value

    if (!buttons.length) {
        console.error("ERROR: No buttons found with selector '.likert-scale button' inside container.");
        return;
    }
    if (!resultsDiv) {
        console.error("ERROR: Results div #survey-results not found inside container.");
        return;
    }
     if (!feedbackP) {
        console.warn("WARN: Feedback paragraph #survey-feedback not found inside container.");
        // Allow continuing without feedback P, but log it
    }
    if (!barContainers.length) {
         console.error("ERROR: No bar containers found with selector '.results-bars .bar-container'.");
        // Cannot proceed without bars
        return;
     } else {
         console.log("Found", barContainers.length, "bar containers."); // Debug
     }

    // Populate bars and values objects - check if elements are found
    barContainers.forEach(bc => {
        const value = bc.dataset.value; // e.g., "1", "2", ...
        const barEl = bc.querySelector('.bar');
        const valueEl = bc.querySelector('.bar-value');
        if (value) {
             if (barEl) {
                bars[value] = barEl;
             } else {
                 console.warn(`WARN: Bar element not found in container for value ${value}`);
             }
             if (valueEl) {
                values[value] = valueEl;
             } else {
                 console.warn(`WARN: Bar value element not found in container for value ${value}`);
             }
        } else {
             console.warn("WARN: Bar container found without data-value:", bc);
         }
    });
     console.log("Populated 'bars' object:", bars); // Debug
     console.log("Populated 'values' object:", values); // Debug


    // --- Attach Event Listeners ---
    buttons.forEach(button => {
        button.addEventListener('click', handleLikertClick);
        console.log("Added click listener to button:", button); // Debug: Listener added?
    });

    // --- Click Handler Function ---
    function handleLikertClick(event) {
        console.log("Likert button clicked! Value:", event.currentTarget.dataset.value); // Debug: Handler executing?

        const clickedButton = event.currentTarget;
        const clickedValue = clickedButton.dataset.value; // Value is "1" to "5"

        // --- 1. Visuelles Feedback für den Klick ---
        try {
             buttons.forEach(b => b.classList.remove('selected')); // Vorherige Auswahl aufheben
             clickedButton.classList.add('selected'); // Geklickten Button hervorheben
             console.log("Button selection class updated."); // Debug

             if (feedbackP) {
                 const buttonText = clickedButton.textContent || `Antwort ${clickedValue}`;
                 feedbackP.textContent = `Danke! Ihre (simulierte) Antwort "${buttonText.split('(')[0].trim()}" wurde registriert. So könnten die aggregierten Ergebnisse aussehen:`;
                feedbackP.className = 'feedback correct'; // Ensure class provides visible style
                console.log("Feedback text updated."); // Debug
             }
        } catch (e) {
            console.error("Error during UI feedback update:", e);
         }

        // --- 2. Simulierte aggregierte Ergebnisse generieren ---
        let simulatedResults = {};
        try {
            let baseDistribution = [5, 10, 25, 35, 25]; // Basisprozentsätze
            let pointsTotal = 100;
             let currentSum = 0;

             // Simple proportional randomization, ensuring sum is 100
            let randomFactors = [];
            let factorSum = 0;
            for(let i=0; i<5; i++) {
                let factor = baseDistribution[i] + (Math.random() * 10 - 5); // Add some noise
                 factor = Math.max(1, factor); // Ensure minimum factor > 0
                randomFactors.push(factor);
                factorSum += factor;
             }

             for (let i = 0; i < 5; i++) {
                 let percentage = Math.round((randomFactors[i] / factorSum) * 100);
                 simulatedResults[i + 1] = percentage; // Values are 1-5
                 currentSum += percentage;
             }

            // Adjust last element to ensure sum is exactly 100 due to rounding
            let diff = 100 - currentSum;
             simulatedResults[5] += diff;
            // Minor edge case: if adjustment makes last bar negative, redistribute diff elsewhere
             if(simulatedResults[5] < 0) {
                 simulatedResults[4] += simulatedResults[5]; // Add negative value to prev
                 simulatedResults[5] = 0; // Set last to 0
                // Could make this smarter if needed, but ok for demo
             }
             console.log("Simulated Results:", simulatedResults); // Debug
         } catch(e) {
            console.error("Error during results simulation:", e);
             return; // Don't proceed if simulation failed
         }


        // --- 3. Balkendiagramm aktualisieren ---
        try {
            for (let i = 1; i <= 5; i++) {
                const percentage = simulatedResults[i] !== undefined ? simulatedResults[i] : 0; // Get percentage (0 if missing)
                const percentageStr = `${percentage}%`;

                if (bars[i]) {
                    bars[i].style.height = percentageStr;
                    console.log(`Set bar ${i} height to ${percentageStr}`); // Debug
                } else {
                     console.warn(`WARN: Cannot set height for bar ${i}, element not found.`);
                 }
                 if (values[i]) {
                     values[i].textContent = percentageStr;
                      console.log(`Set value text ${i} to ${percentageStr}`); // Debug
                 } else {
                     console.warn(`WARN: Cannot set text for value ${i}, element not found.`);
                 }
            }
         } catch(e) {
             console.error("Error updating bar chart:", e);
             return; // Don't try to show if bars failed
         }

        // --- 4. Ergebnisse anzeigen (sehr wichtig!) ---
        if (resultsDiv) {
             // Make sure the results container is visible
             resultsDiv.classList.remove('hidden-content'); // Remove class if it exists
             resultsDiv.style.display = 'block'; // Explicitly set display
             console.log("Results Div display set to 'block'"); // Debug
         } else {
            console.error("ERROR: Cannot show results, resultsDiv is null.");
        }
    }

    // Optional: Initial Console message indicating setup completion
    console.log("Survey Animation Setup Complete. Waiting for clicks.");

}); // End DOMContentLoaded