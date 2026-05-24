(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

// const audioCtx = new AudioContext();

// let audioContext = wavesAudio.audioContext;
const audioContext = new AudioContext();

var speedFactor = 1.0;
var pitchFactor = 1.0;

async function init() {
  if (audioContext.audioWorklet === undefined) {
    handleNoWorklet();
    return;
  }

  let [playerEngine, phaseVocoderNode] = await setupEngine();

  //   let playControl = new wavesAudio.PlayControl(playerEngine);
  //   playControl.setLoopBoundaries(0, buffer.duration);
  //   playControl.loop = true;

  //   setupPlayPauseButton(playControl);
  //   setupSpeedSlider(playControl, phaseVocoderNode);
  setupPitchSlider(phaseVocoderNode);
  //   setupTimeline(, playControl);
}

function handleNoWorklet() {
  let $noWorklet = document.querySelector("#no-worklet");
  $noWorklet.style.display = "block";
  let $timeline = document.querySelector(".timeline");
  $timeline.style.display = "none";
  let $controls = document.querySelector(".controls");
  $controls.style.display = "none";
}

async function setupEngine() {
  // Main block for doing the audio recording
  const constraints = { audio: true };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  await audioContext.audioWorklet.addModule("phase-vocoder.js");
  let phaseVocoderNode = new AudioWorkletNode(
    audioContext,
    "phase-vocoder-processor",
  );

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(phaseVocoderNode);
  phaseVocoderNode.connect(audioContext.destination);

  return [source, phaseVocoderNode];
}

function setupPlayPauseButton(playControl) {
  let $playButton = document.querySelector("#play-pause");
  let $playIcon = $playButton.querySelector(".play");
  let $pauseIcon = $playButton.querySelector(".pause");
  $playButton.addEventListener(
    "click",
    function () {
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      if (this.dataset.playing === "false") {
        playControl.start();
        this.dataset.playing = "true";
        $playIcon.style.display = "none";
        $pauseIcon.style.display = "inline";
      } else if (this.dataset.playing === "true") {
        playControl.pause();
        this.dataset.playing = "false";
        $pauseIcon.style.display = "none";
        $playIcon.style.display = "inline";
      }
    },
    false,
  );
}

// function setupSpeedSlider(playControl, phaseVocoderNode) {
//   let pitchFactorParam = phaseVocoderNode.parameters.get("pitchFactor");
//   let $speedSlider = document.querySelector("#speed");
//   let $valueLabel = document.querySelector("#speed-value");
//   $speedSlider.addEventListener(
//     "input",
//     function () {
//       speedFactor = parseFloat(this.value);
//     //   playControl.speed = speedFactor;
//       pitchFactorParam.value = (pitchFactor * 1) / speedFactor;
//       $valueLabel.innerHTML = speedFactor.toFixed(2);
//     },
//     false,
//   );
// }

function setupPitchSlider(phaseVocoderNode) {
  let pitchFactorParam = phaseVocoderNode.parameters.get("pitchFactor");
  let $pitchSlider = document.querySelector("#pitch");
  let $valueLabel = document.querySelector("#pitch-value");
  $pitchSlider.addEventListener(
    "input",
    function () {
      pitchFactor = parseFloat(this.value);
      pitchFactorParam.value = (pitchFactor * 1) / speedFactor;
      $valueLabel.innerHTML = pitchFactor.toFixed(2);
    },
    false,
  );
}

function setupTimeline(buffer, playControl) {
  //   let $timeline = document.querySelector("#timeline");
  //   const width = $timeline.getBoundingClientRect().width;
  //   const height = 200;
  //   const duration = buffer.duration;
  //   const pixelsPerSecond = width / duration;
  //   let timeline = new wavesUI.core.Timeline(pixelsPerSecond, width);
  //   timeline.createTrack($timeline, height, "main");
  //   let waveformLayer = new wavesUI.helpers.WaveformLayer(buffer, {
  //     height: height,
  //   });
  //   // cursor
  //   let cursorData = { position: 0 };
  //   let cursorLayer = new wavesUI.core.Layer("entity", cursorData, {
  //     height: height,
  //   });
  //   let timeContext = new wavesUI.core.LayerTimeContext(timeline.timeContext);
  //   cursorLayer.setTimeContext(timeContext);
  //   cursorLayer.configureShape(
  //     wavesUI.shapes.Cursor,
  //     {
  //       x: (data) => {
  //         return data.position;
  //       },
  //     },
  //     {
  //       color: "red",
  //     },
  //   );
  //   timeline.addLayer(waveformLayer, "main");
  //   timeline.addLayer(cursorLayer, "main");
  //   timeline.tracks.render();
  //   timeline.tracks.update();
  //   // cursor animation loop
  //   (function loop() {
  //     cursorData.position = playControl.currentPosition;
  //     timeline.tracks.update(cursorLayer);
  //     requestAnimationFrame(loop);
  //   })();
}

window.addEventListener("click", init);

function visualize() {
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  const visualSetting = visualSelect.value;
  console.log(visualSetting);

  if (visualSetting === "sinewave") {
    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    console.log(bufferLength);

    // We can use Float32Array instead of Uint8Array if we want higher precision
    // const dataArray = new Float32Array(bufferLength);
    const dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    const draw = () => {
      drawVisual = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = "rgb(200, 200, 200)";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "rgb(0, 0, 0)";

      canvasCtx.beginPath();

      const sliceWidth = (WIDTH * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * HEIGHT) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(WIDTH, HEIGHT / 2);
      canvasCtx.stroke();
    };

    draw();
  } else if (visualSetting == "frequencybars") {
    analyser.fftSize = 256;
    const bufferLengthAlt = analyser.frequencyBinCount;
    console.log(bufferLengthAlt);

    // See comment above for Float32Array()
    const dataArrayAlt = new Uint8Array(bufferLengthAlt);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    const drawAlt = () => {
      drawVisual = requestAnimationFrame(drawAlt);

      analyser.getByteFrequencyData(dataArrayAlt);

      canvasCtx.fillStyle = "rgb(0, 0, 0)";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLengthAlt) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLengthAlt; i++) {
        const barHeight = dataArrayAlt[i];

        canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
        canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
    };

    drawAlt();
  } else if (visualSetting == "off") {
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.fillStyle = "red";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}

},{}]},{},[1]);
