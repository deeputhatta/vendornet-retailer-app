import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList, TextInput
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function WholesalerListScreen({ navigation }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [wholesalers, setWholesalers] = useState([]);
  const [myCategories, setMyCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWholesaler, setSelectedWholesaler] = useState(null);
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasFirstLoad, setHasFirstLoad] = useState(false);
  const [wsSearch, setWsSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const searchTimer = useRef(null);
  const myCatsRef = useRef([]);

  useEffect(() => { loadWholesalers(); }, []);

  const loadWholesalers = async () => {
    try {
      const myRes = await api.get('/categories/my');
      const cats = myRes.data.categories?.map(ct => ct.category_id) || [];
      setMyCategories(cats);
      myCatsRef.current = cats;
      const params = cats.length > 0 ? `?category_ids=${cats.join(',')}` : '';
      const res = await api.get(`/listings/wholesalers${params}`);
      setWholesalers(res.data.wholesalers || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadListings = async (wholesalerId, p, search) => {
    setListingsLoading(true);
    try {
      const cats = myCatsRef.current;
      const catParam = cats.length > 0 ? `&category_ids=${cats.join(',')}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/listings/?wholesaler_id=${wholesalerId}&limit=20&offset=${(p - 1) * 20}${catParam}${searchParam}`);
      const newListings = (res.data.listings || []).map(l => ({
        ...l,
        has_offer: !!(l.offer_price && parseFloat(l.offer_price) < parseFloat(l.price)),
        effective_price: l.offer_price && parseFloat(l.offer_price) < parseFloat(l.price) ? parseFloat(l.offer_price) : parseFloat(l.price),
      }));
      if (p === 1) {
        setListings(newListings);
      } else {
        setListings(prev => [...prev, ...newListings]);
      }
      setTotal(res.data.total || 0);
      setPage(p);
      setHasFirstLoad(true);
    } catch (err) { console.error(err); }
    finally { setListingsLoading(false); }
  };

  const selectWholesaler = (ws) => {
    setSelectedWholesaler(ws);
    setListingSearch('');
    setPage(1);
    setHasFirstLoad(false);
    setListings([]);
    loadListings(ws.wholesaler_id, 1, '');
  };

  const handleListingSearch = (text) => {
    setListingSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      if (selectedWholesaler) loadListings(selectedWholesaler.wholesaler_id, 1, text);
    }, 500);
  };

  const navigateToProduct = (listing) => {
    navigation.navigate('ProductDetail', {
      listing: {
        ...listing,
        wholesaler_name: selectedWholesaler?.wholesaler_name,
        wholesaler_id: selectedWholesaler?.wholesaler_id,
      }
    });
  };

  const filteredWholesalers = wsSearch
    ? wholesalers.filter(w => w.wholesaler_name.toLowerCase().includes(wsSearch.toLowerCase()))
    : wholesalers;

  if (loading) return (
    <View style={[styles.center, { backgroundColor: c.background }]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => { if (selectedWholesaler) { setSelectedWholesaler(null); setListingSearch(''); setHasFirstLoad(false); } else { navigation.goBack(); } }}
            style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              {selectedWholesaler ? selectedWholesaler.wholesaler_name : 'Wholesalers'}
            </Text>
            <Text style={styles.headerSub}>
              {selectedWholesaler ? `${total} products` : `${filteredWholesalers.length} suppliers`}
            </Text>
          </View>
          {listingsLoading && selectedWholesaler && (
            <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
          )}
        </View>
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={selectedWholesaler ? 'Search products...' : 'Search wholesalers...'}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={selectedWholesaler ? listingSearch : wsSearch}
            onChangeText={selectedWholesaler ? handleListingSearch : setWsSearch}
          />
          {(selectedWholesaler ? listingSearch : wsSearch).length > 0 && (
            <TouchableOpacity onPress={() => selectedWholesaler ? handleListingSearch('') : setWsSearch('')}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!selectedWholesaler ? (
        <FlatList
          key="wholesalers-1col"
          data={filteredWholesalers}
          keyExtractor={item => item.wholesaler_id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.wsCard, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => selectWholesaler(item)}
              activeOpacity={0.75}>
              <View style={[styles.wsAvatar, { backgroundColor: c.primaryLight }]}>
                <Text style={[styles.wsAvatarText, { color: c.primary }]}>{item.wholesaler_name?.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.wsName, { color: c.text }]}>{item.wholesaler_name}</Text>
                <Text style={[styles.wsCount, { color: c.textMuted }]}>{item.listing_count} products</Text>
              </View>
              <Text style={[styles.wsArrow, { color: c.textMuted }]}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🏪</Text>
              <Text style={[styles.emptyText, { color: c.textMuted }]}>No wholesalers found</Text>
            </View>
          }
        />
      ) : listingsLoading && !hasFirstLoad ? (
        // Show spinner only on very first load
        <View style={[styles.center, { backgroundColor: c.background }]}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[{ color: c.textMuted, marginTop: 12, fontSize: 13 }]}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          key="listings-2col"
          data={listings}
          keyExtractor={item => item.listing_id}
          contentContainerStyle={{ padding: 12 }}
          numColumns={2}
          columnWrapperStyle={{ gap: 10 }}
          onEndReached={() => {
            if (!listingsLoading && listings.length < total) {
              loadListings(selectedWholesaler.wholesaler_id, page + 1, listingSearch);
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={listingsLoading ? <ActivityIndicator color={c.primary} style={{ margin: 16 }} /> : null}
          ListEmptyComponent={null}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.listingCard, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => navigateToProduct(item)}
              activeOpacity={0.75}>
              {item.has_offer && (
                <View style={[styles.offerBadge, { backgroundColor: '#1D9E75' }]}>
                  <Text style={styles.offerText}>
                    {Math.round(((item.price - item.offer_price) / item.price) * 100)}% OFF
                  </Text>
                </View>
              )}
              <Text style={[styles.lcProduct, { color: c.text }]} numberOfLines={2}>{item.generic_name}</Text>
              <Text style={[styles.lcBrand, { color: c.primary }]}>{item.brand_name}</Text>
              {item.attributes?.pack_size && (
                <Text style={[styles.lcPack, { color: c.textMuted }]}>{item.attributes.pack_size}</Text>
              )}
              <View style={styles.lcPriceRow}>
                {item.has_offer && (
                  <Text style={[styles.lcOldPrice, { color: c.textMuted }]}>₹{item.price}</Text>
                )}
                <Text style={[styles.lcPrice, { color: item.has_offer ? '#1D9E75' : c.primary }]}>
                  ₹{item.effective_price}
                </Text>
              </View>
              <Text style={[styles.lcMoq, { color: c.textMuted }]}>Min {item.min_order_qty} units</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { paddingTop: 44, paddingBottom: 10, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 22 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 0 },
  wsCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, gap: 12 },
  wsAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  wsAvatarText: { fontSize: 18, fontWeight: '800' },
  wsName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  wsCount: { fontSize: 12 },
  wsArrow: { fontSize: 22 },
  listingCard: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  offerBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 },
  offerText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  lcProduct: { fontSize: 13, fontWeight: '600', marginBottom: 3, lineHeight: 18 },
  lcBrand: { fontSize: 12, marginBottom: 2 },
  lcPack: { fontSize: 11, marginBottom: 4 },
  lcPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  lcOldPrice: { fontSize: 11, textDecorationLine: 'line-through' },
  lcPrice: { fontSize: 15, fontWeight: '700' },
  lcMoq: { fontSize: 10 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
