import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const noteFrequencies = [
  { note: "C2", freq: 65.41 },
  { note: "C#2/Db2", freq: 69.3 },
  { note: "D2", freq: 73.42 },
  { note: "D#2/Eb2", freq: 77.78 },
  { note: "E2", freq: 82.41 },
  { note: "F2", freq: 87.31 },
  { note: "F#2/Gb2", freq: 92.5 },
  { note: "G2", freq: 98.0 },
  { note: "G#2/Ab2", freq: 103.83 },
  { note: "A2", freq: 110.0 },
  { note: "A#2/Bb2", freq: 116.54 },
  { note: "B2", freq: 123.47 },
  { note: "C3", freq: 130.81 },
  { note: "C#3/Db3", freq: 138.59 },
  { note: "D3", freq: 146.83 },
  { note: "D#3/Eb3", freq: 155.56 },
  { note: "E3", freq: 164.81 },
  { note: "F3", freq: 174.61 },
  { note: "F#3/Gb3", freq: 185.0 },
  { note: "G3", freq: 196.0 },
  { note: "G#3/Ab3", freq: 207.65 },
  { note: "A3", freq: 220.0 },
  { note: "A#3/Bb3", freq: 233.08 },
  { note: "B3", freq: 246.94 },
  { note: "C4", freq: 261.63 },
  { note: "C#4/Db4", freq: 277.18 },
  { note: "D4", freq: 293.66 },
  { note: "D#4/Eb4", freq: 311.13 },
  { note: "E4", freq: 329.63 },
  { note: "F4", freq: 349.23 },
  { note: "F#4/Gb4", freq: 369.99 },
  { note: "G4", freq: 392.0 },
  { note: "G#4/Ab4", freq: 415.3 },
  { note: "A4", freq: 440.0 },
  { note: "A#4/Bb4", freq: 466.16 },
  { note: "B4", freq: 493.88 },
  { note: "C5", freq: 523.25 },
  { note: "C#5/Db5", freq: 554.37 },
  { note: "D5", freq: 587.33 },
  { note: "D#5/Eb5", freq: 622.25 },
  { note: "E5", freq: 659.25 },
  { note: "F5", freq: 698.46 },
  { note: "F#5/Gb5", freq: 739.99 },
  { note: "G5", freq: 783.99 },
  { note: "G#5/Ab5", freq: 830.61 },
  { note: "A5", freq: 880.0 },
  { note: "A#5/Bb5", freq: 932.33 },
  { note: "B5", freq: 987.77 },
  { note: "C6", freq: 1046.5 },
  { note: "C#6/Db6", freq: 1108.73 },
  { note: "D6", freq: 1174.66 },
  { note: "D#6/Eb6", freq: 1244.51 },
  { note: "E6", freq: 1318.51 },
  { note: "F6", freq: 1396.91 },
  { note: "F#6/Gb6", freq: 1479.98 },
  { note: "G6", freq: 1567.98 },
  { note: "G#6/Ab6", freq: 1661.22 },
  { note: "A6", freq: 1760.0 },
  { note: "A#6/Bb6", freq: 1864.66 },
  { note: "B6", freq: 1975.53 },
  { note: "C7", freq: 2093.0 },
  { note: "C#7/Db7", freq: 2217.46 },
  { note: "D7", freq: 2349.32 },
  { note: "D#7/Eb7", freq: 2489.02 },
  { note: "E7", freq: 2637.02 },
  { note: "F7", freq: 2793.83 },
  { note: "F#7/Gb7", freq: 2959.96 },
  { note: "G7", freq: 3135.96 },
  { note: "G#7/Ab7", freq: 3322.44 },
  { note: "A7", freq: 3520.0 },
  { note: "A#7/Bb7", freq: 3729.31 },
  { note: "B7", freq: 3951.07 },
  { note: "C8", freq: 4186.01 },
];

export const getNote = (frequency: number) => {
  let closestNote = noteFrequencies[0];
  let minDifference = Math.abs(Math.log2(frequency / closestNote.freq));

  for (let i = 1; i < noteFrequencies.length; i++) {
    const difference = Math.abs(Math.log2(frequency / noteFrequencies[i].freq));
    if (difference < minDifference) {
      closestNote = noteFrequencies[i];
      minDifference = difference;
    }
  }

  return closestNote.note;
};

export const solfegeMap = {
  'C': 'ド',
  'C#': 'ド♯',
  'Db': 'レ♭',
  'D': 'レ',
  'D#': 'レ♯',
  'Eb': 'ミ♭',
  'E': 'ミ',
  'F': 'ファ',
  'F#': 'ファ♯',
  'Gb': 'ソ♭',
  'G': 'ソ',
  'G#': 'ソ♯',
  'Ab': 'ラ♭',
  'A': 'ラ',
  'A#': 'ラ♯',
  'Bb': 'シ♭',
  'B': 'シ',
}

export const getNoteInSolfege = (note: string) => {
  const noteWithoutOctave = note.replace(/\d+$/, '');

  if (noteWithoutOctave.includes('/')) {
    // 複数の表記がある場合（例：C#/Db）
    const [sharp, flat] = noteWithoutOctave.split('/');
    return `${solfegeMap[sharp as keyof typeof solfegeMap] === undefined ? '' : solfegeMap[sharp as keyof typeof solfegeMap] + '/'}${solfegeMap[flat as keyof typeof solfegeMap]}`;
  } else {
    // 単一の表記の場合
    return solfegeMap[noteWithoutOctave as keyof typeof solfegeMap];
  }};


export const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};
