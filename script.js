let cachedResults = null;
let cachedPreferences = null;
let pairsCnt = 3;
let menIndToName = {};
let menNameToInd = {};
let womenIndToName = {};
let womenNameToInd = {};

// Операции с предпочтениями и именами /////

function mapNames() {
    for (let i = 1; i <= pairsCnt; i++) {
        menIndToName[i] = document.getElementById(`manName${i}`).value;
        menNameToInd[document.getElementById(`manName${i}`).value] = i;

        womenIndToName[i] = document.getElementById(`womanName${i}`).value;
        womenNameToInd[document.getElementById(`womanName${i}`).value] = i;
        
    }

    console.log(menIndToName);
    console.log(menNameToInd);

    console.log(womenIndToName);
    console.log(womenNameToInd);
}

function menParsePreferences(input) {
    let a = input.split(' ').map(item => womenNameToInd[item.trim()]);
    return a;
}

function womenParsePreferences(input) {
    let a = input.split(' ').map(item => menNameToInd[item.trim()]);
    return a;
}

function getPreferences(prefix) {
    const preferences = {};
    for (let i = 1; i <= pairsCnt; i++) {
        const id = `${prefix}${i}`;
        if (prefix === 'man') {
            preferences[i] = menParsePreferences(document.getElementById(id).value);
        } else {
            preferences[i] = womenParsePreferences(document.getElementById(id).value);
        }
    }
    return preferences;
}

function checkPreferences(menPrefs, womenPrefs) {
    if (menPrefs == {} || womenPrefs == {}) {
        alert('Предпочтения не должны быть пустыми!');
        return false;
    } else {
        for (let i = 1; i <= pairsCnt; ++i) {
            if (new Set(menPrefs[i]).size !== pairsCnt || new Set(womenPrefs[i]).size !== pairsCnt) {
                alert('Все предпочтения должны быть указаны правильно!');
                return false;
            }
        }
        return true;
    }
}

function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function checkPreferencesChanged() {
    const menPreferences = getPreferences('man', pairsCnt);
    const womenPreferences = getPreferences('woman', pairsCnt);

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
function displayPairs(pairs) {
    const resultsContainer = document.getElementById('results');
    const menCnt = Object.keys(pairs).length;
    if (menCnt === 0) {
        resultsContainer.innerHTML = '<p>No stable pairs found.</p>';
    } else {
        resultsContainer.innerHTML = '<h2>Stable pairs:</h2>';
        for (let i = 1; i <= menCnt; i++) {
            // const man = Object.keys(pairs)[i - 1];
            const woman = pairs[i];
            const resultElement = document.createElement('p');
            resultElement.innerHTML = `<strong>Pair ${i}:</strong> ${menIndToName[i]} - ${womenIndToName[woman]}`;
            resultsContainer.appendChild(resultElement);
        }
    }
}

function clearResults() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
}
/////////////////////////////////

function galeShapleyWithSteps(menPrefs, womenPrefs) {

    const menCount = Object.keys(menPrefs).length;
    let engagedMen = new Set();
    let stablePairs = {};
    let proposals = {};
    let algorithmSteps = [];

    let currentSimulationStep = 1; // Шаг симуляции: 1 - мужчины делают предложения, 2 - женщины выбирают

    while (engagedMen.size < menCount) {
        console.log(`------new iter ${currentSimulationStep}`)
        let cur_actions = []
        if (currentSimulationStep === 1) {

            // Мужчины делают предложения
            for (let man_str of Object.keys(menPrefs)) {
                const man = parseInt(man_str, 10); 
                
                if (!engagedMen.has(man)) {

                    const woman = menPrefs[man].shift();
                    const actionDescription = `${menIndToName[man]} proposes to ${womenIndToName[woman]}`;
                    console.log(actionDescription)
                    cur_actions.push(actionDescription);

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
                        const actionDescription = `${menIndToName[rejectedMan]} is rejected by ${womenIndToName[woman]}`;
                        console.log(actionDescription);
                        cur_actions.push(actionDescription);
                        stablePairs[rejectedMan] = null;
                        engagedMen.delete(rejectedMan);
                    }

                    proposals[woman] = [man];
                }
            }
        }

        algorithmSteps.push(cur_actions);
        cur_actions = [];
        currentSimulationStep = currentSimulationStep === 1 ? 2 : 1; // Переключение сторон
    }

    return { pairs: stablePairs, steps: algorithmSteps };
}

