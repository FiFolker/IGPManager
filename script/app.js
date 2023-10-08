import setupRace from '../data/igpManager.json' assert {type: 'json'}
import config from '../data/config.json' assert {type: 'json'}

const allInputRange = document.querySelectorAll('.percent');
const objectivePercent = document.querySelector('.objective')
const raceSelected = document.querySelector('#race-selected');
const calculButton = document.querySelector('#calculate');

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
    
    const lapMin = document.querySelector(`.${currInput.parentNode.parentNode.className} .lap-min`)
    const lapOptimist = document.querySelector(`.${currInput.parentNode.parentNode.className} .lap-optimist`)
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
    lapMin.innerHTML = result.toFixed(2);
    lapOptimist.innerHTML = (result+2).toFixed(2);
}

calculButton.addEventListener("click", () => {
    let tyreChanged = false;
    document.querySelectorAll('.dry').forEach(tyre => {
        
    });
})