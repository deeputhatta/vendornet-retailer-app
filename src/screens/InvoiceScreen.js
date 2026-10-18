import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
  Linking, Alert
} from 'react-native';
import { invoicesAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function InvoiceScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = async () => {
    try {
      const res = await invoicesAPI.getMyInvoices();
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openInvoice = async (invoice, download = false) => {
    if (!invoice.file_url) {
      Alert.alert('Not Available', 'Invoice file has not been uploaded yet.');
      return;
    }
    try {
      const res = await invoicesAPI.getDownloadUrl(invoice.invoice_id);
      const url = download ? res.data.url + '?dl=1' : res.data.url;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot Open', 'Unable to open this file on your device.');
      }
    } catch (err) {
      console.error('OPEN INVOICE ERROR:', err.message, err.response?.data, err.response?.status);
      Alert.alert('Error', 'Failed to open invoice.');
    }
  };

  const renderInvoice = ({ item }) => {
    const hasFile = !!item.file_url;
    const isNew = item.status !== 'viewed';

    return (
      <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}>

        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.invoiceNo, { color: c.text }]}>
              {item.invoice_number || 'Invoice'}
            </Text>
            <Text style={[styles.wholesaler, { color: c.primary }]}>
              🏪 {item.wholesaler_name}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {isNew && (
              <View style={[styles.newBadge, { backgroundColor: c.primaryLight }]}>
                <Text style={[styles.newBadgeText, { color: c.primary }]}>NEW</Text>
              </View>
            )}
            <Text style={[styles.amount, { color: c.text }]}>
              ₹{parseFloat(item.invoice_amount || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Details row */}
        <View style={[styles.detailsRow, { borderTopColor: c.borderLight }]}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: c.textMuted }]}>Date</Text>
            <Text style={[styles.detailValue, { color: c.text }]}>
              {new Date(item.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </Text>
          </View>
          {item.gstin_wholesaler && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: c.textMuted }]}>GSTIN</Text>
              <Text style={[styles.detailValue, { color: c.text }]} numberOfLines={1}>
                {item.gstin_wholesaler}
              </Text>
            </View>
          )}
          {item.file_type && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: c.textMuted }]}>Type</Text>
              <Text style={[styles.detailValue, { color: c.text }]}>
                {item.file_type.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          {hasFile ? (
            <>
              <TouchableOpacity
                style={[styles.viewBtn, { backgroundColor: c.primaryLight, borderColor: c.primary }]}
                onPress={() => openInvoice(item)}>
                <Text style={[styles.viewBtnText, { color: c.primary }]}>👁 View Invoice</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.downloadBtn, { backgroundColor: c.primary }]}
                onPress={() => openInvoice(item, true)}>
                <Text style={styles.downloadBtnText}>⬇ Download</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.pendingBadge, { backgroundColor: '#2A1F00' }]}>
              <Text style={{ color: '#F2C94C', fontSize: 12 }}>⏳ Invoice not yet uploaded</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={[styles.loading, { backgroundColor: c.background }]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <Text style={styles.title}>My Invoices</Text>
        {invoices.length > 0 && (
          <Text style={styles.subtitle}>
            {invoices.length} invoice{invoices.length > 1 ? 's' : ''} ·{' '}
            {invoices.filter(i => i.status !== 'viewed').length} new
          </Text>
        )}
      </View>

      <FlatList
        data={invoices}
        renderItem={renderInvoice}
        keyExtractor={item => item.invoice_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingTop: 8 }}
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
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🧾</Text>
            <Text style={[styles.emptyText, { color: c.textMuted }]}>No invoices yet</Text>
            <Text style={[styles.emptySubText, { color: c.textMuted }]}>
              Invoices will appear here once your orders are delivered
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
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    borderRadius: 14, marginBottom: 10, padding: 16,
    elevation: 1, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  invoiceNo: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  wholesaler: { fontSize: 13 },
  newBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  newBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  amount: { fontSize: 20, fontWeight: '800' },
  detailsRow: {
    flexDirection: 'row', gap: 16,
    paddingTop: 10, borderTopWidth: 0.5, marginBottom: 12,
  },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 13, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  viewBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, paddingVertical: 10, borderWidth: 1, gap: 6,
  },
  viewBtnText: { fontSize: 13, fontWeight: '600' },
  downloadBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, paddingVertical: 10, gap: 6,
  },
  downloadBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  pendingBadge: {
    flex: 1, borderRadius: 10, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyText: { fontSize: 16, marginBottom: 8 },
  emptySubText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
