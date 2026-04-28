const fs = require('fs');
let c = fs.readFileSync('src/screens/ProductDetailScreen.js', 'utf8');

// 1. Reduce header padding
c = c.replace(
  "  header: { paddingHorizontal: 16, paddingTop: 44, paddingBottom: 16 },",
  "  header: { paddingHorizontal: 16, paddingTop: 36, paddingBottom: 10 },"
);

// 2. Reduce product name font size
c = c.replace(
  "  productName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 },",
  "  productName: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 2 },"
);

// 3. Reduce brand font size
c = c.replace(
  "  brand: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },",
  "  brand: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 6 },"
);

// 4. Reduce price font size
c = c.replace(
  "  price: { fontSize: 26, fontWeight: '800', color: '#fff' },",
  "  price: { fontSize: 22, fontWeight: '800', color: '#fff' },"
);

// 5. Reduce priceRow margin
c = c.replace(
  "  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },",
  "  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },"
);

// 6. Reduce headerMeta margin
c = c.replace(
  "  headerMeta: { flexDirection: 'row', gap: 12, marginBottom: 12 },",
  "  headerMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },"
);

// 7. Reduce headerTop margin
c = c.replace(
  "  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },",
  "  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },"
);

// 8. Fix view cart button - use sticky bottom bar instead of inside ScrollView
// Wrap in a View with flex:1 and add sticky footer for view cart
c = c.replace(
  `    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>`,
  `    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: cartItems.length > 0 ? 60 : 0 }}>`
);

// 9. Move view cart button outside ScrollView as sticky footer
c = c.replace(
  `        {cartItems.length > 0 && (
          <TouchableOpacity
            style={[sStyles.viewCartBtn, { borderColor: c.primary, backgroundColor: c.primaryLight }]}
            onPress={goToCart}>
            <Text style={[sStyles.viewCartText, { color: c.primary }]}>
              🛒 View Cart ({cartItems.length} item{cartItems.length > 1 ? 's' : ''}) →
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>`,
  `        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Sticky View Cart Button */}
      {cartItems.length > 0 && (
        <TouchableOpacity
          style={[sStyles.viewCartBtn, { borderColor: c.primary, backgroundColor: c.primaryLight }]}
          onPress={goToCart}>
          <Text style={[sStyles.viewCartText, { color: c.primary }]}>
            🛒 View Cart ({cartItems.length} item{cartItems.length > 1 ? 's' : ''}) →
          </Text>
        </TouchableOpacity>
      )}
    </View>`
);

// 10. Update viewCartBtn style to be sticky
c = c.replace(
  "  viewCartBtn: { marginHorizontal: 12, marginTop: 10, borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },",
  "  viewCartBtn: { marginHorizontal: 12, marginBottom: 10, borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },"
);

fs.writeFileSync('src/screens/ProductDetailScreen.js', c);
console.log('Done');
