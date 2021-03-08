"use strict";
//ATTENTION: ん？って思ったやつの7割くらいはコールバックとかの非同期処理を理解してないことによるバグだぞ、特にaddEventListenerとPromise

/***
 *
 *MUST TODO: MIDIデバイスの接続を拒否 or 許可する前にボタンを操作した場合に発生するエラーに対して例外を投げたい <-実装終了
 *TODO: キーボード長押しで音がぶつ切れになるのを防ぐ
 */
const outputSelector = document.querySelector("#output_selector");
const playButton = document.querySelector("#play_button");
const pitchButton = document.querySelector("#pitch_area");
const piano_field = document.querySelector("#piano_button");
const keyLayArray = [
  //キーボード配列を配列に代入したもの
  "z",
  "s",
  "x",
  "d",
  "c",
  "f",
  "v",
  "g",
  "b",
  "h",
  "n",
  "j",
  "m", //下段ここまで
  "q",
  "2",
  "w",
  "3",
  "e",
  "4",
  "r",
  "5",
  "t",
  "6",
  "y",
  "7",
  "u",
  "8",
  "i",
  "9",
  "o",
  "0",
  "p",
];
const pianoKeyLength = keyLayArray.length;
let MIDIOutputAccess = null;
let pitch = null;
let noteMinNumber = 48;
let keyLayout = new Map();
initMap(keyLayout, noteMinNumber);

navigator.requestMIDIAccess({ sysex: true }).then(callSucess, callFail);

const piano_key_id = piano_field.childNodes;
createPianoKeyboard(noteMinNumber, pianoKeyLength);
joinMIDIMessage(piano_key_id);

//playボタンが押されたら
playButton.addEventListener("click", () => {
  updateKeyboard(pitchButton.value); //HACK: アロー関数のなかで関数呼び出し
});

//キーボードが押された場合の処理、enter以外の特殊キーは無視
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    updateKeyboard(pitchButton.value);
  } else if (
    keyLayout.get(e.key) !== undefined &&
    keyLayout.get(e.key) !== null
  ) {
    sendMIDIMessage(keyLayout.get(e.key), true);
  }
});

window.addEventListener("keyup", (e) => {
  if (keyLayout.get(e.key) != null) {
    sendMIDIMessage(keyLayout.get(e.key), false);
  }
});

function callSucess(midiAccess) {
  MIDIOutputAccess = midiAccess.outputs;
  for (let output of MIDIOutputAccess.values()) {
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

function createPianoKeyboard(minNumber, lenge) {
  //鍵盤作成
  for (let i = minNumber; i <= minNumber + lenge; i++) {
    let keyboard = document.createElement("button");
    keyboard.id = `node${i}`;
    keyboard.innerText = `${i}`;
    piano_field.appendChild(keyboard);
  }
}

function joinMIDIMessage(sendId) {
  for (let i = 0; i < sendId.length; i++) {
    sendId[i].addEventListener("mousedown", () => {
      sendMIDIMessage(sendId[i].innerText, true); //HACK: アロー関数の中に関数呼び出し
    });
    sendId[i].addEventListener("mouseup", () => {
      //TODO: 音を止める関数
      sendMIDIMessage(sendId[i].innerText, false);
    });
    sendId[i].addEventListener("mouseout", () => {
      sendMIDIMessage(sendId[i].innerText, false);
    });
  }
}

function sendMIDIMessage(note, bool) {
  const MIDIOutput = setMIDIOutput(outputSelector); //FIXME: グローバルにするとエラー
  if (MIDIOutput !== -1) {//-1はindeの例外
    const sendNote = Number(note);
    if (bool) {
      MIDIOutput.send([0x90, sendNote, 100]);
    } else {
      MIDIOutput.send([0x80, sendNote, 100]);
    }
  } else {
    alert(`Please admit MIDI access`);
  }
}

function setMIDIOutput(targetSelector) {
  //ポート番号を指定
  const index = targetSelector.selectedIndex;
  if (index < 0) {
    
    return index;
  } else {
    const portId = targetSelector[index].value;
    const output = MIDIOutputAccess.get(portId);
    return output;
  }
}

function updateKeyboard(pitch) {
  //pitchはstring型
  const pitchMin = 0,
    pitchMax = 95;
  if (isValidValue(pitch, pitchMin, pitchMax)) {
    resetKeyboard(noteMinNumber);
    noteMinNumber = Number(pitch);
    createPianoKeyboard(Number(pitch), pianoKeyLength);
    joinMIDIMessage(piano_key_id);
    initMap(keyLayout, noteMinNumber);
  }
}

function resetKeyboard(start) {
  for (let i = start; i <= start + pianoKeyLength; i++) {
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
  for (let i = 0; i < keyLayArray.length; i++) {
    map.set(keyLayArray[i], minN + i);
  }
}
