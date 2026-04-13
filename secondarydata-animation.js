// secondarydata-animation.js (Data Kiosk Metaphor)

document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('secondarydata-visualization');
    if (!container) {
        console.error("Secondary data container not found!");
        return;
    }

    // --- Get Elements ---
    const kiosk = container.querySelector('#secdata-kiosk');
    const display = container.querySelector('#secdata-display');
    const buttons = container.querySelectorAll('.secdata-kiosk-btn');
    const slot = container.querySelector('#secdata-slot');
    const dispensedData = container.querySelector('#secdata-dispensed-data');
    const researcher = container.querySelector('#secdata-researcher-area'); // Changed ID
    const questionIcon = container.querySelector('#secdata-question-icon'); // Changed ID
    const statusText = container.querySelector('#secdata-status');
    const outcomeArea = container.querySelector('#secdata-outcome');
    const benefitDiv = container.querySelector('#secdata-benefit'); // Div for text + icon
    const drawbackDiv = container.querySelector('#secdata-drawback'); // Div for text + icon


    if (!kiosk || !display || !buttons.length || !slot || !dispensedData || !researcher || !questionIcon || !statusText || !outcomeArea ||!benefitDiv || !drawbackDiv) {
        console.error("Required elements for Secondary Data Kiosk animation missing.");
        return;
    }

    // --- Config & State ---
    const datasetOptions = [
        { id: 'survey', name: 'Umfragedaten', icon: '📊', fit: 0.8 }, // 80% fit probability
        { id: 'social', name: 'Social Media Daten', icon: '💬', fit: 0.6 }, // 60%
        { id: 'official', name: 'Amtsstatistiken', icon: '📈', fit: 0.9 }, // 90%
         { id: 'archive', name: 'Projektarchiv Daten', icon: '📄', fit: 0.7 } // 70%
     ];
    let currentSelection = null;
    let animationTimeout;
    let cycleCounter = 0;
    const pauseBetweenCycles = 3000;
    
    // --- Functions ---
    function resetAnimation() {
        clearTimeout(animationTimeout);
        container.classList.remove('selecting', 'dispensing', 'evaluating', 'finished');
        buttons.forEach(btn => btn.classList.remove('active', 'selected'));
        display.textContent = 'Wähle Datensatz...';
        dispensedData.style.transform = 'translateY(150%) scale(0.5)'; // Move down below slot, shrink
        dispensedData.style.opacity = '0';
        dispensedData.innerHTML = ''; // Clear content
        benefitDiv.style.opacity = '0'; benefitDiv.style.transform = 'scale(0)';
         drawbackDiv.style.opacity = '0'; drawbackDiv.style.transform = 'scale(0)';
        kiosk.classList.remove('working');
        researcher.classList.remove('evaluating');
        statusText.textContent = 'Bereit.';
        currentSelection = null;
         console.log("Secondary Data Kiosk Reset");
    }

    function startSelectionPhase() {
        resetAnimation();
        cycleCounter++;
         const optionIndex = cycleCounter % datasetOptions.length; // Cycle through options
        currentSelection = datasetOptions[optionIndex];
        const targetButton = container.querySelector(`.secdata-kiosk-btn[data-type="${currentSelection.id}"]`);

         statusText.textContent = `Forscher:in sucht: "${currentSelection.name}"...`;
        container.classList.add('selecting');
         researcher.classList.add('thinking'); // Make researcher active

        // Highlight the button being "pressed"
         if(targetButton){
              setTimeout(() => {
                  targetButton.classList.add('active'); // Show which button is chosen
                  display.textContent = `Auswahl: ${currentSelection.icon} ${currentSelection.name}`;
              }, 500); // Delay button press slightly
         } else {
              console.warn(`Button for type ${currentSelection.id} not found.`);
              display.textContent = `Auswahl: ${currentSelection.icon} ${currentSelection.name}`;
          }


        // Move to dispensing phase
        animationTimeout = setTimeout(dispenseDataPhase, 1500); // Time for selection
    }

    function dispenseDataPhase() {
        if (!currentSelection) return; // Should not happen
         statusText.textContent = `Kiosk sucht & gibt "${currentSelection.name}" aus...`;
        container.classList.remove('selecting');
        container.classList.add('dispensing');
         researcher.classList.remove('thinking');
        kiosk.classList.add('working'); // Animate kiosk working

        // Update the content of the dispensed item BEFORE animating it
         dispensedData.innerHTML = `${currentSelection.icon} <span class="data-label">${currentSelection.name}</span>`;

        // Animate dispensing
         animationTimeout = setTimeout(() => {
              dispensedData.style.opacity = '1';
              dispensedData.style.transform = 'translateY(0) scale(1)'; // Move up into view
             kiosk.classList.remove('working');

              // Move to evaluation phase
              animationTimeout = setTimeout(evaluationPhase, 1200); // Time for data to appear
          }, 800); // Time for "working" animation
     }

     function evaluationPhase() {
         if (!currentSelection) return;
         statusText.textContent = `Prüfe Passgenauigkeit der "${currentSelection.name}"...`;
         container.classList.remove('dispensing');
         container.classList.add('evaluating');
         researcher.classList.add('evaluating'); // Researcher evaluates
         questionIcon.classList.add('active'); // Question mark pulses


          // Animate benefit first
         animationTimeout = setTimeout(() => {
              benefitDiv.style.opacity = '1';
             benefitDiv.style.transform = 'scale(1)'; // Show benefit

              // Decide if drawback is shown based on 'fit' probability
              const showsDrawback = Math.random() > currentSelection.fit;

              if (showsDrawback) {
                  animationTimeout = setTimeout(() => {
                     drawbackDiv.style.opacity = '1';
                     drawbackDiv.style.transform = 'scale(1)'; // Show drawback
                     statusText.textContent = `✅ Zeit gespart, aber ⚠️ Daten passen nicht perfekt!`;
                      container.classList.add('finished-drawback'); // Add specific class
                  }, 900); // Show drawback slightly after benefit
             } else {
                  statusText.textContent = `✅ Zeit gespart & Daten scheinen gut zu passen!`;
                  container.classList.add('finished-nodrawback');
              }

             // Reset question pulse
              questionIcon.classList.remove('active');

             // Finish cycle
             animationTimeout = setTimeout(() => {
                 container.classList.remove('evaluating');
                 container.classList.add('finished');
                  animationTimeout = setTimeout(startSelectionPhase, pauseBetweenCycles); // Loop
             }, showsDrawback ? 2000 : 1500); // Wait longer if drawback shown


         }, 800); // Time before showing benefit
     }

    // --- Start ---
    console.log("Secondary Data Kiosk Animation Ready.");
     startSelectionPhase();

    // Optional: Pause on hover - simple version restarts cycle
     container.addEventListener('mouseenter', () => { clearTimeout(animationTimeout); console.log("Kiosk Paused"); });
     container.addEventListener('mouseleave', () => { clearTimeout(animationTimeout); animationTimeout = setTimeout(startSelectionPhase, 500); console.log("Kiosk Resumed"); });

}); // End DOMContentLoaded