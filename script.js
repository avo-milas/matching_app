let cachedResults = null;
let cachedPreferences = null;
let pairsCnt = 0;
let menNames = new Set();
let womenNames = new Set();
let menIndToName = {};
let menNameToInd = {};
let womenIndToName = {};
let womenNameToInd = {};
menPhotos = [...Array(10).keys()];
womenPhotos = [...Array(10).keys()];
let nextStepButton = null;
let linesToDelete = new Set();


function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function showInfo() {
    document.getElementById("infoModal").style.display = "block";
}

document.addEventListener('DOMContentLoaded', function() {
    var infoButton = document.getElementById('infoButton');
    setInterval(function() {
        var modal = document.getElementById('infoModal');
        if (!modal.classList.contains('active')) {
            infoButton.classList.add('pulse');
        }
    }, 2000);
});


function closeInfoModal() {
    document.getElementById("infoModal").style.display = "none";
}

function areSetsEqual(set1, set2) {
    if (set1.size !== set2.size) {return false}
    for (const item of set1) {
        if (!set2.has(item)) {return false}
    }
    return true;
}

function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}


// Операции с предпочтениями и именами //

function mapNames() {
    menNames.clear();
    womenNames.clear();

    for (let i = 1; i <= pairsCnt; i++) {
        let manName = document.getElementById(`manName${i}`).value;
        let womanName = document.getElementById(`womanName${i}`).value;

        if (manName !== "") {
            menIndToName[i] = manName;
            menNameToInd[manName] = i;
            menNames.add(manName);
        } else {
            alert('Имена должны быть указаны!');
            return false;
        }

        if (womanName !== "") {
            womenIndToName[i] = womanName;
            womenNameToInd[womanName] = i;
            womenNames.add(womanName);
        } else {
            alert('Имена должны быть указаны!');
            return false;
        }
    }

    if (womenNames.size != pairsCnt || menNames.size != pairsCnt) {
        alert('Имена должны быть уникальными!');
        return false;
    }

    return true;
}


function parsePreferences(input, prefix) {
    let names_prefs = input.split(' ').map(item => item.trim());
    let cur_prefs_names = new Set();

    for (let name of names_prefs) {
        cur_prefs_names.add(name);
    }

    let setNames = (prefix === "man") ? womenNames : menNames;
    let nameToInd = (prefix === "man") ? womenNameToInd : menNameToInd;

    if (!areSetsEqual(cur_prefs_names, setNames)) {
        return false;
    }

    let prefs = names_prefs.map(item => nameToInd[item]);
    return prefs;
}

function getPreferences(prefix) {
    const preferences = {};

    for (let i = 1; i <= pairsCnt; i++) {
        const id = `${prefix}${i}`;
        let f = parsePreferences(document.getElementById(id).value, prefix);
        if (f) { preferences[i] = f }
        else {
            let indToName = (prefix === "man") ? menIndToName : womenIndToName;
            alert(`Предпочтения одной стороны должны быть согласованы с именами другой! Ошибка в предпочтениях ${indToName[i]}`);
            return false;
        }
    }
    return preferences;
}

function checkPreferences(menPrefs, womenPrefs) {
    if (menPrefs == {} || womenPrefs == {}) {
        alert('Предпочтения не должны быть пустыми!');
        return false;
    } else { return true }
}

