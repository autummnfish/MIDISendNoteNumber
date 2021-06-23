"use strict";
/*
 *コードの制約上,MIDIはA0(ラの音)から始まっちゃうのでそのへんは要相談(とりあえずC0からはじめる)
 *コードはA~Gの7種類
 */
//c0 = 12,c1 = 24,c2 = 36,c3 = 48,c4 = 60,c5 = 72,c6 = 84,c7 = 96,c8 = 108,c9 = 120
//実装はc7を上限とした(左端の限界がc7)
const outputSelector = document.querySelector("#output_selector");
const playButton = document.querySelector("#play_button");
const pitchButton = document.querySelector("#pitch_area");
const piano_field = document.querySelector("#piano_button");
const pitchUpButton = document.querySelector("#pitch_up_button");
const pitchDownButton = document.querySelector("#pitch_down_button");
const keyLayArray = [
  //キーボード配列を配列に代入したもの
  //長さは26

  "z", //c
  "s", //
  "x", //d
  "d", //
  "c", //e
  "v", //f
  "g", //
  "b", //g
  "h", //
  "n", //a
  "j", //
  "m", //b
  ",", // c//下段ここまで
  "1", //
  "q", //d
  "2", //
  "w", //e
  "e", //f
  "4", //
  "r", //g
  "5", //
  "t", //a
  "6", //
  "y", //b
  "u", //c
  "8", //
  "i", // d
];
const pianoKeyLength = keyLayArray.length;
const mod = 12;
const black = "black",
  white = "white",
  blackSide = "sd";
let MIDIOutputAccess = null;
let pitch = null;
let noteMinNumber = 48; //C3からはじめる

let keyLayout = initMap(noteMinNumber);
let isSendMap = initSendNoteMap();

navigator.requestMIDIAccess({ sysex: true }).then(callSucess, callFail);

const piano_key_id = piano_field.childNodes;
createPianoKeyboard(noteMinNumber, pianoKeyLength);
joinMIDIMessage(piano_key_id);

//キーボードが押された場合の処理、矢印キー上下の場合キーボードが変更される
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    const deltaNum = -12;
    changePitchUpDown(noteMinNumber, deltaNum);
  } else if (e.key === "ArrowUp") {
    const addNum = 12;
    changePitchUpDown(noteMinNumber, addNum);
  } else if (
    keyLayout.get(e.key) !== undefined &&
    keyLayout.get(e.key) !== null
  ) {
    if (!isSendMap.get(e.key)) {
      isSendMap.set(e.key, true);
      sendMIDIMessage(keyLayout.get(e.key), true);
      const keyValueIndex = Number(keyLayout.get(e.key)) % noteMinNumber;
      const keyId = piano_key_id[keyValueIndex];
      changeClassName(keyValueIndex, keyId, true);

    }
  }
});

window.addEventListener("keyup", (e) => {

  if (keyLayout.get(e.key) !== null && keyLayout.get(e.key) !== undefined) {
    isSendMap.set(e.key, false);
    sendMIDIMessage(keyLayout.get(e.key), false);
    const keyValueIndex = Number(keyLayout.get(e.key)) % noteMinNumber;
    const keyId = piano_key_id[keyValueIndex];
    changeClassName(keyValueIndex, keyId, false);


  }
});

pitchUpButton.addEventListener("click", () => {
  const addNum = 12;
  changePitchUpDown(noteMinNumber, addNum);
});

pitchDownButton.addEventListener("click", () => {
  const deltaNum = -12;
  changePitchUpDown(noteMinNumber, deltaNum);
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
  const chordSize = 12;
  const chordKindArray = ["C", "D", "E", "F", "G", "A", "B"];
  let now = 0;
  for (let i = minNumber; i < minNumber + lenge; i++) {
    let keyboard = document.createElement("li");
    keyboard.id = `node${i}`;
    if (isBlackKey(i)) {
      keyboard.className = `${black}`;
      keyboard.innerText = "";
    } else {
      const chd = chordKindArray[now % chordKindArray.length];
      const isSide = isBlackSide(chd);
      if (isSide) {
        keyboard.className = `${white} ${blackSide}`;
      } else {
        keyboard.className = `${white}`;
      }
      keyboard.innerText = `${i}`;
      now++;
    }



    piano_field.appendChild(keyboard);
  }
}

function joinMIDIMessage(sendId) {
  for (let i = 0; i < sendId.length; i++) {
    const IDNumber = sendId[i].id.slice(4); //id名であるnodeiのiのみの部分文字列を取得
    sendId[i].addEventListener("mousedown", () => {
      sendMIDIMessage(IDNumber, true);
      changeClassName(i, sendId[i], true);
    });
    sendId[i].addEventListener("mouseup", () => {
      sendMIDIMessage(IDNumber, false);
      changeClassName(i, sendId[i], false);


    });
  }
}

function sendMIDIMessage(note, bool) {
  const MIDIOutput = setMIDIOutput(outputSelector);
  if (MIDIOutput !== -1) {
    //-1はindeの例外
    const sendNote = Number(note);
    if (bool) {
      MIDIOutput.send([0x90, sendNote, 100]);
    } else {
      MIDIOutput.send([0x80, sendNote, 100]);
    }
  } else {
    alert(`Please admit MIDI access`); //TODO: うざったいので別の方法で警告を出したい
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
    keyLayout = initMap(noteMinNumber);
  }
}

function resetKeyboard(start) {
  for (let i = start; i < start + pianoKeyLength; i++) {

    const R = document.querySelector(`#node${i}`);
    piano_field.removeChild(R);
  }
}

function isValidValue(value, min, max) {
  if (value === null || value === undefined || value === "") {
    return false;
  } else if (value < min || value > max) {
    return false;
  }
  return true;
}

function isBlackKey(n) {
  if (
    n % mod === 1 ||
    n % mod === 3 ||
    n % mod === 6 ||
    n % mod === 8 ||
    n % mod === 10
  ) {
    return true;
  }
  return false;
}

function initMap(minN) {
  let map = new Map();
  for (let i = 0; i < keyLayArray.length; i++) {
    map.set(keyLayArray[i], minN + i);
  }
  return map;
}


function initSendNoteMap() {
  let map = new Map();
  for (let i = 0; i < keyLayArray.length; i++) {
    map.set(keyLayArray[i], false);
  }
  return map;
}

function changePitchUpDown(noteNum, addNum) {
  if (noteNum + addNum < 96 && noteNum + addNum >= 0) {
    updateKeyboard(noteNum + addNum);
  }
}


function changePushMode(keyId, color, isPush) {
  const chd = keyId.innerText.slice(0, 1);
  const isSide = isBlackSide(chd);
  if (isPush) {
    if (isSide) {
      keyId.className = `${color}_pushed ${blackSide}`;
    } else {
      keyId.className = `${color}_pushed`;
    }
  } else {
    if (isSide) {
      keyId.className = `${color} ${blackSide}`;
    } else {
      keyId.className = `${color}`;
    }
  }
}

function changeClassName(n, keyId, isPush) {
  if (isBlackKey(n)) {
    changePushMode(keyId, black, isPush);
  } else {
    changePushMode(keyId, white, isPush);
  }
}

function isBlackSide(chd) {
  const sideArray = ["A", "B", "D", "G", "E"];

  return sideArray.includes(chd);
}
