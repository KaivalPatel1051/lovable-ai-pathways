// Note: This service uses localStorage for demo purposes
// In production, you would integrate with Supabase custom tables or your preferred backend

export interface NotificationSchedule {
  id?: string;
  user_id: string;
  addiction_type: string;
  peak_times: string[];
  notification_offset_minutes: number; // Minutes before peak time
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserAddictionProfile {
  id?: string;
  user_id: string;
  addiction_type: string;
  custom_addiction?: string;
  daily_frequency: number;
  weekly_frequency: number;
  importance_level: number;
  current_impact: string;
  peak_times: string[];
  triggers: string[];
  previous_attempts: number;
  motivation_level: number;
  support_system: string;
  goals: string;
  additional_notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationTemplate {
  id?: string;
  addiction_type: string;
  trigger_type: 'peak_time' | 'craving' | 'milestone' | 'motivation';
  importance_level_min: number;
  importance_level_max: number;
  title: string;
  message: string;
  is_active: boolean;
}

class NotificationService {
  // Save user addiction profile (localStorage version)
  async saveAddictionProfile(profile: Omit<UserAddictionProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserAddictionProfile | null> {
    try {
      const profileWithMetadata: UserAddictionProfile = {
        ...profile,
        id: `profile_${profile.user_id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`addiction_profile_${profile.user_id}`, JSON.stringify(profileWithMetadata));
      
      // After saving profile, schedule notifications
      await this.scheduleNotifications(profile.user_id, profileWithMetadata);
      
      return profileWithMetadata;
    } catch (error) {
      console.error('Error saving addiction profile:', error);
      return null;
    }
  }

  // Get user addiction profile (localStorage version)
  async getUserAddictionProfile(userId: string): Promise<UserAddictionProfile | null> {
    try {
      const stored = localStorage.getItem(`addiction_profile_${userId}`);
      if (!stored) return null;
      
      return JSON.parse(stored) as UserAddictionProfile;
    } catch (error) {
      console.error('Error fetching addiction profile:', error);
      return null;
    }
  }

  // Schedule notifications based on user profile (localStorage version)
  async scheduleNotifications(userId: string, profile: UserAddictionProfile): Promise<void> {
    try {
      // Clear existing schedules
      localStorage.removeItem(`notification_schedules_${userId}`);

      // Create new schedules for each peak time
      const schedules: NotificationSchedule[] = profile.peak_times.map((peakTime, index) => ({
        id: `schedule_${userId}_${index}`,
        user_id: userId,
        addiction_type: profile.addiction_type,
        peak_times: [peakTime],
        notification_offset_minutes: this.calculateNotificationOffset(profile.importance_level),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      localStorage.setItem(`notification_schedules_${userId}`, JSON.stringify(schedules));

      console.log('Notifications scheduled successfully');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  // Calculate notification offset based on importance level
  private calculateNotificationOffset(importanceLevel: number): number {
    // Higher importance = earlier notification
    // Scale: 1-3 = 5 minutes, 4-6 = 10 minutes, 7-8 = 15 minutes, 9-10 = 20 minutes
    if (importanceLevel <= 3) return 5;
    if (importanceLevel <= 6) return 10;
    if (importanceLevel <= 8) return 15;
    return 20;
  }

  // Get personalized notification message (localStorage version)
  async getNotificationMessage(userId: string, triggerType: 'peak_time' | 'craving' | 'milestone' | 'motivation'): Promise<string> {
    try {
      const profile = await this.getUserAddictionProfile(userId);
      if (!profile) return this.getDefaultMessage(triggerType);

      // In a full implementation, this would query notification templates
      // For now, we'll use the default message with personalization
      const defaultMessage = this.getDefaultMessage(triggerType);
      return this.personalizeMessage(defaultMessage, profile);
    } catch (error) {
      console.error('Error getting notification message:', error);
      return this.getDefaultMessage(triggerType);
    }
  }

  // Personalize message with user data
  private personalizeMessage(template: string, profile: UserAddictionProfile): string {
    return template
      .replace('{addiction_type}', profile.addiction_type.toLowerCase())
      .replace('{days_since_start}', this.calculateDaysSinceStart(profile.created_at || ''))
      .replace('{motivation_level}', profile.motivation_level.toString())
      .replace('{user_goals}', profile.goals || 'your recovery goals');
  }

  // Calculate days since profile creation (proxy for recovery start)
  private calculateDaysSinceStart(createdAt: string): string {
    const start = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString();
  }

  // Default messages for different trigger types
  private getDefaultMessage(triggerType: string): string {
    const messages = {
      peak_time: "🌟 Your peak time is approaching. Remember your strength and the progress you've made. You've got this!",
      craving: "💪 Cravings are temporary, but your recovery is permanent. Take a deep breath and remember why you started.",
      milestone: "🎉 Congratulations on another day of progress! Every step forward is a victory worth celebrating.",
      motivation: "🔥 Your journey matters. Every moment you choose recovery, you're choosing a better future for yourself."
    };
    return messages[triggerType as keyof typeof messages] || messages.motivation;
  }

  // Send immediate notification (localStorage version)
  async sendNotification(userId: string, title: string, message: string): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with:
      // - Push notification service (Firebase, OneSignal, etc.)
      // - Email service (SendGrid, Mailgun, etc.)
      // - SMS service (Twilio, etc.)
      
      console.log('Sending notification:', { userId, title, message });
      
      // Store notification in localStorage for history
      const notification = {
        id: `notif_${Date.now()}`,
        user_id: userId,
        title,
        message,
        sent_at: new Date().toISOString(),
        status: 'sent'
      };
      
      const existingHistory = JSON.parse(localStorage.getItem(`notification_history_${userId}`) || '[]');
      existingHistory.unshift(notification);
      localStorage.setItem(`notification_history_${userId}`, JSON.stringify(existingHistory.slice(0, 50))); // Keep last 50
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Get notification history (localStorage version)
  async getNotificationHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const stored = localStorage.getItem(`notification_history_${userId}`);
      if (!stored) return [];
      
      const history = JSON.parse(stored);
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
  }

  // Update notification preferences (localStorage version)
  async updateNotificationPreferences(userId: string, preferences: {
    push_enabled: boolean;
    email_enabled: boolean;
    sms_enabled: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
  }): Promise<boolean> {
    try {
      const preferencesWithMetadata = {
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem(`notification_preferences_${userId}`, JSON.stringify(preferencesWithMetadata));
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  // Check if notifications should be sent (localStorage version)
  async shouldSendNotification(userId: string): Promise<boolean> {
    try {
      const stored = localStorage.getItem(`notification_preferences_${userId}`);
      if (!stored) return true; // Default to sending if no preferences found
      
      const preferences = JSON.parse(stored);
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      // Check quiet hours
      if (preferences.quiet_hours_start && preferences.quiet_hours_end) {
        const quietStart = preferences.quiet_hours_start;
        const quietEnd = preferences.quiet_hours_end;
        
        if (quietStart <= quietEnd) {
          // Same day quiet hours
          if (currentTime >= quietStart && currentTime <= quietEnd) {
            return false;
          }
        } else {
          // Overnight quiet hours
          if (currentTime >= quietStart || currentTime <= quietEnd) {
            return false;
          }
        }
      }

      return preferences.push_enabled || preferences.email_enabled || preferences.sms_enabled;
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return true;
    }
  }
}

export const notificationService = new NotificationService();

// Utility function to convert time slot to specific time
export const parseTimeSlot = (timeSlot: string): { hour: number; minute: number } => {
  // Parse time slots like "6:00 PM - 9:00 PM" to get the start time
  const startTime = timeSlot.split(' - ')[0];
  const [time, period] = startTime.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return { hour, minute };
};

// Function to schedule browser notifications (for demo purposes)
export const scheduleBrowserNotification = (title: string, message: string, delayMs: number) => {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }, delayMs);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setTimeout(() => {
            new Notification(title, {
              body: message,
              icon: '/favicon.ico',
              badge: '/favicon.ico'
            });
          }, delayMs);
        }
      });
    }
  }
};
