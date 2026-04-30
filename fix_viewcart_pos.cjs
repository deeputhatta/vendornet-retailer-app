const fs = require('fs');
let c = fs.readFileSync('src/screens/ProductDetailScreen.js', 'utf8');

// Move view cart above reviews
c = c.replace(
  `        {/* Product Reviews */}
        {!!(listing.product_id || listing.variant_id) && (
          <ReviewSection
            entityType="product"
            entityId={listing.product_id || listing.variant_id}
            colors={c}
            title="Rate this Product"
            subtitle="Share your experience"
          />
        )}

        {/* View Cart */}
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={[sStyles.viewCartBtn, { borderColor: c.primary, backgroundColor: c.primaryLight }]}
            onPress={goToCart}>
            <Text style={[sStyles.viewCartText, { color: c.primary }]}>
              🛒 View Cart ({cartItems.length} item{cartItems.length > 1 ? 's' : ''}) →
            </Text>
          </TouchableOpacity>
        )}`,
  `        {/* View Cart */}
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
        )}`
);

fs.writeFileSync('src/screens/ProductDetailScreen.js', c);
console.log('Done');
