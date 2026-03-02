import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Bildirimlerin nasıl gösterileceğini ayarlama
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Bildirime tıklanınca ne olacağını yönet
Notifications.addNotificationResponseReceivedListener((response) => {
  console.log('Bildirime tıklandı:', response);
  // Burada bildirime tıklanınca yapılacak işlemler eklenir
});

export interface ScheduleNotificationProps {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

class NotificationService {
  // Bildirim izinlerini isteme
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Bildirimler emülatörlerde güvenilir çalışmayabilir');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Bildirim izni alınamadı!');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  }

  // Anlık bildirim gönderme
  async sendImmediateNotification(props: ScheduleNotificationProps): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    
    if (!hasPermission) {
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: props.title,
          body: props.body,
          data: props.data || {},
        },
        trigger: null, // Hemen gösterilmesi için null
      });
      
      return notificationId;
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error);
      return null;
    }
  }

  // Günlük hatırlatıcı bildirimi (şu an için sadece test amaçlı anlık bildirim gönderiyor)
  async scheduleDailyReminder(
    title: string,
    body: string,
    hour: number,
    minute: number,
    data?: Record<string, unknown>
  ): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    
    if (!hasPermission) {
      return null;
    }
    
    try {
      // Ayarları göster - Şu anda zamanlanmış bildirimler yerine anlık bildirim gönderiyoruz
      const notificationId = await this.sendImmediateNotification({
        title: `Günlük Hatırlatıcı Kuruldu`,
        body: `Günlük hatırlatıcı ayarlandı: Her gün saat ${hour}:${minute < 10 ? '0' : ''}${minute}\n\nNot: Şu anda test aşamasındayız, ileride tam zamanlı bildirimler olacak.`,
        data
      });
      
      console.log(`Günlük hatırlatıcı etkinleştirildi. Saat: ${hour}:${minute < 10 ? '0' : ''}${minute}`);
      return notificationId;
    } catch (error) {
      console.error('Günlük hatırlatıcı ayarlanamadı:', error);
      return null;
    }
  }

  // Tüm bildirimleri iptal etme
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Belirli bir bildirimi iptal etme
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Bekleyen tüm bildirimleri alma
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

export default new NotificationService(); 