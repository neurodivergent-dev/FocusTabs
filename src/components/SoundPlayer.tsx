import React, { useEffect, useRef } from 'react';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useThemeStore } from '../store/themeStore';

const SOUND_ASSETS: Record<string, number> = {
  complete: require('../../assets/sounds/complete.mp3'),
  delete: require('../../assets/sounds/delete.mp3'),
  undo: require('../../assets/sounds/undo.mp3'),
  click: require('../../assets/sounds/click.mp3'),
  fanfare: require('../../assets/sounds/fanfare.mp3'),
  timer: require('../../assets/sounds/timer.mp3'),
};

const AMBIENT_ASSETS: Record<string, any> = {
  river: require('../../assets/sounds/river.mp3'),
  forest: require('../../assets/sounds/forest.mp3'),
  lofi: require('../../assets/sounds/lofi.mp3'),
  rain: require('../../assets/sounds/rain.mp3'),
  zen: require('../../assets/sounds/zen.mp3'),
};

/**
 * High-performance Sound Player.
 * FIXED: Always creates a fresh instance for UI sounds to prevent Native Bridge deadlocks (5s locks).
 */
export const SoundPlayer: React.FC = () => {
  const { soundTrigger, soundsEnabled, ambientSound } = useThemeStore();
  const playerRef = useRef<AudioPlayer | null>(null);
  const ambientPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (!soundsEnabled || !soundTrigger) return;

    const playSound = async () => {
      const soundAsset = SOUND_ASSETS[soundTrigger.type];
      if (!soundAsset) return;

      try {
        // ALWAYS release existing player before playing a new sound
        // This prevents the 5-second "Busy Bridge" timeout in expo-audio
        if (playerRef.current) {
          playerRef.current.release();
          playerRef.current = null;
        }

        // Create a fresh instance for this specific trigger
        const player = createAudioPlayer(soundAsset);
        playerRef.current = player;

        if (soundTrigger.type === 'fanfare' || soundTrigger.type === 'complete') player.volume = 0.3;
        else if (soundTrigger.type === 'click') player.volume = 0.1;
        else player.volume = 0.2;

        player.play();
      } catch (error) {
        console.log('[SOUND PLAYER] Native Lock Error:', error);
      }
    };

    playSound();
  }, [soundTrigger, soundsEnabled]);

  // Handle Ambient Sound
  useEffect(() => {
    // Stop if disabled or none
    if (!soundsEnabled || ambientSound === 'none') {
      if (ambientPlayerRef.current) {
        ambientPlayerRef.current.pause();
        ambientPlayerRef.current.release();
        ambientPlayerRef.current = null;
      }
      return;
    }

    const setupAmbient = async () => {
      const asset = AMBIENT_ASSETS[ambientSound];
      if (!asset) return;

      try {
        // Clean up previous
        if (ambientPlayerRef.current) {
          ambientPlayerRef.current.release();
        }

        const player = createAudioPlayer(asset);
        player.loop = true;
        player.volume = 0.15;
        player.play();
        ambientPlayerRef.current = player;
      } catch (error) {
        console.log('[AMBIENT PLAYER] Linkage Error:', error);
      }
    };

    setupAmbient();

    return () => {
      if (ambientPlayerRef.current) {
        ambientPlayerRef.current.release();
        ambientPlayerRef.current = null;
      }
    };
  }, [ambientSound, soundsEnabled]);

  return null;
};
