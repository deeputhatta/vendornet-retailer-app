import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, StatusBar,
  Dimensions
} from 'react-native';
import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { searchAPI, catalogueAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import VendorNetLogo from '../components/VendorNetLogo';

const { width: SCREEN_W } = Dimensions.get('window');

const CATEGORY_ICONS = {
  'cement': '🏗', 'steel-tmt': '⚙️', 'paint': '🎨',
  'electrical': '⚡', 'plumbing': '🔧', 'hardware': '🔨',
  'tiles': '🪟', 'power-tools': '🔌', 'wood': '🪵',
};
const getCategoryEmoji = (slug) => CATEGORY_ICONS[slug] || '📦';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const RECENTLY_VIEWED_KEY = 'recently_viewed_listings';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [myCategories, setMyCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [offers, setOffers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [spotlight, setSpotlight] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [dispatchedOrders, setDispatchedOrders] = useState([]);
  const [bestDeal, setBestDeal] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const { user } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => {
    loadAll();
    loadRecentlyViewed();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      setQuery('');
      setResults([]);
    });
    return unsubscribe;
  }, [navigation]);



  const loadRecentlyViewed = async () => {
    try {
      const data = await AsyncStorageLib.getItem(RECENTLY_VIEWED_KEY);
      if (data) setRecentlyViewed(JSON.parse(data));
    } catch (err) { console.error(err); }
  };

  const saveRecentlyViewed = async (listing) => {
    try {
      const data = await AsyncStorageLib.getItem(RECENTLY_VIEWED_KEY);
      let items = data ? JSON.parse(data) : [];
      items = items.filter(i => i.listing_id !== listing.listing_id);
      items.unshift(listing);
      items = items.slice(0, 5);
      await AsyncStorageLib.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
      setRecentlyViewed(items);
    } catch (err) { console.error(err); }
  };

  const navigateToProduct = (listing) => {
    saveRecentlyViewed({
      listing_id: listing.listing_id,
      generic_name: listing.generic_name,
      brand_name: listing.brand_name,
      wholesaler_name: listing.wholesaler_name,
      wholesaler_id: listing.wholesaler_id,
      effective_price: listing.effective_price || listing.offer_price || listing.price,
      price: listing.price,
      offer_price: listing.offer_price,
      has_offer: !!(listing.offer_price),
      min_order_qty: listing.min_order_qty,
      category_name: listing.category_name,
    });
    navigation.navigate('ProductDetail', {
      listing: {
        ...listing,
        effective_price: listing.effective_price || listing.offer_price || listing.price,
        has_offer: !!(listing.offer_price),
      }
    });
  };

  const loadAll = async () => {
    try {
      const [catRes, myRes, statsRes, offersRes, newRes, topRes, spotRes] = await Promise.allSettled([
        catalogueAPI.getCategories(),
        api.get('/categories/my'),
        api.get('/orders/retailer-analytics'),
        api.get('/listings/?has_offer=true&limit=10'),
        api.get('/listings/?new_arrivals=true&days=7&limit=8'),
        api.get('/orders/top-products?limit=5'),
        api.get('/orders/wholesaler-spotlight'),
        api.get('/orders/my'),
        api.get('/orders/top-products?limit=20'),
      ]);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data.categories || []);
      if (myRes.status === 'fulfilled') setMyCategories(myRes.value.data.categories?.map(cat => cat.category_id) || []);
      if (statsRes.status === 'fulfilled') {
        const d = statsRes.value.data;
        setStats({ totalSpent: d.summary?.total_spend || 0, totalOrders: d.summary?.total_orders || 0, topItem: d.top_items?.[0]?.generic_name || '—' });
      }
      if (offersRes.status === 'fulfilled') {
        const offerList = (offersRes.value.data.listings || []).filter(l => l.offer_price);
        setOffers(offerList);
        if (offerList.length > 0) {
          const best = offerList.reduce((a, b) => {
            const discA = (a.price - a.offer_price) / a.price;
            const discB = (b.price - b.offer_price) / b.price;
            return discA > discB ? a : b;
          });
          setBestDeal(best);
        }
      }
      if (newRes.status === 'fulfilled') setNewArrivals(newRes.value.data.listings || []);
      if (topRes.status === 'fulfilled') setTopSellers(topRes.value.data.products || []);
      if (spotRes.status === 'fulfilled') setSpotlight(spotRes.value.data.wholesaler);
      const ordersRes = results[7];
      const topProductsRes = results[8];
      if (topProductsRes?.status === 'fulfilled') {
        const lowStock = (topProductsRes.value.data.products || [])
          .filter(p => p.stock_qty !== undefined && parseInt(p.stock_qty) < 20 && parseInt(p.stock_qty) > 0);
        setLowStockItems(lowStock.slice(0, 3));
      }
      if (ordersRes?.status === 'fulfilled') {
        const allOrders = ordersRes.value.data.orders || [];
        const pending = allOrders.filter(o => o.sub_orders?.some(s => ['pending','accepted'].includes(s.status)));
        const dispatched = allOrders.filter(o => o.sub_orders?.some(s => s.status === 'dispatched'));
        setPendingOrders(pending.slice(0, 3));
        setDispatchedOrders(dispatched.slice(0, 3));
      }
    } catch (err) { console.error(err); }
  };

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const categoryFilter = myCategories.length > 0 ? { category_ids: myCategories.join(',') } : {};
      const res = await searchAPI.search(q, categoryFilter);
      setResults(res.data.results.grouped_hits || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const activeCategories = (categories || []).filter(cat => cat && myCategories.includes(cat.category_id));
  const otherCategories = (categories || []).filter(cat => cat && !myCategories.includes(cat.category_id));
  const hasMapping = myCategories.length > 0;

  const SectionHeader = ({ title, subtitle, onPress, actionLabel }) => (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.sectionSub, { color: c.textMuted }]}>{subtitle}</Text>}
      </View>
      {onPress && (
        <TouchableOpacity onPress={onPress} style={[styles.seeAllBtn, { backgroundColor: c.primaryLight }]}>
          <Text style={[styles.seeAllText, { color: c.primary }]}>{actionLabel || 'See all →'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const ListingCard = ({ item, width, onPress }) => {
    const discount = item.offer_price ? Math.round(((item.price - item.offer_price) / item.price) * 100) : 0;
    return (
      <TouchableOpacity
        style={[styles.listingCard, { backgroundColor: c.surface, borderColor: c.border, width: width || SCREEN_W * 0.52 }]}
        onPress={onPress}
        activeOpacity={0.8}>
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        <Text style={[styles.lcProduct, { color: c.text }]} numberOfLines={2}>{item.generic_name}</Text>
        <Text style={[styles.lcBrand, { color: c.primary }]}>{item.brand_name}</Text>
        <Text style={[styles.lcWholesaler, { color: c.textMuted }]} numberOfLines={1}>🏪 {item.wholesaler_name}</Text>
        <View style={styles.lcPriceRow}>
          {item.offer_price && <Text style={[styles.lcOldPrice, { color: c.textMuted }]}>₹{item.price}</Text>}
          <Text style={[styles.lcPrice, { color: item.offer_price ? '#1D9E75' : c.primary }]}>
            ₹{item.offer_price || item.price}
          </Text>
        </View>
        <Text style={[styles.lcMoq, { color: c.textMuted }]}>Min {item.min_order_qty} units</Text>
      </TouchableOpacity>
    );
  };

  const renderSearchProduct = ({ item }) => {
    const doc = item.hits[0]?.document;
    if (!doc) return null;
    return (
      <TouchableOpacity
        style={[styles.productCard, { backgroundColor: c.surface, shadowColor: c.text }]}
        onPress={() => navigateToProduct(doc)}
        activeOpacity={0.8}>
        <View style={[styles.accentBar, { backgroundColor: c.primary }]} />
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: c.text }]} numberOfLines={2}>{doc.generic_name}</Text>
          <Text style={[styles.productBrand, { color: c.primary }]}>{doc.brand_name}</Text>
          <View style={styles.wholesalerRow}>
            <Text style={styles.wholesalerIcon}>🏪</Text>
            <Text style={[styles.wholesalerName, { color: c.textMuted }]} numberOfLines={1}>{doc.wholesaler_name}</Text>
          </View>
          <View style={[styles.categoryPill, { backgroundColor: c.primaryLight }]}>
            <Text style={[styles.categoryPillText, { color: c.primary }]}>{doc.category_name}</Text>
          </View>
        </View>
        <View style={styles.priceBox}>
          {doc.has_offer && <Text style={[styles.oldPrice, { color: c.textMuted }]}>₹{doc.price}</Text>}
          <Text style={[styles.price, { color: c.primary }]}>₹{doc.effective_price}</Text>
          <Text style={[styles.moq, { color: c.textMuted }]}>Min {doc.min_order_qty}</Text>
          <View style={[styles.stockBadge, { backgroundColor: doc.stock_qty > 0 ? '#003A10' : '#2A0A0A' }]}>
            <Text style={[styles.stockText, { color: doc.stock_qty > 0 ? '#30D158' : '#FF453A' }]}>
              {doc.stock_qty > 0 ? '✓ In Stock' : '✗ Out'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#185FA5" />

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <View style={styles.headerRow}>
          <VendorNetLogo size={38} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
            <Text style={styles.subGreeting}>What do you need today?</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.searchBox, { backgroundColor: c.surface }]}>
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

      {query.length < 2 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* STATS */}
          <View style={styles.statsRow}>
            {[
              { icon: '📦', value: stats?.totalOrders ?? '—', label: 'Orders', color: '#0A84FF', bg: '#0A1F35', screen: 'Orders' },
              { icon: '💰', value: stats?.totalSpent >= 1000 ? `₹${(stats.totalSpent/1000).toFixed(1)}K` : `₹${stats?.totalSpent ?? 0}`, label: 'Spent', color: '#F2C94C', bg: '#2A1F00', screen: 'Analytics' },
              { icon: '🔥', value: stats?.topItem ?? '—', label: 'Top Item', color: '#30D158', bg: '#003A10', screen: 'Analytics' },
              { icon: '🧾', value: 'View', label: 'Invoices', color: '#BF5AF2', bg: '#1A0A2A', screen: 'Invoices' },
            ].map((s, i) => (
              <TouchableOpacity key={i} style={[styles.statCard, { backgroundColor: s.bg }]} onPress={() => navigation.navigate(s.screen)}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: s.color, fontSize: s.label === 'Top Item' ? 11 : 13 }]} numberOfLines={1}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SMART INFO CARDS */}
          {(pendingOrders.length > 0 || dispatchedOrders.length > 0 || bestDeal || lowStockItems.length > 0) && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.smartCardsScroll}>

              {/* Pending orders */}
              {pendingOrders.length > 0 && (
                <TouchableOpacity
                  style={[styles.smartCard, { backgroundColor: '#2A1F00', borderColor: '#F2C94C' }]}
                  onPress={() => navigation.navigate('Orders')}>
                  <Text style={styles.smartCardIcon}>⏳</Text>
                  <Text style={[styles.smartCardTitle, { color: '#F2C94C' }]}>
                    {pendingOrders.length} Pending Order{pendingOrders.length > 1 ? 's' : ''}
                  </Text>
                  <Text style={[styles.smartCardSub, { color: '#F2C94C', opacity: 0.75 }]}>
                    Awaiting wholesaler confirmation
                  </Text>
                  <Text style={[styles.smartCardAction, { color: '#F2C94C' }]}>View Orders →</Text>
                </TouchableOpacity>
              )}

              {/* Dispatched orders */}
              {dispatchedOrders.length > 0 && (
                <TouchableOpacity
                  style={[styles.smartCard, { backgroundColor: '#001830', borderColor: '#0A84FF' }]}
                  onPress={() => navigation.navigate('Orders')}>
                  <Text style={styles.smartCardIcon}>🚚</Text>
                  <Text style={[styles.smartCardTitle, { color: '#0A84FF' }]}>
                    {dispatchedOrders.length} Order{dispatchedOrders.length > 1 ? 's' : ''} On the Way
                  </Text>
                  <Text style={[styles.smartCardSub, { color: '#0A84FF', opacity: 0.75 }]}>
                    {dispatchedOrders[0]?.sub_orders?.find(s => s.status === 'dispatched')?.wholesaler_name}
                  </Text>
                  <Text style={[styles.smartCardAction, { color: '#0A84FF' }]}>Track Delivery →</Text>
                </TouchableOpacity>
              )}

              {/* Low stock alert */}
              {lowStockItems.length > 0 && (
                <TouchableOpacity
                  style={[styles.smartCard, { backgroundColor: '#2A1500', borderColor: '#FF9500' }]}
                  onPress={() => navigateToProduct({ ...lowStockItems[0], effective_price: lowStockItems[0].offer_price || lowStockItems[0].price, has_offer: !!lowStockItems[0].offer_price })}>
                  <Text style={styles.smartCardIcon}>⚠️</Text>
                  <Text style={[styles.smartCardTitle, { color: '#FF9500' }]}>Low Stock Alert</Text>
                  <Text style={[styles.smartCardSub, { color: '#FF9500', opacity: 0.75 }]} numberOfLines={2}>
                    {lowStockItems[0].generic_name} — only {lowStockItems[0].stock_qty} units left
                  </Text>
                  <Text style={[styles.smartCardAction, { color: '#FF9500' }]}>Order Now →</Text>
                </TouchableOpacity>
              )}

              {/* Best deal */}
              {bestDeal && (
                <TouchableOpacity
                  style={[styles.smartCard, { backgroundColor: '#003A10', borderColor: '#30D158' }]}
                  onPress={() => navigateToProduct({ ...bestDeal, effective_price: bestDeal.offer_price, has_offer: true })}>
                  <Text style={styles.smartCardIcon}>🔥</Text>
                  <Text style={[styles.smartCardTitle, { color: '#30D158' }]}>
                    {Math.round(((bestDeal.price - bestDeal.offer_price) / bestDeal.price) * 100)}% OFF Today
                  </Text>
                  <Text style={[styles.smartCardSub, { color: '#30D158', opacity: 0.75 }]} numberOfLines={1}>
                    {bestDeal.generic_name} — {bestDeal.brand_name}
                  </Text>
                  <Text style={[styles.smartCardAction, { color: '#30D158' }]}>Grab Deal →</Text>
                </TouchableOpacity>
              )}

            </ScrollView>
          )}

          {/* OFFERS */}
          {offers.length > 0 && (
            <>
              <SectionHeader title="🏷 Special Offers" subtitle={`${offers.length} deals available`} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
                {offers.map(item => (
                  <ListingCard key={item.listing_id} item={item} onPress={() => navigateToProduct(item)} />
                ))}
              </ScrollView>
            </>
          )}

          {/* RECENTLY VIEWED */}
          {recentlyViewed.length > 0 && (
            <>
              <SectionHeader title="👁 Recently Viewed" subtitle="Your last 5 products" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
                {recentlyViewed.map(item => (
                  <ListingCard key={item.listing_id} item={item} width={SCREEN_W * 0.44} onPress={() => navigateToProduct(item)} />
                ))}
              </ScrollView>
            </>
          )}

          {/* NEW ARRIVALS */}
          {newArrivals.length > 0 && (
            <>
              <SectionHeader title="✨ New Arrivals" subtitle="Added in last 7 days" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
                {newArrivals.map(item => (
                  <ListingCard key={item.listing_id} item={item} onPress={() => navigateToProduct(item)} />
                ))}
              </ScrollView>
            </>
          )}

          {/* TOP SELLERS */}
          {topSellers.length > 0 && (
            <>
              <SectionHeader title="🔥 Top Sellers" subtitle="Most ordered products" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
                {topSellers.map((item, i) => (
                  <TouchableOpacity
                    key={item.listing_id}
                    style={[styles.topSellerCard, { backgroundColor: c.surface, borderColor: c.border }]}
                    onPress={() => navigateToProduct({ ...item, effective_price: item.offer_price || item.price, has_offer: !!item.offer_price })}
                    activeOpacity={0.8}>
                    <View style={styles.topSellerRank}>
                      <Text style={styles.topSellerRankText}>#{i + 1}</Text>
                    </View>
                    <Text style={[styles.lcProduct, { color: c.text }]} numberOfLines={2}>{item.generic_name}</Text>
                    <Text style={[styles.lcBrand, { color: c.primary }]}>{item.brand_name}</Text>
                    <Text style={[styles.lcWholesaler, { color: c.textMuted }]} numberOfLines={1}>🏪 {item.wholesaler_name}</Text>
                    <View style={styles.topSellerStats}>
                      <Text style={[styles.topSellerStat, { color: '#30D158' }]}>📦 {item.total_sold} sold</Text>
                      <Text style={[styles.lcPrice, { color: c.primary }]}>₹{item.offer_price || item.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* WHOLESALER SPOTLIGHT */}
          {spotlight && (
            <>
              <SectionHeader title="🌟 Wholesaler Spotlight" />
              <TouchableOpacity
                style={[styles.spotlightCard, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => navigation.navigate('Category', { wholesaler_id: spotlight.user_id, category: { name: spotlight.business_name || spotlight.name } })}
                activeOpacity={0.8}>
                <View style={styles.spotlightLeft}>
                  <View style={[styles.spotlightAvatar, { backgroundColor: c.primary }]}>
                    <Text style={styles.spotlightAvatarText}>{((spotlight.business_name || spotlight.name) || 'W').charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.spotlightName, { color: c.text }]}>{spotlight.business_name || spotlight.name}</Text>
                    <View style={styles.spotlightMeta}>
                      {spotlight.is_verified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
                      <Text style={[styles.spotlightRating, { color: c.textMuted }]}>⭐ {spotlight.rating}</Text>
                      <Text style={[styles.spotlightListings, { color: c.textMuted }]}>{spotlight.listing_count} products</Text>
                    </View>
                    {spotlight.categories?.length > 0 && (
                      <Text style={[styles.spotlightCats, { color: c.textMuted }]} numberOfLines={1}>
                        {spotlight.categories.join(' · ')}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={[styles.browseBtn, { backgroundColor: c.primaryLight }]}>
                  <Text style={[styles.browseBtnText, { color: c.primary }]}>Browse →</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* CATEGORIES */}
          <SectionHeader
            title="Browse Categories"
            subtitle={hasMapping ? `${myCategories.length} active · others dimmed` : undefined}
            onPress={() => navigation.navigate('CategoryPicker')}
            actionLabel="✏ Edit"
          />
          <View style={styles.categoryGrid}>
            {activeCategories.map(cat => (
              <TouchableOpacity
                key={cat.category_id}
                style={[styles.categoryCard, styles.categoryCardActive]}
                onPress={() => navigation.navigate('Category', { category: cat })}
                activeOpacity={0.8}>
                <View style={[styles.emojiBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat.slug)}</Text>
                </View>
                <Text style={[styles.categoryName, { color: '#fff' }]} numberOfLines={2}>{cat.name}</Text>
                <View style={styles.activeDot} />
              </TouchableOpacity>
            ))}
            {otherCategories.map(cat => (
              <TouchableOpacity
                key={cat.category_id}
                style={[styles.categoryCard, { backgroundColor: c.surface, borderColor: c.borderLight, opacity: hasMapping ? 0.4 : 1 }]}
                onPress={() => navigation.navigate('Category', { category: cat })}
                activeOpacity={0.8}>
                <View style={[styles.emojiBox, { backgroundColor: c.primaryLight }]}>
                  <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat.slug)}</Text>
                </View>
                <Text style={[styles.categoryName, { color: c.text }]} numberOfLines={2}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      ) : (
        <FlatList
          data={results}
          renderItem={renderSearchProduct}
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
                <Text style={[styles.noResultsSub, { color: c.textMuted }]}>Try a different search term</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 48, paddingBottom: 14, paddingHorizontal: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  greeting: { fontSize: 15, fontWeight: '700', color: '#fff' },
  subGreeting: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  notifBtn: { padding: 6 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, height: '100%' },

  statsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12, gap: 8 },
  statCard: { flex: 1, borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  statIcon: { fontSize: 16, marginBottom: 3 },
  statValue: { fontSize: 13, fontWeight: '800' },
  statLabel: { fontSize: 9, marginTop: 1, fontWeight: '600', opacity: 0.8 },

  smartCardsScroll: { paddingHorizontal: 12, paddingTop: 10, gap: 10 },
  smartCard: { width: 145, borderRadius: 12, padding: 10, borderWidth: 1.5, gap: 4 },
  smartCardIcon: { fontSize: 18, marginBottom: 1 },
  smartCardTitle: { fontSize: 12, fontWeight: '800' },
  smartCardSub: { fontSize: 10, lineHeight: 14 },
  smartCardAction: { fontSize: 10, fontWeight: '700', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionSub: { fontSize: 10, marginTop: 1 },
  seeAllBtn: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4 },
  seeAllText: { fontSize: 11, fontWeight: '600' },

  hScroll: { paddingHorizontal: 12, gap: 10 },

  listingCard: { borderRadius: 12, padding: 12, borderWidth: 1, position: 'relative', elevation: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#1D9E75', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  discountText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  lcProduct: { fontSize: 13, fontWeight: '700', marginBottom: 2, paddingRight: 36 },
  lcBrand: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  lcWholesaler: { fontSize: 10, marginBottom: 6 },
  lcPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  lcOldPrice: { fontSize: 11, textDecorationLine: 'line-through' },
  lcPrice: { fontSize: 16, fontWeight: '800' },
  lcMoq: { fontSize: 9 },

  topSellerCard: { width: SCREEN_W * 0.48, borderRadius: 12, padding: 12, borderWidth: 1, position: 'relative', elevation: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  topSellerRank: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#185FA5', justifyContent: 'center', alignItems: 'center' },
  topSellerRankText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  topSellerStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  topSellerStat: { fontSize: 10, fontWeight: '600' },

  spotlightCard: { marginHorizontal: 12, borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  spotlightLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  spotlightAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  spotlightAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  spotlightName: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  spotlightMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  verifiedBadge: { fontSize: 10, color: '#1D9E75', fontWeight: '600' },
  spotlightRating: { fontSize: 10 },
  spotlightListings: { fontSize: 10 },
  spotlightCats: { fontSize: 10 },
  browseBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexShrink: 0 },
  browseBtnText: { fontSize: 12, fontWeight: '700' },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingBottom: 8 },
  categoryCard: { width: '30%', margin: '1.5%', borderRadius: 12, padding: 10, alignItems: 'center', elevation: 1, borderWidth: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  categoryCardActive: { backgroundColor: '#185FA5', borderColor: '#185FA5', elevation: 4, shadowColor: '#185FA5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
  emojiBox: { width: 44, height: 44, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  categoryEmoji: { fontSize: 22 },
  categoryName: { fontSize: 10, textAlign: 'center', fontWeight: '600', lineHeight: 13 },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#F2C94C', marginTop: 3 },

  resultsList: { paddingTop: 8, paddingBottom: 20 },
  resultsHeader: { fontSize: 13, paddingHorizontal: 14, paddingVertical: 8 },
  productCard: { marginHorizontal: 14, marginBottom: 10, borderRadius: 12, padding: 14, flexDirection: 'row', elevation: 1, overflow: 'hidden', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  accentBar: { width: 3, borderRadius: 3, marginRight: 12, alignSelf: 'stretch' },
  productInfo: { flex: 1, marginRight: 10 },
  productName: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  productBrand: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  wholesalerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  wholesalerIcon: { fontSize: 10 },
  wholesalerName: { fontSize: 10, flex: 1 },
  categoryPill: { alignSelf: 'flex-start', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2, marginTop: 5 },
  categoryPillText: { fontSize: 10, fontWeight: '600' },
  priceBox: { alignItems: 'flex-end', justifyContent: 'center' },
  oldPrice: { fontSize: 11, textDecorationLine: 'line-through' },
  price: { fontSize: 17, fontWeight: '800' },
  moq: { fontSize: 10, marginTop: 2 },
  stockBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2, marginTop: 3 },
  stockText: { fontSize: 9, fontWeight: '600' },
  emptySearch: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  noResults: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  noResultsSub: { fontSize: 13 },
});








