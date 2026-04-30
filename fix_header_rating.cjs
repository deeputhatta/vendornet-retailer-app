const fs = require('fs');
let c = fs.readFileSync('src/screens/ProductDetailScreen.js', 'utf8');

// Add avgRating state
c = c.replace(
  "  const [added, setAdded] = useState(false);",
  "  const [added, setAdded] = useState(false);\n  const [avgRating, setAvgRating] = useState(0);\n  const [reviewCount, setReviewCount] = useState(0);"
);

// Load avg rating on mount
c = c.replace(
  "  useEffect(() => {\n    isInWishlist(listing.listing_id).then(setWishlisted);",
  `  useEffect(() => {
    isInWishlist(listing.listing_id).then(setWishlisted);
    // Load avg rating
    const entityId = listing.product_id || listing.variant_id;
    if (entityId) {
      fetch(\`\${require('../services/api').default.defaults.baseURL}/reviews/product/\${entityId}\`)
        .then(r => r.json())
        .then(d => {
          if (d.stats) {
            setAvgRating(parseFloat(d.stats.avg_rating) || 0);
            setReviewCount(parseInt(d.stats.total) || 0);
          }
        })
        .catch(() => {});
    }`
);

// Add rating display in header after brand line
c = c.replace(
  `        <Text style={sStyles.brand} numberOfLines={1}>{listing.brand_name} · {listing.category_name}</Text>`,
  `        <Text style={sStyles.brand} numberOfLines={1}>{listing.brand_name} · {listing.category_name}</Text>
        {reviewCount > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            {[1,2,3,4,5].map(s => (
              <Text key={s} style={{ fontSize: 12, color: s <= Math.round(avgRating) ? '#F2C94C' : 'rgba(255,255,255,0.3)' }}>★</Text>
            ))}
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{avgRating.toFixed(1)} ({reviewCount})</Text>
          </View>
        )}`
);

fs.writeFileSync('src/screens/ProductDetailScreen.js', c);
console.log('Done');
