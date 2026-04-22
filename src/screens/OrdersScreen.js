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
  cancelled:          { bg: '#2A1500', text: '#FF9500' },
};

const getStatusColor = (status) => STATUS_COLORS[status] || { bg: '#2A2A2A', text: '#8E8E93' };

const STATUS_LABELS = {
  pending: 'Pending', accepted: 'Accepted', partially_accepted: 'Partial',
  packing: 'Packing', dispatched: 'Dispatched', delivered: 'Delivered',
  invoice_uploaded: 'Invoiced', completed: 'Completed',
  rejected: 'Rejected', auto_cancelled: 'Cancelled', cancelled: 'Cancelled',
};

const CANCELLED_STATUSES = ['rejected', 'auto_cancelled', 'cancelled'];

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('active');
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getMyOrders();
      setOrders(res.data.orders);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return order.sub_orders?.some(s =>
      ['pending', 'accepted', 'packing', 'dispatched'].includes(s.status));
    if (filter === 'delivered') return order.sub_orders?.some(s =>
      ['delivered', 'completed', 'invoice_uploaded'].includes(s.status));
    if (filter === 'cancelled') return order.sub_orders?.every(s =>
      CANCELLED_STATUSES.includes(s.status));
    return true;
  });

  const getOverallStatus = (sub_orders) => {
    if (!sub_orders?.length) return 'pending';
    const statuses = sub_orders.map(s => s.status);
    if (statuses.every(s => ['delivered', 'completed', 'invoice_uploaded'].includes(s))) return 'delivered';
    if (statuses.every(s => CANCELLED_STATUSES.includes(s))) return 'auto_cancelled';
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
    const hasInvoice = item.sub_orders?.some(s => s.status === 'invoice_uploaded');
    const totalItems = item.sub_orders?.reduce((s, sub) => s + (sub.item_count || sub.items?.length || 0), 0);
    const supplierCount = item.sub_orders?.length || 0;

    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: c.surface, shadowColor: c.text, borderLeftColor: statusColor.text }]}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.order_id })}
        activeOpacity={0.8}>

        {/* ── PRIMARY: Order info ── */}
        <View style={styles.orderHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.orderId, { color: c.text }]}>
              #{item.order_id.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={[styles.orderDate, { color: c.textMuted }]}>
              {new Date(item.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
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

        {/* ── SECONDARY: Item & supplier summary ── */}
        <View style={[styles.summaryRow, { borderTopColor: c.borderLight, backgroundColor: c.background }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: c.text }]}>{totalItems}</Text>
            <Text style={[styles.summaryLabel, { color: c.textMuted }]}>
              {totalItems === 1 ? 'Product' : 'Products'}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: c.borderLight }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: c.text }]}>{supplierCount}</Text>
            <Text style={[styles.summaryLabel, { color: c.textMuted }]}>
              {supplierCount === 1 ? 'Supplier' : 'Suppliers'}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: c.borderLight }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: c.text }]}>
              {item.sub_orders?.filter(s => ['delivered','completed','invoice_uploaded'].includes(s.status)).length}/{supplierCount}
            </Text>
            <Text style={[styles.summaryLabel, { color: c.textMuted }]}>Delivered</Text>
          </View>
        </View>

        {/* ── TERTIARY: Supplier status list ── */}
        {item.sub_orders?.map((sub) => {
          const sc = getStatusColor(sub.status);
          return (
            <View key={sub.sub_order_id} style={[styles.subRow, { borderTopColor: c.borderLight }]}>
              <View style={[styles.wholesalerDot, { backgroundColor: c.primary }]}>
                <Text style={styles.wholesalerDotText}>{sub.wholesaler_name?.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={[styles.wholesalerName, { color: c.text }]} numberOfLines={1}>
                {sub.wholesaler_name}
              </Text>
              <Text style={[styles.subAmount, { color: c.textMuted }]}>
                ₹{parseFloat(sub.total_amount).toLocaleString('en-IN')}
              </Text>
              <View style={[styles.subStatusBadge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.subStatusText, { color: sc.text }]}>
                  {STATUS_LABELS[sub.status] || sub.status}
                </Text>
              </View>
            </View>
          );
        })}

        {/* ── ACTION BUTTONS (small, secondary) ── */}
        {(hasDispatched || hasInvoice) && (
          <View style={[styles.actionsRow, { borderTopColor: c.borderLight }]}>
            {hasDispatched && (
              <TouchableOpacity
                style={[styles.smallBtn, { borderColor: '#F2C94C', backgroundColor: 'rgba(242,201,76,0.08)' }]}
                onPress={(e) => {
                  e.stopPropagation();
                  const sub = item.sub_orders.find(s => s.status === 'dispatched');
                  navigation.navigate('DeliveryTracking', { subOrderId: sub.sub_order_id, wholesalerName: sub.wholesaler_name });
                }}>
                <Text style={[styles.smallBtnText, { color: '#F2C94C' }]}>🚚 Track</Text>
              </TouchableOpacity>
            )}
            {hasInvoice && (
              <TouchableOpacity
                style={[styles.smallBtn, { borderColor: '#30D158', backgroundColor: 'rgba(48,209,88,0.08)' }]}
                onPress={(e) => { e.stopPropagation(); navigation.navigate('Invoices'); }}>
                <Text style={[styles.smallBtnText, { color: '#30D158' }]}>🧾 Invoice</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.smallBtn, { borderColor: c.border, backgroundColor: 'transparent', marginLeft: 'auto' }]}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.order_id })}>
              <Text style={[styles.smallBtnText, { color: c.textMuted }]}>Details →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── FOOTER hint (only if no action buttons) ── */}
        {!hasDispatched && !hasInvoice && (
          <View style={[styles.viewDetail, { borderTopColor: c.borderLight }]}>
            <Text style={[styles.viewDetailText, { color: c.textMuted }]}>
              Tap to view full details & reorder →
            </Text>
          </View>
        )}

      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={[styles.loading, { backgroundColor: c.background }]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );

  const tabs = [
    { key: 'active', label: 'Active' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'all', label: 'All' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Orders</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate('ReportDownload', { reportType: 'orders' })}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>📥  Report</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.notifBtn}>🔔</Text>
          </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSub}>{orders.length} total orders</Text>
      </View>

      <View style={[styles.filterRow, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        {tabs.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, { borderBottomColor: filter === f.key ? c.primary : 'transparent' }]}
            onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, {
              color: filter === f.key ? c.primary : c.textMuted,
              fontWeight: filter === f.key ? '700' : '400'
            }]}>{f.label}</Text>
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
            tintColor={c.primary} colors={[c.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              {filter === 'cancelled' ? 'No cancelled orders' :
               filter === 'active' ? 'No active orders' :
               filter === 'delivered' ? 'No delivered orders' : 'No orders yet'}
            </Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              {filter === 'active' ? 'Your active orders will appear here' : 'Your orders will appear here'}
            </Text>
            {filter === 'active' && (
              <TouchableOpacity
                style={[styles.shopBtn, { backgroundColor: c.primary }]}
                onPress={() => navigation.navigate('Home')}>
                <Text style={styles.shopBtnText}>Start Shopping →</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 48 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  notifBtn: { fontSize: 22 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  filterRow: { flexDirection: 'row', borderBottomWidth: 1 },
  filterBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2 },
  filterText: { fontSize: 13 },
  list: { padding: 12, paddingBottom: 24 },

  orderCard: {
    borderRadius: 14, marginBottom: 12, overflow: 'hidden',
    elevation: 2, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, borderLeftWidth: 4,
  },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: 14,
  },
  orderId: { fontSize: 16, fontWeight: '800', marginBottom: 3 },
  orderDate: { fontSize: 12 },
  orderAmount: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },

  summaryRow: {
    flexDirection: 'row', borderTopWidth: 0.5,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  summaryLabel: { fontSize: 10 },
  summaryDivider: { width: 0.5, marginVertical: 4 },

  subRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderTopWidth: 0.5, gap: 8,
  },
  wholesalerDot: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  wholesalerDotText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  wholesalerName: { flex: 1, fontSize: 12, fontWeight: '500' },
  subAmount: { fontSize: 11 },
  subStatusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  subStatusText: { fontSize: 10, fontWeight: '600' },

  actionsRow: {
    flexDirection: 'row', gap: 8, padding: 10,
    paddingHorizontal: 14, borderTopWidth: 0.5,
    flexWrap: 'wrap',
  },
  smallBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  smallBtnText: { fontSize: 12, fontWeight: '600' },

  viewDetail: {
    borderTopWidth: 0.5, paddingVertical: 8,
    paddingHorizontal: 14, alignItems: 'center',
  },
  viewDetailText: { fontSize: 11 },

  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  shopBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});



