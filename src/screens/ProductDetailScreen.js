import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from './WishlistScreen';

const getAttributes = (attrs) => {
  try {
    if (!attrs) return [];
    const parsed = typeof attrs === 'string' ? JSON.parse(attrs) : attrs;
    return Object.entries(parsed);
  } catch {
    return [];
  }
};

export default function ProductDetailScreen({ route, navigation }) {
  const { listing } = route.params;
  const [quantity, setQuantity] = useState(listing.min_order_qty);
  const [wishlisted, setWishlisted] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => {
    isInWishlist(listing.listing_id).then(setWishlisted);
  }, []);

  const toggleWishlist = async () => {
    if (wishlisted) {
      await removeFromWishlist(listing.listing_id);
      setWishlisted(false);
    } else {
      await addToWishlist({
        listing_id: listing.listing_id,
        generic_name: listing.generic_name,
        brand_name: listing.brand_name,
        wholesaler_name: listing.wholesaler_name,
        wholesaler_id: listing.wholesaler_id,
        price: listing.price,
        effective_price: listing.effective_price,
        has_offer: listing.has_offer,
        min_order_qty: listing.min_order_qty,
      });
      setWishlisted(true);
    }
  };

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
    <ScrollView style={[styles.container, { backgroundColor: c.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleWishlist}
            style={styles.heartBtn}
          >
            <Text style={styles.heartIcon}>{wishlisted ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.productName}>{listing.generic_name}</Text>
        <Text style={styles.brand}>{listing.brand_name}</Text>
        <Text style={styles.category}>{listing.category_name}</Text>

        <View style={[styles.wholesalerBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Text style={styles.wholesalerBadgeText}>
            🏪 {listing.wholesaler_name}
          </Text>
        </View>
      </View>

      {/* Price Card */}
      <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}>
        {listing.has_offer && (
          <Text style={[styles.oldPrice, { color: c.textMuted }]}>
            ₹{listing.price}/unit
          </Text>
        )}
        <Text style={[styles.price, { color: c.primary }]}>
          ₹{listing.effective_price}/unit
        </Text>
        {listing.has_offer && (
          <View style={[styles.offerBadge, { backgroundColor: c.successLight }]}>
            <Text style={[styles.offerText, { color: c.success }]}>Special offer</Text>
          </View>
        )}
      </View>

      {/* Product Details */}
      <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Product Details</Text>
        <DetailRow label="Brand" value={listing.brand_name} colors={c} />
        <DetailRow label="Category" value={listing.category_name} colors={c} />
        <DetailRow label="HSN Code" value={listing.hsn_code} colors={c} />
        {getAttributes(listing.attributes).map(([k, v]) => (
          <DetailRow
            key={k}
            label={k.replace(/_/g, ' ')}
            value={String(v)}
            colors={c}
          />
        ))}
      </View>

      {/* Seller Details */}
      <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Seller Details</Text>
        <DetailRow label="Seller" value={listing.wholesaler_name} colors={c} />
        <DetailRow label="Delivery" value={`${listing.delivery_days} day(s)`} colors={c} />
        <DetailRow label="Min Order" value={`${listing.min_order_qty} units`} colors={c} />
        <DetailRow label="Stock" value={`${listing.stock_qty} units available`} colors={c} />
      </View>

      {/* Quantity Selector */}
      <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Select Quantity</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={[styles.qtyBtn, { backgroundColor: c.primaryLight }]}
            onPress={() => setQuantity(Math.max(listing.min_order_qty, quantity - 1))}
          >
            <Text style={[styles.qtyBtnText, { color: c.primary }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.qtyValue, { color: c.text }]}>{quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, { backgroundColor: c.primaryLight }]}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={[styles.qtyBtnText, { color: c.primary }]}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.totalText, { color: c.text }]}>
          Total: ₹{(listing.effective_price * quantity).toLocaleString('en-IN')}
        </Text>
        {quantity < listing.min_order_qty && (
          <Text style={[styles.moqWarning, { color: c.error }]}>
            Min order: {listing.min_order_qty} units
          </Text>
        )}
      </View>

      {/* Buttons row */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.wishlistBtn, {
            borderColor: wishlisted ? '#FF453A' : c.border,
            backgroundColor: wishlisted ? '#2A0A0A' : c.surface,
          }]}
          onPress={toggleWishlist}
        >
          <Text style={styles.wishlistBtnIcon}>{wishlisted ? '❤️' : '🤍'}</Text>
          <Text style={[styles.wishlistBtnText, {
            color: wishlisted ? '#FF453A' : c.textMuted,
          }]}>
            {wishlisted ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: c.primary }]}
          onPress={addToCart}
        >
          <Text style={[styles.addBtnText, { color: c.textOnPrimary }]}>
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function DetailRow({ label, value, colors: c }) {
  return (
    <View style={[styles.detailRow, { borderBottomColor: c.borderLight }]}>
      <Text style={[styles.detailLabel, { color: c.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: c.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { padding: 20, paddingTop: 48 },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  backBtn: {},
  backText: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  heartBtn: { padding: 4 },
  heartIcon: { fontSize: 26 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  brand: { fontSize: 16, color: '#B5D4F4', marginTop: 4 },
  category: { fontSize: 13, color: '#85B7EB', marginTop: 2 },
  wholesalerBadge: {
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 10,
  },
  wholesalerBadgeText: { fontSize: 12, color: '#FFFFFF', fontWeight: '500' },

  card: {
    margin: 12, marginTop: 12, borderRadius: 12,
    padding: 16, elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  oldPrice: { fontSize: 14, textDecorationLine: 'line-through' },
  price: { fontSize: 28, fontWeight: 'bold' },
  offerBadge: {
    borderRadius: 6, paddingHorizontal: 10,
    paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6,
  },
  offerText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 0.5,
  },
  detailLabel: { fontSize: 13, textTransform: 'capitalize' },
  detailValue: { fontSize: 13, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },

  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { fontSize: 22, fontWeight: 'bold' },
  qtyValue: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 24 },
  totalText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  moqWarning: { fontSize: 12, textAlign: 'center', marginTop: 4 },

  btnRow: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 16, marginTop: 4,
  },
  wishlistBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, height: 52, paddingHorizontal: 16,
    borderWidth: 1, gap: 6,
  },
  wishlistBtnIcon: { fontSize: 18 },
  wishlistBtnText: { fontSize: 13, fontWeight: '600' },
  addBtn: {
    flex: 1, borderRadius: 12, height: 52,
    justifyContent: 'center', alignItems: 'center',
  },
  addBtnText: { fontSize: 16, fontWeight: '600' },
});