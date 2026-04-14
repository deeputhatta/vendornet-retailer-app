import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
  Linking
} from 'react-native';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const STATUS_STEPS = [
  { key: 'accepted',   label: 'Confirmed', icon: '✓' },
  { key: 'packing',    label: 'Packing',   icon: '📦' },
  { key: 'dispatched', label: 'On the way', icon: '🚚' },
  { key: 'delivered',  label: 'Delivered', icon: '🎉' },
];

const STATUS_CONFIG = {
  pending:            { color: '#F2C94C', bg: '#2A1F00', label: 'Pending' },
  accepted:           { color: '#1D9E75', bg: '#0A2E22', label: 'Confirmed' },
  packing:            { color: '#0A84FF', bg: '#001830', label: 'Packing' },
  dispatched:         { color: '#F2C94C', bg: '#2A1F00', label: 'On the way 🚚' },
  delivered:          { color: '#30D158', bg: '#003A10', label: 'Delivered ✓' },
  completed:          { color: '#30D158', bg: '#003A10', label: 'Completed' },
  invoice_uploaded:   { color: '#30D158', bg: '#003A10', label: 'Invoiced' },
  rejected:           { color: '#FF453A', bg: '#2A0A0A', label: 'Rejected' },
  auto_cancelled:     { color: '#FF9500', bg: '#2A1500', label: 'Cancelled' },
};

export default function DeliveryTrackingScreen({ route, navigation }) {
  const { subOrderId, wholesalerName } = route.params || {};
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => {
    loadDelivery();
    const interval = setInterval(loadDelivery, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadDelivery = async () => {
    try {
      const res = await api.get(`/delivery/${subOrderId}/location`);
      setDelivery(res.data.location);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStepIndex = (status) =>
    STATUS_STEPS.findIndex(s => s.key === status);

  if (loading) return (
    <View style={[styles.loading, { backgroundColor: c.background }]}>
      <ActivityIndicator size="large" color={c.primary} />
      <Text style={[styles.loadingText, { color: c.textMuted }]}>
        Loading delivery info...
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadDelivery(); }}
          tintColor={c.primary} colors={[c.primary]}
        />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Delivery</Text>
        <Text style={styles.headerSub}>{wholesalerName}</Text>
      </View>

      <View style={styles.content}>

        {/* Live indicator */}
        <View style={[styles.liveCard, { backgroundColor: c.surface }]}>
          <View style={styles.liveDot} />
          <Text style={[styles.liveText, { color: c.text }]}>
            Live tracking · Updates every 15s
          </Text>
          <Text style={[styles.liveTime, { color: c.textMuted }]}>
            {delivery?.last_location_at
              ? `Last: ${new Date(delivery.last_location_at).toLocaleTimeString('en-IN')}`
              : 'Waiting for location...'}
          </Text>
        </View>

        {/* Map placeholder */}
        <View style={[styles.mapCard, { backgroundColor: c.surface }]}>
          {delivery?.last_known_lat ? (
            <View style={styles.mapContent}>
              <Text style={styles.mapEmoji}>🗺️</Text>
              <Text style={[styles.mapTitle, { color: c.text }]}>Driver Location</Text>
              <Text style={[styles.mapCoords, { color: c.textMuted }]}>
                {parseFloat(delivery.last_known_lat).toFixed(4)}°N,{' '}
                {parseFloat(delivery.last_known_lng).toFixed(4)}°E
              </Text>
              <TouchableOpacity
                style={[styles.mapsBtn, { backgroundColor: c.primary }]}
                onPress={() => {
                  const url = `https://maps.google.com/?q=${delivery.last_known_lat},${delivery.last_known_lng}`;
                  Linking.openURL(url);
                }}
              >
                <Text style={styles.mapsBtnText}>Open in Google Maps →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mapContent}>
              <Text style={styles.mapEmoji}>📡</Text>
              <Text style={[styles.mapTitle, { color: c.text }]}>
                Waiting for driver location
              </Text>
              <Text style={[styles.mapSub, { color: c.textMuted }]}>
                Location will appear once driver is on the way
              </Text>
            </View>
          )}
        </View>

        {/* ETA card */}
        <View style={[styles.etaCard, { backgroundColor: '#0A2E22' }]}>
          <Text style={styles.etaEmoji}>⏱</Text>
          <View style={styles.etaInfo}>
            <Text style={[styles.etaTitle, { color: '#30D158' }]}>
              Estimated Delivery
            </Text>
            <Text style={[styles.etaValue, { color: '#FFFFFF' }]}>
              Today · Within 24 hours
            </Text>
          </View>
        </View>

        {/* Pull to refresh hint */}
        <View style={[styles.refreshHint, { backgroundColor: c.surfaceSecondary }]}>
          <Text style={[styles.refreshHintText, { color: c.textMuted }]}>
            ↓ Pull to refresh location
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },

  header: { padding: 20, paddingTop: 48 },
  backBtn: { marginBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },

  content: { padding: 16 },

  liveCard: {
    borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 12,
  },
  liveDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#30D158',
  },
  liveText: { fontSize: 13, fontWeight: '600', flex: 1 },
  liveTime: { fontSize: 11 },

  mapCard: {
    borderRadius: 16, marginBottom: 12,
    overflow: 'hidden', minHeight: 200,
    justifyContent: 'center', alignItems: 'center',
  },
  mapContent: { padding: 32, alignItems: 'center' },
  mapEmoji: { fontSize: 48, marginBottom: 12 },
  mapTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  mapCoords: { fontSize: 13, marginBottom: 16 },
  mapSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  mapsBtn: {
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10,
  },
  mapsBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  etaCard: {
    borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 12,
  },
  etaEmoji: { fontSize: 28 },
  etaInfo: {},
  etaTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  etaValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },

  refreshHint: {
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  refreshHintText: { fontSize: 12 },
});