import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Linking
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;
  const [stats, setStats] = useState(null);
  const [fullUser, setFullUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [analyticsRes, userRes] = await Promise.allSettled([
        api.get('/orders/retailer-analytics'),
        api.get('/users/me'),
      ]);
      if (userRes.status === 'fulfilled') setFullUser(userRes.value.data.user);
      const d = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : {};
      setStats({
        totalOrders: d.summary?.total_orders || 0,
        totalSpent: d.summary?.total_spend || 0,
        topItem: d.top_items?.[0]?.generic_name || '—',
        topSupplier: d.top_wholesalers?.[0]?.wholesaler_name || '—',
        avgOrderValue: d.summary?.avg_order_value || 0,
        thisMonth: d.summary?.this_month_spend || 0,
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'R';
  const formatAmount = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${v}`;

  const MenuItem = ({ icon, label, value, onPress, arrow = true, color, subtitle }) => (
    <TouchableOpacity
      style={[styles.menuRow, { borderBottomColor: c.borderLight }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.menuIconBox, { backgroundColor: c.surfaceSecondary || c.primaryLight }]}>
        <Text style={{ fontSize: 17 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: color || c.text }]}>{label}</Text>
        {subtitle && <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>{subtitle}</Text>}
      </View>
      <View style={styles.menuRight}>
        {value && <Text style={[styles.menuValue, { color: c.textMuted }]} numberOfLines={1}>{value}</Text>}
        {arrow && onPress && <Text style={[styles.menuArrow, { color: c.textMuted }]}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Retailer'}</Text>
        <Text style={styles.userMobile}>+91 {user?.mobile}</Text>
        {user?.address && <Text style={styles.userAddress} numberOfLines={1}>{user.address}</Text>}
        <View style={[styles.roleBadge, { backgroundColor: user?.role === 'retailer_admin' ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.15)' }]}>
          <Text style={styles.roleBadgeText}>{user?.role === 'retailer_admin' ? '👑 Admin' : '👤 Staff'}</Text>
        </View>
      </View>

      {/* Stats row */}
      {loading ? (
        <View style={[styles.statsRow, { backgroundColor: c.surface }]}>
          <ActivityIndicator color={c.primary} />
        </View>
      ) : (
        <View style={[styles.statsRow, { backgroundColor: c.surface, borderBottomColor: c.borderLight }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: c.primary }]}>{stats?.totalOrders || 0}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Orders</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: c.borderLight }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: c.primary }]}>{formatAmount(stats?.totalSpent || 0)}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Total Spent</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: c.borderLight }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: c.primary }]}>{formatAmount(stats?.avgOrderValue || 0)}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Avg Order</Text>
          </View>
        </View>
      )}

      {/* Account section */}
      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>ACCOUNT</Text>
        <MenuItem icon="👤" label="Name" value={user?.name} arrow={false} />
        <MenuItem icon="📱" label="Mobile" value={`+91 ${user?.mobile}`} arrow={false} />
        <MenuItem icon="🏷" label="Role" value={user?.role?.replace(/_/g, ' ')} arrow={false} />
        {(fullUser?.address || user?.address) && <MenuItem icon="📍" label="Address" value={fullUser?.address || user?.address} arrow={false} />}
        {(fullUser?.pincode || user?.pincode) && <MenuItem icon="🗺" label="Pincode" value={fullUser?.pincode || user?.pincode} arrow={false} />}
        {(fullUser?.gstin || user?.gstin) && <MenuItem icon="📋" label="GSTIN" value={fullUser?.gstin || user?.gstin} arrow={false} />}
        {(fullUser?.email || user?.email) && <MenuItem icon="📧" label="Email" value={fullUser?.email || user?.email} arrow={false} />}
      </View>

      {/* My Activity */}
      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>MY ACTIVITY</Text>
        <MenuItem icon="📦" label="My Orders" subtitle="View and track all orders" onPress={() => navigation.navigate('Main', { screen: 'Orders' })} />
        <MenuItem icon="🧾" label="My Invoices" subtitle="Download order invoices" onPress={() => navigation.navigate('Invoices')} />
        <MenuItem icon="❤️" label="Wishlist" subtitle="Saved products" onPress={() => navigation.navigate('Wishlist')} />
        <MenuItem icon="🏷" label="My Categories" subtitle="Update buying categories" onPress={() => navigation.navigate('CategoryPicker')} />
        <MenuItem icon="📊" label="Analytics" subtitle="Spending insights & reports" onPress={() => navigation.navigate('Main', { screen: 'Analytics' })} />
      </View>

      {/* Download */}
      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>REPORTS & DOWNLOADS</Text>
        <MenuItem icon="📥" label="Download Report" subtitle="Export orders as PDF/Excel" onPress={() => navigation.navigate('ReportDownload')} />
      </View>

      {/* Insights */}
      {stats?.topSupplier && stats.topSupplier !== '—' && (
        <View style={[styles.section, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>INSIGHTS</Text>
          <MenuItem icon="🏪" label="Top Supplier" value={stats.topSupplier} arrow={false} />
          <MenuItem icon="🔥" label="Top Product" value={stats.topItem} arrow={false} />
          <MenuItem icon="💰" label="This Month" value={formatAmount(stats.thisMonth || 0)} arrow={false} />
        </View>
      )}

      {/* App & Support */}
      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>APP & SUPPORT</Text>
        <MenuItem icon="🌐" label="Website" subtitle="vendornet.in" onPress={() => Linking.openURL('https://vendornet.in')} />
        <MenuItem icon="📞" label="Support" subtitle="Call or WhatsApp us" onPress={() => Linking.openURL('tel:+919876543210')} />
        <MenuItem icon="📧" label="Email Support" subtitle="support@vendornet.in" onPress={() => Linking.openURL('mailto:support@vendornet.in')} />
        <MenuItem icon="📱" label="App Version" value="1.0.0" arrow={false} />
      </View>

      {/* Logout */}
      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <MenuItem icon="🚪" label="Logout" color="#FF453A" onPress={confirmLogout} />
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 48, paddingBottom: 20, paddingHorizontal: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 },
  userMobile: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  userAddress: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 8, textAlign: 'center' },
  roleBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginTop: 6 },
  roleBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 0.5, justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, marginVertical: 4 },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, paddingHorizontal: 16, paddingVertical: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, gap: 12 },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  menuLabel: { fontSize: 14, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '45%' },
  menuValue: { fontSize: 13, textAlign: 'right', flexShrink: 1 },
  menuArrow: { fontSize: 20, marginLeft: 2 },
});
