import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/orders/retailer-analytics');
      const d = res.data;
      setStats({
        totalOrders: d.summary?.total_orders || 0,
        totalSpent: d.summary?.total_spend || 0,
        topItem: d.top_items?.[0]?.generic_name || '—',
        topSupplier: d.top_wholesalers?.[0]?.wholesaler_name || '—',
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

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'R';
  const formatAmount = (v) => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(1)}K` : `₹${v}`;

  const MenuItem = ({ icon, label, value, onPress, arrow = true, color }) => (
    <TouchableOpacity
      style={[styles.menuRow, { borderBottomColor: c.borderLight }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.menuIconBox, { backgroundColor: c.surfaceSecondary }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={[styles.menuLabel, { color: color || c.text }]}>{label}</Text>
      <View style={styles.menuRight}>
        {value && <Text style={[styles.menuValue, { color: c.textMuted }]}>{value}</Text>}
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
        {user?.role === 'retailer_admin' ? (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>👑 Admin</Text>
          </View>
        ) : (
          <View style={[styles.roleBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={styles.roleBadgeText}>Staff Account</Text>
          </View>
        )}
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
            <Text style={[styles.statValue, { color: c.primary, fontSize: 13 }]} numberOfLines={1}>{stats?.topItem || '—'}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Top Item</Text>
          </View>
        </View>
      )}

      {/* Account section */}
      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>ACCOUNT</Text>
        <MenuItem icon="👤" label="Name" value={user?.name} arrow={false} />
        <MenuItem icon="📱" label="Mobile" value={`+91 ${user?.mobile}`} arrow={false} />
        {user?.address && <MenuItem icon="📍" label="Address" value={user.address} arrow={false} />}
        {user?.gstin && <MenuItem icon="📋" label="GSTIN" value={user.gstin} arrow={false} />}
      </View>

      {/* My activity */}
      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>MY ACTIVITY</Text>
        <MenuItem icon="📦" label="My Orders" onPress={() => navigation.navigate('Orders')} />
        <MenuItem icon="🧾" label="My Invoices" onPress={() => navigation.navigate('Invoices')} />
        <MenuItem icon="❤️" label="Wishlist" onPress={() => navigation.navigate('Wishlist')} />
        <MenuItem icon="🏷" label="My Categories" onPress={() => navigation.getParent()?.navigate('CategoryPicker')} />
      </View>

      {/* Reports */}
      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>REPORTS</Text>
        <MenuItem icon="📥" label="Download Report" onPress={() => navigation.getParent()?.navigate('ReportDownload')} />
      </View>

      {/* Top supplier info */}
      {stats?.topSupplier && stats.topSupplier !== '—' && (
        <View style={[styles.section, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>INSIGHTS</Text>
          <MenuItem icon="🏪" label="Top Supplier" value={stats.topSupplier} arrow={false} />
          <MenuItem icon="🔥" label="Top Product" value={stats.topItem} arrow={false} />
        </View>
      )}

      {/* App info */}
      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>APP</Text>
        <MenuItem icon="📱" label="Version" value="1.0.0" arrow={false} />
        <MenuItem icon="🌐" label="Website" value="vendornet.in" arrow={false} />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: c.error || '#FF453A' }]}
        onPress={confirmLogout}>
        <Text style={[styles.logoutText, { color: c.error || '#FF453A' }]}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 24, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  userMobile: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  roleBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 3 },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, marginVertical: 4 },
  section: { marginTop: 12, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 0.5, gap: 12 },
  menuIconBox: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontSize: 13, maxWidth: 160, textAlign: 'right' },
  menuArrow: { fontSize: 20, fontWeight: '300' },
  logoutBtn: { margin: 16, marginTop: 20, borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  logoutText: { fontSize: 16, fontWeight: '600' },
});
