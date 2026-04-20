import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;
  const { cartItems, cartTotal, cartByWholesaler, removeFromCart, updateQuantity, clearCart } = useCart();

  const allMOQMet = cartItems.every(item => item.quantity >= item.min_order_qty);
  const wholesalerCount = Object.keys(cartByWholesaler).length;

  const placeOrder = async () => {
    if (!allMOQMet) {
      Alert.alert('MOQ Error', 'Some items are below minimum order quantity');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        retailer_address: user.address || '',
        retailer_lat: user.lat || 9.9252,
        retailer_lng: user.lng || 78.1198,
        items: cartItems.map(i => ({
          listing_id: i.listing_id,
          quantity: i.quantity,
        }))
      };
      const res = await ordersAPI.placeOrder(orderData);
      const subOrderCount = res.data.order?.sub_orders?.length || wholesalerCount;
      Alert.alert(
        '✓ Order Placed!',
        `Order placed successfully with ${subOrderCount} supplier${subOrderCount > 1 ? 's' : ''}.\n\nOrder ID: #${res.data.order.order_id.slice(0, 8).toUpperCase()}`,
        [{ text: 'View Orders', onPress: () => {
          clearCart();
          navigation.navigate('Orders');
        }}]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const confirmRemove = (listing_id, name) => {
    Alert.alert('Remove Item', `Remove ${name} from cart?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(listing_id) }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <Text style={styles.title}>My Cart</Text>
        {cartItems.length > 0 && (
          <Text style={styles.subtitle}>
            {cartItems.length} item{cartItems.length > 1 ? 's' : ''} · {wholesalerCount} supplier{wholesalerCount > 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>🛒</Text>
          <Text style={[styles.emptyText, { color: c.textMuted }]}>Your cart is empty</Text>
          <TouchableOpacity
            style={[styles.shopBtn, { backgroundColor: c.primary }]}
            onPress={() => navigation.navigate('Home')}>
            <Text style={[styles.shopBtnText, { color: c.textOnPrimary }]}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>

            {/* Group by wholesaler */}
            {Object.values(cartByWholesaler).map(group => (
              <View key={group.wholesaler_id} style={styles.wholesalerGroup}>
                {/* Wholesaler header */}
                <View style={[styles.wholesalerHeader, { backgroundColor: c.primaryLight }]}>
                  <Text style={[styles.wholesalerName, { color: c.primary }]}>
                    🏪 {group.wholesaler_name}
                  </Text>
                  <Text style={[styles.wholesalerItemCount, { color: c.textMuted }]}>
                    {group.items.length} item{group.items.length > 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Items */}
                {group.items.map(item => (
                  <View key={item.listing_id} style={[styles.itemCard, { backgroundColor: c.surface, shadowColor: c.text }]}>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: c.text }]}>{item.product_name}</Text>
                      <Text style={[styles.itemBrand, { color: c.primary }]}>{item.brand_name}</Text>
                      {item.pack_size && (
                        <Text style={[styles.itemPack, { color: c.textMuted }]}>
                          {item.pack_size} {item.unit}
                        </Text>
                      )}
                      <Text style={[styles.itemUnitPrice, { color: c.textMuted }]}>
                        ₹{item.unit_price}/unit
                      </Text>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={[styles.itemTotal, { color: c.text }]}>
                        ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                      </Text>

                      {/* Qty control */}
                      <View style={styles.qtyRow}>
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: c.primaryLight }]}
                          onPress={() => updateQuantity(item.listing_id, Math.max(item.min_order_qty, item.quantity - 1))}>
                          <Text style={[styles.qtyBtnText, { color: c.primary }]}>−</Text>
                        </TouchableOpacity>
                        <Text style={[styles.qtyValue, { color: c.text }]}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: c.primaryLight }]}
                          onPress={() => updateQuantity(item.listing_id, item.quantity + 1)}>
                          <Text style={[styles.qtyBtnText, { color: c.primary }]}>+</Text>
                        </TouchableOpacity>
                      </View>

                      {item.quantity < item.min_order_qty && (
                        <Text style={[styles.moqWarn, { color: c.error }]}>
                          Min: {item.min_order_qty}
                        </Text>
                      )}
                      <TouchableOpacity onPress={() => confirmRemove(item.listing_id, item.product_name)}>
                        <Text style={[styles.removeBtn, { color: c.error }]}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Wholesaler subtotal */}
                <View style={[styles.subtotalRow, { borderTopColor: c.border }]}>
                  <Text style={[styles.subtotalLabel, { color: c.textMuted }]}>Subtotal</Text>
                  <Text style={[styles.subtotalAmount, { color: c.primary }]}>
                    ₹{group.items.reduce((s, i) => s + i.unit_price * i.quantity, 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            ))}

            {/* Multi-supplier note */}
            {wholesalerCount > 1 && (
              <View style={[styles.multiNote, { backgroundColor: c.primaryLight }]}>
                <Text style={[styles.multiNoteText, { color: c.primary }]}>
                  ℹ Your order will be split into {wholesalerCount} separate supplier orders automatically.
                </Text>
              </View>
            )}

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: c.surface, borderTopColor: c.border, shadowColor: c.text }]}>
            <View style={styles.totalRow}>
              <View>
                <Text style={[styles.totalLabel, { color: c.textMuted }]}>Total Amount</Text>
                {wholesalerCount > 1 && (
                  <Text style={[styles.supplierNote, { color: c.textMuted }]}>
                    {wholesalerCount} suppliers
                  </Text>
                )}
              </View>
              <Text style={[styles.totalAmount, { color: c.primary }]}>
                ₹{cartTotal.toLocaleString('en-IN')}
              </Text>
            </View>
            {!allMOQMet && (
              <Text style={[styles.moqError, { color: c.error }]}>
                Some items are below minimum order quantity
              </Text>
            )}
            <TouchableOpacity
              style={[styles.orderBtn, { backgroundColor: allMOQMet ? c.primary : c.primaryLight }]}
              onPress={placeOrder}
              disabled={!allMOQMet || loading}>
              {loading
                ? <ActivityIndicator color={c.textOnPrimary} />
                : <Text style={[styles.orderBtnText, { color: c.textOnPrimary }]}>
                    Place Order{wholesalerCount > 1 ? ` (${wholesalerCount} suppliers)` : ''}
                  </Text>
              }
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16, marginBottom: 24 },
  shopBtn: { borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  shopBtnText: { fontSize: 15, fontWeight: '600' },
  list: { flex: 1 },
  wholesalerGroup: { marginBottom: 8 },
  wholesalerHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
  },
  wholesalerName: { fontSize: 14, fontWeight: '700' },
  wholesalerItemCount: { fontSize: 12 },
  itemCard: {
    marginHorizontal: 12, marginBottom: 6,
    borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between',
    elevation: 1, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  itemInfo: { flex: 1, marginRight: 8 },
  itemName: { fontSize: 15, fontWeight: '600' },
  itemBrand: { fontSize: 13, marginTop: 2 },
  itemPack: { fontSize: 11, marginTop: 1 },
  itemUnitPrice: { fontSize: 12, marginTop: 4 },
  itemRight: { alignItems: 'flex-end' },
  itemTotal: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold', lineHeight: 22 },
  qtyValue: { fontSize: 16, fontWeight: 'bold', minWidth: 28, textAlign: 'center' },
  moqWarn: { fontSize: 10, marginBottom: 2 },
  removeBtn: { fontSize: 12, marginTop: 4 },
  subtotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 0.5,
  },
  subtotalLabel: { fontSize: 13 },
  subtotalAmount: { fontSize: 14, fontWeight: '700' },
  multiNote: { margin: 12, borderRadius: 10, padding: 12 },
  multiNoteText: { fontSize: 12, lineHeight: 18 },
  footer: {
    padding: 16, elevation: 4, borderTopWidth: 1,
    shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 14, fontWeight: '500' },
  supplierNote: { fontSize: 11, marginTop: 2 },
  totalAmount: { fontSize: 22, fontWeight: 'bold' },
  moqError: { fontSize: 12, marginBottom: 8, textAlign: 'center' },
  orderBtn: { borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center' },
  orderBtnText: { fontSize: 16, fontWeight: '600' },
});
