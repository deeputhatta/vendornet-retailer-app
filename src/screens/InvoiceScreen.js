import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Linking, Alert
} from 'react-native';
import { invoicesAPI } from '../services/api';

export default function InvoiceScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const res = await invoicesAPI.getMyInvoices();
      setInvoices(res.data.invoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const viewInvoice = async (invoice) => {
    try {
      const res = await invoicesAPI.getInvoice(invoice.invoice_id);
      const fileUrl = `https://files.vendornet.in/${res.data.invoice.file_url}`;
      Alert.alert(
        'Invoice',
        `Invoice ${invoice.invoice_number}\nAmount: ₹${invoice.invoice_amount}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open', onPress: () => Linking.openURL(fileUrl) }
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Could not open invoice');
    }
  };

  const renderInvoice = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => viewInvoice(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.invoiceNo}>{item.invoice_number}</Text>
        <View style={[styles.badge,
          item.status === 'viewed' ? styles.badgeViewed : styles.badgeNew
        ]}>
          <Text style={[styles.badgeText,
            item.status === 'viewed' ? styles.badgeViewedText : styles.badgeNewText
          ]}>
            {item.status === 'viewed' ? 'Viewed' : 'New'}
          </Text>
        </View>
      </View>
      <Text style={styles.wholesaler}>{item.wholesaler_name}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.amount}>
          ₹{parseFloat(item.invoice_amount).toLocaleString('en-IN')}
        </Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('en-IN')}
        </Text>
      </View>
      <View style={styles.gstRow}>
        <Text style={styles.gstText}>HSN: {item.hsn_code}</Text>
        <Text style={styles.gstText}>GSTIN: {item.gstin_wholesaler}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#185FA5" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Invoices</Text>
      </View>
      <FlatList
        data={invoices}
        renderItem={renderInvoice}
        keyExtractor={item => item.invoice_id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadInvoices();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No invoices yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#185FA5', padding: 20, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', margin: 8, marginHorizontal: 12, borderRadius: 12, padding: 16, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  invoiceNo: { fontSize: 15, fontWeight: '600', color: '#333' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeNew: { backgroundColor: '#E6F1FB' },
  badgeViewed: { backgroundColor: '#EAF3DE' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeNewText: { color: '#0C447C' },
  badgeViewedText: { color: '#27500A' },
  wholesaler: { fontSize: 13, color: '#185FA5', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  amount: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 12, color: '#888' },
  gstRow: { flexDirection: 'row', justifyContent: 'space-between' },
  gstText: { fontSize: 11, color: '#888' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#888' }
});