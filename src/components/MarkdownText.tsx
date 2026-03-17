import React, { useState } from 'react';
import { Text, StyleSheet, TextStyle, View, Image, TouchableOpacity, Modal, SafeAreaView, Dimensions } from 'react-native';
import { useAIStore } from '../store/aiStore';
import { X, ZoomIn } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MarkdownTextProps {
  content: string;
  style?: TextStyle;
  baseColor?: string;
}

/**
 * Gemini'den gelen Markdown yapılarını (**bold**, *italic*, listeler) destekleyen hafif bir bileşen.
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, style, baseColor }) => {
  const lines = content.split('\n');
  const { pollinationsApiKey } = useAIStore();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPrompt, setPreviewPrompt] = useState<string | null>(null);

  const renderStyledText = (text: string, key: string | number) => {
    // Bold ve Italic için regex (önce bold, sonra italic)
    // **bold** or *italic*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    return (
      <Text key={key} style={[style, { color: baseColor }]}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={index} style={styles.bold}>
                {part.substring(2, part.length - 2)}
              </Text>
            );
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <Text key={index} style={styles.italic}>
                {part.substring(1, part.length - 1)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        // Liste elemanı kontrolü (* veya -)
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          return (
            <View key={index} style={styles.listRow}>
              <Text style={[style, { color: baseColor, marginRight: 6 }]}>•</Text>
              <View style={styles.listContent}>
                {renderStyledText(trimmedLine.substring(2), index)}
              </View>
            </View>
          );
        }

        // Boş satır
        if (trimmedLine === '') {
          return <View key={index} style={{ height: 8 }} />;
        }

        // Görüntü (Image) kontrolü: [IMAGE:prompt]
        const imageRegex = /\[IMAGE:(.*?)\]/;
        const imageMatch = line.match(imageRegex);
        
        if (imageMatch) {
          const rawPrompt = imageMatch[1].trim();
          const cleanLine = line.replace(imageRegex, '').trim();
          const encodedPrompt = encodeURIComponent(rawPrompt);
          
          // Stable seed
          const seed = rawPrompt.split('').reduce((acc, char) => acc + (char.charCodeAt(0) * 31), 0) % 100000;
          
          // Pollinations API Key handler
          const authParam = pollinationsApiKey ? `&key=${pollinationsApiKey}` : '';
          const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?width=800&height=800&seed=${seed}&model=flux&nologo=true${authParam}`;
          
          return (
            <View key={index} style={styles.lineContent}>
              {cleanLine !== '' && renderStyledText(cleanLine, `text-${index}`)}
              <TouchableOpacity 
                style={styles.imageContainer}
                onPress={() => {
                  setPreviewImage(imageUrl);
                  setPreviewPrompt(rawPrompt);
                }}
                activeOpacity={0.9}
              >
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.image}
                  resizeMode="cover"
                />
                {!pollinationsApiKey && (
                  <View style={styles.keyOverlay}>
                    <Text style={styles.keyWarningText}>API Key Required</Text>
                  </View>
                )}
                <View style={styles.zoomButton}>
                  <ZoomIn size={16} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
              <Text style={styles.imagePromptOuter}>"{rawPrompt}"</Text>
            </View>
          );
        }

        // Normal satır
        return renderStyledText(line, index);
      })}

      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setPreviewImage(null)}
          >
            <X size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.modalImageContainer}>
            <Image 
              source={{ uri: previewImage || undefined }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  bold: {
    fontWeight: '900',
  },
  italic: {
    fontStyle: 'italic',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listContent: {
    flex: 1,
  },
  lineContent: {
    width: '100%',
    marginVertical: 4,
  },
  imageContainer: {
    marginVertical: 12,
    borderRadius: 16, // Use bubble-like border radius
    overflow: 'hidden',
    backgroundColor: '#000000',
    minHeight: 250,
    width: '100%',
  },
  image: {
    width: '100%',
    aspectRatio: 1, // Standard square format
  },
  imagePromptOuter: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  zoomButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 6,
  },
  keyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyWarningText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalPromptContainer: {
    position: 'absolute',
    bottom: 50,
    paddingHorizontal: 30,
  },
  modalPromptText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
