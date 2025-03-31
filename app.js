document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const decisionInput = document.getElementById('decision-input');
    const drivingForceInput = document.getElementById('driving-force-input');
    const drivingForceScore = document.getElementById('driving-force-score');
    const addDrivingForceBtn = document.getElementById('add-driving-force');
    const drivingForcesList = document.getElementById('driving-forces-list');
    
    const restrainingForceInput = document.getElementById('restraining-force-input');
    const restrainingForceScore = document.getElementById('restraining-force-score');
    const addRestrainingForceBtn = document.getElementById('add-restraining-force');
    const restrainingForcesList = document.getElementById('restraining-forces-list');
    
    const drivingScoreEl = document.getElementById('driving-score');
    const restrainingScoreEl = document.getElementById('restraining-score');
    const netScoreEl = document.getElementById('net-score');
    
    const visualizationEl = document.getElementById('visualization');
    
    const saveBtn = document.getElementById('save-btn');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const analysisNameInput = document.getElementById('analysis-name');
    const confirmSaveBtn = document.getElementById('confirm-save');
    
    // State
    let drivingForces = [];
    let restrainingForces = [];
    let savedAnalyses = JSON.parse(localStorage.getItem('forceFieldAnalyses')) || [];
    
    // Initialize
    initializeApp();
    
    // Event Listeners
    addDrivingForceBtn.addEventListener('click', addDrivingForce);
    addRestrainingForceBtn.addEventListener('click', addRestrainingForce);
    
    drivingForceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addDrivingForce();
    });
    
    restrainingForceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addRestrainingForce();
    });
    
    saveBtn.addEventListener('click', openSaveModal);
    closeModal.addEventListener('click', closeModalHandler);
    confirmSaveBtn.addEventListener('click', saveAnalysis);
    
    exportBtn.addEventListener('click', exportToPDF);
    clearBtn.addEventListener('click', clearAnalysis);
    
    // Functions
    function initializeApp() {
        // Create visualization elements
        const centerLine = document.createElement('div');
        centerLine.className = 'center-line';
        
        const drivingBar = document.createElement('div');
        drivingBar.className = 'visualization-bar driving-bar';
        
        const restrainingBar = document.createElement('div');
        restrainingBar.className = 'visualization-bar restraining-bar';
        
        visualizationEl.appendChild(centerLine);
        visualizationEl.appendChild(drivingBar);
        visualizationEl.appendChild(restrainingBar);
        
        // Load from localStorage if available
        const savedState = localStorage.getItem('currentForceFieldAnalysis');
        if (savedState) {
            const state = JSON.parse(savedState);
            decisionInput.value = state.decision;
            drivingForces = state.drivingForces;
            restrainingForces = state.restrainingForces;
            
            renderForcesList();
            updateScores();
            updateVisualization();
        }
    }
    
    function addDrivingForce() {
        const text = drivingForceInput.value.trim();
        const score = parseInt(drivingForceScore.value);
        
        if (text) {
            drivingForces.push({
                id: Date.now(),
                text,
                score
            });
            
            drivingForceInput.value = '';
            renderDrivingForces();
            updateScores();
            updateVisualization();
            saveToLocalStorage();
        }
    }
    
    function addRestrainingForce() {
        const text = restrainingForceInput.value.trim();
        const score = parseInt(restrainingForceScore.value);
        
        if (text) {
            restrainingForces.push({
                id: Date.now(),
                text,
                score
            });
            
            restrainingForceInput.value = '';
            renderRestrainingForces();
            updateScores();
            updateVisualization();
            saveToLocalStorage();
        }
    }
    
    function renderForcesList() {
        renderDrivingForces();
        renderRestrainingForces();
    }
    
    function renderDrivingForces() {
        drivingForcesList.innerHTML = '';
        
        drivingForces.forEach(force => {
            const forceItem = document.createElement('div');
            forceItem.className = 'force-item';
            forceItem.innerHTML = `
                <div class="force-text">${force.text}</div>
                <div class="force-strength">${force.score}</div>
                <div class="force-actions">
                    <button class="edit-btn" data-id="${force.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${force.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            drivingForcesList.appendChild(forceItem);
            
            // Add event listeners to buttons
            const editBtn = forceItem.querySelector('.edit-btn');
            const deleteBtn = forceItem.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => editForce('driving', force.id));
            deleteBtn.addEventListener('click', () => deleteForce('driving', force.id));
        });
    }
    
    function renderRestrainingForces() {
        restrainingForcesList.innerHTML = '';
        
        restrainingForces.forEach(force => {
            const forceItem = document.createElement('div');
            forceItem.className = 'force-item';
            forceItem.innerHTML = `
                <div class="force-text">${force.text}</div>
                <div class="force-strength">${force.score}</div>
                <div class="force-actions">
                    <button class="edit-btn" data-id="${force.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${force.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            restrainingForcesList.appendChild(forceItem);
            
            // Add event listeners to buttons
            const editBtn = forceItem.querySelector('.edit-btn');
            const deleteBtn = forceItem.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => editForce('restraining', force.id));
            deleteBtn.addEventListener('click', () => deleteForce('restraining', force.id));
        });
    }
    
    function editForce(type, id) {
        const forces = type === 'driving' ? drivingForces : restrainingForces;
        const force = forces.find(f => f.id === id);
        
        if (force) {
            const newText = prompt('Edit force:', force.text);
            if (newText !== null) {
                const newScore = parseInt(prompt('Edit strength (1-5):', force.score));
                
                if (!isNaN(newScore) && newScore >= 1 && newScore <= 5) {
                    force.text = newText;
                    force.score = newScore;
                    
                    renderForcesList();
                    updateScores();
                    updateVisualization();
                    saveToLocalStorage();
                }
            }
        }
    }
    
    function deleteForce(type, id) {
        if (confirm('Are you sure you want to delete this force?')) {
            if (type === 'driving') {
                drivingForces = drivingForces.filter(force => force.id !== id);
                renderDrivingForces();
            } else {
                restrainingForces = restrainingForces.filter(force => force.id !== id);
                renderRestrainingForces();
            }
            
            updateScores();
            updateVisualization();
            saveToLocalStorage();
        }
    }
    
    function updateScores() {
        const drivingScore = drivingForces.reduce((sum, force) => sum + force.score, 0);
        const restrainingScore = restrainingForces.reduce((sum, force) => sum + force.score, 0);
        const netScore = drivingScore - restrainingScore;
        
        drivingScoreEl.textContent = drivingScore;
        restrainingScoreEl.textContent = restrainingScore;
        netScoreEl.textContent = netScore;
        
        // Change net score color based on value
        if (netScore > 0) {
            netScoreEl.style.color = 'white';
            document.querySelector('.result').style.backgroundColor = 'var(--driving-color)';
        } else if (netScore < 0) {
            netScoreEl.style.color = 'white';
            document.querySelector('.result').style.backgroundColor = 'var(--restraining-color)';
        } else {
            netScoreEl.style.color = 'white';
            document.querySelector('.result').style.backgroundColor = 'var(--primary-light)';
        }
    }
    
    function updateVisualization() {
        const drivingScore = drivingForces.reduce((sum, force) => sum + force.score, 0);
        const restrainingScore = restrainingForces.reduce((sum, force) => sum + force.score, 0);
        
        const totalScore = drivingScore + restrainingScore;
        
        if (totalScore > 0) {
            const drivingPercentage = (drivingScore / totalScore) * 100;
            const restrainingPercentage = (restrainingScore / totalScore) * 100;
            
            const drivingBar = visualizationEl.querySelector('.driving-bar');
            const restrainingBar = visualizationEl.querySelector('.restraining-bar');
            
            drivingBar.style.width = `${drivingPercentage}%`;
            restrainingBar.style.width = `${restrainingPercentage}%`;
        } else {
            // If no forces, set both bars to 0
            const drivingBar = visualizationEl.querySelector('.driving-bar');
            const restrainingBar = visualizationEl.querySelector('.restraining-bar');
            
            drivingBar.style.width = '0%';
            restrainingBar.style.width = '0%';
        }
    }
    
    function saveToLocalStorage() {
        const state = {
            decision: decisionInput.value,
            drivingForces,
            restrainingForces
        };
        
        localStorage.setItem('currentForceFieldAnalysis', JSON.stringify(state));
    }
    
    function openSaveModal() {
        if (!decisionInput.value.trim()) {
            alert('Please enter a decision or change to analyze before saving.');
            return;
        }
        
        analysisNameInput.value = decisionInput.value;
        modal.style.display = 'block';
    }
    
    function closeModalHandler() {
        modal.style.display = 'none';
    }
    
    function saveAnalysis() {
        const name = analysisNameInput.value.trim();
        
        if (!name) {
            alert('Please enter a name for your analysis.');
            return;
        }
        
        const analysis = {
            id: Date.now(),
            name,
            decision: decisionInput.value,
            drivingForces,
            restrainingForces,
            date: new Date().toISOString()
        };
        
        savedAnalyses.push(analysis);
        localStorage.setItem('forceFieldAnalyses', JSON.stringify(savedAnalyses));
        
        modal.style.display = 'none';
        alert('Analysis saved successfully!');
    }
    
    function exportToPDF() {
        if (!decisionInput.value.trim()) {
            alert('Please enter a decision or change to analyze before exporting.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Force Field Analysis', 105, 15, { align: 'center' });
        
        // Add decision
        doc.setFontSize(14);
        doc.text('Decision: ' + decisionInput.value, 20, 30);
        
        // Add date
        const date = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.text('Generated on: ' + date, 20, 40);
        
        // Add driving forces
        doc.setFontSize(14);
        doc.text('Driving Forces', 20, 55);
        
        let yPos = 65;
        drivingForces.forEach((force, index) => {
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${force.text} (Strength: ${force.score})`, 25, yPos);
            yPos += 10;
        });
        
        // Add restraining forces
        yPos += 10;
        doc.setFontSize(14);
        doc.text('Restraining Forces', 20, yPos);
        
        yPos += 10;
        restrainingForces.forEach((force, index) => {
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${force.text} (Strength: ${force.score})`, 25, yPos);
            yPos += 10;
        });
        
        // Add scores
        yPos += 10;
        const drivingScore = drivingForces.reduce((sum, force) => sum + force.score, 0);
        const restrainingScore = restrainingForces.reduce((sum, force) => sum + force.score, 0);
        const netScore = drivingScore - restrainingScore;
        
        doc.setFontSize(14);
        doc.text('Summary', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(12);
        doc.text(`Total Driving Force: ${drivingScore}`, 25, yPos);
        
        yPos += 10;
        doc.text(`Total Restraining Force: ${restrainingScore}`, 25, yPos);
        
        yPos += 10;
        doc.text(`Net Force: ${netScore}`, 25, yPos);
        
        // Save the PDF
        doc.save('force-field-analysis.pdf');
    }
    
    function clearAnalysis() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            decisionInput.value = '';
            drivingForces = [];
            restrainingForces = [];
            
            renderForcesList();
            updateScores();
            updateVisualization();
            saveToLocalStorage();
        }
    }
    
    // Save changes when decision input changes
    decisionInput.addEventListener('input', saveToLocalStorage);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModalHandler();
        }
    });
});
