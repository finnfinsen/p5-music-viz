/*
  The detectBeat() function decides whether we have a beat or not
  based on amplitude level and Beat Detect Variables.
 */
var soundfile; // input sources

var amplitude;

/* 
 Beat Detect Variables
*/
// how many draw loop frames before the beatCutoff starts to decay
// so that another beat can be triggered.
// frameRate() is usually around 60 frames per second,
// so 20 fps = 3 beats per second, meaning if the song is over 180 BPM,
// we wont respond to every beat.
var beatHoldFrames = 20;

// what amplitude level can trigger a beat?
var beatThreshold = 0.11; 

// When we have a beat, beatCutoff will be reset to 1.1*beatThreshold, and then decay
// Level must be greater than beatThreshold and beatCutoff before the next beat can trigger.
var beatCutoff = 0;
var beatDecayRate = 0.95; // how fast does beat cutoff decay?
var framesSinceLastbeat = 0; // once this equals beatHoldFrames, beatCutoff starts to decay.

var circle;
var backgroundColor;

function preload() {
  soundfile = loadSound('../music/YACHT_-_06_-_Summer_Song_Instrumental.mp3');
}

function setup() {
  c = createCanvas(windowWidth, windowHeight);
  noStroke();

  amplitude = new p5.Amplitude();

  // make a shape
  circle = new Particle();

  soundfile.play();
}

function draw() {
  background(backgroundColor);

  var level = amplitude.getLevel();
  detectBeat(level);

  circle.update(level);
  circle.draw();
}


function detectBeat(level) {
  if (level  > beatCutoff && level > beatThreshold){
    onBeat();
    beatCutoff = level *1.1;
    framesSinceLastbeat = 0;
  } else{
    if (framesSinceLastbeat <= beatHoldFrames){
      framesSinceLastbeat ++;
    }else{
      beatCutoff *= beatDecayRate;
      beatCutoff = Math.max(beatCutoff, beatThreshold);
    }
  }
}

function onBeat() {
  console.log('beat!');
  backgroundColor = color( random(0,255), random(0,255), random(0,255) );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

// in p5, keyPressed is not case sensitive, but keyTyped is
function keyPressed() {
  if (key == 'T') {
    toggleInput();
  }
}

function toggleInput() {
  if (soundfile.isPlaying() ) {
    soundfile.pause();
    mic.start();
    fft.setInput(mic);
    amplitude.setInput(mic);
  } else {
    soundfile.play();
    mic.stop();
    fft.setInput(soundfile);
    amplitude.setInput(soundfile);
  }
}


// ===============
// Particle class
// ===============

var Particle = function() {
  this.position = createVector( random(0, width), height/2 );
  this.scale = random(1, 2);
  this.speed = random(0, 10);
  this.color = color( random(0,255), random(0,255), random(0,255) );
};

Particle.prototype.update = function(levelRaw) {
  this.diameter = map(levelRaw, 0, 1, 0, 100) * this.scale;
};

Particle.prototype.draw = function() {
  fill(this.color);
  ellipse(
    this.position.x, this.position.y,
    this.diameter, this.diameter
  );
};