function checkPreferencesChanged() {
    const menPreferences = getPreferences('man');
    let womenPreferences = {};
    if (menPreferences) {
        womenPreferences = getPreferences('woman');
    }

    if (!(menPreferences && womenPreferences)) {
        return "false preferences";
    }

    if (!cachedPreferences || !isEqual(cachedPreferences.men, menPreferences) || !isEqual(cachedPreferences.women, womenPreferences)) {
        cachedPreferences = { men: menPreferences, women: womenPreferences };
        cachedResults = null;
        return true;
    }
    return false;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function randomizePreferences() {
    clearResults();
    clearConnectionLines();
    mapNames();

    const pairsCount = parseInt(document.getElementById('pairsCount').value);
    if (pairsCount > 0) {

        for (let i = 1; i <= pairsCount; i++) {
            const preferences = [];
            for (let j = 1; j <= pairsCount; j++) {
                preferences.push(`${womenIndToName[j]}`);
            }
            shuffleArray(preferences);
            const input = document.getElementById(`man${i}`);
            input.value = preferences.join(' ');
        }

        for (let i = 1; i <= pairsCount; i++) {
            const preferences = [];
            for (let j = 1; j <= pairsCount; j++) {
                preferences.push(`${menIndToName[j]}`);
            }
            shuffleArray(preferences);
            const input = document.getElementById(`woman${i}`);
            input.value = preferences.join(' ');
        }
    } else {
        alert('Введите число пар больше нуля.');
    }
}


// Отображение результатов //

function createCircleImageElement(src, alt) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.id = alt;
    img.width = 100;
    img.height = 100;
    img.classList.add('glowing-icon');
    return img;
}

function resetAlgorithm() {
    clearResults();
    clearConnectionLines();
    cachedResults = null;

    pairsCnt = parseInt(document.getElementById('pairsCount').value, 10);

    const menPreferencesContainer = document.getElementById('menPreferences');
    const womenPreferencesContainer = document.getElementById('womenPreferences');

    menPreferencesContainer.innerHTML = '';
    womenPreferencesContainer.innerHTML = '';

    menPhotos.sort(() => Math.random() - 0.5);
    womenPhotos.sort(() => Math.random() - 0.5);
    console.log(menPhotos);
    console.log(womenPhotos);

    // заполнение фото
    for (let i = 1; i <= (pairsCnt < 10 ? pairsCnt : 10); i++) {
        const labelMan = document.createElement('label');
        labelMan.htmlFor = `man${i}`;

        const inputManName = document.createElement('input');
        inputManName.type = 'text';
        inputManName.id = `manName${i}`;
        inputManName.placeholder = `name`;
        inputManName.value = `m${i}`;

        const inputManPreferences = document.createElement('input');
        inputManPreferences.type = 'text';
        inputManPreferences.id = `man${i}`;
        inputManPreferences.placeholder = `preferences`;

        // const menCircle = createCircleImageElement('images/boy.png', `M${i}`);
        console.log(i);
        const menCircle = createCircleImageElement(`images/m${menPhotos[i - 1] + 1}.png`, `M${i}`);

        menPreferencesContainer.appendChild(labelMan);
        menPreferencesContainer.appendChild(inputManName);
        menPreferencesContainer.appendChild(inputManPreferences);
        menPreferencesContainer.appendChild(menCircle);

        const labelWoman = document.createElement('label');
        labelWoman.htmlFor = `woman${i}`;
        
        const inputWomanName = document.createElement('input');
        inputWomanName.type = 'text';
        inputWomanName.id = `womanName${i}`;
        inputWomanName.placeholder = `name`;
        inputWomanName.value = `w${i}`;

        const inputWomanPreferences = document.createElement('input');
        inputWomanPreferences.type = 'text';
        inputWomanPreferences.id = `woman${i}`;
        inputWomanPreferences.placeholder = `preferences`;

        // const womenCircle = createCircleImageElement('images/girl.png', `W${i}`);
        const womenCircle = createCircleImageElement(`images/w${womenPhotos[i - 1] + 1}.png`, `W${i}`);

        womenPreferencesContainer.appendChild(labelWoman);
        womenPreferencesContainer.appendChild(inputWomanName);
        womenPreferencesContainer.appendChild(inputWomanPreferences);
        womenPreferencesContainer.appendChild(womenCircle);
    }

    // заполнение обзеличенной иконкой
    for (let i = 11; i <= pairsCnt; i++) {
        const labelMan = document.createElement('label');
        labelMan.htmlFor = `man${i}`;

        const inputManName = document.createElement('input');
        inputManName.type = 'text';
        inputManName.id = `manName${i}`;
        inputManName.placeholder = `name`;
        inputManName.value = `m${i}`;

        const inputManPreferences = document.createElement('input');
        inputManPreferences.type = 'text';
        inputManPreferences.id = `man${i}`;
        inputManPreferences.placeholder = `preferences`;

        const menCircle = createCircleImageElement('images/boy.png', `M${i}`);

        menPreferencesContainer.appendChild(labelMan);
        menPreferencesContainer.appendChild(inputManName);
        menPreferencesContainer.appendChild(inputManPreferences);
        menPreferencesContainer.appendChild(menCircle);

        const labelWoman = document.createElement('label');
        labelWoman.htmlFor = `woman${i}`;
        
        const inputWomanName = document.createElement('input');
        inputWomanName.type = 'text';
        inputWomanName.id = `womanName${i}`;
        inputWomanName.placeholder = `name`;
        inputWomanName.value = `w${i}`;

        const inputWomanPreferences = document.createElement('input');
        inputWomanPreferences.type = 'text';
        inputWomanPreferences.id = `woman${i}`;
        inputWomanPreferences.placeholder = `preferences`;

        const womenCircle = createCircleImageElement('images/girl.png', `W${i}`);

        womenPreferencesContainer.appendChild(labelWoman);
        womenPreferencesContainer.appendChild(inputWomanName);
        womenPreferencesContainer.appendChild(inputWomanPreferences);
        womenPreferencesContainer.appendChild(womenCircle);
    }

}

