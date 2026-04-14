import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const WISHLIST_KEY = '@vendornet_wishlist';

export async function addToWishlist(product) {
  try {
    const existing = await AsyncStorage.getItem(WISHLIST_KEY);
    const list = existing ? JSON.parse(existing) : [];
    const already = list.find(p => p.listing_id === product.listing_id);
    if (already) return false;
    list.push({ ...product, saved_at: new Date().toISOString() });
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    return true;
  } catch { return false; }
}

export async function removeFromWishlist(listingId) {
  try {
    const existing = await AsyncStorage.getItem(WISHLIST_KEY);
    const list = existing ? JSON.parse(existing) : [];
    const updated = list.filter(p => p.listing_id !== listingId);
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    return true;
  } catch { return false; }
}

export async function isInWishlist(listingId) {
  try {
    const existing = await AsyncStorage.getItem(WISHLIST_KEY);
    const list = existing ? JSON.parse(existing) : [];
    return list.some(p => p.listing_id === listingId);
  } catch { return false; }
}

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([]);
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => { loadWishlist(); }, []);

  const loadWishlist = async () => {
    try {
      const existing = await AsyncStorage.getItem(WISHLIST_KEY);
      setWishlist(existing ? JSON.parse(existing) : []);
    } catch {}
  };

  const remove = async (listingId) => {
    await removeFromWishlist(listingId);
    loadWishlist();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}
      onPress={() => navigation.navigate('ProductDetail', { listing: item })}
      activeOpacity={0.8}
    >
      <View style={[styles.accentBar, { backgroundColor: c.primary }]} />
      <View style={styles.cardContent}>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: c.text }]} numberOfLines={2}>
            {item.generic_name}
          </Text>
          <Text style={[styles.brandName, { color: c.primary }]}>{item.brand_name}</Text>
          <Text style={[styles.wholesalerName, { color: c.textMuted }]}>
            🏪 {item.wholesaler_name}
          </Text>
          <Text style={[styles.savedDate, { color: c.textMuted }]}>
            Saved {new Date(item.saved_at).toLocaleDateString('en-IN')}
          </Text>
        </View>
        <View style={styles.priceBox}>
          {item.has_offer && (
            <Text style={[styles.oldPrice, { color: c.textMuted }]}>₹{item.price}</Text>
          )}
          <Text style={[styles.price, { color: c.primary }]}>
            ₹{item.effective_price}
          </Text>
          <Text style={[styles.moq, { color: c.textMuted }]}>
            Min {item.min_order_qty}
          </Text>
          <TouchableOpacity
            style={[styles.removeBtn, { backgroundColor: '#2A0A0A' }]}
            onPress={() => Alert.alert(
              'Remove', 'Remove from wishlist?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => remove(item.listing_id) }
              ]
            )}
          >
            <Text style={styles.removeBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.headerSub}>{wishlist.length} saved items</Text>
      </View>

      <FlatList
        data={wishlist}
        renderItem={renderItem}
        keyExtractor={item => item.listing_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>❤️</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>No saved items</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              Tap the heart on any product to save it here
            </Text>
            <TouchableOpacity
              style={[styles.browseBtn, { backgroundColor: c.primary }]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.browseBtnText}>Browse Products →</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 48 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  list: { padding: 12, paddingBottom: 24 },

  card: {
    borderRadius: 14, marginBottom: 10,
    flexDirection: 'row', overflow: 'hidden',
    elevation: 1, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  accentBar: { width: 4 },
  cardContent: {
    flex: 1, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  productInfo: { flex: 1, marginRight: 12 },
  productName: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  brandName: { fontSize: 13, fontWeight: '500', marginBottom: 3 },
  wholesalerName: { fontSize: 11, marginBottom: 3 },
  savedDate: { fontSize: 10 },
  priceBox: { alignItems: 'flex-end' },
  oldPrice: { fontSize: 11, textDecorationLine: 'line-through', marginBottom: 2 },
  price: { fontSize: 18, fontWeight: '800', marginBottom: 3 },
  moq: { fontSize: 10, marginBottom: 8 },
  removeBtn: { borderRadius: 8, padding: 6 },
  removeBtnText: { fontSize: 14 },

  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  browseBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  browseBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});