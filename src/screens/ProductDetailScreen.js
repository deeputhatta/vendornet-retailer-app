import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailScreen({ route, navigation }) {
  const { listing } = route.params;
  const [quantity, setQuantity] = useState(listing.min_order_qty);
  const { user } = useAuth();

  const addToCart = () => {
    if (quantity < listing.min_order_qty) {
      Alert.alert('MOQ Error', `Minimum order is ${listing.min_order_qty} units`);
      return;
    }
    navigation.navigate('Main', {
      screen: 'Cart',
      params: {
      item: {
        listing_id: listing.listing_id,
        quantity,
        unit_price: listing.effective_price,
        product_name: listing.generic_name,
        brand_name: listing.brand_name,
        wholesaler_name: listing.wholesaler_name,
        wholesaler_id: listing.wholesaler_id,
        min_order_qty: listing.min_order_qty
      }
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.productName}>{listing.generic_name}</Text>
        <Text style={styles.brand}>{listing.brand_name}</Text>
        <Text style={styles.category}>{listing.category_name}</Text>
      </View>

      <View style={styles.priceCard}>
        {listing.has_offer && (
          <Text style={styles.oldPrice}>₹{listing.price}/unit</Text>
        )}
        <Text style={styles.price}>₹{listing.effective_price}/unit</Text>
        {listing.has_offer && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>Special offer</Text>
          </View>
        )}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Product Details</Text>
        <DetailRow label="Brand" value={listing.brand_name} />
        <DetailRow label="Category" value={listing.category_name} />
        <DetailRow label="HSN Code" value={listing.hsn_code} />
        {listing.attributes && Object.entries(JSON.parse(listing.attributes)).map(([k, v]) => (
          <DetailRow key={k} label={k.replace(/_/g, ' ')} value={String(v)} />
        ))}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Seller Details</Text>
        <DetailRow label="Seller" value={listing.wholesaler_name} />
        <DetailRow label="Delivery" value={`${listing.delivery_days} day(s)`} />
        <DetailRow label="Min Order" value={`${listing.min_order_qty} units`} />
        <DetailRow label="Stock" value={`${listing.stock_qty} units available`} />
      </View>

      <View style={styles.qtyCard}>
        <Text style={styles.sectionTitle}>Select Quantity</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(Math.max(listing.min_order_qty, quantity - 1))}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.totalText}>
          Total: ₹{(listing.effective_price * quantity).toLocaleString('en-IN')}
        </Text>
        {quantity < listing.min_order_qty && (
          <Text style={styles.moqWarning}>
            Min order: {listing.min_order_qty} units
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={addToCart}>
        <Text style={styles.addBtnText}>Add to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#185FA5', padding: 20, paddingTop: 48 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  brand: { fontSize: 16, color: '#B5D4F4', marginTop: 4 },
  category: { fontSize: 13, color: '#85B7EB', marginTop: 2 },
  priceCard: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16, elevation: 1 },
  oldPrice: { fontSize: 14, color: '#888', textDecorationLine: 'line-through' },
  price: { fontSize: 28, fontWeight: 'bold', color: '#185FA5' },
  offerBadge: { backgroundColor: '#EAF3DE', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6 },
  offerText: { color: '#27500A', fontSize: 12, fontWeight: '600' },
  detailCard: { backgroundColor: '#fff', margin: 12, marginTop: 0, borderRadius: 12, padding: 16, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  detailLabel: { fontSize: 13, color: '#888', textTransform: 'capitalize' },
  detailValue: { fontSize: 13, color: '#333', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  qtyCard: { backgroundColor: '#fff', margin: 12, marginTop: 0, borderRadius: 12, padding: 16, elevation: 1 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  qtyBtn: { width: 44, height: 44, backgroundColor: '#E6F1FB', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 22, color: '#185FA5', fontWeight: 'bold' },
  qtyValue: { fontSize: 24, fontWeight: 'bold', color: '#333', marginHorizontal: 24 },
  totalText: { fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
  moqWarning: { color: '#E24B4A', fontSize: 12, textAlign: 'center', marginTop: 4 },
  addBtn: { backgroundColor: '#185FA5', margin: 16, borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});