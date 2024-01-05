let cachedResults = null;
let cachedPreferences = null;
let pairsCnt = 3;

// Операции с предпочтениями/////
function parsePreferences(input) {
    return input.split(' ').map(item => item.trim());
}

function getPreferences(prefix, count) {
    const preferences = {};
    for (let i = 1; i <= count; i++) {
        const id = `${prefix}${i}`;
        preferences[i] = parsePreferences(document.getElementById(id).value);
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

function displayPairs(pairs) {
    const resultsContainer = document.getElementById('results');
    const menCnt = Object.keys(pairs).length;
    if (menCnt === 0) {
        resultsContainer.innerHTML = '<p>No stable pairs found.</p>';
    } else {
        resultsContainer.innerHTML = '<h2>Stable pairs:</h2>';
        for (let i = 1; i <= menCnt; i++) {
            const man = Object.keys(pairs)[i - 1];
            console.log(i);
            const woman = pairs[man];
            const resultElement = document.createElement('p');
            resultElement.innerHTML = `<strong>Pair ${i}:</strong> ${man} - ${woman}`;
            resultsContainer.appendChild(resultElement);
        }
    }
}

function clearResults() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
}


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
            for (const man in menPrefs) {

                if (!engagedMen.has(man)) {

                    const woman = menPrefs[man].shift();
                    const actionDescription = `${man} proposes to ${woman}`;
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
            for (const woman in womenPrefs) {

                if (proposals[woman] && proposals[woman].length > 0) {
                    proposals[woman].sort((a, b) => womenPrefs[woman].indexOf(a) - womenPrefs[woman].indexOf(b));
                    const man = proposals[woman][0];
                    stablePairs[man] = woman;
                    engagedMen.add(man);

                    for (let rejectedMan of proposals[woman].slice(1)) {
                        const actionDescription = `${rejectedMan} is rejected by ${woman}`;
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

    if (checkPreferencesChanged() || !cachedResults) {

        if (checkPreferences(cachedPreferences.men, cachedPreferences.women)) {
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
        const inputMan = document.createElement('input');
        inputMan.type = 'text';
        inputMan.id = `man${i}`;
        inputMan.placeholder = `1 2 3`;

        const labelWoman = document.createElement('label');
        labelWoman.htmlFor = `woman${i}`;
        labelWoman.textContent = `W${i}:`;
        const inputWoman = document.createElement('input');
        inputWoman.type = 'text';
        inputWoman.id = `woman${i}`;
        inputWoman.placeholder = `2 3 1`;

        menPreferencesContainer.appendChild(labelMan);
        menPreferencesContainer.appendChild(inputMan);
        womenPreferencesContainer.appendChild(labelWoman);
        womenPreferencesContainer.appendChild(inputWoman);
    }
}

document.getElementById('newDataButton').addEventListener('click', resetAlgorithm);
document.getElementById('resultButton').addEventListener('click', runAlgorithm);
document.getElementById('runWithStepsButton').addEventListener('click', runAlgorithmWithSteps);
