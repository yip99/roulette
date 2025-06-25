const numberFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});

const colors = [
    '#F38181',
    '#FCE38A',
    '#EAFFD0',
    '#95E1D3',
    '#FFCFDF',
    '#FEFDCA',
    '#E0F9B5',
    '#A5DEE5',
    '#fbe3f7',
    '#c8fcea',
    '#6a9a8b',
    '#7fd1ae',
];

const elementRouletteChoices = document.querySelector('.roulette #roulette-choices');
const elementListChoices = document.querySelector('.list-choices');
const inputNumber = document.querySelector('input[type="number"]');
const inputText = document.querySelector('input[name="choice-text"]');
const buttonSpin = document.querySelector('#spin');
const elementResults = document.querySelector('.results');
const inputColor = document.querySelector('input[name="choice-color"]');
const listContainer = document.querySelector('.list-choices-container');
document.querySelector('#results-copy')?.addEventListener('click', () => {
    if (results.length === 0) {
        return;
    }
    navigator.clipboard.writeText(results.join('\n'));
});
document.querySelector('#results-clear')?.addEventListener('click', () => {
    results.splice(0, results.length);
    displayResult();
});
document.querySelector('#choices-import')?.addEventListener('click', async () => {
    const clipboard = JSON.parse(await navigator.clipboard.readText());
    choices.splice(0, choices.length);
    choices.push(...clipboard);
    updateChoice();
});
document.querySelector('#choices-export')?.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(choices, null, '\t'));
});
document.querySelector('#choices-copy')?.addEventListener('click', () => {
    if (choices.length === 0) {
        return;
    }
    navigator.clipboard.writeText(choices.map(choice => choice.text).join('\n'));
});
document.querySelector('#choices-clear')?.addEventListener('click', () => {
    choices.splice(0, choices.length);
    updateChoice();
});

inputColor.value = colors[Math.floor(Math.random() * colors.length)];

const arrowAngle = +getComputedStyle(document.body).getPropertyValue('--arrow-angle').match(/rotate\(([+-]?\d+)deg\)/)?.[1];

let isSpinning = false;
let rotation = 0;
let animationFrameId;

let maxSpeed = 360 * 5; // degree per second
let accelerateTime = 3_000;
let decelerateTime = 15_000;
let then = Date.now();
let elapsed;
// let fpsLimit = 1000 / 60;
let fps = 0;
let startTime;
let stopTime;
let startSpeed;
let stopSpeed;
let speed = 0;

const choices = [];
const results = [];


let radius = elementRouletteChoices.parentNode.getBoundingClientRect().width / 2;
let angle;

window.addEventListener('resize', function () {
    radius = elementRouletteChoices.parentNode.getBoundingClientRect().width / 2;
    updateChoice();
}, true);

buttonSpin.addEventListener("click", () => {
    if (choices.length < 2) {
        return;
    }
    buttonSpin?.classList.toggle('spinning');
    if (!isSpinning) {
        console.timeEnd("stopped");
        isSpinning = true;
        cancelAnimationFrame(animationFrameId);
        console.time("max");
        console.log("start");
        console.log("accelerate", speed, performance.now());
        startTime = Date.now();
        startSpeed = speed;
        startSpin();
    } else {
        console.timeEnd("max");
        isSpinning = false;
        cancelAnimationFrame(animationFrameId);
        console.log("decelerate", speed, performance.now());
        stopTime = Date.now();
        stopSpeed = speed;
        console.time("stopped");
        stopSpin();
    }
});

document.querySelector('#increment').addEventListener('click', () => {
    inputNumber.value = (+inputNumber.value) + 1;
});

document.querySelector('#decrement').addEventListener('click', () => {
    if (+inputNumber.value > 1) {
        inputNumber.value = (+inputNumber.value) - 1;
    }
});

document.querySelector('#add').addEventListener('click', () => {
    addChoice();
});

inputText?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addChoice();
    }
});

