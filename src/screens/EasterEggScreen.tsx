import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, Terminal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../components/ThemeProvider';
import ManifoldBackground from '../components/ManifoldBackground';

const EasterEggScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [refreshId, setRefreshId] = useState(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleRefresh = () => {
    soundService?.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRefreshId(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* WebGL Raymarching Manifold Background */}
      <ManifoldBackground 
        primaryColor={colors.primary} 
        accentColor={colors.secondary || colors.info} 
        refreshId={refreshId}
      />
      
      <SafeAreaView style={styles.overlay}>
        <View style={styles.topRow}>
          <TouchableOpacity 
            style={styles.circleButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.circleButton} 
            onPress={handleRefresh}
          >
            <RefreshCw color="#fff" size={24} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.titleWrapper}>
            <Terminal size={24} color={colors.primary} />
            <Text style={[styles.glitchText, { color: colors.primary, textShadowColor: colors.primary }]}>
              REALITY_BREACH
            </Text>
          </View>
          <Text style={styles.subText}>Hyperkähler Manifold Raymarching</Text>
          <View style={[styles.statusBadge, { borderColor: colors.primary + '60' }]}>
            <Text style={[styles.statusText, { color: colors.primary }]}>
              STATUS: ARCHITECT VERIFIED
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  glitchText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    textAlign: 'center',
  },
  subText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  statusBadge: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  statusText: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '900',
  }
});

// Sound service importunu düzelteyim (Dosya içinde eksik kalmasın)
import { soundService } from '../services/SoundService';

export default EasterEggScreen;
