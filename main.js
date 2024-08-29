var setup, draw, mousePressed, windowResized;

const MOUSE_MODES = {
  "Click": 0,
  "Drag": 1
};

const PARTICLE_MOTION_TYPES = {
  "Linear": 0,
  "Outward": 1
};

function isNumeric(str) {
  if (typeof str != "string") return false; 
  return !isNaN(str) && !isNaN(parseFloat(str));
}

function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

(function() {
  let effects = [];

  var e_particleControlDiv;
  var pcHidden = false;
  var otherHidden = false;

  var mouseModeValue = 0;
  var motionTypeValue = 1;
  var amountValue = 20;
  var spreadXValue = 0;
  var spreadYValue = 0;
  var durationValue = 60;
  var durationVarValue = 0;
  var velocityXValue = 1;
  var velocityXVarValue = 0;
  var velocityYValue = 1;
  var velocityYVarValue = 0;
  var frictionValue = 0;
  var sizeValue = 10;
  var sizeVarValue = 0;
  var colorValue = [255, 0, 0];
  var colorVarValue = [32, 32, 32]
  var fadeValue = true;

  let amountParticles = 0;

  function fadeDiv(div, hidden) {
    if (hidden) {
      div.classList.remove("fadein");
      div.classList.add("fadeout");
      setTimeout(() => {div.style.display = "none"}, 500);
    }
    else {
      div.style.display = "inline-block";
      setTimeout(() => {
        div.classList.remove("fadeout");
        div.classList.add("fadein");
      }, 1);  // timeout because it doesnt work otherwise ¯\_(ツ)_/¯
    }
  }

  function addListeners() {
    e_particleControlDiv = document.getElementById("particle-control");
    document.getElementById("button-pcShowHide").onclick = () => {
      pcHidden = !pcHidden;
      fadeDiv(e_particleControlDiv, pcHidden);
    }

    e_otherControlDiv = document.getElementById("other-controls");
    document.getElementById("button-otherShowHide").onclick = () => {
      otherHidden = !otherHidden;
      fadeDiv(e_otherControlDiv, otherHidden);
    }
  
    for (let e of document.getElementsByName("rad-mouseMode")) {
      e.onchange = () => {if (e.checked) mouseModeValue = MOUSE_MODES[e.value];};
    }
    let e_particleAmount = document.getElementById("inp-particleAmount");
    e_particleAmount.onchange = () => {amountValue = parseInt(e_particleAmount.value)};
    for (let e of document.getElementsByName("rad-motionType")) {
      e.onchange = () => {if (e.checked) motionTypeValue = PARTICLE_MOTION_TYPES[e.value];};
    }
    let e_spreadX = document.getElementById("rng-spreadX");
    e_spreadX.onchange = () => {spreadXValue = parseFloat(e_spreadX.value)};
    let e_spreadY = document.getElementById("rng-spreadY");
    e_spreadY.onchange = () => {spreadYValue = parseFloat(e_spreadY.value)};
    let e_duration = document.getElementById("rng-duration");
    e_duration.onchange = () => {durationValue = parseFloat(e_duration.value)};
    let e_durationVar = document.getElementById("rng-durationVar");
    e_durationVar.onchange = () => {durationVarValue = parseFloat(e_durationVar.value)};
    let e_velocityX = document.getElementById("rng-velocityX");
    e_velocityX.onchange = () => {velocityXValue = parseFloat(e_velocityX.value)};
    let e_velocityXVar = document.getElementById("rng-velocityXVar");
    e_velocityXVar.onchange = () => {velocityXVarValue = parseFloat(e_velocityXVar.value)};
    let e_velocityY = document.getElementById("rng-velocityY");
    e_velocityY.onchange = () => {velocityYValue = parseFloat(e_velocityY.value)};
    let e_velocityYVar = document.getElementById("rng-velocityYVar");
    e_velocityYVar.onchange = () => {velocityYVarValue = parseFloat(e_velocityYVar.value)};
    let e_friction = document.getElementById("rng-friction");
    e_friction.onchange = () => {frictionValue = parseFloat(e_friction.value)};
    let e_size = document.getElementById("rng-size");
    e_size.onchange = () => {sizeValue = parseFloat(e_size.value)};
    let e_sizeVar = document.getElementById("rng-sizeVar");
    e_sizeVar.onchange = () => {sizeVarValue = parseFloat(e_sizeVar.value)};
    let e_color = document.getElementById("col-particleColor");
    e_color.onchange = () => {colorValue = hexToRgb(e_color.value)};
    for (let e of document.getElementsByName("rad-fade")) {
      e.onchange = () => {if (e.checked) fadeValue = e.value === "True";};
    }   

    let e_bgColor = document.getElementById("col-backgroundColor");
    e_bgColor.onchange = () => {document.body.style.backgroundColor = e_bgColor.value;};
  }

  function createParticleEffect() {
    let effect = new ParticleEffect(motionTypeValue, createVector(mouseX, mouseY), amountValue,
                                    createVector(spreadXValue, spreadYValue), durationValue, durationVarValue,
                                    createVector(velocityXValue, velocityYValue), createVector(velocityXVarValue, velocityYVarValue), frictionValue,
                                    sizeValue, sizeVarValue, colorValue, colorVarValue, fadeValue
                                   );
    effects.push(effect);
    amountParticles += amountValue;
  }

  setup = function() {
    addListeners();
    let c = createCanvas(windowWidth, windowHeight);
    c.position(0, 0);

    noStroke();
    frameRate(60);
  }

  draw = function() {
    if (mouseModeValue == 1 && mouseIsPressed) {
      createParticleEffect();
    }
    
    clear();
    for (let i = 0; i < effects.length; i++) {
      let effect = effects[i];
      let [destroy, amountDestroyed] = effect.tickdraw();
      if (destroy) {
        effects.splice(i, 1);
        i -= 1;
      }
      amountParticles -= amountDestroyed;
    }
    fill(0, 0, 0);
    textAlign(RIGHT, TOP);
    text(`fps: ${Math.round(frameRate())}`, windowWidth, 0);
    text(`particles: ${amountParticles}`, windowWidth, 15);
  }

  mousePressed = function() {
    if (mouseModeValue != 0)
      return;
    createParticleEffect();
  }

  windowResized = function() {
    resizeCanvas(windowWidth, windowHeight);
  }
})();