function runAlgorithm() {
    clearResults();
    mapNames();

    if (checkPreferencesChanged() || !cachedResults) {

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

    const { pairs, steps } = cachedResults;
    displayPairs(pairs);
}

function runAlgorithmWithSteps() {
    clearResults();
    mapNames();

    if (checkPreferencesChanged() || !cachedResults) {

        if (checkPreferences(cachedPreferences.men, cachedPreferences.women)) {
            cachedResults = galeShapleyWithSteps(cachedPreferences.men, cachedPreferences.women);
        } else {
            return;
        }
    }

    const { pairs, steps } = cachedResults;

    let currentStepIndex = 0;

    function displayNextStep() {
        if (currentStepIndex < steps.length - 1) {
            const step = steps[currentStepIndex];
            const resultElement = document.createElement('p');
            resultElement.innerHTML = `<strong>Шаг ${currentStepIndex + 1}:</strong> ${step.join('; ')}`;
            document.getElementById('results').appendChild(resultElement);
            currentStepIndex++;
        } else {
            alert('Больше шагов нет!');
        }
    }

    const nextStepButton = document.createElement('button');
    nextStepButton.textContent = 'Следующий шаг';
    nextStepButton.onclick = displayNextStep;
    document.getElementById('results').appendChild(nextStepButton);
}

function resetAlgorithm() {
    clearResults();
    cachedResults = null;

    pairsCnt = parseInt(document.getElementById('pairsCount').value, 10);

    const menPreferencesContainer = document.getElementById('menPreferences');
    const womenPreferencesContainer = document.getElementById('womenPreferences');

    menPreferencesContainer.innerHTML = '';
    womenPreferencesContainer.innerHTML = '';

    for (let i = 1; i <= pairsCnt; i++) {

        const labelMan = document.createElement('label');
        labelMan.htmlFor = `man${i}`;
        labelMan.textContent = `M${i}:`;

        const inputManName = document.createElement('input');
        inputManName.type = 'text';
        inputManName.id = `manName${i}`;
        inputManName.placeholder = `name`;

        const inputManPreferences = document.createElement('input');
        inputManPreferences.type = 'text';
        inputManPreferences.id = `man${i}`;
        inputManPreferences.placeholder = `preferences`;


        const labelWoman = document.createElement('label');
        labelWoman.htmlFor = `woman${i}`;
        labelWoman.textContent = `W${i}:`;

        const inputWomanName = document.createElement('input');
        inputWomanName.type = 'text';
        inputWomanName.id = `womanName${i}`;
        inputWomanName.placeholder = `name`;

        const inputWomanPreferences = document.createElement('input');
        inputWomanPreferences.type = 'text';
        inputWomanPreferences.id = `woman${i}`;
        inputWomanPreferences.placeholder = `preferences`;


        menPreferencesContainer.appendChild(labelMan);
        menPreferencesContainer.appendChild(inputManName);
        menPreferencesContainer.appendChild(inputManPreferences);
        womenPreferencesContainer.appendChild(labelWoman);
        womenPreferencesContainer.appendChild(inputWomanName);
        womenPreferencesContainer.appendChild(inputWomanPreferences);
    }
}

document.getElementById('newDataButton').addEventListener('click', resetAlgorithm);
document.getElementById('resultButton').addEventListener('click', runAlgorithm);
document.getElementById('runWithStepsButton').addEventListener('click', runAlgorithmWithSteps);
