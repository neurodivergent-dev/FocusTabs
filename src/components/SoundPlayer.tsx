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

/**
 * High-performance Sound Player.
 * FIXED: Always creates a fresh instance for UI sounds to prevent Native Bridge deadlocks (5s locks).
 */
export const SoundPlayer: React.FC = () => {
  const { soundTrigger, soundsEnabled } = useThemeStore();
  const playerRef = useRef<AudioPlayer | null>(null);

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
        
        if (soundTrigger.type === 'fanfare') player.volume = 0.7;
        else if (soundTrigger.type === 'click') player.volume = 0.3;
        else player.volume = 0.5;
        
        player.play();
      } catch (error) {
        console.log('[SOUND PLAYER] Native Lock Error:', error);
      }
    };

    playSound();
  }, [soundTrigger, soundsEnabled]);

  return null;
};
