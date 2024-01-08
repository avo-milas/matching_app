let cachedResults = null;
let cachedPreferences = null;
let pairsCnt = 3;
let menNames = new Set();
let womenNames = new Set();
let menIndToName = {};
let menNameToInd = {};
let womenIndToName = {};
let womenNameToInd = {};

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

    console.log(menIndToName);
    console.log(menNameToInd);

    console.log(womenIndToName);
    console.log(womenNameToInd);

    console.log(pairsCnt);
    console.log(womenNames.size);
    console.log(menNames.size);

    console.log(womenNames);
    console.log(menNames);

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

    const { pairs, steps } = cachedResults;
    displayPairs(pairs);
}

function runAlgorithmWithSteps() {
    clearResults();
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
