import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, StatusBar
} from 'react-native';
import { searchAPI, catalogueAPI } from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import VendorNetLogo from '../components/VendorNetLogo';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const c = theme.colors;

  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await catalogueAPI.getCategories();
      setCategories(res.data.categories);
    } catch (err) { console.error(err); }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/orders/retailer-analytics');
      setStats({
        totalSpent: res.data.summary?.total_spend || 0,
        totalOrders: res.data.summary?.total_orders || 0,
        topItem: res.data.top_items?.[0]?.generic_name || '—',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await searchAPI.search(q);
      setResults(res.data.results.grouped_hits || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const renderProduct = ({ item }) => {
    const doc = item.hits[0]?.document;
    if (!doc) return null;
    return (
      <TouchableOpacity
        style={[styles.productCard, { backgroundColor: c.surface, shadowColor: c.text }]}
        onPress={() => navigation.navigate('ProductDetail', {
          listing: {
            ...doc,
            effective_price: doc.effective_price || doc.price,
            has_offer: doc.has_offer || false,
          }
        })}
        activeOpacity={0.8}
      >
        <View style={[styles.accentBar, { backgroundColor: c.primary }]} />
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: c.text }]} numberOfLines={2}>
            {doc.generic_name}
          </Text>
          <Text style={[styles.productBrand, { color: c.primary }]}>
            {doc.brand_name}
          </Text>
          {/* Wholesaler name */}
          <View style={styles.wholesalerRow}>
            <Text style={styles.wholesalerIcon}>🏪</Text>
            <Text style={[styles.wholesalerName, { color: c.textMuted }]} numberOfLines={1}>
              {doc.wholesaler_name}
            </Text>
          </View>
          <View style={[styles.categoryPill, { backgroundColor: c.primaryLight }]}>
            <Text style={[styles.categoryPillText, { color: c.primary }]}>
              {doc.category_name}
            </Text>
          </View>
        </View>
        <View style={styles.priceBox}>
          {doc.has_offer && (
            <Text style={[styles.oldPrice, { color: c.textMuted }]}>₹{doc.price}</Text>
          )}
          <Text style={[styles.price, { color: c.primary }]}>₹{doc.effective_price}</Text>
          <Text style={[styles.moq, { color: c.textMuted }]}>
            Min {doc.min_order_qty} units
          </Text>
          <View style={[styles.stockBadge, {
            backgroundColor: doc.stock_qty > 0 ? '#003A10' : '#2A0A0A',
          }]}>
            <Text style={[styles.stockText, {
              color: doc.stock_qty > 0 ? '#30D158' : '#FF453A',
            }]}>
              {doc.stock_qty > 0 ? '✓ In Stock' : '✕ Out'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#185FA5" />

      {/* ── SECTION 1: Brand ── */}
      <View style={[styles.brandSection, { backgroundColor: c.primary }]}>
        <View style={styles.brandInner}>
          <View style={styles.logoBox}>
            <VendorNetLogo size={64} />
          </View>
          <View style={styles.brandTextBlock}>
            <Text style={styles.brandName}>
              <Text style={{ color: '#FFFFFF' }}>Vendor</Text>
              <Text style={{ color: '#F2C94C' }}>Net</Text>
            </Text>
            <Text style={styles.brandTagline}>B2B Wholesale Marketplace</Text>
          </View>
          {/* Notification bell */}
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SECTION 2: Greeting + Search ── */}
      <View style={[styles.greetSection, { backgroundColor: c.primary }]}>
        <View style={[styles.greetInner, { backgroundColor: c.surface }]}>
          <View style={styles.greetTop}>
            <Text style={[styles.greeting, { color: c.text }]}>
              Hello, {user?.name?.split(' ')[0] || 'there'} 👋
            </Text>
            <Text style={[styles.greetSubtitle, { color: c.textMuted }]}>
              What do you need today?
            </Text>
          </View>
          <View style={[styles.searchBox, {
            backgroundColor: c.inputBackground,
            borderColor: c.border,
            borderWidth: 1,
          }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: c.text }]}
              placeholder="Search cement, steel, paint..."
              placeholderTextColor={c.placeholder}
              value={query}
              onChangeText={handleSearch}
            />
            {loading
              ? <ActivityIndicator size="small" color={c.primary} />
              : query.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Text style={{ fontSize: 14, color: c.textMuted }}>✕</Text>
                </TouchableOpacity>
              )
            }
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      {query.length < 2 ? (
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── LIVE STATS ── */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: '#0A1F35' }]}
              onPress={() => navigation.navigate('Orders')}
              activeOpacity={0.8}
            >
              <Text style={styles.statIcon}>📦</Text>
              <Text style={[styles.statValue, { color: '#0A84FF' }]}>
                {stats?.totalOrders ?? '—'}
              </Text>
              <Text style={[styles.statLabel, { color: '#0A84FF', opacity: 0.7 }]}>
                Orders
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: '#2A1F00' }]}
              onPress={() => navigation.navigate('Analytics')}
              activeOpacity={0.8}
            >
              <Text style={styles.statIcon}>💰</Text>
              <Text style={[styles.statValue, { color: '#F2C94C' }]}>
                ₹{stats?.totalSpent >= 1000
                  ? `${(stats.totalSpent / 1000).toFixed(1)}K`
                  : stats?.totalSpent ?? '—'}
              </Text>
              <Text style={[styles.statLabel, { color: '#F2C94C', opacity: 0.7 }]}>
                Total Spent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: '#003A10' }]}
              onPress={() => navigation.navigate('Analytics')}
              activeOpacity={0.8}
            >
              <Text style={styles.statIcon}>🔥</Text>
              <Text
                style={[styles.statValue, { color: '#30D158', fontSize: 13 }]}
                numberOfLines={1}
              >
                {stats?.topItem ?? '—'}
              </Text>
              <Text style={[styles.statLabel, { color: '#30D158', opacity: 0.7 }]}>
                Top Item
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── SECTION HEADER ── */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              Browse Categories
            </Text>
            <Text style={[styles.sectionCount, { color: c.textMuted }]}>
              {categories.length} categories
            </Text>
          </View>

          {/* ── CATEGORY GRID ── */}
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.category_id}
                style={[styles.categoryCard, {
                  backgroundColor: c.surface,
                  shadowColor: c.text,
                  borderColor: c.borderLight,
                }]}
                onPress={() => navigation.navigate('Category', { category: cat })}
                activeOpacity={0.8}
              >
                <View style={[styles.emojiBox, { backgroundColor: c.primaryLight }]}>
                  <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat.slug)}</Text>
                </View>
                <Text style={[styles.categoryName, { color: c.text }]} numberOfLines={2}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      ) : (
        <FlatList
          data={results}
          renderItem={renderProduct}
          keyExtractor={(_, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
          ListHeaderComponent={
            <Text style={[styles.resultsHeader, { color: c.textMuted }]}>
              {results.length} results for "{query}"
            </Text>
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptySearch}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={[styles.noResults, { color: c.text }]}>No results found</Text>
                <Text style={[styles.noResultsSub, { color: c.textMuted }]}>
                  Try a different search term
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const getCategoryEmoji = (slug) => {
  const map = {
    'cement': '🏗️', 'steel-tmt': '🔩', 'paint': '🎨',
    'electrical': '⚡', 'plumbing': '🔧', 'hardware': '🔨',
    'tiles': '🪟', 'wood': '🪵', 'glass': '🪞',
  };
  return map[slug] || '📦';
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Section 1: Brand ──
  brandSection: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  brandInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoBox: {
    borderRadius: 16, overflow: 'hidden',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6,
  },
  brandTextBlock: { flex: 1, justifyContent: 'center' },
  brandName: { fontSize: 36, fontWeight: '800', letterSpacing: 0.5, lineHeight: 42 },
  brandTagline: { fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, marginTop: 2 },
  notifBtn: { padding: 8 },
  notifIcon: { fontSize: 22 },

  // ── Section 2: Greeting + Search ──
  greetSection: { paddingBottom: 0 },
  greetInner: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  greetTop: { marginBottom: 14 },
  greeting: { fontSize: 18, fontWeight: '700', marginBottom: 3 },
  greetSubtitle: { fontSize: 13 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, paddingHorizontal: 14,
    height: 46, gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, height: '100%' },

  // ── Live Stats ──
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16, paddingTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 15, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2, fontWeight: '600', textAlign: 'center' },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16,
    marginTop: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionCount: { fontSize: 12 },

  // ── Categories ──
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingBottom: 20,
  },
  categoryCard: {
    width: '30%', margin: '1.5%',
    borderRadius: 14, padding: 14,
    alignItems: 'center', elevation: 1,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3,
  },
  emojiBox: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  categoryEmoji: { fontSize: 26 },
  categoryName: { fontSize: 11, textAlign: 'center', fontWeight: '600', lineHeight: 16 },

  // ── Search Results ──
  resultsList: { paddingTop: 8, paddingBottom: 20 },
  resultsHeader: { fontSize: 13, paddingHorizontal: 16, paddingVertical: 10 },
  productCard: {
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 14, padding: 16,
    flexDirection: 'row', elevation: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  accentBar: { width: 3, borderRadius: 3, marginRight: 14, alignSelf: 'stretch' },
  productInfo: { flex: 1, marginRight: 12 },
  productName: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  productBrand: { fontSize: 13, marginTop: 3, fontWeight: '500' },
  wholesalerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  wholesalerIcon: { fontSize: 11 },
  wholesalerName: { fontSize: 11, flex: 1 },
  categoryPill: {
    alignSelf: 'flex-start', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 6,
  },
  categoryPillText: { fontSize: 11, fontWeight: '600' },
  priceBox: { alignItems: 'flex-end', justifyContent: 'center' },
  oldPrice: { fontSize: 12, textDecorationLine: 'line-through' },
  price: { fontSize: 18, fontWeight: '800' },
  moq: { fontSize: 11, marginTop: 3 },
  stockBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  stockText: { fontSize: 10, fontWeight: '600' },

  // ── Empty state ──
  emptySearch: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  noResults: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  noResultsSub: { fontSize: 14 },
});