function displayPairs(pairs) {
    const resultsContainer = document.getElementById('results');
    const menCnt = Object.keys(pairs).length;
    if (menCnt === 0) {
        resultsContainer.innerHTML = '<p>No stable pairs found.</p>';
    } else {
        const table = document.createElement('table');
        table.classList.add('table');
        const headerRow = document.createElement('tr');
        const header1 = document.createElement('th');
        const header2 = document.createElement('th');
        header1.textContent = 'Man';
        header2.textContent = 'Woman';
        headerRow.appendChild(header1);
        headerRow.appendChild(header2);
        table.appendChild(headerRow);
        for (let i = 1; i <= menCnt; i++) {
            const man = menIndToName[i];
            const woman = womenIndToName[pairs[i]];
            const row = document.createElement('tr');
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            cell1.textContent = `\u{1F935} ${man}`;
            cell2.textContent = `\u{1F470} ${woman}`;
            row.appendChild(cell1);
            row.appendChild(cell2);
            table.appendChild(row);
        }
        resultsContainer.appendChild(table);
    }
}

function clearResults() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (nextStepButton) {
        nextStepButton.remove();
        nextStepButton = null;
    }
    const icons = document.querySelectorAll('.glowing-icon');
        icons.forEach(icon => {
        icon.style.boxShadow = '0 0 15px 2px rgba(237, 238, 240, 0.8)';
    });
}


function getLineYcoord(manIndex, womanIndex) {
    const menPreferences = document.getElementById("menPreferences");
    const womenPreferences = document.getElementById("womenPreferences");
    const connectionLines = document.getElementById("connectionLines");
    const connectionLinesWidth = connectionLines.clientWidth;

    const manElement = menPreferences.children[4 * manIndex - 1];
    const womanElement = womenPreferences.children[4 * womanIndex - 1];
    const manRect = manElement.getBoundingClientRect();
    const womanRect = womanElement.getBoundingClientRect();

    const startY = manRect.y - menPreferences.getBoundingClientRect().y + manRect.height / 2;
    const endY = womanRect.y - womenPreferences.getBoundingClientRect().y + womanRect.height / 2;
    return {startY, endY, connectionLinesWidth};
}

