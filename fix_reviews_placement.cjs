const fs = require('fs');

// 1. Fix ProductDetailScreen - keep only product review, remove wholesaler review
let c = fs.readFileSync('src/screens/ProductDetailScreen.js', 'utf8');

c = c.replace(
  `        {/* Product Reviews */}
        <ReviewSection entityType="product" entityId={listing.product_id || listing.variant_id} colors={c} />

        {/* Wholesaler Reviews */}
        <ReviewSection entityType="wholesaler" entityId={listing.wholesaler_id} colors={c} />`,
  `        {/* Product Reviews */}
        <ReviewSection
          entityType="product"
          entityId={listing.product_id || listing.variant_id}
          colors={c}
          title="Rate this Product"
          subtitle="Share your experience with this product"
        />`
);

fs.writeFileSync('src/screens/ProductDetailScreen.js', c);
console.log('ProductDetailScreen fixed');
