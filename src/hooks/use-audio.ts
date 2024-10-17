import { useState, useCallback, useRef } from 'react'

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);

  const createReverbImpulse = useCallback((duration: number, decay: number, reverse: boolean = false) => {
    const sampleRate = audioContextRef.current!.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContextRef.current!.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i;
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }

    return impulse;
  }, []);

  const createAudioGraph = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;

    // Create multiple oscillators
    const oscs = [
      ctx.createOscillator(),
      ctx.createOscillator(),
      ctx.createOscillator()
    ];
    oscs[0].type = 'sine';
    oscs[1].type = 'triangle';
    oscs[2].type = 'sine';

    // Detune oscillators slightly for richer sound
    oscs[1].detune.value = 5;
    oscs[2].detune.value = -5;

    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);

    filterRef.current = ctx.createBiquadFilter();
    filterRef.current.type = 'lowpass';
    filterRef.current.frequency.setValueAtTime(2000, ctx.currentTime);
    filterRef.current.Q.setValueAtTime(1, ctx.currentTime);

    // Create reverb
    reverbRef.current = ctx.createConvolver();
    reverbRef.current.buffer = createReverbImpulse(3, 2);

    // Connect nodes
    oscs.forEach(osc => {
      osc.connect(filterRef.current!);
    });
    filterRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(reverbRef.current);
    reverbRef.current.connect(ctx.destination);

    oscillatorsRef.current = oscs;
  }, [createReverbImpulse]);

  const setupAudio = useCallback(() => {
    createAudioGraph();
    oscillatorsRef.current.forEach(osc => osc.start());
  }, [createAudioGraph]);

  const playAudio = useCallback(() => {
    if (isPlaying) return;

    createAudioGraph();
    if (gainNodeRef.current && audioContextRef.current) {
      oscillatorsRef.current.forEach(osc => osc.start());
      const now = audioContextRef.current.currentTime;
      gainNodeRef.current.gain.setValueAtTime(0, now);
      gainNodeRef.current.gain.linearRampToValueAtTime(0.5, now + 0.2);
      gainNodeRef.current.gain.linearRampToValueAtTime(0.3, now + 0.5);
    }
    setIsPlaying(true);
  }, [createAudioGraph, isPlaying]);

  const stopAudio = useCallback(() => {
    if (!isPlaying) return;

    if (gainNodeRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      gainNodeRef.current.gain.linearRampToValueAtTime(0, now + 1);
    }

    setTimeout(() => {
      oscillatorsRef.current.forEach(osc => osc.stop());
      oscillatorsRef.current = [];
      setIsPlaying(false);
    }, 1000);
  }, [isPlaying]);

  const changeFrequency = useCallback((frequency: number) => {
    if (audioContextRef.current) {
      oscillatorsRef.current.forEach((osc, index) => {
        const detune = index === 1 ? 5 : index === 2 ? -5 : 0;
        osc.frequency.setValueAtTime(frequency, audioContextRef.current!.currentTime);
        osc.detune.setValueAtTime(detune, audioContextRef.current!.currentTime);
      });

      if (filterRef.current) {
        filterRef.current.frequency.setValueAtTime(
            Math.min(frequency * 4, audioContextRef.current.sampleRate / 2),
            audioContextRef.current.currentTime
        );
      }
    }
  }, []);

  return {
    isPlaying,
    setupAudio,
    playAudio,
    stopAudio,
    changeFrequency
  };
};