function showConnectionLine(manIndex, womanIndex, stepIndex) {

    const {startY, endY, connectionLinesWidth} = getLineYcoord(manIndex, womanIndex);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    const line_id = `${manIndex}_${womanIndex}`;
    line.setAttribute("id", line_id);
    line.setAttribute("x1", 0);
    line.setAttribute("y1", startY);
    line.setAttribute("x2", connectionLinesWidth);
    line.setAttribute("y2", endY);
    line.setAttribute("stroke-width", "4");

    connectionLines.appendChild(line);
    let totalLength = line.getTotalLength();


    if (stepIndex % 2 === 0) {
        line.setAttribute("stroke-dashoffset", totalLength);
        const icon = document.getElementById(`M${manIndex}`);
        if (icon) {
            icon.style.boxShadow = '0 0 15px 2px rgba(237, 238, 240, 0.8)';
        }
    } else {
        line.setAttribute("stroke-dashoffset", "0");
        const icon = document.getElementById(`M${manIndex}`);
        if (icon) {
            icon.style.boxShadow = '0 0 15px 2px rgba(249, 47, 96, 0.8)';
        }
    }

    if (stepIndex % 2 === 0) {
        line.setAttribute("stroke", "#1c2332");
        line.setAttribute("stroke-dasharray", totalLength + " " + totalLength);
    } else {
        linesToDelete.add(line_id);
        deleteConnectionLine(line_id);
        line.setAttribute("stroke", "#f92f60");
        line.setAttribute("stroke-dasharray", "16 8");
    }

    line.style.transition = "stroke-dashoffset 1s ease";
    connectionLines.appendChild(line);

    if (stepIndex % 2 === 0) {
        requestAnimationFrame(() => {
            line.setAttribute("stroke-dashoffset", "0");
        });
    } else {
        requestAnimationFrame(() => {
            line.setAttribute("stroke-dashoffset", totalLength);
        });
    }
    
}

function clearConnectionLines() {
    const connectionLines = document.getElementById("connectionLines");
    connectionLines.innerHTML = '';
}

function deleteConnectionLine(line_id) {
    const lineToRemove = document.getElementById(line_id);
    if (lineToRemove) {
        lineToRemove.remove();
    }
}


// Алгоритм Гэйла-Шепли //

function isEngaged(woman, stablePairs) {
    return Object.values(stablePairs).includes(woman);
}

function galeShapleyWithSteps(menPrefs, womenPrefs) {

    const menCount = Object.keys(menPrefs).length;
    let engagedMen = new Set();
    let stablePairs = {};
    let proposals = {};
    let algorithmSteps = [];
    let algorithmLines = [];
    let engagedMenAtSteps = [];

    // Шаг симуляции: 1 - мужчины делают предложения, 2 - женщины выбирают
    let currentSimulationStep = 1;
    
    while (engagedMen.size < menCount) {
        let cur_actions = [];
        let cur_lines = [];
        if (currentSimulationStep === 1) {

            // Мужчины делают предложения
            for (let man_str of Object.keys(menPrefs)) {
                const man = parseInt(man_str, 10); 
                
                if (!engagedMen.has(man)) {

                    const woman = menPrefs[man].shift();
                    const actionDescription = `${menIndToName[man]} &#128141; ${womenIndToName[woman]}`;
                    console.log(actionDescription)
                    cur_actions.push(actionDescription);
                    cur_lines.push([man, woman]);

                    if (!proposals[woman]) {
                        proposals[woman] = [man];
                    } else {
                        proposals[woman].push(man);
                    }
                }
            }

        } else if (currentSimulationStep === 2) {

            // Женщины выбирают лучшие предложения
            for (let woman_str of Object.keys(womenPrefs)) {
                const woman = parseInt(woman_str, 10); 

                if (proposals[woman] && proposals[woman].length > 0) {
                    proposals[woman].sort((a, b) => womenPrefs[woman].indexOf(a) - womenPrefs[woman].indexOf(b));
                    const man = proposals[woman][0];
                    stablePairs[man] = woman;
                    engagedMen.add(man);

                    for (let rejectedMan of proposals[woman].slice(1)) {
                        const actionDescription = `${menIndToName[rejectedMan]} &#10060; ${womenIndToName[woman]}`;
                        console.log(actionDescription);
                        cur_actions.push(actionDescription);
                        cur_lines.push([rejectedMan, woman]);
                        stablePairs[rejectedMan] = null;
                        engagedMen.delete(rejectedMan);
                    }
                    proposals[woman] = [man];
                }
            }

            // engagedMen.forEach(man => {
            //     const icon = document.getElementById(`M${man}`);
            //     icon.style.boxShadow = '0 0 15px 2px rgba(151, 240, 151, 0.8)';
            // });
        }

        algorithmSteps.push(cur_actions);
        algorithmLines.push(cur_lines);
        engagedMenAtSteps.push(engagedMen);
        cur_actions = [];
        cur_lines = [];
        currentSimulationStep = currentSimulationStep === 1 ? 2 : 1; // Переключение сторон
    }
    console.log(`maaaaaaaaaaaaaaaaan${engagedMenAtSteps}`);
    return { pairs: stablePairs, steps: algorithmSteps, lines: algorithmLines, engagedMenAtSteps: engagedMenAtSteps};
}

