import setupRace from '../data/igpManager.json' assert {type: 'json'};
import config from '../data/config.json' assert {type: 'json'};

const allInputRange = document.querySelectorAll('.percent');
const objectivePercent = document.querySelector('.objective')
const raceSelected = document.querySelector('#race-selected');
const calculButton = document.querySelector('#calculate');

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
	input.addEventListener("change", () => {
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
	console.log(currInput.parentNode.parentNode.classList[0].toString());
}

calculButton.addEventListener("click", () => {
	const tireComponents = [ 'SS', 'S', 'M', 'H'];
	console.log(generatePitStrategies(tireComponents, config.maxPitStop, config.minPitStop, setupRace.race[raceSelected.value].laps));
	// document.querySelectorAll('.dry').forEach(tyre => {
	//     console.dir(tyre);

	//     console.log(allInputRange[tyreIndex]);
	//     console.log(setupRace.race[raceSelected.value].PitStop);
	//     console.log(setupRace.race[raceSelected.value].laps - tyresLaps[tyreIndex]);
	//     console.log(tyresLaps[tyreIndex]);
	//     console.log(setupRace.race[raceSelected.value].laps);

	//     tyreIndex ++;
	// });
})

function generatePitStrategies(tireComponents, maxTireChanges, minTireChanges, raceLaps) {
	const pitStrategies = new Object();

	// Fonction récursive pour générer les combinaisons de pneus
	function generateCombinations(currentCombination, remainingChanges, currentIndex) {
		if (currentCombination.length === maxTireChanges || currentIndex === tireComponents.length) {
			// Vérifier si la combinaison est valide
			const totalLaps = currentCombination.reduce((total, component) => total + tyresLaps.get(component), 0);
            // console.log(currentCombination);
			if (totalLaps >= raceLaps && currentCombination.length >= minTireChanges) {
				pitStrategies[Object.keys(pitStrategies).length] = {
                    "tyreSet ": [...currentCombination],
                    "totalTime": calculTotalTime([...currentCombination])
                };
                console.log(pitStrategies);
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

function countOccurence(array, occurenceToCheck){
    
}

function calculTotalTime(tyreSet){
    let totalTime = setupRace.race[raceSelected.value].PitStop*tyreSet.length;
    tyreSet.forEach(tyreName => {
        console.log(tyreName);
        let tyreTime = document.querySelector(`.${tyreName} .timePerLap`).value;
        totalTime += convertMinToSec(tyreTime);
    })
    console.log(tyreSet,":",totalTime);
    return totalTime;
}

function convertMinToSec(toConvert){
    return parseFloat(toConvert.split('.')[0] *60) + parseFloat(toConvert.split('.')[1]) + parseFloat("0."+toConvert.split('.')[2])
}