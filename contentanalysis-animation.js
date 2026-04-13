document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('contentanalysis-visualization');
    if (!container) {
        console.error("Content analysis container #contentanalysis-visualization not found!");
        return;
    }

    // --- Get Elements ---
    const sampleContentDiv = container.querySelector('#ca-sample-content');
    const quantButton = container.querySelector('#ca-btn-quant');
    const qualButton = container.querySelector('#ca-btn-qual');
    const quantResultsDiv = container.querySelector('#ca-quant-results');
    const qualResultsDiv = container.querySelector('#ca-qual-results');
    const quantList = container.querySelector('#ca-quant-list');
    const qualList = container.querySelector('#ca-qual-list');
    // Get the actual text items - IMPORTANT: Get original texts before highlighting
    const textItems = Array.from(container.querySelectorAll('.ca-text-item'));
    const originalTexts = textItems.map(item => item.innerHTML); // Store original HTML for reset

    if (!sampleContentDiv || !quantButton || !qualButton || !quantResultsDiv || !qualResultsDiv || !quantList || !qualList || !textItems.length) {
        console.error("Content analysis elements missing for animation.");
        return;
    }

    // --- Configuration ---
    const highlightDelay = 150; // ms between highlighting steps
    // Define terms and categories for quantitative analysis (using RegExp for flexibility)
    const quantCategories = {
        'Klima 🌳': /Klima|Umwelt|Erderwärmung|CO2|Nachhaltig|🌳|🌍/gi, // Global, ignore case
        'Wirtschaft 📈': /Wirtschaft|Markt|Inflation|Handel|Invest|📈|💰|€|\$/gi,
        'Soziales ❤️': /Sozial|Gerechtigkeit|Armut|Hilfe|Gemeinschaft|Rente|❤️/gi
    };
     // Define sentences/phrases and codes for qualitative analysis (simple mapping for demo)
     const qualCodings = [
          { textIndex: 0, phrase: /stärkeren Fokus auf Klimaschutz/i, code: 'Forderung', color: '#cfe2ff'}, // Match specific phrases, store index of text item
         { textIndex: 1, phrase: /muss jetzt handeln!/i, code: 'Appell', color: '#d1e7dd'},
          { textIndex: 2, phrase: /Große Sorge um Wirtschaft/i, code: 'Problembeschreibung', color: '#f8d7da'},
         { textIndex: 0, phrase: /Sozial Schwache leiden/i, code: 'Folgenabschätzung', color: '#fff3cd'} // Can code multiple aspects in one text
     ];


    let animationTimeout;
    let currentHighlightIndex = 0; // For sequencing highlights

    // --- Functions ---
    function resetState() {
        clearTimeout(animationTimeout);
        currentHighlightIndex = 0; // Reset sequence index
        quantResultsDiv.classList.add('hidden-content');
        qualResultsDiv.classList.add('hidden-content');
        quantList.innerHTML = ''; // Clear previous results
        qualList.innerHTML = ''; // Clear previous results

        // Restore original text content VERY IMPORTANT
        textItems.forEach((item, index) => {
            item.innerHTML = originalTexts[index];
        });
         // Reset button states if needed
        quantButton.disabled = false;
        qualButton.disabled = false;
         console.log("Content Analysis Reset");
    }

    // Helper to wrap matched text with a span, handling potential existing tags simply
     function highlightMatches(textNode, regex, className) {
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;
          let match;

          // Create temporary div to parse existing HTML safely
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = textNode.innerHTML; // Use current innerHTML

          // We'll process text nodes within the temp div
          const nodeIterator = document.createNodeIterator(tempDiv, NodeFilter.SHOW_TEXT);
          let currentNode;
          const textContents = [];
           while(currentNode = nodeIterator.nextNode()) {
              textContents.push({ node: currentNode, text: currentNode.nodeValue });
          }

         let highlightedHTML = tempDiv.innerHTML; // Start with current potentially highlighted HTML

         textContents.forEach(({ node, text }) => {
              let localLastIndex = 0;
              let resultHTML = '';
             while ((match = regex.exec(text)) !== null) {
                  // Append text before the match
                  resultHTML += escapeHTML(text.substring(localLastIndex, match.index));
                  // Append the highlighted match
                 resultHTML += `<span class="${className}">${escapeHTML(match[0])}</span>`;
                  localLastIndex = regex.lastIndex; // Continue searching from end of match
             }
             // Append any remaining text
             resultHTML += escapeHTML(text.substring(localLastIndex));

              // Replace the original text node's content within the larger HTML string
             // This is tricky and imperfect without complex DOM manipulation
              // A simpler approach for demo: Just replace text directly on re-render, potential nested span issues
             highlightedHTML = highlightedHTML.replace(escapeHTML(text), resultHTML); // Use replace carefully
         });

         // Re-inject potentially highlighted HTML
          textNode.innerHTML = highlightedHTML; // Overwrite innerHTML - potentially destructive to other markup!
         return (highlightedHTML.match(new RegExp(`<span class="${className}">`, 'g')) || []).length; // Count added highlights
     }

     // Simple HTML escaping
     function escapeHTML(str) {
         return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'");
     }


    function runQuantitativeAnalysis() {
        resetState();
        console.log("Running Quantitative Analysis...");
        quantButton.disabled = true; // Prevent double clicks while running
         qualButton.disabled = true;
        quantResultsDiv.classList.remove('hidden-content');

        const counts = {};
        Object.keys(quantCategories).forEach(key => counts[key] = 0);

        currentHighlightIndex = 0; // Start sequencing from first item
        let totalHighlightsApplied = 0;

        function processNextQuantItem() {
            if (currentHighlightIndex >= textItems.length) {
                 console.log("Quantitative processing complete. Counts:", counts);
                displayQuantResults(counts); // Display final counts after all items scanned
                 quantButton.disabled = false; // Re-enable buttons
                 qualButton.disabled = false;
                return;
            }

            const item = textItems[currentHighlightIndex];
            let itemHighlights = 0;
            console.log(`Scanning Item ${currentHighlightIndex + 1}`);

             Object.entries(quantCategories).forEach(([key, regex]) => {
                 // IMPORTANT: Reset lastIndex for global regex before each use on NEW string
                 regex.lastIndex = 0;
                  // Count matches directly in the original text to avoid counting nested spans
                  const originalItemText = item.textContent || ""; // Get raw text
                  const matches = originalItemText.match(regex);
                  const matchCount = matches ? matches.length : 0;

                  if (matchCount > 0) {
                      console.log(` Found ${matchCount} matches for ${key} in item ${currentHighlightIndex+1}`);
                     counts[key] += matchCount;
                      // Apply highlighting (best effort visual) - will add spans
                     highlightMatches(item, regex, 'highlight-quant'); // Apply highlight class
                      itemHighlights++;
                 }
              });

             if (itemHighlights > 0) totalHighlightsApplied += itemHighlights; // Track if *any* highlight applied

             currentHighlightIndex++;
            // Move to the next item after a delay
            animationTimeout = setTimeout(processNextQuantItem, highlightDelay * (itemHighlights > 0 ? 2 : 1) ); // Slightly longer delay if something was found
         }

         processNextQuantItem(); // Start the sequence
    }


     function displayQuantResults(counts) {
         quantList.innerHTML = ''; // Clear previous list items if any
         Object.entries(counts).forEach(([key, count]) => {
             const li = document.createElement('li');
             // Extract emoji if present for display
              const icon = key.match(/[\p{Emoji}]/u) ? key.match(/[\p{Emoji}]/u)[0] : '';
              const text = key.replace(/[\p{Emoji}]/u, '').trim();

             li.innerHTML = `<span class="ca-quant-icon">${icon}</span> ${text}: <span class="ca-quant-count">${count}</span>`;
              li.style.opacity = '0';
              quantList.appendChild(li);
              // Stagger fade-in of results
              setTimeout(() => li.style.opacity = '1', Math.random() * 300);
          });
     }

    function runQualitativeAnalysis() {
        resetState();
        console.log("Running Qualitative Analysis...");
         quantButton.disabled = true;
         qualButton.disabled = true;
        qualResultsDiv.classList.remove('hidden-content');

        currentHighlightIndex = 0; // Reuse index for sequencing through codings

        function processNextQualCoding() {
             if (currentHighlightIndex >= qualCodings.length) {
                 console.log("Qualitative coding complete.");
                 quantButton.disabled = false;
                  qualButton.disabled = false;
                 return; // All codings processed
             }

            const coding = qualCodings[currentHighlightIndex];
            const targetItem = textItems[coding.textIndex];

             if (!targetItem) {
                  console.warn(`Qualitative target item ${coding.textIndex} not found.`);
                  currentHighlightIndex++; // Skip to next
                  animationTimeout = setTimeout(processNextQualCoding, highlightDelay / 2);
                  return;
              }

             const itemText = targetItem.textContent || "";
              const match = itemText.match(coding.phrase); // Find the phrase

              if (match) {
                 console.log(`Coding '${coding.code}' for phrase in item ${coding.textIndex}`);
                  // Highlight the specific phrase (more complex replacement needed for precision)
                  // Simple visual: just add a background/border to the item for demo
                  // targetItem.style.backgroundColor = coding.color || '#e0e0e0';
                 // Or highlight the matched phrase (can have issues with existing spans)
                  targetItem.innerHTML = itemText.replace(match[0], `<span class="highlight-qual" style="background-color:${coding.color || '#cfe2ff'}">${match[0]}</span>`);


                  // Display the result
                 const li = document.createElement('li');
                  li.innerHTML = `<code>[${coding.code}]</code>: <q>${escapeHTML(match[0])}</q>`;
                 li.style.opacity = '0';
                 qualList.appendChild(li);
                  // Stagger fade-in
                  setTimeout(() => li.style.opacity = '1', Math.random() * 200);

             } else {
                 console.log(`Phrase for code '${coding.code}' not found in item ${coding.textIndex}`);
              }

            currentHighlightIndex++;
            // Process next coding after a delay
             animationTimeout = setTimeout(processNextQualCoding, highlightDelay * (match ? 3 : 1) ); // Longer delay if found & coded
         }

        processNextQualCoding(); // Start the sequence
    }


    // --- Attach Event Listeners ---
    quantButton.addEventListener('click', runQuantitativeAnalysis);
    qualButton.addEventListener('click', runQualitativeAnalysis);

    // --- Initial State ---
    console.log("Content Analysis Animation Ready.");
     resetState(); // Ensure clean start


});