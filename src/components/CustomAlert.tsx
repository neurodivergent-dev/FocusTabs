import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  ZoomIn, 
  ZoomOut 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export type AlertType = 'warning' | 'info' | 'success' | 'danger';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { colors, isDarkMode } = useTheme();

  if (!visible) return null;

  const getTypeColor = () => {
    switch (type) {
      case 'danger': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'success': return '#10B981';
      default: return colors.primary;
    }
  };

  const getIcon = () => {
    const color = getTypeColor();
    switch (type) {
      case 'danger':
      case 'warning':
        return <AlertTriangle size={32} color={color} />;
      case 'success':
        return <CheckCircle2 size={32} color={color} />;
      default:
        return <Info size={32} color={color} />;
    }
  };

  const typeColor = getTypeColor();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={onCancel}
        >
          <Animated.View 
            entering={FadeIn.duration(200)} 
            exiting={FadeOut.duration(200)}
            style={[styles.backdrop, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }]} 
          />
        </Pressable>

        <Animated.View 
          entering={ZoomIn.springify().damping(15)} 
          exiting={ZoomOut.duration(150)}
          style={styles.container}
        >
          <View style={[
            styles.alertCard, 
            { 
              backgroundColor: colors.card, 
              borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderWidth: 1 
            }
          ]}>
            <LinearGradient
              colors={[typeColor + '15', 'transparent']}
              style={styles.gradientHeader}
            />
            
            <View style={styles.content}>
              <View style={[styles.iconContainer, { backgroundColor: typeColor + '15' }]}>
                {getIcon()}
              </View>
              
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.message, { color: colors.subText }]}>{message}</Text>
              
              <View style={styles.buttonContainer}>
                {cancelText && (
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} 
                    onPress={onCancel}
                  >
                    <Text style={[styles.buttonText, { color: colors.text }]}>{cancelText}</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: typeColor }]} 
                  onPress={onConfirm}
                >
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  alertCard: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  content: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    // borderWith: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
