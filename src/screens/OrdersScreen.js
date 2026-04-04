import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { ordersAPI } from '../services/api';

const STATUS_COLORS = {
  pending: '#FAEEDA',
  accepted: '#EAF3DE',
  partially_accepted: '#E6F1FB',
  packing: '#E6F1FB',
  dispatched: '#E6F1FB',
  delivered: '#EAF3DE',
  invoice_uploaded: '#EAF3DE',
  completed: '#EAF3DE',
  rejected: '#FCEBEB',
  auto_cancelled: '#FCEBEB'
};

const STATUS_TEXT_COLORS = {
  pending: '#633806',
  accepted: '#27500A',
  partially_accepted: '#0C447C',
  packing: '#0C447C',
  dispatched: '#0C447C',
  delivered: '#27500A',
  invoice_uploaded: '#27500A',
  completed: '#27500A',
  rejected: '#791F1F',
  auto_cancelled: '#791F1F'
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getMyOrders();
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>
          Order #{item.order_id.slice(0, 8).toUpperCase()}
        </Text>
        <Text style={styles.orderDate}>
          {new Date(item.created_at).toLocaleDateString('en-IN')}
        </Text>
      </View>
      <Text style={styles.orderAmount}>
        ₹{parseFloat(item.total_amount).toLocaleString('en-IN')}
      </Text>
      {item.sub_orders?.map(sub => (
        <View key={sub.sub_order_id} style={styles.subOrder}>
          <Text style={styles.wholesalerName}>{sub.wholesaler_name}</Text>
          <View style={[styles.statusBadge,
            { backgroundColor: STATUS_COLORS[sub.status] || '#f5f5f5' }
          ]}>
            <Text style={[styles.statusText,
              { color: STATUS_TEXT_COLORS[sub.status] || '#333' }
            ]}>
              {sub.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#185FA5" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.order_id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadOrders();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders yet</Text>
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
  orderCard: { backgroundColor: '#fff', margin: 8, marginHorizontal: 12, borderRadius: 12, padding: 16, elevation: 1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderId: { fontSize: 14, fontWeight: '600', color: '#333' },
  orderDate: { fontSize: 12, color: '#888' },
  orderAmount: { fontSize: 20, fontWeight: 'bold', color: '#185FA5', marginBottom: 10 },
  subOrder: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderTopWidth: 0.5, borderTopColor: '#eee' },
  wholesalerName: { fontSize: 13, color: '#333', flex: 1 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#888' }
});