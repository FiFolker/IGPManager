const allInputRange = document.querySelectorAll('.percent');
const objectivePercent = document.querySelector('.objective')


allInputRange.forEach(input =>{

    input.addEventListener("change", () => {
        calculLaps(input)
    })
})

function calculLaps(currInput){
    
    const lapMin = document.querySelector(`.${currInput.parentNode.parentNode.className} .lap-min`)
    const lapOptimist = document.querySelector(`.${currInput.parentNode.parentNode.className} .lap-optimist`)
    let result = objectivePercent.value/currInput.value;
    lapMin.innerHTML = result.toFixed(2);
    lapOptimist.innerHTML = (result+2).toFixed(2);
}