function runAlgorithm() {

    clearResults();
    clearConnectionLines();

    if (!mapNames()) {
        menNames.clear();
        womenNames.clear();
        return;
    }

    let cpc = checkPreferencesChanged();
    if (cpc === "false preferences") {
        return;
    } else if (cpc || !cachedResults) {

        if (checkPreferences(cachedPreferences.men, cachedPreferences.women)) {
            cachedResults = galeShapleyWithSteps(cachedPreferences.men, cachedPreferences.women);
        } else {
            return;
        }
    }

    const { pairs, steps, lines, engagedMenAtSteps } = cachedResults;

    displayPairs(pairs);

    for (const m in pairs) {
        showConnectionLine(m, pairs[m], 0);
    }
}

function runAlgorithmWithSteps() {

    clearResults();
    clearConnectionLines();
    if (!mapNames()) {
        return;
    }

    let cpc = checkPreferencesChanged();

    if (cpc == "false preferences") {
        return;

    } else if (cpc || !cachedResults) {

        if (checkPreferences(cachedPreferences.men, cachedPreferences.women)) {
            cachedResults = galeShapleyWithSteps(cachedPreferences.men, cachedPreferences.women);
        } else {
            return;
        }
    }

    const { pairs, steps, lines, engagedMenAtSteps } = cachedResults;

    let currentStepIndex = 0;

    function displayNextStep() {

        if (currentStepIndex < steps.length - 1) {

            const step = steps[currentStepIndex];
            const line = lines[currentStepIndex];
            const resultElement = document.createElement('p');
            resultElement.innerHTML = `<strong>Step ${currentStepIndex + 1}:</strong> ${step.join('; ')}`;
            document.getElementById('results').appendChild(resultElement);
            
            if (currentStepIndex % 2 === 0) {
                linesToDelete.forEach(deleteConnectionLine);
                linesToDelete.clear();
            } else {
                engagedMenAtSteps[currentStepIndex].forEach(man => {
                    const icon = document.getElementById(`M${man}`);
                    icon.style.boxShadow = '0 0 15px 2px rgba(151, 240, 151, 0.8)';
                });
            }

            line.forEach(pair => {
                const [manIndex, womanIndex] = pair;
                showConnectionLine(manIndex, womanIndex, currentStepIndex);
            });

            currentStepIndex++;
        } else {
            const icons = document.querySelectorAll('.glowing-icon');
                icons.forEach(icon => {
                icon.style.boxShadow = '0 0 15px 2px rgba(151, 240, 151, 0.8)';
            });
            alert('Больше шагов нет!');
        }
    }

    nextStepButton = document.createElement('button');
    nextStepButton.id = 'nextStepButton';
    nextStepButton.textContent = 'Next step';
    nextStepButton.onclick = displayNextStep;
    document.getElementById('buttonsContainer').appendChild(nextStepButton);    
}


const connectionLines = document.getElementById('connectionLines');
document.getElementById('newDataButton').addEventListener('click', function() {
    connectionLines.style.display = 'block';
    resetAlgorithm();
});
document.getElementById('randomizeButton').addEventListener('click', randomizePreferences);
document.getElementById('resultButton').addEventListener('click', runAlgorithm);
document.getElementById('runWithStepsButton').addEventListener('click', runAlgorithmWithSteps);
