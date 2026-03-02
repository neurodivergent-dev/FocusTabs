import React from 'react';
import { Text, StyleSheet, TextStyle, View } from 'react-native';

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

        // Normal satır
        return renderStyledText(line, index);
      })}
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
});
