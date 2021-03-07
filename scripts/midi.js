"use strict";

const outputSelector = document.querySelector("#output_selector");
const playButton = document.querySelector("#play_button");
const pitchButton = document.querySelector("#pitch_area");
const piano_field = document.querySelector("#piano_button");

let outputs = null;
let pitch = null;
navigator.requestMIDIAccess({ sysex: true }).then(callSucess, callFail);

function callSucess(midiAccess) {
  outputs = midiAccess.outputs;
  for (let output of outputs.values()) {
    const optionEl = document.createElement("option");
    optionEl.text = output.name;
    optionEl.value = output.id;
    outputSelector.appendChild(optionEl);
  }
}

function callFail(err) {
  //エラー処理
  console.log(err);
}

let noteMinNumber = 48;
const keyLength = 26; //アルファベットの数にそろえてるだけ

let keyLayout = new Map();
initMap(keyLayout, noteMinNumber);

createPianoKeyboard(noteMinNumber);

function createPianoKeyboard(minNumber) {
  //鍵盤作成
  for (let i = minNumber; i <= minNumber + keyLength; i++) {
    let keyboard = document.createElement("button");
    keyboard.id = `node${i}`;
    keyboard.innerText = `${i}`;
    piano_field.appendChild(keyboard);
  }
}

joinMIDIMessage();

function joinMIDIMessage() {
  const piano_key_id = piano_field.childNodes; 
  callMIDIMessage(piano_key_id);
}

function callMIDIMessage(sendId) {
  for (let i = 0; i < sendId.length; i++) {
    sendId[i].addEventListener("mousedown", () => {
      sendMIDIMessage(sendId[i].innerText);
    });
  }
}

function sendMIDIMessage(note) {
  const output = setMIDIOutput(outputSelector);
  const sendNote = Number(note);
  output.send([0x90, sendNote, 100]);
  output.send([0x80, sendNote, 100], window.performance.now() + 1000);
}

// function readyMIDImsg(note){
//   const output = setMIDIOutput(outputSelector);
//   const sendNote = Number(note);
// }


// function stopMIDIMessage(note){
//   const output = setMIDIOutput(outputSelector);
//   const sendNote = Number(note);
//   output.send([0x80, sendNote, 100]);
// }

function setMIDIOutput(targetSelector) {
  const index = targetSelector.selectedIndex;
  const portId = targetSelector[index].value;
  const output = outputs.get(portId);
  return output;
}

function changeKeyboard(pitch) {
  //pitchはstring型
  const pitchMin = 0,
    pitchMax = 103;
  if (isValidValue(pitch, pitchMin, pitchMax)) {
    resetKeyboard(noteMinNumber);
    noteMinNumber = Number(pitch);
    createPianoKeyboard(Number(pitch));
    joinMIDIMessage();
    initMap(keyLayout, noteMinNumber);
  }
}

//playボタンが押されたら
playButton.addEventListener("click", () => {
  changeKeyboard(pitchButton.value); 
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    changeKeyboard(pitchButton.value);
  } else if (
    keyLayout.get(e.key) !== undefined &&
    keyLayout.get(e.key) !== null
  ) {
    //sendする
    sendMIDIMessage(keyLayout.get(e.key));
  }
});

function resetKeyboard(start) {
  for (let i = start; i <= start + keyLength; i++) {
    const R = document.querySelector(`#node${i}`);
    piano_field.removeChild(R);
  }
}

function isValidValue(value, min, max) {
  if (value === null || value === undefined || value === "") {
    alert("Please enter number");
    return false;
  } else if (value < min || value > max) {
    alert("The number is out of lenge");
    return false;
  }
  return true;
}



function initMap(map, minN) {
  map.set("z", minN);
  map.set("x", minN);
  map.set("c", minN);
  map.set("v", minN);
  map.set("b", minN);
  map.set("n", minN);
  map.set("m", minN);
  map.set("a", minN);
  map.set("s", minN);
  map.set("d", minN);
  map.set("f", minN);
  map.set("g", minN);
  map.set("h", minN);
  map.set("j", minN);
  map.set("k", minN);
  map.set("l", minN);
  map.set("q", minN);
  map.set("w", minN);
  map.set("e", minN);
  map.set("r", minN);
  map.set("t", minN);
  map.set("y", minN);
  map.set("u", minN);
  map.set("i", minN);
  map.set("o", minN);
  map.set("p", minN);
  let i = 0;
  map.forEach((note, key) => {
    map.set(key, note + i);
    i++;
  });
}
