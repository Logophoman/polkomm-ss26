document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('inference-visualization');
    if (!container) {
        console.error("Container #inference-visualization not found!");
        return;
    }

    // --- Configuration ---
    const nodeSize = 18; // px
    const layerSpacing = 100; // Horizontal space between layers
    const nodeSpacing = 30; // Vertical space between nodes in a layer
    const inputAreaWidth = 80;
    const outputAreaWidth = 80;
    const animationStepDuration = 600; // ms per activation step
    const cyclePause = 1500; // ms pause before switching animal
    const animalEmojiSize = '3em';

    // --- Element Creation / Setup ---
    container.innerHTML = ''; // Clear previous content
    container.style.position = 'relative'; // Ensure container is positioning context
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    // Adjust container height if needed based on your CSS or calculated height

    // Create main wrapper for centering content vertically if flexbox isn't enough
    const contentWrapper = document.createElement('div');
    contentWrapper.style.position = 'relative';
    contentWrapper.style.display = 'flex';
    contentWrapper.style.alignItems = 'center'; // Vertically align items in the row
    container.appendChild(contentWrapper);

    // Input Area (Left)
    const inputArea = document.createElement('div');
    inputArea.id = 'inf-input-area';
    inputArea.className = 'inf-area';
    inputArea.style.width = `${inputAreaWidth}px`;
    inputArea.style.marginRight = `${layerSpacing / 3}px`;
    inputArea.style.textAlign = 'center';
    contentWrapper.appendChild(inputArea);

    const magnifyGlass = document.createElement('span');
    magnifyGlass.id = 'inf-magnify';
    magnifyGlass.textContent = '🔍'; // Magnifying glass emoji
    magnifyGlass.style.fontSize = '2.5em';
    magnifyGlass.style.display = 'block';
    magnifyGlass.style.transform = 'scaleX(-1) rotate(-25deg)'; // Tilt left
    inputArea.appendChild(magnifyGlass);

    const emojiHolder = document.createElement('span');
    emojiHolder.id = 'inf-emoji';
    emojiHolder.style.fontSize = animalEmojiSize;
    emojiHolder.style.position = 'absolute';
    emojiHolder.style.display = 'block';
     emojiHolder.style.top = '70px'; // Position below magnifying glass initially
     emojiHolder.style.left = '-60px'; // Relative to inputArea
     emojiHolder.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s';
     emojiHolder.style.opacity = '0'; // Start hidden
     emojiHolder.style.zIndex = '1';
     inputArea.appendChild(emojiHolder);

     // Arrow (Input -> Layer 1)
    const arrow1 = document.createElement('div');
    arrow1.className = 'inf-arrow';
    arrow1.innerHTML = '→';
    contentWrapper.appendChild(arrow1);


    // Network Layers Container (Needed for SVG overlay)
    const networkContainer = document.createElement('div');
    networkContainer.style.position = 'relative'; // Crucial for SVG overlay
    contentWrapper.appendChild(networkContainer);

    // SVG Canvas for Edges
    const svgCanvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgCanvas.id = 'inf-svg-canvas';
    svgCanvas.style.position = 'absolute';
    svgCanvas.style.top = '0';
    svgCanvas.style.left = '0';
    svgCanvas.style.width = '100%';
    svgCanvas.style.height = '100%';
    svgCanvas.style.pointerEvents = 'none'; // Allow clicks through SVG
    svgCanvas.style.zIndex = '5'; // Draw edges above nodes background, below interaction layer if any
    networkContainer.appendChild(svgCanvas);

    // Create Layers and Nodes
    const layers = [];
    const nodeElements = [];
    const layerConfigs = [
        { id: 'input', nodes: 3 },
        { id: 'hidden1', nodes: 4 },
        { id: 'hidden2', nodes: 4 },
    ];

    let currentLeft = 0; // Start position for layers inside networkContainer

    layerConfigs.forEach((config, layerIndex) => {
        const layerDiv = document.createElement('div');
        layerDiv.id = `inf-layer-${config.id}`;
        layerDiv.className = 'inf-layer';
        layerDiv.style.position = 'absolute';
        layerDiv.style.left = `${currentLeft}px`;
         // Vertical centering logic for the layer div itself
         const layerHeight = (config.nodes - 1) * nodeSpacing + nodeSize;
        layerDiv.style.top = `calc(50% - ${layerHeight / 2}px)`;
        layerDiv.style.width = `${nodeSize}px`; // Layers are just as wide as a node
        layerDiv.style.height = `${layerHeight}px`;

        networkContainer.appendChild(layerDiv);
        layers.push(layerDiv);
        nodeElements[layerIndex] = [];

        for (let i = 0; i < config.nodes; i++) {
            const nodeDiv = document.createElement('div');
            nodeDiv.id = `inf-node-${config.id}-${i}`;
            nodeDiv.className = 'inf-node';
            nodeDiv.style.position = 'absolute';
            nodeDiv.style.top = `${i * nodeSpacing}px`;
            nodeDiv.style.left = `0px`; // Nodes align vertically in layer div
             nodeDiv.style.width = `${nodeSize}px`;
             nodeDiv.style.height = `${nodeSize}px`;
            layerDiv.appendChild(nodeDiv);
            nodeElements[layerIndex].push(nodeDiv);
        }
        // Move to the next layer position
        currentLeft += nodeSize + layerSpacing; // Add node width + spacing
    });

    // Set network container width based on content
     const networkWidth = currentLeft - layerSpacing; // Total width used by layers
     networkContainer.style.width = `${networkWidth}px`;
     // Estimate height needed for network based on max nodes in a layer
     const maxNodes = Math.max(...layerConfigs.map(l => l.nodes));
     const networkHeight = (maxNodes -1) * nodeSpacing + nodeSize + 20; // Add some padding
     networkContainer.style.height = `${networkHeight}px`;

     // Arrow (Layer Last -> Output)
     const arrow2 = document.createElement('div');
     arrow2.className = 'inf-arrow';
     arrow2.innerHTML = '→';
     contentWrapper.appendChild(arrow2);


    // Output Area (Right)
    const outputArea = document.createElement('div');
    outputArea.id = 'inf-output-area';
    outputArea.className = 'inf-area';
    outputArea.style.width = `${outputAreaWidth}px`;
    outputArea.style.marginLeft = `${layerSpacing / 3}px`;
    contentWrapper.appendChild(outputArea);

    const outputCat = document.createElement('div');
    outputCat.id = 'inf-output-cat';
    outputCat.className = 'inf-output-label';
    outputCat.innerHTML = 'Katze 🐈';
    outputArea.appendChild(outputCat);

    const outputDog = document.createElement('div');
    outputDog.id = 'inf-output-dog';
    outputDog.className = 'inf-output-label';
    outputDog.innerHTML = 'Hund 🐕';
    outputArea.appendChild(outputDog);

    // --- Edge Drawing Logic ---
    const edges = [];
     function drawEdges() {
         svgCanvas.innerHTML = ''; // Clear existing edges
         edges.length = 0; // Clear edge array

         if (nodeElements.length < 2) return; // Need at least two layers

         for (let layerIdx = 0; layerIdx < nodeElements.length - 1; layerIdx++) {
             const fromLayerNodes = nodeElements[layerIdx];
             const toLayerNodes = nodeElements[layerIdx + 1];

             // Get the offset of the layers relative to the network container
             const fromLayerLeftOffset = layers[layerIdx].offsetLeft;
             const toLayerLeftOffset = layers[layerIdx + 1].offsetLeft;
             const fromLayerTopOffset = layers[layerIdx].offsetTop;
              const toLayerTopOffset = layers[layerIdx + 1].offsetTop;


             fromLayerNodes.forEach((fromNode, fromIdx) => {
                 toLayerNodes.forEach((toNode, toIdx) => {
                     const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

                     // Calculate center points of nodes relative to svgCanvas (which covers networkContainer)
                     const x1 = fromLayerLeftOffset + fromNode.offsetLeft + nodeSize / 2;
                     const y1 = fromLayerTopOffset + fromNode.offsetTop + nodeSize / 2;
                     const x2 = toLayerLeftOffset + toNode.offsetLeft + nodeSize / 2;
                     const y2 = toLayerTopOffset + toNode.offsetTop + nodeSize / 2;

                     line.setAttribute('x1', x1);
                     line.setAttribute('y1', y1);
                     line.setAttribute('x2', x2);
                     line.setAttribute('y2', y2);
                     line.setAttribute('stroke', '#ddd'); // Default edge color
                     line.setAttribute('stroke-width', '1.5');
                     line.classList.add('inf-edge');
                     // Add unique ID for potential individual control (though we activate by layer here)
                     line.id = `inf-edge-${layerIdx}_${fromIdx}-${layerIdx + 1}_${toIdx}`;

                     svgCanvas.appendChild(line);
                     edges.push(line); // Store reference if needed, currently unused for group activation
                 });
             });
         }
     }

     // Draw edges initially (call after calculating layer positions)
    setTimeout(drawEdges, 50); // Timeout needed to allow DOM rendering for offset calculation

    // --- Animation Logic ---
    let currentAnimal = 'cat'; // Start with cat
    let animationTimeout;

     function resetActivation() {
          nodeElements.flat().forEach(node => node.classList.remove('active'));
          svgCanvas.querySelectorAll('.inf-edge').forEach(edge => edge.classList.remove('active'));
         outputCat.classList.remove('active');
         outputDog.classList.remove('active');
         emojiHolder.style.opacity = '0';
          emojiHolder.style.transform = 'translateY(0px)'; // Reset fly animation
      }

    function runAnimationCycle(animalType) {
        resetActivation();
        // 1. Set Input Emoji & Prepare Fly-in
        emojiHolder.textContent = (animalType === 'cat') ? '🐈' : '🐕';
        emojiHolder.style.opacity = '1';
         // Calculate fly target (approx middle of first layer nodes)
         const targetX = layers[0].offsetLeft + networkContainer.offsetLeft + contentWrapper.offsetLeft + (nodeSize / 2) - (inputAreaWidth / 2) - 10; // Adjust as needed
         const targetY = -40; // Fly upwards towards layer vertical center relative to input pos
        emojiHolder.style.transform = `translate(${targetX}px, ${targetY}px)`;

        let delay = 500; // Start after fly animation duration

        // 2. Activate Input Layer Nodes
         setTimeout(() => {
              nodeElements[0].forEach(node => node.classList.add('active'));
              emojiHolder.style.opacity = '0'; // Hide emoji after "delivery"
          }, delay);
          delay += animationStepDuration;

          // 3. Activate Edges (Input -> H1) and H1 Nodes
         setTimeout(() => {
             // Activate relevant edges
              svgCanvas.querySelectorAll('[id^="inf-edge-0"]').forEach(edge => edge.classList.add('active'));
              // Activate next layer nodes
              nodeElements[1].forEach(node => node.classList.add('active'));
              // Deactivate previous layer nodes
              nodeElements[0].forEach(node => node.classList.remove('active'));
         }, delay);
          delay += animationStepDuration;

        // 4. Activate Edges (H1 -> H2) and H2 Nodes
         setTimeout(() => {
             // Deactivate previous edges
             svgCanvas.querySelectorAll('[id^="inf-edge-0"]').forEach(edge => edge.classList.remove('active'));
              // Activate relevant edges
              svgCanvas.querySelectorAll('[id^="inf-edge-1"]').forEach(edge => edge.classList.add('active'));
             // Activate next layer nodes
             nodeElements[2].forEach(node => node.classList.add('active'));
              // Deactivate previous layer nodes
              nodeElements[1].forEach(node => node.classList.remove('active'));
         }, delay);
         delay += animationStepDuration;

          // 5. Activate Edges (H2 -> Output) and Output Label
         setTimeout(() => {
              // Deactivate previous edges
             svgCanvas.querySelectorAll('[id^="inf-edge-1"]').forEach(edge => edge.classList.remove('active'));
             // Activate relevant edges - visually represent connection to final choice
              svgCanvas.querySelectorAll('[id^="inf-edge-2"]').forEach(edge => edge.classList.add('active')); // All edges active leading to output space
              // Deactivate previous layer nodes
              nodeElements[2].forEach(node => node.classList.remove('active'));

             // Activate the correct output label
             if (animalType === 'cat') {
                 outputCat.classList.add('active');
              } else {
                 outputDog.classList.add('active');
              }
          }, delay);
          delay += animationStepDuration;


          // 6. Schedule next cycle
         setTimeout(() => {
              // Deactivate last edges
              svgCanvas.querySelectorAll('[id^="inf-edge-2"]').forEach(edge => edge.classList.remove('active'));

              const nextAnimal = (animalType === 'cat') ? 'dog' : 'cat';
              animationTimeout = setTimeout(() => runAnimationCycle(nextAnimal), 100); // Short delay before starting next
          }, delay + cyclePause); // Wait before switching
      }

    // Start the animation
     runAnimationCycle(currentAnimal);

    // Redraw edges if window resizes (simple implementation, might need debounce)
    window.addEventListener('resize', () => {
         // Recalculating all positions would be more robust, but redrawing edges is a start
        drawEdges();
     });

});