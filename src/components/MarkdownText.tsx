import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface MarkdownTextProps {
  content: string;
  style?: TextStyle;
  baseColor?: string;
}

/**
 * Gemini'den gelen basit Markdown (**bold**) yapılarını destekleyen hafif bir Text bileşeni.
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, style, baseColor }) => {
  // Metni ** ayıracıyla bölüyoruz
  const parts = content.split(/(\*\*.*?\*\*)/g);

  return (
    <Text style={[style, { color: baseColor }]}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Kalın metni temizle ve render et
          const boldText = part.substring(2, part.length - 2);
          return (
            <Text key={index} style={styles.bold}>
              {boldText}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: '900',
  },
});
