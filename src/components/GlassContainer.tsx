import React from 'react';
import { StyleSheet, View, Platform, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from './ThemeProvider';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface GlassContainerProps {
  children: React.ReactNode;
  intensity?: number;
  onClose?: () => void;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ 
  children, 
  intensity = 70,
  onClose 
}) => {
  const { isDarkMode } = useTheme();

  return (
    <Animated.View 
      entering={FadeIn.duration(300)} 
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <BlurView
          intensity={Platform.OS === 'ios' ? intensity : 100}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        >
          <View 
            style={[
              styles.overlay, 
              { 
                backgroundColor: isDarkMode 
                  ? 'rgba(0, 0, 0, 0.6)' 
                  : 'rgba(255, 255, 255, 0.4)' 
              }
            ]} 
          />
        </BlurView>
      </TouchableWithoutFeedback>
      
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
