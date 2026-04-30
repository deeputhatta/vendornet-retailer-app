const fs = require('fs');
let c = fs.readFileSync('src/screens/ProductDetailScreen.js', 'utf8');

c = c.replace(
  `        {/* Product Reviews */}
        <ReviewSection
          entityType="product"
          entityId={listing.product_id || listing.variant_id}
          colors={c}
          title="Rate this Product"
          subtitle="Share your experience with this product"
        />`,
  `        {/* Product Reviews */}
        {!!(listing.product_id || listing.variant_id) && (
          <ReviewSection
            entityType="product"
            entityId={listing.product_id || listing.variant_id}
            colors={c}
            title="Rate this Product"
            subtitle="Share your experience with this product"
          />
        )}`
);

fs.writeFileSync('src/screens/ProductDetailScreen.js', c);
console.log('done');
