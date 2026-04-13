document.addEventListener('DOMContentLoaded', function () {
    // 1. Definiere Knoten (Nodes) - nur IDs, keine Labels
    const nodes = new vis.DataSet([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
        { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 },
        { id: 11 }, { id: 12 } // Beispiel: 12 Knoten
    ]);

    // 2. Definiere Kanten (Edges) - Verbindungen zwischen Knoten
    const edges = new vis.DataSet([
        { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4 },
        { from: 2, to: 5 }, { from: 2, to: 6 },
        { from: 3, to: 7 },
        { from: 4, to: 8 }, { from: 4, to: 9 },
        { from: 5, to: 10 }, { from: 5, to: 11 },
        { from: 6, to: 11 }, { from: 6, to: 12 },
        { from: 7, to: 12 },
        { from: 8, to: 11 },
        { from: 9, to: 10 },
        { from: 10, to: 12 } // Beispiel-Verbindungen
    ]);

    // 3. Wähle den Container im HTML
    const container = document.getElementById('network-visualization');

    // 4. Sammle Daten für das Netzwerk
    const data = {
        nodes: nodes,
        edges: edges
    };

    // 5. Definiere Optionen für die Darstellung und Animation
    const options = {
        nodes: {
            shape: 'dot', // Knoten als Punkte
            size: 12,      // Größe der Punkte
            color: {
                background: '#003366', // Primärfarbe aus CSS
                border: '#001a33',
                highlight: { // Farbe beim Hover/Klick
                    background: '#e8491d', // Akzentfarbe aus CSS
                    border: '#d73a0a'
                }
            },
            font: {
                size: 0 // Versteckt effektiv alle Labels
            }
        },
        edges: {
            width: 1, // Dünne Linien
            color: '#cccccc', // Helles Grau für Kanten
            smooth: { // Rundet Kanten leicht ab
                enabled: true,
                type: "continuous"
            }
        },
        physics: {
            enabled: true, // Aktiviere Physik-Engine für Bewegung
            solver: 'barnesHut', // Ein gängiger Solver für Netzwerklayouts
            barnesHut: {
                gravitationalConstant: -2500, // Wie stark sich Knoten abstoßen
                centralGravity: 0.1,        // Leichte Anziehung zum Zentrum
                springLength: 95,           // Ideale Kantenlänge
                springConstant: 0.04,       // Steifigkeit der Kanten-"Federn"
                damping: 0.15               // Dämpfungsfaktor, reduziert Oszillation
            },
            // Reduziert die Anzahl der Initialisierungsiterationen,
            // damit es schneller "lebendig" wird, aber nicht sofort einfriert
            stabilization: {
                iterations: 150
             }
        },
        interaction: {
            dragNodes: true, // Erlaube das Ziehen von Knoten
            dragView: true,  // Erlaube das Verschieben der Ansicht
            zoomView: true   // Erlaube das Zoomen
        }
    };

    // 6. Erzeuge das Netzwerk
    const network = new vis.Network(container, data, options);

    // Optional: Stoppe die Physik nach einer Weile, wenn die Bewegung zu viel wird
    // setTimeout(() => {
    //     network.setOptions({ physics: false });
    // }, 15000); // Stoppt nach 15 Sekunden

});