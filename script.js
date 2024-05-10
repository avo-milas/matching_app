let cachedResults = null;
let cachedPreferences = null;
let pairsCnt = 0;
let menNames = new Set();
let womenNames = new Set();
let menIndToName = {};
let menNameToInd = {};
let womenIndToName = {};
let womenNameToInd = {};
let nextStepButton = null;

// Операции с предпочтениями и именами /////

function areSetsEqual(set1, set2) {
    if (set1.size !== set2.size) {
        return false;
    }
    for (const item of set1) {
        if (!set2.has(item)) {
            return false;
        }
    }
    return true;
}

function mapNames() {
    menNames.clear();
    womenNames.clear();

    for (let i = 1; i <= pairsCnt; i++) {
        let manName = document.getElementById(`manName${i}`).value;
        if (manName !== null) {
            menIndToName[i] = manName;
            menNameToInd[manName] = i;
            menNames.add(manName);
        } else {
            alert('Имена должны быть указаны!');
            return false;
        }

        let womanName = document.getElementById(`womanName${i}`).value;
        if (manName !== null) {
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

function menParsePreferences(input) {
    let names_prefs = input.split(' ').map(item => item.trim());
    let cur_prefs_names = new Set();
    for (let name of names_prefs) {
        cur_prefs_names.add(name);
    }

    if (!areSetsEqual(cur_prefs_names, womenNames)) {
        alert('Предпочтения одной стороны должны быть согласованы с именами другой!');
        return false;
    }
    let prefs = names_prefs.map(item => womenNameToInd[item]);
    return prefs;
}

function womenParsePreferences(input) {
    let names_prefs = input.split(' ').map(item => item.trim());
    let cur_prefs_names = new Set();
    for (let name of names_prefs) {
        cur_prefs_names.add(name);
    }
    if (!areSetsEqual(cur_prefs_names, menNames)) {
        alert('Предпочтения одной стороны должны быть согласованы с именами другой!');
        return false;
    }
    let prefs = names_prefs.map(item => menNameToInd[item]);
    return prefs;
}

function getPreferences(prefix) {
    const preferences = {};
    for (let i = 1; i <= pairsCnt; i++) {
        const id = `${prefix}${i}`;
        if (prefix === 'man') {
            let fm = menParsePreferences(document.getElementById(id).value);
            if (fm) {
                preferences[i] = fm;
            } else {
                return false;
            }
        } else {
            let fw = womenParsePreferences(document.getElementById(id).value);
            if (fw) {
                preferences[i] = fw;
            } else {
                return false;
            }
        }
    }
    return preferences;
}

function checkPreferences(menPrefs, womenPrefs) {
    if (menPrefs == {} || womenPrefs == {}) {
        alert('Предпочтения не должны быть пустыми!');
        return false;
    } else {
        // console.log(menPrefs);
        // for (let i = 1; i <= pairsCnt; ++i) {
        //     let mp = menPrefs[i];
        //     let wp = new Set(womenPrefs[i]);
        //     console.log(womenNames);
        //     console.log(menNames);
        //     console.log(mp);
        //     console.log(wp);
        //     if (!areSetsEqual(mp, womenNames) || !areSetsEqual(wp, menNames)) {
        //         alert('Все предпочтения должны быть указаны правильно!');
        //         return false;
        //     }
        // }
        return true;
    }
}

function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function checkPreferencesChanged() {
    const menPreferences = getPreferences('man');
    const womenPreferences = getPreferences('woman');

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
/////////////////////////////////

function isEngaged(woman, stablePairs) {
    return Object.values(stablePairs).includes(woman);
}

// отображение результатов ///////
// function displayPairs(pairs) {
//     const resultsContainer = document.getElementById('results');
//     const menCnt = Object.keys(pairs).length;
//     if (menCnt === 0) {
//         resultsContainer.innerHTML = '<p>No stable pairs found.</p>';
//     } else {
//         resultsContainer.innerHTML = '<h2>Stable pairs:</h2>';
//         for (let i = 1; i <= menCnt; i++) {
//             // const man = Object.keys(pairs)[i - 1];
//             const woman = pairs[i];
//             const resultElement = document.createElement('p');
//             resultElement.innerHTML = `<strong>Pair ${i}:</strong> ${menIndToName[i]} - ${womenIndToName[woman]}`;
//             resultsContainer.appendChild(resultElement);
//         }
//     }
// }

function displayPairs(pairs) {
    const resultsContainer = document.getElementById('results');
    const menCnt = Object.keys(pairs).length;
    if (menCnt === 0) {
        resultsContainer.innerHTML = '<p>No stable pairs found.</p>';
    } else {
        // resultsContainer.innerHTML = '<h2>Stable pairs:</h2>';
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
        nextStepButton = null; // Очищаем ссылку после удаления кнопки
    }
}

function clearConnectionLines() {
    const connectionLines = document.getElementById("connectionLines");
    connectionLines.innerHTML = '';
}

/////////////////////////////////

function galeShapleyWithSteps(menPrefs, womenPrefs) {

    const menCount = Object.keys(menPrefs).length;
    let engagedMen = new Set();
    let stablePairs = {};
    let proposals = {};
    let algorithmSteps = [];
    let algorithmLines = [];

    let currentSimulationStep = 1; // Шаг симуляции: 1 - мужчины делают предложения, 2 - женщины выбирают

    while (engagedMen.size < menCount) {
        console.log(`------new iter ${currentSimulationStep}`)
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
        }

        algorithmSteps.push(cur_actions);
        algorithmLines.push(cur_lines);
        cur_actions = [];
        cur_lines = [];
        currentSimulationStep = currentSimulationStep === 1 ? 2 : 1; // Переключение сторон
    }

    return { pairs: stablePairs, steps: algorithmSteps, lines: algorithmLines};
}

function runAlgorithm() {
    clearResults();
    clearConnectionLines();

    if (!mapNames()) {
        menNames.clear();
        womenNames.clear();
        return;
    }

    console.log("--------");
    console.log(womenNames);
    console.log(menNames);

    let cpc = checkPreferencesChanged();
    
    if (cpc === "false preferences") {
        return;
    } else if (cpc || !cachedResults) {

        if (checkPreferences(cachedPreferences.men, cachedPreferences.women)) {
            console.log("GS algo---");
            console.log(`men:`);
            console.log(cachedPreferences.men);
            console.log(`women:`);
            console.log(cachedPreferences.women);
            cachedResults = galeShapleyWithSteps(cachedPreferences.men, cachedPreferences.women);
        } else {
            return;
        }
    }

    const { pairs, steps, lines } = cachedResults;

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

    const { pairs, steps, lines } = cachedResults;

    let currentStepIndex = 0;

    function displayNextStep() {

        if (currentStepIndex < steps.length - 1) {

            const step = steps[currentStepIndex];
            const line = lines[currentStepIndex];
            const resultElement = document.createElement('p');
            resultElement.innerHTML = `<strong>Step ${currentStepIndex + 1}:</strong> ${step.join('; ')}`;
            document.getElementById('results').appendChild(resultElement);

            line.forEach(pair => {
                const [manIndex, womanIndex] = pair;
                showConnectionLine(manIndex, womanIndex, currentStepIndex);
            });

            currentStepIndex++;

        } else {
            alert('Больше шагов нет!');
        }
    }

    nextStepButton = document.createElement('button');
    nextStepButton.id = 'nextStepButton';
    nextStepButton.textContent = 'Next step';
    nextStepButton.onclick = displayNextStep;
    document.getElementById('buttonsContainer').appendChild(nextStepButton);    
}


function showConnectionLine(manIndex, womanIndex, stepIndex) {
        const menPreferences = document.getElementById("menPreferences");
        const womenPreferences = document.getElementById("womenPreferences");
        const connectionLines = document.getElementById("connectionLines");

        const manElement = menPreferences.children[4 * manIndex - 1];
        const womanElement = womenPreferences.children[4 * womanIndex - 1];
        const manRect = manElement.getBoundingClientRect();
        const womanRect = womanElement.getBoundingClientRect();

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        
        const startY = manRect.y - menPreferences.getBoundingClientRect().y + manRect.height / 2;
        const endY = womanRect.y - womenPreferences.getBoundingClientRect().y + womanRect.height / 2;

        line.setAttribute("x1", 0);
        line.setAttribute("y1", startY);
        line.setAttribute("x2", connectionLines.clientWidth);
        line.setAttribute("y2", endY);
        line.setAttribute("stroke-width", "4");

        if (stepIndex % 2 === 0) {
            // line.setAttribute("stroke", "#94a8b1");
            line.setAttribute("stroke", "#1c2332");
        } else {
            line.setAttribute("stroke", "#dfeaee");
            // line.setAttribute("stroke", "#7791ca");
        }

        connectionLines.appendChild(line);

        line.setAttribute("stroke-dasharray", "0 " + line.getTotalLength());
        line.style.transition = "stroke-dasharray 1s ease";
        line.setAttribute("stroke-dasharray", line.getTotalLength() + " 0");
    }


function createCircleImageElement(src, alt) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.width = 100;
    img.height = 100;
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

    for (let i = 1; i <= pairsCnt; i++) {
        const labelMan = document.createElement('label');
        labelMan.htmlFor = `man${i}`;
        // labelMan.textContent = `M${i}:`;

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
        // labelWoman.textContent = `W${i}:`;

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


document.getElementById('newDataButton').addEventListener('click', resetAlgorithm);
const connectionLines = document.getElementById('connectionLines');
document.getElementById('newDataButton').addEventListener('click', function() {
    connectionLines.style.display = 'block';
});

document.getElementById('resultButton').addEventListener('click', function() {
    runAlgorithm();
});
document.getElementById('runWithStepsButton').addEventListener('click', runAlgorithmWithSteps);



document.getElementById('randomizeButton').addEventListener('click', function() {

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
            shuffleArray(preferences); // Перемешивание массива предпочтений
            const input = document.getElementById(`man${i}`);
            input.value = preferences.join(' ');
        }

        for (let i = 1; i <= pairsCount; i++) {
            const preferences = [];
            for (let j = 1; j <= pairsCount; j++) {
                preferences.push(`${menIndToName[j]}`);
            }
            shuffleArray(preferences); // Перемешивание массива предпочтений
            const input = document.getElementById(`woman${i}`);
            input.value = preferences.join(' ');
        }
    } else {
        alert('Введите число пар больше нуля.');
    }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function showInformation() {
    document.getElementById("informationModal").style.display = "block";
}

function closeInformationModal() {
    document.getElementById("informationModal").style.display = "none";
}

