const fs = require('fs');
let c = fs.readFileSync('src/screens/ProductDetailScreen.js', 'utf8');

// Add import
c = c.replace(
  "import { addToWishlist, removeFromWishlist, isInWishlist } from './WishlistScreen';",
  "import { addToWishlist, removeFromWishlist, isInWishlist } from './WishlistScreen';\nimport ReviewSection from '../components/ReviewSection';"
);

// Add review sections before the height spacer at bottom
c = c.replace(
  "        <View style={{ height: 16 }} />\n      </ScrollView>",
  `        {/* Product Reviews */}
        <ReviewSection entityType="product" entityId={listing.product_id || listing.variant_id} colors={c} />

        {/* Wholesaler Reviews */}
        <ReviewSection entityType="wholesaler" entityId={listing.wholesaler_id} colors={c} />

        <View style={{ height: 16 }} />
      </ScrollView>`
);

fs.writeFileSync('src/screens/ProductDetailScreen.js', c);
console.log('Done');
