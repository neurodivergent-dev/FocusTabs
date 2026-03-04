import React, { useState, useRef, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { Send, Sparkles, User, Bot, AlertCircle, Trash2 } from 'lucide-react-native';
import { aiService } from '../services/aiService';
import { useAIStore, ChatMessage } from '../store/aiStore';
import { useDailyGoalsStore } from '../store/dailyGoalsStore';
import { MarkdownText } from '../components/MarkdownText';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AIChatScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const { apiKey, isAIEnabled, chatMessages, addChatMessage, clearChatMessages } = useAIStore();
  const { goals, completionData } = useDailyGoalsStore();
  const insets = useSafeAreaInsets();
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Eğer geçmiş boşsa hoşgeldin mesajı ekle (ama persist etme, sadece görüntüle)
  const displayMessages = useMemo(() => {
    if (chatMessages.length === 0) {
      return [{
        id: 'welcome',
        text: t('settings.ai.chat.welcome'),
        role: 'model' as const,
        timestamp: Date.now(),
      }];
    }
    return chatMessages;
  }, [chatMessages, t]);

  // İstatistik ve Geçmiş bağlamını (context) hazırla
  const statsContext = useMemo(() => {
    const totalCompletedTasks = completionData.reduce((sum, item) => sum + item.completedCount, 0);
    const totalFocusTime = goals.reduce((sum, goal) => sum + (goal.focusTime || 0), 0);
    
    // Tüm geçmiş görevleri AI'nın anlayabileceği çok sıkışık bir formatta hazırla
    // Format: [Date|Task|Mins|Status]
    const historyLog = goals
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50) // Son 50 görevi gönder (context limiti için)
      .map(g => `${g.date}|${g.text}|${Math.floor((g.focusTime || 0) / 60)}m|${g.completed ? 'Done' : 'Active'}`)
      .join("\n");

    return `
    USER PERFORMANCE SUMMARY:
    - Lifetime Focus Time: ${Math.floor(totalFocusTime / 3600)}h ${Math.floor((totalFocusTime % 3600) / 60)}m
    - Lifetime Goals Completed: ${totalCompletedTasks}
    - 7-Day Completion Rates: ${completionData.slice(-7).map(d => `${d.date}: ${d.percentage}%`).join(", ")}
    
    TASK HISTORY (Date|Task|FocusTime|Status):
    ${historyLog || "No history yet."}
    `;
  }, [goals, completionData]);

  // Görev bağlamını (context) hazırla
  const goalContext = useMemo(() => {
    if (goals.length === 0) return "User has no goals set for today yet.";
    
    const goalsList = goals.map((g, i) => {
      let str = `${i+1}. ${g.text} (${g.completed ? 'Completed' : 'Active'}, Focus: ${Math.floor((g.focusTime || 0) / 60)}m)`;
      if (g.subTasks && g.subTasks.length > 0) {
        str += "\n   Subtasks: " + g.subTasks.map(st => `${st.text} (${st.completed ? 'Done' : 'Pending'})`).join(", ");
      }
      return str;
    }).join("\n");

    return `
    ${statsContext}
    
    Current user goals for today:
    ${goalsList}
    `;
  }, [goals, statsContext]);

  // Sohbet geçmişini Gemini formatına çevir
  const chatHistory = useMemo(() => {
    return chatMessages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    if (!apiKey || !isAIEnabled) {
      alert(t('settings.ai.chat.noApiKey'));
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      role: 'user',
      timestamp: Date.now(),
    };

    addChatMessage(userMessage);
    setInputText('');
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const response = await aiService.chat(
        userMessage.text,
        chatHistory.slice(-10), // Son 10 mesajı gönder (context sınırı için)
        goalContext,
        i18n.language
      );

      if (response) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response,
          role: 'model',
          timestamp: Date.now(),
        };
        addChatMessage(aiMessage);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error("Empty response");
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: t('settings.ai.chat.error'),
        role: 'model',
        timestamp: Date.now(),
      };
      addChatMessage(errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearChatMessages();
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isAi = item.role === 'model';
    
    return (
      <Animated.View 
        entering={isAi ? FadeInUp.delay(100) : FadeInDown}
        style={[
          styles.messageWrapper,
          isAi ? styles.aiMessageWrapper : styles.userMessageWrapper
        ]}
      >
        <View style={[
          styles.avatar,
          { backgroundColor: isAi ? colors.primary + '20' : colors.secondary + '20' }
        ]}>
          {isAi ? <Bot size={16} color={colors.primary} /> : <User size={16} color={colors.secondary} />}
        </View>
        <View style={[
          styles.messageBubble,
          { 
            backgroundColor: isAi 
              ? (isDarkMode ? 'rgba(255,255,255,0.05)' : '#F0F0F0') 
              : colors.primary,
            borderBottomLeftRadius: isAi ? 4 : 20,
            borderBottomRightRadius: isAi ? 20 : 4,
          }
        ]}>
          <MarkdownText 
            content={item.text} 
            baseColor={isAi ? colors.text : '#FFFFFF'}
            style={styles.messageText}
          />
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary || colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, {
            paddingTop: insets.top + 16,
            paddingBottom: 24,
          }]}
        >
          {/* Decorative background elements */}
          <View style={styles.headerDecorationCircle1} />
          <View style={styles.headerDecorationCircle2} />

          <View style={styles.headerContent}>
            <View style={styles.headerTitleContainer}>
              <View style={styles.iconBadge}>
                <Sparkles size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>{t('settings.ai.chat.title')}</Text>
                <Text style={styles.headerSubtitle}>{t('app.slogan')}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
              <View style={styles.clearButtonInner}>
                <Trash2 size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {!apiKey || !isAIEnabled ? (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color={colors.warning} opacity={0.5} />
            <Text style={[styles.emptyStateText, { color: colors.subText }]}>
              {t('settings.ai.chat.noApiKey')}
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={displayMessages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {isLoading && (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.typingText, { color: colors.subText }]}>{t('settings.ai.chat.typing')}</Text>
              </View>
            )}

            <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F0F0F0' }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('settings.ai.chat.placeholder')}
                  placeholderTextColor={colors.subText}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity 
                  onPress={handleSend}
                  disabled={!inputText.trim() || isLoading}
                  style={[
                    styles.sendButton, 
                    { backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.subText + '30' }
                  ]}
                >
                  <Send size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerDecorationCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerDecorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 2,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});

export default AIChatScreen;
