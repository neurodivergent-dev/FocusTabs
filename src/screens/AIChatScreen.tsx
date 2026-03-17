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
  StatusBar,
  Keyboard,
  Alert,
  Linking
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { Send, Sparkles, User, Bot, AlertCircle, Trash2, ChevronDown } from 'lucide-react-native';
import { aiService } from '../services/aiService';
import { useAIStore, ChatMessage } from '../store/aiStore';
import { useDailyGoalsStore } from '../store/dailyGoalsStore';
import { MarkdownText } from '../components/MarkdownText';
import { CustomAlert } from '../components/CustomAlert';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { exportData, dataToJSON } from '../utils/backup';

const AIChatScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const { apiKey, isAIEnabled, chatMessages, addChatMessage, clearChatMessages, customSystemPrompt } = useAIStore();
  const addGoal = useDailyGoalsStore(state => state.addGoal);
  const deleteGoal = useDailyGoalsStore(state => state.deleteGoal);
  const clearGoals = useDailyGoalsStore(state => state.clearGoals);
  const updateGoal = useDailyGoalsStore(state => state.updateGoal);
  const startGoalTimer = useDailyGoalsStore(state => state.startGoalTimer);
  const decomposeGoal = useDailyGoalsStore(state => state.decomposeGoal);
  const updateSubTask = useDailyGoalsStore(state => state.updateSubTask);
  const deleteSubTask = useDailyGoalsStore(state => state.deleteSubTask);
  const activeTimerGoalId = useDailyGoalsStore(state => state.activeTimerGoalId);
  const setIsDarkMode = useThemeStore(state => state.setIsDarkMode);
  const setThemeId = useThemeStore(state => state.setThemeId);
  const setLanguage = useLanguageStore(state => state.setLanguage);
  const resetLanguage = useLanguageStore(state => state.resetState);
  const setSoundsEnabled = useThemeStore(state => state.setSoundsEnabled);
  const setBackgroundEffect = useThemeStore(state => state.setBackgroundEffect);
  const addCustomTheme = useThemeStore(state => state.addCustomTheme);
  const setCustomBackgroundConfig = useThemeStore(state => state.setCustomBackgroundConfig);
  const insets = useSafeAreaInsets();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [clearChatAlertVisible, setClearChatAlertVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // Alttan 100 pikselden fazla uzaklaşırsa butonu göster
    const isCloseToBottom = contentHeight - layoutHeight - offsetY < 100;
    setShowScrollToBottom(!isCloseToBottom);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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

  // Sohbet geçmişini Gemini formatına çevir (Sadece mesajlar değişince güncellenir)
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

    // Context'i tam gönderim anında store'dan çekerek re-render döngüsünü kırıyoruz ve donmayı önlüyoruz
    const storeState = useDailyGoalsStore.getState();
    const goals = storeState.goals;
    const completionData = storeState.completionData;

    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];
    
    // Context boyutu için son 7 ve gelecek 7 günün hedeflerini gönderiyoruz
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(todayDate.getDate() - 7);
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(todayDate.getDate() + 7);

    const filteredGoals = goals.filter(g => {
      const gDate = new Date(g.date);
      return gDate >= sevenDaysAgo && gDate <= sevenDaysLater;
    });

    // İstatistiksel Context Hazırlama
    // 1. Seri (Streak) Hesaplama
    let streak = 0;
    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatDateStr(yesterdayDate);
    
    const todayData = completionData.find(i => i.date === todayStr);
    const yesterdayData = completionData.find(i => i.date === yesterdayStr);
    const isTodaySuccess = todayData && todayData.totalCount > 0 && todayData.percentage >= 70;
    const isYesterdaySuccess = yesterdayData && yesterdayData.totalCount > 0 && yesterdayData.percentage >= 70;

    if (isTodaySuccess || isYesterdaySuccess) {
      let checkDate = isTodaySuccess ? new Date() : yesterdayDate;
      const safetyLimit = 365; // Sonsuz döngü koruması
      let iterations = 0;
      while (iterations < safetyLimit) {
        const checkDateStr = formatDateStr(checkDate);
        const dayEntry = completionData.find(i => i.date === checkDateStr);
        if (dayEntry && dayEntry.totalCount > 0 && dayEntry.percentage >= 70) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
        iterations++;
      }
    }

    // 2. En Çok Çalışılan Kategori
    const completedGoals = goals.filter(g => g.completed);
    const catCounts = completedGoals.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // 3. Genel Özet Verileri
    const totalFocusTimeSec = goals.reduce((s, g) => s + (g.focusTime || 0), 0);
    const totalFocusH = Math.floor(totalFocusTimeSec / 3600);
    const totalFocusM = Math.floor((totalFocusTimeSec % 3600) / 60);
    const totalCompleted = completionData.reduce((s, i) => s + i.completedCount, 0);

    const statsContext = `USER STATS:
    - Total Focus Time: ${totalFocusH}h ${totalFocusM}m
    - Total Completed Tasks: ${totalCompleted}
    - Current Streak: ${streak} days
    - Top Category: ${topCategory}`;

    const goalContext = filteredGoals.length === 0 
      ? `Today is ${todayStr}.\n${statsContext}\nNo goals found in the recent range.` 
      : `Today is ${todayStr}.\n${statsContext}\nRecent Goals (±7 days):\n${filteredGoals.map((g, i) => `${i + 1}. [Date:${g.date}] [ID:${g.id}] ${g.text} (${g.completed ? 'Done' : 'Active'})`).join("\n")}`;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      role: 'user',
      timestamp: Date.now(),
    };

    addChatMessage(userMessage);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const response = await aiService.chat(
        userMessage.text,
        chatHistory.slice(-10), // Son 10 mesajı gönder (context sınırı için)
        goalContext,
        i18n.language,
        customSystemPrompt
      );

      if (response && response.trim().length > 0) {
        let cleanResponse = response;
        
        // AI Model Actions:
        // 1. CREATE GOAL: Append this at the end if the user wants to add a new task:
        //    [ACTION:CREATE_GOAL:{"text": "Refined Goal Text", "category": "work|health|personal|finance|other"}]
        //    
        // 2. START TIMER: Append this if the user wants to start a timer for an EXISTING goal.
        //    - Format: [ACTION:START_TIMER:{"goalId": "EXACT_ID", "duration": seconds}]
        //    
        // 3. DECOMPOSE GOAL: Append this if the user wants to break down an EXISTING goal into subtasks.
        //    - Format: [ACTION:DECOMPOSE_GOAL:{"goalId": "EXACT_ID"}]
        //    - Use this when the user asks to "parçala", "dilimle", "plan çıkar" or "nasıl yaparım" for a specific task.
        // 
        // 4. DELETE GOAL: Append this if the user specifically asks to REMOVE or DELETE a goal.
        //    - Format: [ACTION:DELETE_GOAL:{"goalId": "EXACT_ID"}]
        //
        // 5. UPDATE GOAL: Append this if the user wants to EDIT or CHANGE an existing goal.
        //    - Format: [ACTION:UPDATE_GOAL:{"goalId": "EXACT_ID", "text": "New Text", "category": "category"}]
        // 
        // - Refine user input into professional text for goals.
        // - You can ONLY perform ONE action per response.

        // Görev Oluşturma Aksiyonu
        const goalMatch = response.match(/\[ACTION:CREATE_GOAL:(.*?)\]/);
        if (goalMatch) {
          try {
            const data = JSON.parse(goalMatch[1]);
            const success = await addGoal({
              text: data.text,
              category: data.category || 'other',
              date: data.date || todayStr,
            });
            if (success) {
              cleanResponse = cleanResponse.replace(goalMatch[0], '').trim();
            }
          } catch (e) { console.error("Goal Action Error:", e); }
        }

        // Zamanlayıcı (Odaklanma) Aksiyonu
        const timerMatch = response.match(/\[ACTION:START_TIMER:(.*?)\]/);
        if (timerMatch) {
          try {
            const data = JSON.parse(timerMatch[1]);
            if (data.goalId) {
              startGoalTimer(data.goalId, data.duration);
              cleanResponse = cleanResponse.replace(timerMatch[0], '').trim();
              // Hemen Timer ekranına yönlendir
              setTimeout(() => {
                router.push('/timer');
              }, 5000);
            }
          } catch (e) { console.error("Timer Action Error:", e); }
        }

        // Dilimleme (Decompose) Aksiyonu
        const decomposeMatch = response.match(/\[ACTION:DECOMPOSE_GOAL:(.*?)\]/);
        if (decomposeMatch) {
          try {
            const data = JSON.parse(decomposeMatch[1]);
            if (data.goalId) {
              await decomposeGoal(data.goalId, i18n.language);
              cleanResponse = cleanResponse.replace(decomposeMatch[0], '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Decompose Action Error:", e); }
        }

        // Silme (Delete) Aksiyonu
        const deleteMatch = response.match(/\[ACTION:DELETE_GOAL:(.*?)\]/);
        if (deleteMatch) {
          try {
            const data = JSON.parse(deleteMatch[1]);
            if (data.goalId) {
              await deleteGoal(data.goalId);
              cleanResponse = cleanResponse.replace(deleteMatch[0], '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          } catch (e) { console.error("Delete Action Error:", e); }
        }

        // Güncelleme (Update) Aksiyonu
        const updateMatch = response.match(/\[ACTION:UPDATE_GOAL:(.*?)\]/);
        if (updateMatch) {
          try {
            const data = JSON.parse(updateMatch[1]);
            if (data.goalId) {
              const updates: any = {};
              if (data.text) updates.text = data.text;
              if (data.category) updates.category = data.category;
              if (data.date) updates.date = data.date;
              
              await updateGoal(data.goalId, updates);
              cleanResponse = cleanResponse.replace(updateMatch[0], '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Update Action Error:", e); }
        }

        // Alt Görev Güncelleme (Update Subtask) Aksiyonu
        const updateSubMatch = response.match(/\[ACTION:UPDATE_SUBTASK:(.*?)\]/);
        if (updateSubMatch) {
          try {
            const data = JSON.parse(updateSubMatch[1]);
            if (data.goalId && data.subTaskId && data.text) {
              await updateSubTask(data.goalId, data.subTaskId, data.text);
              cleanResponse = cleanResponse.replace(updateSubMatch[0], '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Update Subtask Error:", e); }
        }

        // Alt Görev Silme (Delete Subtask) Aksiyonu
        const deleteSubMatch = response.match(/\[ACTION:DELETE_SUBTASK:(.*?)\]/);
        if (deleteSubMatch) {
          try {
            const data = JSON.parse(deleteSubMatch[1]);
            if (data.goalId && data.subTaskId) {
              await deleteSubTask(data.goalId, data.subTaskId);
              cleanResponse = cleanResponse.replace(deleteSubMatch[0], '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          } catch (e) { console.error("Delete Subtask Error:", e); }
        }

        // Karanlık Mod (Dark Mode) Aksiyonu
        const darkMatch = response.match(/\[ACTION:SET_DARK_MODE:(.*?)\]/);
        if (darkMatch) {
          try {
            const data = JSON.parse(darkMatch[1]);
            if (data.isDark !== undefined) {
              setIsDarkMode(data.isDark);
              cleanResponse = cleanResponse.replace(darkMatch[0], '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Dark Mode Error:", e); }
        }

        // Tema (Theme) Aksiyonu
        const themeMatch = response.match(/\[ACTION:SET_APP_THEME:(.*?)\]/);
        if (themeMatch) {
          try {
            const data = JSON.parse(themeMatch[1]);
            if (data.themeId) {
              setThemeId(data.themeId);
              cleanResponse = cleanResponse.replace(themeMatch[0], '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Theme Error:", e); }
        }

        // Dil (Language) Aksiyonu
        const langMatch = response.match(/\[ACTION:SET_LANGUAGE:(.*?)\]/);
        if (langMatch) {
          try {
            const data = JSON.parse(langMatch[1]);
            if (data.lang) {
              setLanguage(data.lang);
              cleanResponse = cleanResponse.replace(langMatch[0], '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Language Error:", e); }
        }

        // Ses (Sounds) Aksiyonu
        const soundsMatch = response.match(/\[ACTION:SET_SOUNDS:(.*?)\]/);
        if (soundsMatch) {
          try {
            const data = JSON.parse(soundsMatch[1]);
            if (data.enabled !== undefined) {
              setSoundsEnabled(data.enabled);
              cleanResponse = cleanResponse.replace(soundsMatch[0], '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Sounds Error:", e); }
        }

        // Verileri Sıfırlama (Reset All Data) Aksiyonu
        if (response.includes('[ACTION:RESET_ALL_DATA]')) {
          cleanResponse = cleanResponse.replace('[ACTION:RESET_ALL_DATA]', '').trim();
          Alert.alert(
            t('settings.dangerZone.clearDataTitle') || "Reset All Data",
            t('settings.dangerZone.clearDataDescription') || "Are you sure you want to delete all goals and reset settings? This cannot be undone.",
            [
              { text: t('common.cancel'), style: 'cancel' },
              { 
                text: t('common.delete'), 
                style: 'destructive',
                onPress: async () => {
                  await clearGoals();
                  resetLanguage();
                  setIsDarkMode(true);
                  setThemeId('default');
                  clearChatMessages();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  router.replace('/');
                }
              }
            ]
          );
        }

        // Arka Plan Efekti (Background Effect) Aksiyonu
        const effectMatch = response.match(/\[ACTION:SET_BACKGROUND_EFFECT:(.*?)\]/);
        if (effectMatch) {
          try {
            const data = JSON.parse(effectMatch[1]);
            if (data.effect) {
              setBackgroundEffect(data.effect);
              cleanResponse = cleanResponse.replace(effectMatch[0], '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Effect Error:", e); }
        }

        // Özel Arka Plan (Custom Background) Aksiyonu
        const customBgMatch = response.match(/\[ACTION:SET_CUSTOM_BACKGROUND:(.*?)\]/);
        if (customBgMatch) {
          try {
            const data = JSON.parse(customBgMatch[1]);
            console.log("[AI ACTION] Setting Custom Background:", data);
            setCustomBackgroundConfig(data);
            cleanResponse = cleanResponse.replace(customBgMatch[0], '').trim();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) { console.error("Set Custom Background Error:", e); }
        }

        // Veri Dışa Aktarma (Export Data) Aksiyonu
        if (response.includes('[ACTION:EXPORT_DATA]')) {
          try {
            const data = exportData();
            const jsonString = dataToJSON(data);
            const fileName = `focustabs-backup-${new Date().toISOString().split("T")[0]}.json`;
            const filePath = `${FileSystem.documentDirectory}${fileName}`;
            
            await FileSystem.writeAsStringAsync(filePath, jsonString);
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
              await Sharing.shareAsync(filePath);
            }
            cleanResponse = cleanResponse.replace('[ACTION:EXPORT_DATA]', '').trim();
          } catch (e) { console.error("Export Error:", e); }
        }

        // Yedekleme Ayarları (Open Backup Settings) Aksiyonu
        if (response.includes('[ACTION:OPEN_BACKUP_SETTINGS]')) {
          cleanResponse = cleanResponse.replace('[ACTION:OPEN_BACKUP_SETTINGS]', '').trim();
          setTimeout(() => {
            router.push('/backup-settings');
          }, 5000);
        }

        // Genel Yönlendirme (Navigate) Aksiyonu
        const navigateMatch = response.match(/\[ACTION:NAVIGATE:(.*?)\]/);
        if (navigateMatch) {
          try {
            const data = JSON.parse(navigateMatch[1]);
            if (data.route) {
              cleanResponse = cleanResponse.replace(navigateMatch[0], '').trim();
              setTimeout(() => {
                router.push(data.route as any);
              }, 5000);
            }
          } catch (e) { console.error("Navigate Action Error:", e); }
        }

        // Tema Oluşturma (Create Theme) Aksiyonu
        const createThemeMatch = response.match(/\[ACTION:CREATE_THEME:(.*?)\]/);
        if (createThemeMatch) {
          try {
            const data = JSON.parse(createThemeMatch[1]);
            const newTheme = {
              id: 'custom-ai',
              name: data.name || 'AI Magic',
              colors: {
                primary: data.colors.primary,
                secondary: data.colors.secondary,
                background: data.colors.background || '#09090B',
                card: data.colors.card || 'rgba(30, 30, 35, 0.6)',
                cardBackground: data.colors.card || 'rgba(30, 30, 35, 0.6)',
                cardBorder: 'rgba(255, 255, 255, 0.1)',
                text: data.colors.text || '#FFFFFF',
                subText: data.colors.subText || '#8E8E93',
                border: data.colors.border || 'rgba(255, 255, 255, 0.1)',
                success: data.colors.success || '#32D74B',
                warning: data.colors.warning || '#FFD60A',
                error: data.colors.error || '#FF453A',
                info: data.colors.info || '#0A84FF',
              }
            };
            addCustomTheme(newTheme as any);
            cleanResponse = cleanResponse.replace(createThemeMatch[0], '').trim();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) { console.error("Create Theme Error:", e); }
        }

        // Uygulamayı Değerlendir (Rate App) Aksiyonu
        if (response.includes('[ACTION:RATE_APP]')) {
          cleanResponse = cleanResponse.replace('[ACTION:RATE_APP]', '').trim();
          const playStoreUrl = "https://play.google.com/store/apps/details?id=com.melihcandemir.focustabs";
          Linking.canOpenURL(playStoreUrl).then((supported) => {
            if (supported) Linking.openURL(playStoreUrl);
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Chat Geçmişini Sil (Clear Chat) Aksiyonu
        if (response.includes('[ACTION:CLEAR_CHAT]')) {
          cleanResponse = cleanResponse.replace('[ACTION:CLEAR_CHAT]', '').trim();
          setClearChatAlertVisible(true);
        }

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: cleanResponse,
          role: 'model',
          timestamp: Date.now(),
        };
        addChatMessage(aiMessage);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Boş yanıt gelirse hata mesajı göster (throw etmeden)
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: t('settings.ai.chat.error'),
          role: 'model',
          timestamp: Date.now(),
        };
        addChatMessage(errorMessage);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
    setClearChatAlertVisible(true);
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
              onContentSizeChange={() => {
                if (!showScrollToBottom) {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }
              }}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              keyboardDismissMode="on-drag"
            />

            {showScrollToBottom && (
              <Animated.View 
                entering={FadeInDown.duration(200)} 
                exiting={FadeInDown.duration(200)}
                style={styles.scrollToBottomContainer}
              >
                <TouchableOpacity
                  onPress={scrollToBottom}
                  style={[styles.scrollToBottomButton, { backgroundColor: colors.card }]}
                >
                  <ChevronDown size={20} color={colors.primary} />
                </TouchableOpacity>
              </Animated.View>
            )}

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

      <CustomAlert
        visible={clearChatAlertVisible}
        title={t('settings.ai.chat.clearHistoryTitle')}
        message={t('settings.ai.chat.clearHistoryDescription')}
        type="danger"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => {
          clearChatMessages();
          setClearChatAlertVisible(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onCancel={() => setClearChatAlertVisible(false)}
      />
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
  scrollToBottomContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 10,
  },
  scrollToBottomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default AIChatScreen;
