document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('api-visualization');
    if (!container) {
        console.error("API container #api-visualization not found!");
        return;
    }

    // --- Get Elements ---
    const client = container.querySelector('#api-client');
    const platform = container.querySelector('#api-platform');
    const requestBubble = container.querySelector('#api-request-bubble');
    const responseBubble = container.querySelector('#api-response-bubble');
    const reqArrow = container.querySelector('#api-request-arrow');
    const resArrow = container.querySelector('#api-response-arrow');
    const statusText = container.querySelector('#api-status');

    if (!client || !platform || !requestBubble || !responseBubble || !reqArrow || !resArrow || !statusText) {
        console.error("Required elements for API animation missing.");
        return;
    }

    // Platforms and example requests/responses
    const platforms = [
        { name: 'Twitter/X', icon: '🐦', color: '#1DA1F2', req: 'GET /tweets?q=politik&lang=de', res: '[{"id": "...", "text": "...", ...}]' },
        { name: 'Reddit', icon: '🤖', color: '#FF4500', req: 'GET /r/de/search?q=bundestag', res: '{"kind": "Listing", "data": {...}}' },
        { name: 'YouTube', icon: '▶️', color: '#FF0000', req: 'GET /search?part=snippet&q=regierung', res: '{"items": [{"snippet": {...}}, ...]}' },
        // Add more platforms if desired
    ];
    let currentPlatformIndex = 0;
    let animationTimeout;


    // --- Functions ---
    function resetAnimation() {
        clearTimeout(animationTimeout);
        container.classList.remove('requesting', 'processing', 'responding', 'finished');
        requestBubble.style.opacity = '0';
        responseBubble.style.opacity = '0';
        reqArrow.classList.remove('active');
        resArrow.classList.remove('active');
        platform.classList.remove('processing'); // Remove pulse effect
        // Reset bubble positions (optional, CSS handles initial)
        console.log("API Animation Reset");
    }

    function runApiCycle() {
        resetAnimation();
        const currentPlatform = platforms[currentPlatformIndex];
        console.log(`API Animation: Starting cycle for ${currentPlatform.name}`);

        // 1. Setup Platform Info
        platform.querySelector('.api-platform-icon').textContent = currentPlatform.icon;
        platform.style.borderColor = currentPlatform.color;
        // Display request more clearly
        let reqText = currentPlatform.req.replace("GET ", ""); // Remove GET prefix for display
        requestBubble.querySelector('code').innerHTML = `Endpoint: ${reqText.split('?')[0]}<br>Params: ${reqText.split('?')[1] || '(none)'}`;
        // Shorten response preview
        let resText = currentPlatform.res;
        responseBubble.querySelector('code').textContent = resText.length > 50 ? resText.substring(0, 47) + '...]' : resText;

        // Increase animation phase durations for slower travel
        const reqTravelTime = 2500; // ms (was 1500)
        const processingTime = 1500; // ms (was 1000)
        const resTravelTime = 2500; // ms (was 1500)
        const finishPause = 3500; // ms (was 3000)

        // 2. Initiate Request State
        statusText.textContent = `Sende Anfrage an ${currentPlatform.name} API...`;
        container.classList.add('requesting');
        requestBubble.style.opacity = '1';
        requestBubble.style.transform = 'translateX(0)'; // Ensure starts at base position
        responseBubble.style.transform = 'translateX(0)'; // Ensure response starts at base position
        reqArrow.classList.add('active');


        // 3. Simulate Processing (after request 'arrives')
        // Use transitionend event for more accurate timing (fallback to timeout)
        let reqBubbleMoved = false;
        const reqEndHandler = (event) => {
            if (event.propertyName === 'transform' && !reqBubbleMoved) {
                reqBubbleMoved = true;
                console.log("Request Bubble transition finished.");
                statusText.textContent = `API verarbeitet Anfrage...`;
                container.classList.remove('requesting');
                container.classList.add('processing');
                platform.classList.add('processing');
                // Hide request elements smoothly after arrival
                requestBubble.style.opacity = '0';
                reqArrow.classList.remove('active'); // Remove arrow earlier

                animationTimeout = setTimeout(startResponsePhase, processingTime); // Start response phase after processing delay
                requestBubble.removeEventListener('transitionend', reqEndHandler); // Clean up listener
            }
        };
        requestBubble.addEventListener('transitionend', reqEndHandler);
        // Fallback timeout if transitionend doesn't fire reliably
        animationTimeout = setTimeout(() => {
            if (!reqBubbleMoved) {
                console.warn("TransitionEnd fallback triggered for request bubble.");
                reqEndHandler({ propertyName: 'transform' }); // Manually trigger
            }
        }, reqTravelTime + 100); // Travel time + buffer


        // Function to handle the response part of the cycle
        function startResponsePhase() {
            statusText.textContent = `Empfange strukturierte Daten (JSON)...`;
            platform.classList.remove('processing');
            container.classList.remove('processing');
            container.classList.add('responding');
            responseBubble.style.opacity = '1';
            resArrow.classList.add('active');

            // Use transitionend for response bubble arrival
            let resBubbleMoved = false;
            const resEndHandler = (event) => {
                if (event.propertyName === 'transform' && !resBubbleMoved) {
                    resBubbleMoved = true;
                    console.log("Response Bubble transition finished.");
                    statusText.textContent = `Daten erfolgreich empfangen! Bereit für Analyse.`;
                    container.classList.remove('responding');
                    container.classList.add('finished');
                    // Optionally fade out response after arrival
                    // setTimeout(() => { responseBubble.style.opacity = '0'; resArrow.classList.remove('active'); }, 1000);

                    currentPlatformIndex = (currentPlatformIndex + 1) % platforms.length;
                    animationTimeout = setTimeout(runApiCycle, finishPause); // Pause before next cycle
                    responseBubble.removeEventListener('transitionend', resEndHandler); // Clean up
                }
            };
            responseBubble.addEventListener('transitionend', resEndHandler);
            // Fallback timeout
            animationTimeout = setTimeout(() => {
                if (!resBubbleMoved) {
                    console.warn("TransitionEnd fallback triggered for response bubble.");
                    resEndHandler({ propertyName: 'transform' }); // Manually trigger
                }
            }, resTravelTime + 100);
        }


        // Trigger the request bubble move slightly after initial setup
        setTimeout(() => {
            // Trigger request bubble move - This actually starts the visual transition
            if (container.classList.contains('requesting')) { // Only trigger if still in requesting state
                // JS sets the class which CSS uses to trigger the transform change
                // The transform value itself is set in CSS based on the class.
                console.log("Triggering Request Bubble Move via Class 'requesting'.");
                // Ensure CSS transition is ready - might need requestAnimationFrame if initial setup is complex
            }
        }, 50); // Short delay to allow initial styles to apply

    } // End runApiCycle function definition

    // Start the initial cycle
    console.log("API Animation Ready.");
    runApiCycle();

    // Optional: Pause on hover logic remains the same...
    container.addEventListener('mouseenter', () => { clearTimeout(animationTimeout); console.log("API Animation Paused"); });
    container.addEventListener('mouseleave', () => { clearTimeout(animationTimeout); animationTimeout = setTimeout(runApiCycle, 500); console.log("API Animation Resumed"); });

    // --- Start ---
    console.log("API Animation Ready.");
    runApiCycle(); // Start the first cycle

    // Optional: Pause on hover
    container.addEventListener('mouseenter', () => { clearTimeout(animationTimeout); console.log("API Animation Paused"); });
    container.addEventListener('mouseleave', () => { clearTimeout(animationTimeout); animationTimeout = setTimeout(runApiCycle, 500); console.log("API Animation Resumed"); });


});