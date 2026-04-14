import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function CartScreen({ route, navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;

  const addedRef = React.useRef(false);

useEffect(() => {
  if (route.params?.item && !addedRef.current) {
    addedRef.current = true;
    addItem(route.params.item);
  }
}, []);

  const addItem = (newItem) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.listing_id === newItem.listing_id);
      if (exists) {
        return prev.map(i =>
          i.listing_id === newItem.listing_id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (listing_id) => {
    setCartItems(prev => prev.filter(i => i.listing_id !== listing_id));
  };

  const totalAmount = cartItems.reduce((sum, item) =>
    sum + (item.unit_price * item.quantity), 0
  );

  const allMOQMet = cartItems.every(item => item.quantity >= item.min_order_qty);

  const placeOrder = async () => {
    if (!allMOQMet) {
      Alert.alert('MOQ Error', 'Some items are below minimum order quantity');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        retailer_address: user.address || 'Test Address',
        retailer_lat: 9.9252,
        retailer_lng: 78.1198,
        items: cartItems.map(i => ({
          listing_id: i.listing_id,
          quantity: i.quantity
        }))
      };
      const res = await ordersAPI.placeOrder(orderData);
      Alert.alert(
        'Order Placed!',
        `Order #${res.data.order.order_id.slice(0, 8)} placed successfully`,
        [{ text: 'OK', onPress: () => {
          setCartItems([]);
          navigation.navigate('Orders');
        }}]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <Text style={styles.title}>My Cart</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            Your cart is empty
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={[styles.shopLink, { color: c.primary }]}>
              Browse products
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {cartItems.map(item => (
              <View
                key={item.listing_id}
                style={[styles.itemCard, {
                  backgroundColor: c.surface,
                  shadowColor: c.text,
                }]}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: c.text }]}>
                    {item.product_name}
                  </Text>
                  <Text style={[styles.itemBrand, { color: c.primary }]}>
                    {item.brand_name}
                  </Text>
                  <Text style={[styles.itemSeller, { color: c.textMuted }]}>
                    {item.wholesaler_name}
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={[styles.itemPrice, { color: c.text }]}>
                    ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.itemQty, { color: c.textMuted }]}>
                    Qty: {item.quantity}
                  </Text>
                  {item.quantity < item.min_order_qty && (
                    <Text style={[styles.moqWarn, { color: c.error }]}>
                      Min: {item.min_order_qty}
                    </Text>
                  )}
                  <TouchableOpacity onPress={() => removeItem(item.listing_id)}>
                    <Text style={[styles.removeBtn, { color: c.error }]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, {
            backgroundColor: c.surface,
            borderTopColor: c.border,
            shadowColor: c.text,
          }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: c.text }]}>
                Total Amount
              </Text>
              <Text style={[styles.totalAmount, { color: c.primary }]}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </Text>
            </View>
            {!allMOQMet && (
              <Text style={[styles.moqError, { color: c.error }]}>
                Some items are below minimum order quantity
              </Text>
            )}
            <TouchableOpacity
              style={[
                styles.orderBtn,
                { backgroundColor: allMOQMet ? c.primary : c.primaryLight }
              ]}
              onPress={placeOrder}
              disabled={!allMOQMet || loading}
            >
              {loading
                ? <ActivityIndicator color={c.textOnPrimary} />
                : <Text style={[styles.orderBtnText, { color: c.textOnPrimary }]}>
                    Place Order
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, marginBottom: 12 },
  shopLink: { fontSize: 15, fontWeight: '600' },
  list: { flex: 1 },
  itemCard: {
    margin: 8, marginHorizontal: 12,
    borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between',
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600' },
  itemBrand: { fontSize: 13, marginTop: 2 },
  itemSeller: { fontSize: 12, marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemPrice: { fontSize: 16, fontWeight: 'bold' },
  itemQty: { fontSize: 12, marginTop: 2 },
  moqWarn: { fontSize: 11, marginTop: 2 },
  removeBtn: { fontSize: 12, marginTop: 6 },
  footer: {
    padding: 16,
    elevation: 4,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: '500' },
  totalAmount: { fontSize: 20, fontWeight: 'bold' },
  moqError: { fontSize: 12, marginBottom: 8, textAlign: 'center' },
  orderBtn: {
    borderRadius: 12, height: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  orderBtnText: { fontSize: 16, fontWeight: '600' },
});