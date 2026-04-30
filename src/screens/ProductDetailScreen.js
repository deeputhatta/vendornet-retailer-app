import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, LayoutAnimation, UIManager, Platform, TextInput
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from './WishlistScreen';
import ReviewSection from '../components/ReviewSection';
import api from '../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getAttributes = (attrs) => {
  try {
    if (!attrs) return [];
    const parsed = typeof attrs === 'string' ? JSON.parse(attrs) : attrs;
    return Object.entries(parsed).filter(([k, v]) => v !== null && v !== undefined && v !== '');
  } catch { return []; }
};

function CollapsibleSection({ title, children, defaultOpen = false, colors: c }) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(p => !p);
  };
  return (
    <View style={[sStyles.card, { backgroundColor: c.surface }]}>
      <TouchableOpacity onPress={toggle} style={sStyles.sectionHeader} activeOpacity={0.7}>
        <Text style={[sStyles.sectionTitle, { color: c.text }]}>{title}</Text>
        <Text style={{ fontSize: 16, color: c.textMuted }}>{open ? '▾' : '▸'}</Text>
      </TouchableOpacity>
      {open && <View style={sStyles.sectionBody}>{children}</View>}
    </View>
  );
}

function DetailRow({ label, value, colors: c }) {
  return (
    <View style={[sStyles.detailRow, { borderBottomColor: c.borderLight }]}>
      <Text style={[sStyles.detailLabel, { color: c.textMuted }]}>{label}</Text>
      <Text style={[sStyles.detailValue, { color: c.text }]}>{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen({ route, navigation }) {
  const { listing } = route.params;
  const [quantity, setQuantity] = useState(listing.min_order_qty || 1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const { theme } = useTheme();
  const c = theme.colors;
  const { addToCart, cartItems } = useCart();
  const alreadyInCart = cartItems.find(i => i.listing_id === listing.listing_id);

  useEffect(() => {
    isInWishlist(listing.listing_id).then(setWishlisted);
    if (alreadyInCart) setQuantity(alreadyInCart.quantity);
    // Load rating
    const eid = listing.product_id || listing.variant_id;
    if (eid) {
      api.get('/reviews/product/' + eid).then(res => {
        setAvgRating(parseFloat(res.data.stats.avg_rating) || 0);
        setReviewCount(parseInt(res.data.stats.total) || 0);
      }).catch(() => {});
    }
  }, []);

  const toggleWishlist = async () => {
    if (wishlisted) {
      await removeFromWishlist(listing.listing_id);
      setWishlisted(false);
    } else {
      await addToWishlist({
        listing_id: listing.listing_id,
        generic_name: listing.generic_name,
        brand_name: listing.brand_name,
        wholesaler_name: listing.wholesaler_name,
        wholesaler_id: listing.wholesaler_id,
        price: listing.price,
        effective_price: listing.effective_price,
        has_offer: listing.has_offer,
        min_order_qty: listing.min_order_qty,
      });
      setWishlisted(true);
    }
  };

  const handleAddToCart = () => {
    const qty = parseInt(quantity) || listing.min_order_qty;
    if (qty < listing.min_order_qty) {
      Alert.alert('MOQ Error', `Minimum order is ${listing.min_order_qty} units`);
      return;
    }
    addToCart({
      listing_id: listing.listing_id,
      quantity: qty,
      unit_price: listing.effective_price,
      product_name: listing.generic_name,
      brand_name: listing.brand_name,
      wholesaler_name: listing.wholesaler_name,
      wholesaler_id: listing.wholesaler_id,
      min_order_qty: listing.min_order_qty,
      pack_size: listing.pack_size,
      unit: listing.unit,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const goToCart = () => navigation.navigate('Main', { screen: 'Cart' });
  const qty = parseInt(quantity) || 0;
  const total = (listing.effective_price * qty).toLocaleString('en-IN');

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* ── Compact Header ── */}
      <View style={[sStyles.header, { backgroundColor: c.primary }]}>
        <View style={sStyles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={sStyles.iconBtn}>
            <Text style={sStyles.iconBtnText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleWishlist} style={sStyles.iconBtn}>
            <Text style={sStyles.iconBtnText}>{wishlisted ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={sStyles.productName} numberOfLines={1}>{listing.generic_name}</Text>
        <Text style={sStyles.brand} numberOfLines={1}>{listing.brand_name} · {listing.category_name}</Text>

        {/* Star rating in header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <Text style={{ fontSize: 12, color: '#F2C94C', letterSpacing: 1 }}>
            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
          </Text>
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
            {reviewCount > 0 ? `${avgRating.toFixed(1)} (${reviewCount})` : 'No reviews yet'}
          </Text>
        </View>

        <View style={sStyles.priceRow}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            {listing.has_offer && <Text style={sStyles.oldPrice}>₹{listing.price}</Text>}
            <Text style={sStyles.price}>₹{listing.effective_price}<Text style={sStyles.perUnit}>/unit</Text></Text>
          </View>
          {listing.has_offer && (
            <View style={sStyles.offerBadge}>
              <Text style={sStyles.offerText}>OFFER</Text>
            </View>
          )}
        </View>

        {/* Qty + Add to Cart in header */}
        <View style={sStyles.headerCartRow}>
          <View style={sStyles.qtyRowInline}>
            <TouchableOpacity style={sStyles.qtyBtnSmall}
              onPress={() => setQuantity(q => Math.max(listing.min_order_qty, (parseInt(q) || 1) - 1))}>
              <Text style={sStyles.qtyBtnSmallText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={sStyles.qtyValueSmall}
              value={String(quantity)}
              onChangeText={v => { const n = parseInt(v); if (!isNaN(n) && n > 0) setQuantity(n); else if (v === '') setQuantity(''); }}
              onBlur={() => { const n = parseInt(quantity); setQuantity(!isNaN(n) && n >= listing.min_order_qty ? n : listing.min_order_qty); }}
              keyboardType="numeric"
              selectTextOnFocus
            />
            <TouchableOpacity style={sStyles.qtyBtnSmall}
              onPress={() => setQuantity(q => (parseInt(q) || 0) + 1)}>
              <Text style={sStyles.qtyBtnSmallText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[sStyles.headerCartBtn, { backgroundColor: added ? '#1D9E75' : 'rgba(255,255,255,0.2)' }]}
            onPress={handleAddToCart}>
            <Text style={sStyles.headerCartBtnText}>
              {added ? '✓ Added!' : alreadyInCart ? 'Update Cart' : '🛒 Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={sStyles.totalInHeader}>Total: ₹{total}</Text>
      </View>

      {/* Already in cart banner */}
      {alreadyInCart && (
        <TouchableOpacity onPress={goToCart}
          style={[sStyles.inCartBanner, { backgroundColor: c.successLight || '#e1f5ee' }]}>
          <Text style={[sStyles.inCartText, { color: c.success || '#1D9E75' }]}>
            ✓ {alreadyInCart.quantity} units in cart · Tap to view →
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>

        <CollapsibleSection title="Product Details" defaultOpen={false} colors={c}>
          <DetailRow label="Brand" value={listing.brand_name} colors={c} />
          <DetailRow label="Category" value={listing.category_name} colors={c} />
          {listing.hsn_code && <DetailRow label="HSN Code" value={listing.hsn_code} colors={c} />}
          {getAttributes(listing.attributes).map(([k, v]) => (
            <DetailRow key={k} label={k.replace(/_/g, ' ')} value={String(v)} colors={c} />
          ))}
        </CollapsibleSection>

        <CollapsibleSection title="Seller Details" defaultOpen={false} colors={c}>
          <DetailRow label="Seller" value={listing.wholesaler_name} colors={c} />
          <DetailRow label="Delivery" value={`${listing.delivery_days} day(s)`} colors={c} />
          <DetailRow label="Min Order" value={`${listing.min_order_qty} units`} colors={c} />
          <DetailRow label="Stock" value={`${listing.stock_qty} units available`} colors={c} />
        </CollapsibleSection>

        {/* Quantity + Add to Cart (bottom) */}
        <View style={[sStyles.card, { backgroundColor: c.surface }]}>
          <View style={sStyles.qtyRow}>
            <TouchableOpacity style={[sStyles.qtyBtn, { backgroundColor: c.primaryLight }]}
              onPress={() => setQuantity(q => Math.max(listing.min_order_qty, (parseInt(q) || 1) - 1))}>
              <Text style={[sStyles.qtyBtnText, { color: c.primary }]}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={[sStyles.qtyValue, { color: c.text, borderBottomWidth: 1, borderBottomColor: c.border }]}
              value={String(quantity)}
              onChangeText={v => { const n = parseInt(v); if (!isNaN(n) && n > 0) setQuantity(n); else if (v === '') setQuantity(''); }}
              onBlur={() => { const n = parseInt(quantity); setQuantity(!isNaN(n) && n >= listing.min_order_qty ? n : listing.min_order_qty); }}
              keyboardType="numeric"
              selectTextOnFocus
            />
            <TouchableOpacity style={[sStyles.qtyBtn, { backgroundColor: c.primaryLight }]}
              onPress={() => setQuantity(q => (parseInt(q) || 0) + 1)}>
              <Text style={[sStyles.qtyBtnText, { color: c.primary }]}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={[sStyles.totalText, { color: c.text }]}>Total: ₹{total}</Text>
          {qty < listing.min_order_qty && (
            <Text style={[sStyles.moqWarning, { color: c.error || '#FF453A' }]}>
              Min order: {listing.min_order_qty} units
            </Text>
          )}
        </View>

        {/* Save + Add to Cart buttons */}
        <View style={sStyles.btnRow}>
          <TouchableOpacity
            style={[sStyles.wishlistBtn, { borderColor: wishlisted ? '#FF453A' : c.border, backgroundColor: wishlisted ? '#2A0A0A' : c.surface }]}
            onPress={toggleWishlist}>
            <Text style={sStyles.wishlistBtnIcon}>{wishlisted ? '❤️' : '🤍'}</Text>
            <Text style={[sStyles.wishlistBtnText, { color: wishlisted ? '#FF453A' : c.textMuted }]}>
              {wishlisted ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[sStyles.addBtn, { backgroundColor: added ? '#1D9E75' : c.primary }]}
            onPress={handleAddToCart}>
            <Text style={[sStyles.addBtnText, { color: '#fff' }]}>
              {added ? '✓ Added to Cart!' : alreadyInCart ? 'Update Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* View Cart */}
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={[sStyles.viewCartBtn, { borderColor: c.primary, backgroundColor: c.primaryLight }]}
            onPress={goToCart}>
            <Text style={[sStyles.viewCartText, { color: c.primary }]}>
              🛒 View Cart ({cartItems.length} item{cartItems.length > 1 ? 's' : ''}) →
            </Text>
          </TouchableOpacity>
        )}

        {/* Product Reviews */}
        {!!(listing.product_id || listing.variant_id) && (
          <ReviewSection
            entityType="product"
            entityId={listing.product_id || listing.variant_id}
            colors={c}
            title="Rate this Product"
            subtitle="Share your experience"
          />
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const sStyles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 36, paddingBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  iconBtn: { padding: 4 },
  iconBtnText: { color: 'rgba(255,255,255,0.85)', fontSize: 20 },
  productName: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 2 },
  brand: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  oldPrice: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecorationLine: 'line-through' },
  price: { fontSize: 22, fontWeight: '800', color: '#fff' },
  perUnit: { fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.7)' },
  offerBadge: { backgroundColor: '#F2C94C', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  offerText: { fontSize: 11, fontWeight: '800', color: '#000' },
  headerCartRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  qtyRowInline: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 4 },
  qtyBtnSmall: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  qtyBtnSmallText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  qtyValueSmall: { color: '#fff', fontSize: 15, fontWeight: '700', marginHorizontal: 10, minWidth: 32, textAlign: 'center' },
  headerCartBtn: { flex: 1, borderRadius: 10, height: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  headerCartBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  totalInHeader: { fontSize: 11, color: 'rgba(255,255,255,0.65)', textAlign: 'right' },
  inCartBanner: { marginHorizontal: 12, marginTop: 8, borderRadius: 10, padding: 10, alignItems: 'center' },
  inCartText: { fontSize: 13, fontWeight: '600' },
  card: { marginHorizontal: 12, marginTop: 10, borderRadius: 12, overflow: 'hidden', elevation: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 0.5 },
  detailLabel: { fontSize: 13, textTransform: 'capitalize' },
  detailValue: { fontSize: 13, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 14 },
  qtyBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 22, fontWeight: 'bold' },
  qtyValue: { fontSize: 22, fontWeight: 'bold', marginHorizontal: 20, minWidth: 48, textAlign: 'center' },
  totalText: { fontSize: 15, fontWeight: '600', textAlign: 'center', paddingBottom: 10 },
  moqWarning: { fontSize: 12, textAlign: 'center', marginTop: 2, paddingBottom: 8 },
  btnRow: { flexDirection: 'row', gap: 10, marginHorizontal: 12, marginTop: 10 },
  wishlistBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, height: 50, paddingHorizontal: 14, borderWidth: 1, gap: 6 },
  wishlistBtnIcon: { fontSize: 18 },
  wishlistBtnText: { fontSize: 13, fontWeight: '600' },
  addBtn: { flex: 1, borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { fontSize: 15, fontWeight: '600' },
  viewCartBtn: { marginHorizontal: 12, marginBottom: 10, marginTop: 10, borderRadius: 12, height: 46, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  viewCartText: { fontSize: 14, fontWeight: '600' },
});
