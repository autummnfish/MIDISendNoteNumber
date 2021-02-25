"use strict";

const outputSelector = document.querySelector("#output_selector");
const playButton = document.querySelector("#play_button");
const pitchButton = document.querySelector("#pitch_button");

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

//playボタンが押されたら
playButton.addEventListener("click", () => {
  pitch = pitchButton.value;
  if (pitch === null || pitch === undefined || pitch === "") {
    alert("Please enter number");
  } else if (pitch < 0 || pitch > 127) {//ノート番号の範囲外なら
    alert("The number is out of lenge");
  } else {
    const index = outputSelector.selectedIndex;
    const portId = outputSelector[index].value;

    const output = outputs.get(portId);
    output.send([0x90, pitch, 100]);
    output.send([0x80, pitch, 100], window.performance.now() + 1000);
  }
});

