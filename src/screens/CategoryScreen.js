import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import { listingsAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const SORT_OPTIONS = [
  { key: 'price_asc',  label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'moq_asc',   label: 'MOQ ↑' },
  { key: 'stock',     label: 'In Stock' },
];

export default function CategoryScreen({ route, navigation }) {
  const { category, wholesaler_id } = route.params || {};
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('price_asc');
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => { loadListings(); }, []);

  useEffect(() => { applyFilterSort(); }, [listings, search, sort]);

  const loadListings = async () => {
    try {
      const params = {};
      if (category?.category_id) params.category_id = category.category_id;
      if (wholesaler_id) params.wholesaler_id = wholesaler_id;
      const res = await listingsAPI.getListings(params);
      setListings(res.data.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilterSort = () => {
    let data = [...listings];

    // Search filter
    if (search.length > 1) {
      data = data.filter(l =>
        l.generic_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.wholesaler_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        data.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_desc':
        data.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'moq_asc':
        data.sort((a, b) => a.min_order_qty - b.min_order_qty);
        break;
      case 'stock':
        data.sort((a, b) => b.stock_qty - a.stock_qty);
        break;
    }

    setFiltered(data);
  };

  const renderItem = ({ item }) => {
    const hasOffer = item.offer_price && parseFloat(item.offer_price) < parseFloat(item.price);
    const effectivePrice = hasOffer ? parseFloat(item.offer_price) : parseFloat(item.price);
    const discount = hasOffer
      ? Math.round(((parseFloat(item.price) - parseFloat(item.offer_price)) / parseFloat(item.price)) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}
        onPress={() => navigation.navigate('ProductDetail', {
          listing: {
            ...item,
            effective_price: effectivePrice,
            has_offer: hasOffer,
          }
        })}
        activeOpacity={0.8}
      >
        <View style={[styles.cardLeft, { borderRightColor: c.borderLight }]}>
          {/* Product icon */}
          <View style={[styles.iconBox, { backgroundColor: c.primaryLight }]}>
            <Text style={styles.iconEmoji}>📦</Text>
          </View>

          {/* Name & brand */}
          <Text style={[styles.productName, { color: c.text }]} numberOfLines={2}>
            {item.generic_name}
          </Text>
          <Text style={[styles.brandName, { color: c.primary }]}>
            {item.brand_name}
          </Text>

          {/* Wholesaler */}
          <View style={styles.wholesalerRow}>
            <Text style={styles.wholesalerIcon}>🏪</Text>
            <Text style={[styles.wholesalerName, { color: c.textMuted }]} numberOfLines={1}>
              {item.wholesaler_name}
            </Text>
          </View>

          {/* Delivery & stock */}
          <View style={styles.metaRow}>
            <View style={[styles.metaBadge, { backgroundColor: c.surfaceSecondary }]}>
              <Text style={[styles.metaText, { color: c.textMuted }]}>
                🚚 {item.delivery_days}d
              </Text>
            </View>
            <View style={[styles.metaBadge, {
              backgroundColor: item.stock_qty < 10 ? '#2A1500' : '#003A10',
            }]}>
              <Text style={[styles.metaText, {
                color: item.stock_qty < 10 ? '#FF9500' : '#30D158',
              }]}>
                {item.stock_qty < 10 ? '⚠️ Low' : '✓ In Stock'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right side - price */}
        <View style={styles.cardRight}>
          {hasOffer && (
            <>
              <Text style={[styles.oldPrice, { color: c.textMuted }]}>
                ₹{item.price}
              </Text>
              <View style={[styles.discountBadge, { backgroundColor: '#003A10' }]}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            </>
          )}
          <Text style={[styles.price, { color: c.primary }]}>
            ₹{effectivePrice}
          </Text>
          <Text style={[styles.perUnit, { color: c.textMuted }]}>/unit</Text>
          <Text style={[styles.moq, { color: c.textMuted }]}>
            Min {item.min_order_qty} units
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: c.primary }]}
            onPress={() => navigation.navigate('ProductDetail', {
              listing: {
                ...item,
                effective_price: effectivePrice,
                has_offer: hasOffer,
              }
            })}
          >
            <Text style={styles.addBtnText}>View →</Text>
          </TouchableOpacity>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category?.name || 'All Products'}</Text>
        <Text style={styles.headerSub}>{filtered.length} products</Text>
      </View>

      {/* Search + Sort */}
      <View style={[styles.toolbar, {
        backgroundColor: c.surface, borderBottomColor: c.border,
      }]}>
        {/* Search */}
        <View style={[styles.searchBox, {
          backgroundColor: c.inputBackground, borderColor: c.border,
        }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="Search products..."
            placeholderTextColor={c.placeholder}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: c.textMuted, fontSize: 14 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sort options */}
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortBtn, {
                backgroundColor: sort === s.key ? c.primary : c.surfaceSecondary,
                borderColor: sort === s.key ? c.primary : c.border,
              }]}
              onPress={() => setSort(s.key)}
            >
              <Text style={[styles.sortText, {
                color: sort === s.key ? '#FFFFFF' : c.textMuted,
                fontWeight: sort === s.key ? '700' : '400',
              }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Listings */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => item.listing_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadListings(); }}
            tintColor={c.primary} colors={[c.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              No products found
            </Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              {search ? 'Try a different search' : 'No listings in this category yet'}
            </Text>
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
  backBtn: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },

  // Toolbar
  toolbar: { padding: 12, borderBottomWidth: 1 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 12,
    height: 40, borderWidth: 1, gap: 8, marginBottom: 10,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14 },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  sortText: { fontSize: 12 },

  list: { padding: 12, paddingBottom: 24 },

  // Card
  card: {
    borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', overflow: 'hidden',
    elevation: 2, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6,
  },
  cardLeft: {
    flex: 1, padding: 14,
    borderRightWidth: 0.5,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  iconEmoji: { fontSize: 22 },
  productName: { fontSize: 15, fontWeight: '700', marginBottom: 3, lineHeight: 21 },
  brandName: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  wholesalerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  wholesalerIcon: { fontSize: 11 },
  wholesalerName: { fontSize: 11, flex: 1 },
  metaRow: { flexDirection: 'row', gap: 6 },
  metaBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  metaText: { fontSize: 10, fontWeight: '600' },

  // Right
  cardRight: {
    width: 110, padding: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  oldPrice: { fontSize: 11, textDecorationLine: 'line-through', marginBottom: 2 },
  discountBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  discountText: { fontSize: 10, fontWeight: '700', color: '#30D158' },
  price: { fontSize: 20, fontWeight: '900' },
  perUnit: { fontSize: 10, marginBottom: 4 },
  moq: { fontSize: 10, marginBottom: 10, textAlign: 'center' },
  addBtn: {
    borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 8, width: '100%', alignItems: 'center',
  },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Empty
  empty: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySub: { fontSize: 14, textAlign: 'center' },
});