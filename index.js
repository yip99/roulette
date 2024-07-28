let roulette = document.querySelector(".container");
let button = document.getElementById("spin");

let isSpinning = false;
let rotation = 0;
let animationFrameId;

// let maxSpeed = 20; // degree per frame
let maxSpeed = 360 * 5; // degree per second
let accelerateTime = 3_000;
let decelerateTime = 12_000;
let then = Date.now();
let elapsed;
// let fpsLimit = 1000 / 60;
let fps = 0;
let startTime;
let stopTime;
let startSpeed;
let stopSpeed;
let speed = 0;
function startSpin() {
  elapsed = Date.now() - then;
  fps = 1000 / elapsed;
  then = Date.now();
  if (Date.now() - startTime < accelerateTime * (1 - startSpeed / maxSpeed)) {
    // 1
    // if (Date.now() - startTime < accelerateTime && Date.now() - startTime < accelerateTime * (Date.now() - startTime / accelerateTime)) { // 2
    // if (Date.now() - startTime < accelerateTime) { // 0
    // speed = maxSpeed * bezierBlend((Date.now() - startTime) / accelerateTime); // 0
    speed =
      maxSpeed *
        bezierBlend(
          (Date.now() - startTime) /
            (accelerateTime * (1 - startSpeed / maxSpeed)),
        ) +
      startSpeed *
        (1 -
          (Date.now() - startTime) /
            (accelerateTime * (1 - startSpeed / maxSpeed))); // 1
    // speed = maxSpeed * bezierBlend((Date.now() - startTime) / (accelerateTime * (1 - (Date.now() - startTime / accelerateTime)))); // 2
    rotation += speed / fps;
    roulette.style.transform = `rotate(${rotation}deg)`;
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
  roulette.style.transform = `rotate(${rotation}deg)`;
  animationFrameId = requestAnimationFrame(spin);
}

function stopSpin() {
  elapsed = Date.now() - then;
  fps = 1000 / elapsed;
  then = Date.now();
  if (Date.now() - stopTime < decelerateTime * (stopSpeed / maxSpeed)) {
    // 1
    // if (Date.now() - stopTime < decelerateTime) {
    // speed = stopSpeed * bezierBlend(1 - ((Date.now() - stopTime) / decelerateTime));
    speed =
      stopSpeed *
      (1 -
        easeInOutSine(
          (Date.now() - stopTime) / (decelerateTime * (stopSpeed / maxSpeed)),
        )); // 1
    rotation += speed / fps;
    roulette.style.transform = `rotate(${rotation}deg)`;
    animationFrameId = requestAnimationFrame(stopSpin);
  } else {
    cancelAnimationFrame(animationFrameId);
    console.timeLog("stopped");
    let choice;
    document.querySelectorAll(".container > *").forEach((element) => {
      const position = element.getBoundingClientRect();
      if (!choice || position.bottom < choice.position.bottom) {
        choice = { element, position };
      }
    });
    console.log(choice.element.textContent);
  }
}

button.addEventListener("click", () => {
  if (!isSpinning) {
    console.timeEnd("stopped");
    isSpinning = true;
    cancelAnimationFrame(animationFrameId);
    console.time("max");
    // console.timeLog('max');
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

function bezierBlend(t) {
  return t * t * (3 - 2 * t);
}

function parametricBlend(t) {
  const sqr = t * t;
  return sqr / (2 * (sqr - t) + 1);
}

function inOutQuadBlend(t) {
  if (t <= 0.5) return 2 * t * t;
  t -= 0.5;
  return 2 * t * (1 - t) + 0.5;
}

function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}
