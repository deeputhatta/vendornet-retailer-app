import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { ordersAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const STATUS_COLORS = {
  pending:            { bg: '#2A1F00', text: '#F2C94C' },
  accepted:           { bg: '#0A2E22', text: '#1D9E75' },
  partially_accepted: { bg: '#0A1F35', text: '#185FA5' },
  packing:            { bg: '#001830', text: '#0A84FF' },
  dispatched:         { bg: '#2A1F00', text: '#F2C94C' },
  delivered:          { bg: '#003A10', text: '#30D158' },
  invoice_uploaded:   { bg: '#003A10', text: '#30D158' },
  completed:          { bg: '#003A10', text: '#30D158' },
  rejected:           { bg: '#2A0A0A', text: '#FF453A' },
  auto_cancelled:     { bg: '#2A1500', text: '#FF9500' },
};

const getStatusColor = (status) =>
  STATUS_COLORS[status] || { bg: '#2A2A2A', text: '#8E8E93' };

const STATUS_LABELS = {
  pending:            'Pending',
  accepted:           'Accepted',
  partially_accepted: 'Partial',
  packing:            'Packing',
  dispatched:         'Dispatched',
  delivered:          'Delivered',
  invoice_uploaded:   'Invoiced',
  completed:          'Completed',
  rejected:           'Rejected',
  auto_cancelled:     'Cancelled',
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getMyOrders();
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return order.sub_orders?.some(s =>
      ['pending', 'accepted', 'packing', 'dispatched'].includes(s.status)
    );
    if (filter === 'delivered') return order.sub_orders?.some(s =>
      ['delivered', 'completed', 'invoice_uploaded'].includes(s.status)
    );
    return true;
  });

  const getOverallStatus = (sub_orders) => {
    if (!sub_orders?.length) return 'pending';
    const statuses = sub_orders.map(s => s.status);
    if (statuses.every(s => ['delivered', 'completed', 'invoice_uploaded'].includes(s)))
      return 'delivered';
    if (statuses.some(s => s === 'dispatched')) return 'dispatched';
    if (statuses.some(s => s === 'packing')) return 'packing';
    if (statuses.some(s => s === 'accepted')) return 'accepted';
    if (statuses.some(s => s === 'rejected')) return 'rejected';
    return statuses[0];
  };

  const renderOrder = ({ item }) => {
    const overallStatus = getOverallStatus(item.sub_orders);
    const statusColor = getStatusColor(overallStatus);
    const hasDispatched = item.sub_orders?.some(s => s.status === 'dispatched');

    return (
      <TouchableOpacity
        style={[styles.orderCard, {
          backgroundColor: c.surface,
          shadowColor: c.text,
          borderLeftColor: statusColor.text,
        }]}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.order_id })}
        activeOpacity={0.8}
      >
        {/* Order header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={[styles.orderId, { color: c.text }]}>
              #{item.order_id.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={[styles.orderDate, { color: c.textMuted }]}>
              {new Date(item.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.orderHeaderRight}>
            <Text style={[styles.orderAmount, { color: c.primary }]}>
              ₹{parseFloat(item.total_amount).toLocaleString('en-IN')}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {STATUS_LABELS[overallStatus] || overallStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Sub orders */}
        {item.sub_orders?.map((sub, i) => {
          const sc = getStatusColor(sub.status);
          const isDispatched = sub.status === 'dispatched';
          return (
            <View
              key={sub.sub_order_id}
              style={[styles.subRow, {
                borderTopColor: c.borderLight,
                backgroundColor: isDispatched
                  ? 'rgba(242,201,76,0.05)' : 'transparent',
              }]}
            >
              <View style={styles.subLeft}>
                <View style={[styles.wholesalerDot, { backgroundColor: c.primary }]}>
                  <Text style={styles.wholesalerDotText}>
                    {sub.wholesaler_name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.wholesalerName, { color: c.text }]}>
                    {sub.wholesaler_name}
                  </Text>
                  {isDispatched && (
                    <Text style={[styles.dispatchHint, { color: '#F2C94C' }]}>
                      🚚 On the way
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.subRight}>
                <View style={[styles.subStatusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.subStatusText, { color: sc.text }]}>
                    {STATUS_LABELS[sub.status] || sub.status}
                  </Text>
                </View>
                <Text style={[styles.subAmount, { color: c.textMuted }]}>
                  ₹{parseFloat(sub.total_amount).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Track button for dispatched */}
        {hasDispatched && (
          <TouchableOpacity
            style={[styles.trackBtn, { borderColor: '#F2C94C' }]}
            onPress={(e) => {
              e.stopPropagation();
              const dispatchedSub = item.sub_orders.find(s => s.status === 'dispatched');
              navigation.navigate('DeliveryTracking', {
                subOrderId: dispatchedSub.sub_order_id,
                wholesalerName: dispatchedSub.wholesaler_name,
              });
            }}
          >
            <Text style={styles.trackBtnIcon}>🚚</Text>
            <Text style={[styles.trackBtnText, { color: '#F2C94C' }]}>
              Track Delivery
            </Text>
            <Text style={[styles.trackBtnArrow, { color: '#F2C94C' }]}>→</Text>
          </TouchableOpacity>
        )}

        {/* View detail hint */}
        <View style={[styles.viewDetail, { borderTopColor: c.borderLight }]}>
          <Text style={[styles.viewDetailText, { color: c.textMuted }]}>
            Tap to view full details & reorder →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={[styles.loading, { backgroundColor: c.background }]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.notifBtn}>🔔</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>
          {orders.length} total orders
        </Text>
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterRow, {
        backgroundColor: c.surface, borderBottomColor: c.border,
      }]}>
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'delivered', label: 'Delivered' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, {
              borderBottomColor: filter === f.key ? c.primary : 'transparent',
            }]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, {
              color: filter === f.key ? c.primary : c.textMuted,
              fontWeight: filter === f.key ? '700' : '400',
            }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={item => item.order_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadOrders(); }}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>No orders yet</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              Your orders will appear here
            </Text>
            <TouchableOpacity
              style={[styles.shopBtn, { backgroundColor: c.primary }]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopBtnText}>Start Shopping →</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: { padding: 20, paddingTop: 48 },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  notifBtn: { fontSize: 22 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

  // Filter
  filterRow: {
    flexDirection: 'row', borderBottomWidth: 1,
  },
  filterBtn: {
    flex: 1, paddingVertical: 12,
    alignItems: 'center', borderBottomWidth: 2,
  },
  filterText: { fontSize: 13 },

  list: { padding: 12, paddingBottom: 24 },

  // Order card
  orderCard: {
    borderRadius: 14, marginBottom: 12,
    overflow: 'hidden', elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6,
    borderLeftWidth: 4,
  },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: 14,
  },
  orderHeaderLeft: {},
  orderId: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  orderDate: { fontSize: 11 },
  orderHeaderRight: { alignItems: 'flex-end' },
  orderAmount: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },

  // Sub rows
  subRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 14,
    paddingVertical: 10, borderTopWidth: 0.5,
  },
  subLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  wholesalerDot: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  wholesalerDotText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  wholesalerName: { fontSize: 13, fontWeight: '600' },
  dispatchHint: { fontSize: 10, marginTop: 1 },
  subRight: { alignItems: 'flex-end', gap: 3 },
  subStatusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  subStatusText: { fontSize: 10, fontWeight: '600' },
  subAmount: { fontSize: 11 },

  // Track button
  trackBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 14, marginBottom: 10,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    gap: 8, backgroundColor: 'rgba(242,201,76,0.08)',
  },
  trackBtnIcon: { fontSize: 16 },
  trackBtnText: { flex: 1, fontSize: 13, fontWeight: '700' },
  trackBtnArrow: { fontSize: 14, fontWeight: '700' },

  // View detail
  viewDetail: {
    borderTopWidth: 0.5, paddingVertical: 8,
    paddingHorizontal: 14, alignItems: 'center',
  },
  viewDetailText: { fontSize: 11 },

  // Empty
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  shopBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});