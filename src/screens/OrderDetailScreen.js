import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { ordersAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const STATUS_CONFIG = {
  pending:            { color: '#F2C94C', bg: '#2A1F00', label: 'Pending' },
  accepted:           { color: '#1D9E75', bg: '#0A2E22', label: 'Accepted' },
  packing:            { color: '#0A84FF', bg: '#001830', label: 'Packing' },
  dispatched:         { color: '#F2C94C', bg: '#2A1F00', label: 'Dispatched' },
  delivered:          { color: '#30D158', bg: '#003A10', label: 'Delivered' },
  completed:          { color: '#30D158', bg: '#003A10', label: 'Completed' },
  invoice_uploaded:   { color: '#30D158', bg: '#003A10', label: 'Invoiced' },
  rejected:           { color: '#FF453A', bg: '#2A0A0A', label: 'Rejected' },
  auto_cancelled:     { color: '#FF9500', bg: '#2A1500', label: 'Cancelled' },
};

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => { loadOrder(); }, []);

  const loadOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}/detail`);
      setOrder(res.data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reorder = async () => {
    Alert.alert(
      'Reorder',
      'Add all items from this order to cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reorder', onPress: async () => {
            setReordering(true);
            try {
              const allItems = order.sub_orders.flatMap(sub =>
                sub.items.map(item => ({
                  listing_id: item.listing_id,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  product_name: item.generic_name,
                  brand_name: item.brand_name,
                  wholesaler_name: sub.wholesaler_name,
                  wholesaler_id: sub.wholesaler_id,
                  min_order_qty: item.min_order_qty,
                }))
              );
              // Navigate to cart with first item
              navigation.navigate('Main', {
                screen: 'Cart',
                params: { item: allItems[0], reorderItems: allItems }
              });
            } catch (err) {
              Alert.alert('Error', 'Failed to reorder');
            } finally {
              setReordering(false);
            }
          }
        }
      ]
    );
  };

  if (loading) return (
    <View style={[styles.loading, { backgroundColor: c.background }]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );

  if (!order) return (
    <View style={[styles.loading, { backgroundColor: c.background }]}>
      <Text style={[styles.errorText, { color: c.textMuted }]}>Order not found</Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Order #{order.order_id.slice(0, 8).toUpperCase()}
        </Text>
        <Text style={styles.headerDate}>
          {new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </Text>
        <Text style={styles.headerAmount}>
          ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
        </Text>
      </View>

      <View style={styles.content}>

        {/* Reorder button */}
        <TouchableOpacity
          style={[styles.reorderBtn, { backgroundColor: c.primary }]}
          onPress={reorder}
          disabled={reordering}
        >
          <Text style={styles.reorderIcon}>🔄</Text>
          <Text style={styles.reorderText}>
            {reordering ? 'Adding to cart...' : 'Reorder All Items'}
          </Text>
        </TouchableOpacity>

        {/* Delivery address */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>📍 Delivery Address</Text>
          <Text style={[styles.addressText, { color: c.textSecondary }]}>
            {order.retailer_address || 'Address not available'}
          </Text>
        </View>

        {/* Sub orders */}
        {order.sub_orders?.map((sub, si) => {
          const config = STATUS_CONFIG[sub.status] ||
            { color: c.textMuted, bg: c.surfaceSecondary, label: sub.status };
          return (
            <View key={sub.sub_order_id} style={[styles.card, { backgroundColor: c.surface }]}>

              {/* Wholesaler header */}
              <View style={[styles.wholesalerHeader, { borderBottomColor: c.borderLight }]}>
                <View style={[styles.wholesalerAvatar, { backgroundColor: c.primary }]}>
                  <Text style={styles.wholesalerAvatarText}>
                    {sub.wholesaler_name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.wholesalerInfo}>
                  <Text style={[styles.wholesalerName, { color: c.text }]}>
                    {sub.wholesaler_name}
                  </Text>
                  <Text style={[styles.wholesalerMobile, { color: c.textMuted }]}>
                    +91 {sub.wholesaler_mobile}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                  <Text style={[styles.statusText, { color: config.color }]}>
                    {config.label}
                  </Text>
                </View>
              </View>

              {/* Items */}
              {sub.items?.map((item, ii) => (
                <View
                  key={item.item_id}
                  style={[styles.itemRow, {
                    borderBottomColor: c.borderLight,
                    borderBottomWidth: ii < sub.items.length - 1 ? 0.5 : 0,
                  }]}
                >
                  <View style={[styles.itemIcon, { backgroundColor: c.primaryLight }]}>
                    <Text style={styles.itemEmoji}>📦</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: c.text }]}>
                      {item.generic_name}
                    </Text>
                    <Text style={[styles.itemBrand, { color: c.primary }]}>
                      {item.brand_name}
                    </Text>
                    <Text style={[styles.itemQty, { color: c.textMuted }]}>
                      Qty: {item.quantity} × ₹{item.unit_price}
                    </Text>
                  </View>
                  <Text style={[styles.itemTotal, { color: c.text }]}>
                    ₹{parseFloat(item.item_total).toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}

              {/* Sub order total */}
              <View style={[styles.subTotal, { borderTopColor: c.borderLight }]}>
                <Text style={[styles.subTotalLabel, { color: c.textMuted }]}>
                  Subtotal
                </Text>
                <Text style={[styles.subTotalValue, { color: c.primary }]}>
                  ₹{parseFloat(sub.total_amount).toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Track button for dispatched */}
              {sub.status === 'dispatched' && (
                <TouchableOpacity
                  style={[styles.trackBtn, { borderColor: '#F2C94C' }]}
                  onPress={() => navigation.navigate('DeliveryTracking', {
                    subOrderId: sub.sub_order_id,
                    wholesalerName: sub.wholesaler_name,
                  })}
                >
                  <Text style={styles.trackBtnIcon}>🚚</Text>
                  <Text style={[styles.trackBtnText, { color: '#F2C94C' }]}>
                    Track Delivery →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Order total */}
        <View style={[styles.totalCard, { backgroundColor: c.surface }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: c.textMuted }]}>Order Total</Text>
            <Text style={[styles.totalValue, { color: c.primary }]}>
              ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 6 }]}>
            <Text style={[styles.totalLabel, { color: c.textMuted }]}>Items</Text>
            <Text style={[styles.totalLabel, { color: c.textSecondary }]}>
              {order.sub_orders?.reduce((sum, s) => sum + (s.items?.length || 0), 0)} products
            </Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 6 }]}>
            <Text style={[styles.totalLabel, { color: c.textMuted }]}>Suppliers</Text>
            <Text style={[styles.totalLabel, { color: c.textSecondary }]}>
              {order.sub_orders?.length} wholesalers
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16 },

  header: { padding: 20, paddingTop: 48 },
  backBtn: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerDate: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  headerAmount: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginTop: 8 },

  content: { padding: 16 },

  reorderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, height: 52, gap: 10, marginBottom: 16,
  },
  reorderIcon: { fontSize: 18 },
  reorderText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  card: {
    borderRadius: 16, marginBottom: 14,
    overflow: 'hidden', elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', padding: 14, paddingBottom: 8 },
  addressText: { fontSize: 13, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 14 },

  wholesalerHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 0.5, gap: 10,
  },
  wholesalerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  wholesalerAvatarText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  wholesalerInfo: { flex: 1 },
  wholesalerName: { fontSize: 14, fontWeight: '700' },
  wholesalerMobile: { fontSize: 11, marginTop: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },

  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, paddingHorizontal: 14, gap: 10,
  },
  itemIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  itemEmoji: { fontSize: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  itemBrand: { fontSize: 11, marginBottom: 2 },
  itemQty: { fontSize: 11 },
  itemTotal: { fontSize: 14, fontWeight: '700' },

  subTotal: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 14, borderTopWidth: 0.5,
  },
  subTotalLabel: { fontSize: 13 },
  subTotalValue: { fontSize: 15, fontWeight: '800' },

  trackBtn: {
    flexDirection: 'row', alignItems: 'center',
    margin: 14, marginTop: 0,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
    backgroundColor: 'rgba(242,201,76,0.08)',
  },
  trackBtnIcon: { fontSize: 16 },
  trackBtnText: { flex: 1, fontSize: 13, fontWeight: '700' },

  totalCard: {
    borderRadius: 16, padding: 16, marginBottom: 14,
    elevation: 1, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 13 },
  totalValue: { fontSize: 20, fontWeight: '800' },
});