function startSpin() {
    elapsed = Date.now() - then;
    fps = 1000 / elapsed;
    then = Date.now();
    if (Date.now() - startTime < accelerateTime * (1 - startSpeed / maxSpeed)) {
        speed = maxSpeed * easeInOutSine((Date.now() - startTime) / (accelerateTime * (1 - startSpeed / maxSpeed))) + startSpeed * (1 - (Date.now() - startTime) / (accelerateTime * (1 - startSpeed / maxSpeed)));
        rotation += (speed / fps);
        elementRouletteChoices.style.transform = `rotate(${rotation}deg)`;
        animationFrameId = requestAnimationFrame(startSpin);
    } else {
        console.timeLog("max", speed);
        spin();
    }
}

function spin() {
    elapsed = Date.now() - then;
    fps = 1000 / elapsed;
    then = Date.now();
    rotation += speed / fps;
    elementRouletteChoices.style.transform = `rotate(${rotation}deg)`;
    animationFrameId = requestAnimationFrame(spin);
}

function stopSpin() {
    elapsed = Date.now() - then;
    fps = 1000 / elapsed;
    then = Date.now();
    if (Date.now() - stopTime < decelerateTime * (stopSpeed / maxSpeed)) {
        speed = stopSpeed * (1 - easeInOutSine((Date.now() - stopTime) / (decelerateTime * (stopSpeed / maxSpeed))));
        rotation += speed / fps;
        elementRouletteChoices.style.transform = `rotate(${rotation}deg)`;
        animationFrameId = requestAnimationFrame(stopSpin);
    } else {
        cancelAnimationFrame(animationFrameId);
        console.timeLog("stopped");
        const result = getResult();
        results.push(result);
        displayResult();
        elementResults.scrollTop = elementResults.scrollHeight;
    }
}

function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

function x(cx, radius, degree) {
    return cx + (radius * Math.sin(degree * (Math.PI / 180)));
}

function y(cy, radius, degree) {
    return cy - (radius * Math.cos(degree * (Math.PI / 180)));
}

function addChoice() {
    if (inputText.value === '') {
        return;
    }
    const choice = {
        text: inputText.value,
        number: +inputNumber.value,
        color: inputColor.value,
    }

    choices.push(choice);
    updateChoice();
    listContainer.scrollTop = listContainer.scrollHeight;

    const lastChoice = choices.at(-1);
    let newColor = colors[Math.floor(Math.random() * colors.length)];
    while (lastChoice?.color === newColor) {
        newColor = colors[Math.floor(Math.random() * colors.length)];
    }
    inputColor.value = newColor;
    inputText.value = '';
    inputNumber.value = 1;
    inputText.focus();
}

