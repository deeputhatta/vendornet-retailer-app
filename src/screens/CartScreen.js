import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CartScreen({ route, navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (route.params?.item) {
      addItem(route.params.item);
    }
  }, [route.params]);

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopLink}>Browse products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.list}>
            {cartItems.map(item => (
              <View key={item.listing_id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  <Text style={styles.itemBrand}>{item.brand_name}</Text>
                  <Text style={styles.itemSeller}>{item.wholesaler_name}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemPrice}>
                    ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  {item.quantity < item.min_order_qty && (
                    <Text style={styles.moqWarn}>Min: {item.min_order_qty}</Text>
                  )}
                  <TouchableOpacity onPress={() => removeItem(item.listing_id)}>
                    <Text style={styles.removeBtn}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </Text>
            </View>
            {!allMOQMet && (
              <Text style={styles.moqError}>
                Some items are below minimum order quantity
              </Text>
            )}
            <TouchableOpacity
              style={[styles.orderBtn, !allMOQMet && styles.orderBtnDisabled]}
              onPress={placeOrder}
              disabled={!allMOQMet || loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.orderBtnText}>Place Order</Text>
              }
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#185FA5', padding: 20, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888', marginBottom: 12 },
  shopLink: { color: '#185FA5', fontSize: 15, fontWeight: '600' },
  list: { flex: 1 },
  itemCard: { backgroundColor: '#fff', margin: 8, marginHorizontal: 12, borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', elevation: 1 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#333' },
  itemBrand: { fontSize: 13, color: '#185FA5', marginTop: 2 },
  itemSeller: { fontSize: 12, color: '#888', marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemQty: { fontSize: 12, color: '#888', marginTop: 2 },
  moqWarn: { fontSize: 11, color: '#E24B4A', marginTop: 2 },
  removeBtn: { color: '#E24B4A', fontSize: 12, marginTop: 6 },
  footer: { backgroundColor: '#fff', padding: 16, elevation: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 16, color: '#333', fontWeight: '500' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#185FA5' },
  moqError: { color: '#E24B4A', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  orderBtn: { backgroundColor: '#185FA5', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center' },
  orderBtnDisabled: { backgroundColor: '#B5D4F4' },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});