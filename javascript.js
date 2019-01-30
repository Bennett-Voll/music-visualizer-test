function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function preload() {
    sound = loadSound('assets/boc.mp3');
}

function setup() {
    var cnv = createCanvas(window.innerWidth, window.innerHeight);
    cnv.mouseClicked(togglePlay);
    fft = new p5.FFT();
    sound.amp(0.2);
}

function draw() {
    background(0);

    var centerX = width / 2;
    var centerY = height / 2;
    var minLength = Math.min(width, height) / 2;

    var spectrum = fft.analyze();
    var waveform = fft.waveform();

    noFill();
    beginShape();
    stroke(255, 0, 0); // waveform is red
    strokeWeight(1);
    for (var i = 0; i < waveform.length; i += 1) {
        var waveI = i;
        var specI = i === waveform.length - 1 ? i : i - i % 8;

        var deg = map(i, 0, waveform.length, 0, Math.PI * 2);

        var waveformX = map(waveform[waveI], 0, 1, 0, minLength / 2);
        var waveformY = map(waveform[waveI], 0, 1, 0, minLength / 2);

        var spectrumX = (i % 2 === 0 ? -1 : 1) * map(spectrum[specI], 0, 255, 0, minLength / 3);
        var spectrumY = (i % 2 === 0 ? -1 : 1) * map(spectrum[specI], 0, 255, 0, minLength / 3);

        var x = centerX + (waveformX + spectrumX) * Math.cos(deg);
        var y = centerY + (waveformY + spectrumY) * Math.sin(deg);
        
        vertex(x, y);
    }
    endShape();
}

// fade sound if mouse is over canvas
function togglePlay() {
    if (sound.isPlaying()) {
        sound.pause();
    } else {
        sound.loop();
    }
}