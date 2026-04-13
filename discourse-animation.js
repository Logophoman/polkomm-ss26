document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('discourse-visualization');
    if (!container) {
        console.error("Discourse analysis container not found!");
        return;
    }

    // --- Get Elements ---
    const discourseTextDiv = container.querySelector('#discourse-text');
    const controlsDiv = container.querySelector('#discourse-controls');
    const explanationDiv = container.querySelector('#discourse-explanation');

    if (!discourseTextDiv || !controlsDiv || !explanationDiv) {
        console.error("Required elements for Discourse analysis animation missing.");
        return;
    }

    // Store original HTML content of the text div to allow resetting highlights
    const originalTextHTML = discourseTextDiv.innerHTML;

    // --- Define Patterns for Highlighting ---
    // Use regular expressions (case-insensitive, global)
    const analysisPatterns = {
        power: {
            regex: /\b(mächtige|Einfluss|Kontrolle|regulieren|dominieren|Eliten|Autorität|muss|entscheiden|Staat)\b/gi,
            className: 'hl-power',
            explanation: 'Hebt Begriffe hervor, die Macht, Kontrolle oder Autorität implizieren.'
        },
        framingFreedom: {
             regex: /\b(Freiheit|Eigenverantwortung|Wahl|offen|unabhängig|deregulieren|Markt|Chance)\b/gi,
             className: 'hl-frame-freedom',
             explanation: 'Zeigt Begriffe, die das Thema als Frage von Freiheit vs. Einschränkung rahmen.'
         },
        framingSecurity: {
            regex: /\b(Sicherheit|Schutz|Risiko|Gefahr|stabil|Gemeinschaft|Verantwortung|sichern)\b/gi,
            className: 'hl-frame-security',
            explanation: 'Zeigt Begriffe, die das Thema als Frage von Sicherheit vs. Risiko rahmen.'
        },
         actorsPositive: {
             regex: /\b(Experten|Bürger|Innovatoren|Wir|Unterstützer)\b/gi,
             className: 'hl-actor-pos',
             explanation: 'Markiert positiv dargestellte oder neutrale Akteursbezeichnungen.'
         },
         actorsNegative: {
              regex: /\b(Lobbyisten|Bürokraten|Gegner|Kritiker|Die|Problem)\b/gi,
             className: 'hl-actor-neg',
             explanation: 'Markiert negativ dargestellte oder problematisierte Akteurs-/Gruppenbezeichnungen.'
          }
    };

    // --- Functions ---

    // Removes all added highlight spans by restoring original content
    function resetHighlighting() {
        discourseTextDiv.innerHTML = originalTextHTML;
         explanationDiv.innerHTML = '<i>Klicken Sie auf einen Button, um Analyseaspekte hervorzuheben.</i>';
         explanationDiv.className = 'discourse-explanation'; // Reset class
         // Reset button active states
        controlsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
         console.log("Discourse highlights reset.");
    }

    // Applies highlights based on the selected analysis type
    function applyHighlights(analysisKey) {
         resetHighlighting(); // Clear previous state first
         if (!analysisPatterns[analysisKey]) return;

         const { regex, className, explanation } = analysisPatterns[analysisKey];
         let currentHTML = originalTextHTML; // Work on a copy of the original

          console.log(`Applying highlights for: ${analysisKey}`);

         // Replace matches with spans (global regex handles multiple instances)
         // Important: Do replacement iteratively on the evolving string is complex with overlaps.
         // Simpler: replace on original string. Issues if keywords overlap analysis types.
         // For demo: Good enough. For real tool: Needs smarter node manipulation.
         let matchCount = 0;
          currentHTML = currentHTML.replace(regex, (match) => {
              matchCount++;
              // Simple span wrapping. Careful with HTML entities in match.
             // This won't handle nested tags well inside the original text!
              return `<span class="${className}">${match}</span>`;
         });

         discourseTextDiv.innerHTML = currentHTML; // Apply the modified HTML
         explanationDiv.textContent = explanation; // Show explanation
         explanationDiv.className = `discourse-explanation visible ${className}-bg`; // Add class for potential background

         // Highlight active button
         const activeButton = controlsDiv.querySelector(`[data-analysis="${analysisKey}"]`);
         if (activeButton) activeButton.classList.add('active');

         console.log(`Applied ${matchCount} highlights for ${analysisKey}.`);
    }


    // --- Create Buttons and Add Listeners ---
    Object.keys(analysisPatterns).forEach(key => {
        const button = document.createElement('button');
        button.type = 'button';
         // Simple name from key - could be more descriptive
         let buttonText = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // CamelCase to Title Case
        button.textContent = buttonText.replace('Framing ', ''); // Shorten name
        button.dataset.analysis = key; // Store key for handler
         button.title = analysisPatterns[key].explanation; // Tooltip

         // Assign a class based on the analysis type for distinct button styles
        button.classList.add(`btn-type-${key.split(/(?=[A-Z])/)[0].toLowerCase()}`); // e.g., btn-type-power, btn-type-framing

        button.addEventListener('click', () => applyHighlights(key));
        controlsDiv.appendChild(button);
    });

     // Add a Reset button
     const resetButton = document.createElement('button');
     resetButton.type = 'button';
     resetButton.textContent = 'Zurücksetzen';
     resetButton.title = 'Alle Hervorhebungen entfernen';
      resetButton.classList.add('btn-type-reset');
      resetButton.addEventListener('click', resetHighlighting);
      controlsDiv.appendChild(resetButton);


    // --- Initial State ---
    resetHighlighting(); // Set initial state
    console.log("Discourse Analysis Animation Ready.");

});