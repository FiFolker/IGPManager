import setupRace from '../data/igpManager.json' assert {type: 'json'};
import config from '../data/config.json' assert {type: 'json'};

const allInputRange = document.querySelectorAll('.percent');
const objectivePercent = document.querySelector('.objective')
const raceSelected = document.querySelector('#race-selected');
const calculButton = document.querySelector('#calculate');
const strategyPlace = document.querySelector('#strategy');

let tyresLaps = new Map();
let strategies = {};
let changed = true;

raceSelected.addEventListener("change", () => {
	// TO DO LATER (Have to write in json file)
	config.lastRaceSelected = raceSelected.value;
})

for (const race in setupRace.race) {
	let opt = document.createElement("option");
	opt.value = race;
	opt.text = race;
	raceSelected.add(opt, null);
}


window.onclick = function (e) {
	if(e.target.contains(objectivePercent) && e.target != objectivePercent && !changed){
		calculAllLaps();
		console.log("calcul ...")
		changed = true;
	}
}

objectivePercent.addEventListener("change", () => {
	changed = false;
})

allInputRange.forEach(input =>{
	input.addEventListener("input", () => {

		if(input.value.length > 3){
			console.log("> que 3 chiffres");
			input.value = input.value.slice(0, 3);
		}else if(input.value > 100){
			console.log("> que 100");
			input.value = input.value.slice(0, 2);
			
		}
		input.nextElementSibling.value = input.value
		if(input.value == ""){
			input.nextElementSibling.value = 0;
		}
		calculLaps(input)
	})
})


function calculAllLaps(){
	allInputRange.forEach(input =>{
		if(input.value != 0){
			calculLaps(input);
		}
		
	})
}

function calculLaps(currInput){
	
	const lapMin = document.querySelector(`.${currInput.parentNode.parentNode.classList[0]} .lap-min`)
	const lapOptimist = document.querySelector(`.${currInput.parentNode.parentNode.classList[0]} .lap-optimist`)
	let result = 0;
	try{
		result = objectivePercent.value/currInput.value;
		if(isNaN(result)){
			throw new SyntaxError("NaN");
		}
		if(objectivePercent.value <= 0){
			throw new RangeError("Less or Equal to 0");
		}
	}catch(err){
		objectivePercent.value = 70;
		result = 70/currInput.value;
		console.log("ERROR : objectivePercent value invalid !");
		console.log(err.message);

	}
	
	lapMin.innerHTML = Math.round(result).toString();
	lapOptimist.innerHTML = Math.round((result+2)).toString();
	tyresLaps.set(currInput.parentNode.parentNode.classList[0].toString(), Math.round((result+2)));
}

calculButton.addEventListener("click", () => {
	const tireComponents = [ 'SS', 'S', 'M', 'H'];
	let pitStrategies = generatePitStrategies(tireComponents, config.maxPitStop, config.minPitStop, setupRace.race[raceSelected.value].laps);
	let index = chooseBestStrategies(pitStrategies);
	document.querySelector('#strategy #config').innerText = "config : ride -> " + setupRace.race[raceSelected.value][config.tiers]["ride"] + " : wings -> " + setupRace.race[raceSelected.value][config.tiers]["wings"];
	document.querySelector('#strategy #dry').innerText = "Strategy Dry : " + pitStrategies[index].tyreSet + "\nEstimated time : " + pitStrategies[index].totalTime;
	
})

function generatePitStrategies(tireComponents, maxTireChanges, minTireChanges, raceLaps) {
	const pitStrategies = new Object();

	// Fonction récursive pour générer les combinaisons de pneus
	function generateCombinations(currentCombination, remainingChanges, currentIndex) {
		if (currentCombination.length === maxTireChanges || currentIndex === tireComponents.length) {
			// Vérifier si la combinaison est valide
			const totalLaps = currentCombination.reduce((total, component) => total + tyresLaps.get(component), 0);
			if (totalLaps >= raceLaps && totalLaps < raceLaps+config.lapExcess && currentCombination.length >= minTireChanges && !notAllSame([...currentCombination])) {
				pitStrategies[Object.keys(pitStrategies).length] = {
                    "tyreSet": [...currentCombination],
                    "totalTime": calculTotalTime([...currentCombination])
                };
			}
			return;
		}

		// Inclure le composant de pneu actuel dans la combinaison
		currentCombination.push(tireComponents[currentIndex]);
		generateCombinations(currentCombination, remainingChanges - 1, currentIndex);

		// Ne pas inclure le composant de pneu actuel dans la combinaison
		currentCombination.pop();
		generateCombinations(currentCombination, remainingChanges, currentIndex + 1);
	}

	// Démarrer la génération des combinaisons avec des valeurs initiales
	generateCombinations([], maxTireChanges, 0);

	return pitStrategies;
}

function notAllSame(array){
    return array.every((val, i, arr) => val === arr[0]);
}

function calculTotalTime(tyreSet){
    let totalTime = setupRace.race[raceSelected.value].PitStop*tyreSet.length;
    tyreSet.forEach(tyreName => {
        let tyreTime = document.querySelector(`.${tyreName} .timePerLap`).value;
        totalTime += convertMinToSec(tyreTime);
    })
    return totalTime;
}

function convertMinToSec(toConvert){
    return parseFloat(toConvert.split('.')[0] *60) + parseFloat(toConvert.split('.')[1]) + parseFloat("0."+toConvert.split('.')[2])
}

function chooseBestStrategies(strategies){
	let best;
	let index;
	for (const strategy in strategies) {
		if(best >= strategies[strategy].totalTime || best === undefined){
			if(best > strategies[strategy].totalTime){
				best = undefined;
				index = undefined;
			}
			best = strategies[strategy].totalTime;
			index = strategy;
			
		}
	}
	return index;
}