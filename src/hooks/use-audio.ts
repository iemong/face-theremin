import { useCallback, useState } from "react";

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | undefined>(
    undefined,
  );
  const [oscillator, setOscillator] = useState<OscillatorNode | undefined>(
    undefined,
  );

  const createOscillator = useCallback((context: AudioContext) => {
    const osc = context.createOscillator();
    osc.type = "sawtooth";
    osc.connect(context.destination);
    return osc;
  }, []);

  const setupAudio = useCallback(() => {
    const context = new window.AudioContext();
    const osc = createOscillator(context);
    osc.start();
    setIsPlaying(true);
    setAudioContext(context);
    setOscillator(osc);
  }, [createOscillator]);

  const playAudio = useCallback(() => {
    if (oscillator !== undefined || isPlaying) {
      return;
    }
    const osc = createOscillator(audioContext!);
    osc.start();
    setIsPlaying(true);
    setOscillator(osc);
  }, [audioContext, createOscillator, isPlaying, oscillator]);

  const stopAudio = useCallback(() => {
    if (oscillator === undefined || !isPlaying) {
      return;
    }
    oscillator.stop();
    oscillator.disconnect(audioContext!.destination);
    setIsPlaying(false);
    setOscillator(undefined)
  }, [audioContext, isPlaying, oscillator]);

  const changeFrequency = useCallback((frequency: number) => {
    if (oscillator === undefined) {
      return;
    }
    oscillator.frequency.setValueAtTime(frequency, audioContext!.currentTime);
  }, [audioContext, oscillator])

  return {
    isPlaying,
    setupAudio,
    playAudio,
    stopAudio,
    changeFrequency
  };
};
