import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePermissions } from '../context/PermissionContext';
import { CartProvider } from '../context/CartContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DeliveryTrackingScreen from '../screens/DeliveryTrackingScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import WishlistScreen from '../screens/WishlistScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import InvoiceScreen from '../screens/InvoiceScreen';
import CategoryScreen from '../screens/CategoryScreen';
import StaffManagementScreen from '../screens/StaffManagementScreen';
import CategoryPickerScreen from '../screens/CategoryPickerScreen';
import ReportDownloadScreen from '../screens/ReportDownloadScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MoreScreen({ navigation }) {
  const { theme } = useTheme();
  const { isAdmin } = usePermissions();
  const c = theme.colors;

  const moreItems = [
    { icon: '🏷', label: 'My Categories',   screen: 'CategoryPicker' },
    { icon: '❤️', label: 'Wishlist',         screen: 'Wishlist' },
    { icon: '🧾', label: 'Invoices',         screen: 'Invoices' },
    { icon: '🔔', label: 'Notifications',    screen: 'Notifications' },
    ...(isAdmin ? [{ icon: '👥', label: 'Staff Management', screen: 'StaffManagement' }] : []),
    { icon: '👤', label: 'Profile',          screen: 'Profile' },
  ];

  return (
    <View style={[styles.moreContainer, { backgroundColor: c.background }]}>
      <View style={[styles.moreHeader, { backgroundColor: c.primary }]}>
        <Text style={styles.moreHeaderTitle}>More</Text>
        <Text style={styles.moreHeaderSub}>All features</Text>
      </View>
      <ScrollView contentContainerStyle={styles.moreList}>
        {moreItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.moreItem, {
              backgroundColor: c.surface,
              shadowColor: c.text,
            }]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.8}
          >
            <View style={[styles.moreIconBox, { backgroundColor: c.primaryLight }]}>
              <Text style={styles.moreIcon}>{item.icon}</Text>
            </View>
            <Text style={[styles.moreLabel, { color: c.text }]}>{item.label}</Text>
            <Text style={[styles.moreArrow, { color: c.textMuted }]}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function HomeTabs() {
  const { theme } = useTheme();
  const { can } = usePermissions();
  const c = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: c.tabBarActive,
        tabBarInactiveTintColor: c.tabBarInactive,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopColor: c.border,
          borderTopWidth: 1,
        },
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        headerTitleStyle: { fontWeight: '600', color: c.text },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
          headerShown: false,
        }}
      />
      {can('place_orders') && (
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{
            tabBarLabel: 'Cart',
            tabBarIcon: () => <Text style={{ fontSize: 22 }}>🛒</Text>,
            headerShown: false,
          }}
        />
      )}
      {can('view_orders') && (
        <Tab.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            tabBarLabel: 'Orders',
            tabBarIcon: () => <Text style={{ fontSize: 22 }}>📦</Text>,
            headerShown: false,
          }}
        />
      )}
      {can('view_analytics') && (
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarLabel: 'Analytics',
            tabBarIcon: () => <Text style={{ fontSize: 22 }}>📈</Text>,
            headerShown: false,
          }}
        />
      )}
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color }) => (
            <View style={{ gap: 4, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 18, height: 2, backgroundColor: color, borderRadius: 2 }} />
              <View style={{ width: 18, height: 2, backgroundColor: color, borderRadius: 2 }} />
              <View style={{ width: 18, height: 2, backgroundColor: color, borderRadius: 2 }} />
            </View>
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={HomeTabs} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Product Details',
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '600', color: c.text },
          headerBackTitle: '',
        }}
      />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DeliveryTracking"
        component={DeliveryTrackingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Invoices"
        component={InvoiceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
        <Stack.Screen
          name="StaffManagement"
          component={StaffManagementScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CategoryPicker"
          component={CategoryPickerScreen}
        />
        <Stack.Screen
          name="ReportDownload"
          component={ReportDownloadScreen}
          options={{ headerShown: false }}
          options={{ headerShown: false }}
        />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;

  if (loading) return null;

  const navTheme = {
    ...(theme.dark ? DarkTheme : DefaultTheme),
    dark: theme.dark,
    colors: {
      primary: c.primary,
      background: c.background,
      card: c.surface,
      text: c.text,
      border: c.border,
      notification: c.primary,
    },
  };

  return (
    <CartProvider>
      <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainStack" component={MainStack} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
      </CartProvider>
  );
}

const styles = StyleSheet.create({
  moreContainer: { flex: 1 },
  moreHeader: { padding: 20, paddingTop: 48 },
  moreHeaderTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  moreHeaderSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  moreList: { padding: 16, gap: 10 },
  moreItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 16, gap: 14,
    elevation: 1, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  moreIconBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  moreIcon: { fontSize: 22 },
  moreLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  moreArrow: { fontSize: 16 },
});




