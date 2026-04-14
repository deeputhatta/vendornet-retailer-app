import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const NOTIF_KEY = '@vendornet_notifications';

export async function saveNotification(title, body, data = {}) {
  try {
    const existing = await AsyncStorage.getItem(NOTIF_KEY);
    let list = [];
    if (existing) {
      try { list = JSON.parse(existing); } catch { list = []; }
    }
    list.unshift({
      id: Date.now().toString(),
      title, body, data,
      read: false,
      created_at: new Date().toISOString(),
    });
    await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}
}

const NOTIF_ICONS = {
  NEW_ORDER: '📦',
  SUB_ORDER_ACCEPTED: '✅',
  ITEMS_REJECTED: '❌',
  DRIVER_ASSIGNED: '🚚',
  BILL_UPLOADED: '🧾',
  DELIVERY_ASSIGNED: '🚚',
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const existing = await AsyncStorage.getItem(NOTIF_KEY);
      let list = [];
      if (existing) {
        try { list = JSON.parse(existing); } catch { list = []; }
      }
      setNotifications(list);
      const updated = list.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearAll = async () => {
    await AsyncStorage.removeItem(NOTIF_KEY);
    setNotifications([]);
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  const renderItem = ({ item }) => (
    <View style={[styles.notifCard, {
      backgroundColor: item.read ? c.surface : c.primaryLight,
      borderLeftColor: item.read ? c.border : c.primary,
    }]}>
      <View style={[styles.iconBox, {
        backgroundColor: item.read ? c.surfaceSecondary : c.primaryLight,
      }]}>
        <Text style={styles.notifIcon}>
          {NOTIF_ICONS[item.data?.type] || '🔔'}
        </Text>
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, { color: c.text }]}>{item.title}</Text>
        <Text style={[styles.notifBody, { color: c.textSecondary }]} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={[styles.notifTime, { color: c.textMuted }]}>
          {getTimeAgo(item.created_at)}
        </Text>
      </View>
      {!item.read && (
        <View style={[styles.unreadDot, { backgroundColor: c.primary }]} />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearBtn}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>No notifications yet</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              Order updates will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20, paddingTop: 48,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  clearBtn: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  list: { padding: 12, paddingBottom: 24 },

  notifCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, marginBottom: 8,
    padding: 14, gap: 12,
    borderLeftWidth: 3, elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  notifIcon: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  notifBody: { fontSize: 12, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 10 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center' },
});