import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import { searchAPI, catalogueAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await catalogueAPI.getCategories();
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchAPI.search(q);
      const hits = res.data.results.grouped_hits || [];
      setResults(hits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => {
    const doc = item.hits[0]?.document;
    if (!doc) return null;
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { listing: doc })}
      >
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{doc.generic_name}</Text>
          <Text style={styles.brandName}>{doc.brand_name}</Text>
          <Text style={styles.category}>{doc.category_name}</Text>
        </View>
        <View style={styles.priceBox}>
          {doc.has_offer && (
            <Text style={styles.oldPrice}>₹{doc.price}</Text>
          )}
          <Text style={styles.price}>₹{doc.effective_price}</Text>
          <Text style={styles.moq}>Min {doc.min_order_qty} units</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}</Text>
        <Text style={styles.subtitle}>What do you need today?</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search cement, steel, paint..."
          value={query}
          onChangeText={handleSearch}
        />
        {loading && <ActivityIndicator size="small" color="#185FA5" />}
      </View>

      {query.length < 2 ? (
        <ScrollView>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.category_id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Category', { category: cat })}
              >
                <Text style={styles.categoryEmoji}>
                  {getCategoryEmoji(cat.slug)}
                </Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          renderItem={renderProduct}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            !loading && <Text style={styles.noResults}>No results found</Text>
          }
        />
      )}
    </View>
  );
}

const getCategoryEmoji = (slug) => {
  const map = {
    'cement': '🏗️',
    'steel-tmt': '🔩',
    'paint': '🎨',
    'electrical': '⚡',
    'plumbing': '🔧',
    'hardware': '🔨'
  };
  return map[slug] || '📦';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#185FA5', padding: 20, paddingTop: 48 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#B5D4F4', marginTop: 4 },
  searchBox: { margin: 16, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  searchInput: { flex: 1, height: 48, fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  categoryCard: { width: '30%', margin: '1.5%', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 1 },
  categoryEmoji: { fontSize: 28, marginBottom: 8 },
  categoryName: { fontSize: 12, color: '#333', textAlign: 'center', fontWeight: '500' },
  productCard: { backgroundColor: '#fff', margin: 8, marginHorizontal: 16, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', elevation: 1 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333' },
  brandName: { fontSize: 13, color: '#185FA5', marginTop: 2 },
  category: { fontSize: 12, color: '#888', marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  oldPrice: { fontSize: 12, color: '#888', textDecorationLine: 'line-through' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#185FA5' },
  moq: { fontSize: 11, color: '#888', marginTop: 2 },
  noResults: { textAlign: 'center', color: '#888', marginTop: 40 }
});