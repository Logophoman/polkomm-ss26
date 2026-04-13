document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('experiment-visualization');
    if (!container) {
        console.error("Experiment container #experiment-visualization not found!");
        return;
    }

    // --- Get elements ---
    const versionA = container.querySelector('#exp-version-a');
    const versionB = container.querySelector('#exp-version-b');
    const btnA = container.querySelector('#exp-btn-a');
    const btnB = container.querySelector('#exp-btn-b');
    const barA = container.querySelector('#exp-bar-a');
    const barB = container.querySelector('#exp-bar-b');
    const valueA = container.querySelector('#exp-value-a');
    const valueB = container.querySelector('#exp-value-b');
    const conclusionText = container.querySelector('#exp-conclusion');

    if (!versionA || !versionB || !btnA || !btnB || !barA || !barB || !valueA || !valueB || !conclusionText) {
        console.error("Experiment elements missing for animation.");
        return;
    }

    // --- Config ---
    const maxClicks = 100; // Represents 100% in the bar width
    const targetClicksA = 65; // Simulate Version A getting 65 clicks/points
    const targetClicksB = 80; // Simulate Version B getting 80 clicks/points (B performs better)
    const animationDuration = 2500; // ms for bars to fill
    const updateInterval = 50; // ms interval for updating bars/values
    const cyclePause = 3000; // ms pause before restarting

    let currentClicksA = 0;
    let currentClicksB = 0;
    let intervalIdA = null;
    let intervalIdB = null;
    let animationTimeout;

    // --- Functions ---
    function resetAnimation() {
        clearTimeout(animationTimeout);
        clearInterval(intervalIdA);
        clearInterval(intervalIdB);
        currentClicksA = 0;
        currentClicksB = 0;
        barA.style.width = '0%';
        barB.style.width = '0%';
        valueA.textContent = '0';
        valueB.textContent = '0';
        btnA.classList.remove('active-pulse');
        btnB.classList.remove('active-pulse');
        versionA.classList.remove('winner');
        versionB.classList.remove('winner');
        conclusionText.style.opacity = '0';
         conclusionText.textContent = 'Teste Varianten...'; // Reset text
        console.log("Experiment Animation Reset");
    }

     function updateBars() {
          const steps = animationDuration / updateInterval;
          const incrementA = targetClicksA / steps;
          const incrementB = targetClicksB / steps;

         let iterations = 0;

          // Separate intervals to potentially handle slight timing differences if needed
         intervalIdA = setInterval(() => {
              currentClicksA += incrementA;
              if (currentClicksA >= targetClicksA) {
                  currentClicksA = targetClicksA;
                  clearInterval(intervalIdA);
              }
              barA.style.width = `${(currentClicksA / maxClicks) * 100}%`;
              valueA.textContent = Math.round(currentClicksA).toString();
              // Add pulse effect briefly
              if (iterations % 5 === 0) { // Pulse occasionally
                 btnA.classList.add('active-pulse');
                 setTimeout(() => btnA.classList.remove('active-pulse'), updateInterval * 4);
             }

         }, updateInterval);

          intervalIdB = setInterval(() => {
              currentClicksB += incrementB;
              if (currentClicksB >= targetClicksB) {
                  currentClicksB = targetClicksB;
                  clearInterval(intervalIdB);
              }
              barB.style.width = `${(currentClicksB / maxClicks) * 100}%`;
              valueB.textContent = Math.round(currentClicksB).toString();
              // Add pulse effect briefly
              if (iterations % 5 === 0) { // Pulse occasionally
                 btnB.classList.add('active-pulse');
                 setTimeout(() => btnB.classList.remove('active-pulse'), updateInterval * 4);
              }
              iterations++; // Only increment once

             // Check if BOTH intervals are finished
              if (currentClicksA === targetClicksA && currentClicksB === targetClicksB) {
                 finishExperiment();
              }

         }, updateInterval);

      }

    function finishExperiment() {
        console.log("Experiment Animation Finished Running");
        // Remove active pulses if they are stuck
         btnA.classList.remove('active-pulse');
        btnB.classList.remove('active-pulse');

        // Determine winner
        if (targetClicksB > targetClicksA) {
            versionB.classList.add('winner');
            conclusionText.textContent = `Ergebnis: Version B (${targetClicksB}) ist effektiver als Version A (${targetClicksA})!`;
        } else if (targetClicksA > targetClicksB) {
            versionA.classList.add('winner');
            conclusionText.textContent = `Ergebnis: Version A (${targetClicksA}) ist effektiver als Version B (${targetClicksB})!`;
        } else {
            conclusionText.textContent = `Ergebnis: Beide Versionen (${targetClicksA}) sind etwa gleich effektiv.`;
        }
         conclusionText.style.opacity = '1';

         // Schedule next cycle
         animationTimeout = setTimeout(startExperimentCycle, cyclePause);
     }

    function startExperimentCycle() {
        resetAnimation();
        console.log("Experiment Animation Starting Cycle");
        // Add small delay before starting bars to let reset settle
         setTimeout(updateBars, 300);
    }

    // Start the animation loop
    startExperimentCycle();

    // Optional: Pause on hover
    container.addEventListener('mouseenter', () => {
        clearTimeout(animationTimeout);
         clearInterval(intervalIdA); // Stop intervals
        clearInterval(intervalIdB);
        console.log("Experiment Paused on Hover");
     });
    container.addEventListener('mouseleave', () => {
         // Simple resume: Restart the whole cycle after short delay
        clearTimeout(animationTimeout);
         clearInterval(intervalIdA);
        clearInterval(intervalIdB);
        animationTimeout = setTimeout(startExperimentCycle, 500);
         console.log("Experiment Resuming on Leave");
    });

});