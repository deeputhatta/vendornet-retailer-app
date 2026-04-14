import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Linking, Alert
} from 'react-native';
import { invoicesAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

// Fixed semantic badge colors — same as OrdersScreen pattern
const BADGE = {
  new:    { bg: '#E6F1FB', text: '#0C447C' },
  viewed: { bg: '#EAF3DE', text: '#27500A' },
};

export default function InvoiceScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const c = theme.colors;

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

  const renderInvoice = ({ item }) => {
    const badge = item.status === 'viewed' ? BADGE.viewed : BADGE.new;
    return (
      <TouchableOpacity
        style={[styles.card, {
          backgroundColor: c.surface,
          shadowColor: c.text,
        }]}
        onPress={() => viewInvoice(item)}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={[styles.invoiceNo, { color: c.text }]}>
            {item.invoice_number}
          </Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {item.status === 'viewed' ? 'Viewed' : 'New'}
            </Text>
          </View>
        </View>

        {/* Wholesaler */}
        <Text style={[styles.wholesaler, { color: c.primary }]}>
          {item.wholesaler_name}
        </Text>

        {/* Amount + Date */}
        <View style={[styles.cardFooter, {
          borderTopColor: c.borderLight,
        }]}>
          <Text style={[styles.amount, { color: c.text }]}>
            ₹{parseFloat(item.invoice_amount).toLocaleString('en-IN')}
          </Text>
          <Text style={[styles.date, { color: c.textMuted }]}>
            {new Date(item.created_at).toLocaleDateString('en-IN')}
          </Text>
        </View>

        {/* GST Row */}
        <View style={[styles.gstRow, { borderTopColor: c.borderLight }]}>
          <Text style={[styles.gstText, { color: c.textMuted }]}>
            HSN: {item.hsn_code}
          </Text>
          <Text style={[styles.gstText, { color: c.textMuted }]}>
            GSTIN: {item.gstin_wholesaler}
          </Text>
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
        <Text style={styles.title}>My Invoices</Text>
      </View>

      <FlatList
        data={invoices}
        renderItem={renderInvoice}
        keyExtractor={item => item.invoice_id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadInvoices(); }}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              No invoices yet
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    margin: 8, marginHorizontal: 12,
    borderRadius: 12, padding: 16,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  invoiceNo: { fontSize: 15, fontWeight: '600' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  wholesaler: { fontSize: 13, marginBottom: 8 },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
    paddingTop: 8, borderTopWidth: 0.5,
  },
  amount: { fontSize: 20, fontWeight: 'bold' },
  date: { fontSize: 12 },
  gstRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 8, borderTopWidth: 0.5,
  },
  gstText: { fontSize: 11 },
  empty: { justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16 },
});