function updateChoice() {
    elementListChoices.innerHTML = '';
    elementRouletteChoices.innerHTML = '';
    angle = 360 / choices.reduce((total, obj) => obj.number + total, 0);
    let degreeFrom = 0;
    elementRouletteChoices.style.transform = `rotate(${rotation}deg)`;
    let no = 1;
    for (let i = 0; i < choices.length; i++) {
        const degreeTo = choices[i].number * angle;
        const div = document.createElement('div');
        div.className = 'roulette-choice';
        div.style.transform = `rotate(${degreeFrom}deg)`;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); // 1
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); // 1
        svg.setAttribute('width', `${radius * 2}`);
        svg.setAttribute('height', `${radius * 2}`);
        svg.appendChild(path)
        path.setAttribute('fill', `${choices[i].color}`);
        path.setAttribute(
            'd',
            choices.length === 1
                ? `M ${radius} ${radius} M ${radius * 2} ${radius} A ${radius} ${radius} 0 1 0 0 ${radius} A ${radius} ${radius} 0 1 0 ${radius * 2} ${radius}`
                : `M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 ${degreeTo > 180 ? '1' : '0'} 1 ${x(radius, radius, degreeTo)} ${y(radius, radius, degreeTo)} Z`
        );
        const span = document.createElement('span');
        span.textContent = choices[i].text;
        span.style.color = getContrastYIQ(choices[i].color);
        span.style.transform = `rotate(${degreeTo < 360 ? (degreeTo - 180) / 2 : 0}deg)`;
        div.appendChild(svg);
        div.appendChild(span);
        elementRouletteChoices.appendChild(div);
        degreeFrom += degreeTo;

        const listChoice = document.createElement('div');
        const listChoiceColor = document.createElement('input');
        const listChoiceNo = document.createElement('span');
        const listChoiceText = document.createElement('input');
        const listChoiceDecrement = document.createElement('button');
        const listChoiceNumber = document.createElement('input');
        const listChoiceIncrement = document.createElement('button');
        const listChoicePercentage = document.createElement('span');
        const listChoiceRemove = document.createElement('button');

        listChoiceColor.type = 'color';
        listChoiceColor.value = choices[i].color;
        listChoiceColor.addEventListener('input', (event) => {
            choices[i].color = event.currentTarget.value;
            path.setAttribute('fill', `${choices[i].color}`);
            span.style.color = getContrastYIQ(choices[i].color);
        });
        listChoice.className = 'list-choice';
        listChoiceNo.className = 'number';
        listChoiceNo.textContent = `${no++}.`;
        listChoiceText.className = 'list-choice-text';
        listChoiceText.value = choices[i].text;
        listChoiceText.title = choices[i].text;
        listChoiceText.addEventListener('input', (event) => {
            choices[i].text = event.currentTarget.value;
            span.textContent = choices[i].text;
            listChoiceText.title = choices[i].text;
        });
        listChoiceDecrement.textContent = '-';
        listChoiceDecrement.addEventListener('click', () => {
            if (choices[i].number < 2) {
                return;
            }
            choices[i].number--;
            updateChoice();
        });
        listChoiceNumber.type = 'number';
        listChoiceNumber.value = `${choices[i].number}`;
        listChoiceIncrement.textContent = '+';
        listChoiceIncrement.addEventListener('click', () => {
            choices[i].number++;
            updateChoice();
        });

        listChoicePercentage.className = 'list-choice-percentage';
        listChoicePercentage.textContent = `${numberFormat.format((angle / 360 * choices[i].number) * 100)}%`;

        listChoiceRemove.className = 'remove';
        listChoiceRemove.textContent = 'Remove';
        listChoiceRemove.addEventListener('click', () => {
            choices.splice(i, 1);
            updateChoice();
        });

        listChoice.append(
            listChoiceColor,
            listChoiceNo,
            listChoiceText,
            listChoiceDecrement,
            listChoiceNumber,
            listChoiceIncrement,
            listChoicePercentage,
            listChoiceRemove
        );
        elementListChoices.appendChild(listChoice);
    }
}

function getResult() {
    let theta = rotation % 360;
    let from = 360;
    let to = 360;
    if (theta === 0) {
        return choices[0];
    }
    for (let i = 0; i < choices.length; i++) {
        to = from;
        from -= choices[i].number * angle;
        if ((360 + theta - arrowAngle) % 360 >= from && (360 + theta - arrowAngle) % 360 < to) {
            return choices[i].text;
        }
    }
}

function displayResult() {
    elementResults.innerHTML = '';
    for (let i = 0; i < results.length; i++) {
        const div = document.createElement('div');
        div.className = 'result';
        const number = document.createElement('span');
        number.className = 'number';
        number.innerText = `${i + 1}.`;
        const span = document.createElement('span');
        span.innerText = results[i];
        span.title = results[i];
        div.appendChild(number);
        div.appendChild(span);
        elementResults?.appendChild(div);
    }
}

function getContrastYIQ(hexcolor) {
    var r = parseInt(hexcolor.substring(1, 3), 16);
    var g = parseInt(hexcolor.substring(3, 5), 16);
    var b = parseInt(hexcolor.substring(5, 7), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}
