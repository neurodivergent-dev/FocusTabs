import React, { useEffect, useRef } from 'react';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useThemeStore } from '../store/themeStore';

const SOUND_ASSETS: Record<string, number> = {
  complete: require('../../assets/sounds/complete.mp3'),
  delete: require('../../assets/sounds/delete.mp3'),
  undo: require('../../assets/sounds/undo.mp3'),
  click: require('../../assets/sounds/click.mp3'),
  fanfare: require('../../assets/sounds/fanfare.mp3'), // fanfare.mp3 dosyasını kullanıyoruz
};

export const SoundPlayer: React.FC = () => {
  const { soundTrigger, soundsEnabled } = useThemeStore();
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (!soundsEnabled || !soundTrigger) return;

    const soundAsset = SOUND_ASSETS[soundTrigger.type];
    if (!soundAsset) return;

    try {
      if (playerRef.current) {
        playerRef.current.release();
        playerRef.current = null;
      }

      const player = createAudioPlayer(soundAsset);
      playerRef.current = player;
      
      // Ses seviyesi ayarları
      if (soundTrigger.type === 'fanfare') {
        player.volume = 0.7; // Fanfar daha duyulur olsun
      } else if (soundTrigger.type === 'click') {
        player.volume = 0.3;
      } else {
        player.volume = 0.5;
      }
      
      player.play();
      
    } catch (error) {
      if (error instanceof Error) {
        console.log('Yerel ses çalma hatası:', error.message);
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.release();
        playerRef.current = null;
      }
    };
  }, [soundTrigger, soundsEnabled]);

  return null;
};
