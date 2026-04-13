document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('casestudy-visualization');
    if (!container) {
        console.error("Container #casestudy-visualization not found!");
        return;
    }

    const methods = Array.from(container.querySelectorAll('.cs-method')); // Use Array.from for easier iteration
    const magnifier = container.querySelector('#cs-magnifier');
    const caseElement = container.querySelector('#cs-case');
    const connectors = Array.from(container.querySelectorAll('.cs-connector')); // Use Array.from

    if (!methods.length || !magnifier || !caseElement || !connectors.length) {
        console.error("Case study critical elements missing for animation.");
        return; // Stop if essential elements are not found
    }

    console.log(`Found ${methods.length} methods and ${connectors.length} connectors.`);

    const methodCount = methods.length;
    let currentMethodIndex = 0;
    let animationTimeout;

    // Helper function to safely modify scale within the existing transform
    function setScaleInTransform(element, scaleValue) {
        if (!element || !element.style) return;
        // Get current transform or default to none if not set (should be set by CSS initially)
        let currentTransform = element.style.transform || window.getComputedStyle(element).transform || '';
        if (currentTransform === 'none') { // Handle cases where transform might be initially unset or computed as 'none'
             // Use base position from CSS - this assumes CSS handles the translate correctly
             // Example for one element (adapt if needed or fetch dynamically)
              // For simplicity, let's assume it gets a base transform applied initially by CSS load or fade-in
              // If not, we'd need to read initial CSS value. Best rely on fade-in setting a base scale(1).
               currentTransform = 'scale(1)'; // Fallback if needed, might cause jump
         }

        // Replace existing scale() or add it if missing
        if (currentTransform.includes('scale')) {
            element.style.transform = currentTransform.replace(/scale\([0-9.]+\)/, `scale(${scaleValue})`);
        } else {
            // Append scale if it wasn't there (less likely with our setup)
            element.style.transform = `${currentTransform} scale(${scaleValue})`;
        }
    }


    function resetAnimation() {
        clearTimeout(animationTimeout);
        console.log("Case Study Animation: Resetting...");

        methods.forEach(m => {
            m.classList.remove('active', 'focused');
            m.style.opacity = '0';
             // Rely on CSS for initial transform including scale(0.8) when opacity is 0
             // If issues persist, explicitly set the full initial transform string from CSS here.
             // e.g., m.style.transform = 'translate(-50%, calc(-50% - var(--cs-offset))) scale(0.8)';
         });

        connectors.forEach(c => {
            c.style.opacity = '0';
            c.classList.remove('active');
        });

        magnifier.style.opacity = '0';
        // Reset magnifier completely, position doesn't matter when opacity is 0
        magnifier.style.transform = 'translate(-50%, -50%) scale(0.8) rotate(0deg)';
        magnifier.style.left = '50%'; // Doesn't hurt to reset base positioning too
        magnifier.style.top = '50%';

        caseElement.classList.remove('final-highlight');
        currentMethodIndex = 0;
    }

    function startCycle() {
        resetAnimation(); // Start clean
        console.log("Case Study Animation: Starting New Cycle");

        // Step 1: Fade in method icons (CSS transition should handle scale from 0.8 to 1)
        let delay = 200;
        methods.forEach((method, index) => {
            setTimeout(() => {
                method.style.opacity = '1';
                 // Ensure base scale(1) is part of transform after fade-in for subsequent manipulations
                // Only needed if reset doesn't properly set the transform that CSS animates from
                //setScaleInTransform(method, 1); // Set scale explicitly to 1 if transition alone isn't working
             }, delay + index * 150);
        });
        delay += methods.length * 150 + 300; // Wait for icons + pause

        // Step 2: Start the focusing sequence
        animationTimeout = setTimeout(focusNextMethod, delay); // Use animationTimeout for cancellability
    }

    function focusNextMethod() {
        if (currentMethodIndex >= methodCount) {
            console.log("Case Study Animation: Focusing Complete -> Final Picture");
            showFinalPicture();
            return;
        }

        const targetMethod = methods[currentMethodIndex];
        if (!targetMethod || !targetMethod.dataset.method) {
             console.error(`Error: Cannot focus method index ${currentMethodIndex}, invalid element or missing data-method.`);
            // Skip to next or stop? Let's try skipping.
            currentMethodIndex++;
             animationTimeout = setTimeout(focusNextMethod, 100); // Quickly try next
            return;
         }

        const connectorId = `cs-connector-${targetMethod.dataset.method}`;
        const connector = document.getElementById(connectorId); // Get specific connector by ID


        // --- Remove focus from previously focused elements ---
        methods.forEach(m => {
             if(m !== targetMethod) { // Don't remove focus class from the target yet
                 m.classList.remove('focused');
                 setScaleInTransform(m, 1.0); // Explicitly reset scale of OTHERS to 1.0
            }
         });
        connectors.forEach(c => {
             if(c !== connector) { // Don't deactivate target connector yet
                 c.classList.remove('active');
                 // Resetting connector opacity might be too flashy, let CSS handle fade out?
                 // c.style.opacity = '0'; // Optionally hide inactive ones faster
             }
        });
        //--- End Remove Previous Focus ---


        console.log(`Case Study Animation: Focusing method ${currentMethodIndex + 1}/${methodCount} (${targetMethod.dataset.method})`);

        // Calculate target position for magnifier CENTERED on the icon
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetMethod.getBoundingClientRect();
        const targetX = targetRect.left - containerRect.left + targetRect.width / 2;
        const targetY = targetRect.top - containerRect.top + targetRect.height / 2;

        // Move Magnifier: Update position, ensure opacity 1, apply scale/rotate transform
        magnifier.style.left = `${targetX}px`;
        magnifier.style.top = `${targetY}px`;
        magnifier.style.opacity = '1';
        magnifier.style.transform = 'translate(-50%, -50%) scale(1.2) rotate(-15deg)'; // translate(-50%,-50%) keeps it centered on the coords

        // Schedule highlighting after magnifier's CSS transition (approx 500ms)
        clearTimeout(animationTimeout); // Clear previous focus timer
        animationTimeout = setTimeout(() => {
            if (!targetMethod || !connector) {
                 console.warn(`WARN: Target method or connector for ${targetMethod?.dataset.method} lost during transition.`);
                // Optionally attempt recovery or proceed carefully
            } else {
                targetMethod.classList.add('focused');
                setScaleInTransform(targetMethod, 1.15); // Explicitly make focused icon larger

                 if (connector) { // Check again inside timeout
                    connector.classList.add('active');
                    connector.style.opacity = '1'; // Make connector fully opaque when active
                 } else {
                     console.warn(`WARN: Connector ${connectorId} not found or lost when highlighting.`);
                 }
            }

            // Schedule next focus step
            currentMethodIndex++;
            clearTimeout(animationTimeout); // Clear highlight timer before setting next focus timer
            animationTimeout = setTimeout(focusNextMethod, 1400); // Time until next focus move

        }, 500); // Wait for magnifier move
    }

    function showFinalPicture() {
        console.log("Case Study Animation: Showing Final Picture");

        // Fade out magnifier and reset its transform for next cycle start
        magnifier.style.opacity = '0';
        magnifier.style.transform = 'translate(-50%, -50%) scale(0.8) rotate(0deg)';

        // Highlight all methods and connectors, ensure scale is reset
        methods.forEach(m => {
            m.classList.remove('focused'); // Remove specific focus style
            m.classList.add('active');      // Apply general final active style
            setScaleInTransform(m, 1.0);  // Ensure all are back to normal scale
        });

        connectors.forEach(c => {
            c.classList.add('active');
            c.style.opacity = '0.8'; // Final state slightly transparent connectors
        });

        caseElement.classList.add('final-highlight');

        // Schedule restart
        clearTimeout(animationTimeout); // Clear previous focus timer
        animationTimeout = setTimeout(startCycle, 2500); // Pause on final picture
    }


    // --- Start Animation ---
    startCycle(); // Initiate the first cycle

    // Optional: Add a mechanism to pause/resume on hover if desired
     container.addEventListener('mouseenter', () => {
         console.log("Animation paused on hover");
         clearTimeout(animationTimeout); // Pause the timer
     });
      container.addEventListener('mouseleave', () => {
         console.log("Animation resumed on leave");
          // Simple resume: just schedule the next step (either focusNextMethod or showFinalPicture)
         // based on currentMethodIndex, might need smarter state tracking for perfect resume.
         // For this demo, restarting the current focus or starting next cycle is ok.
         clearTimeout(animationTimeout);
         if (currentMethodIndex >= methodCount) {
             // If it was about to show final or was showing final
              animationTimeout = setTimeout(startCycle, 500); // Restart soon
          } else {
              // If it was in the middle of focusing
             animationTimeout = setTimeout(focusNextMethod, 500); // Resume focusing soon
         }
      });

});