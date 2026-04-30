const fs = require('fs');
let c = fs.readFileSync('src/screens/ProductDetailScreen.js', 'utf8');

// 1. Add avgRating and reviewCount states
c = c.replace(
  '  const [added, setAdded] = useState(false);',
  '  const [added, setAdded] = useState(false);\n  const [avgRating, setAvgRating] = useState(0);\n  const [reviewCount, setReviewCount] = useState(0);'
);

// 2. Add API import reference - api is already imported, just add load call in useEffect
c = c.replace(
  '    if (alreadyInCart) setQuantity(alreadyInCart.quantity);',
  `    if (alreadyInCart) setQuantity(alreadyInCart.quantity);
    // Load rating
    const eid = listing.product_id || listing.variant_id;
    if (eid) {
      import('../services/api').then(m => {
        m.default.get('/reviews/product/' + eid).then(res => {
          setAvgRating(parseFloat(res.data.stats.avg_rating) || 0);
          setReviewCount(parseInt(res.data.stats.total) || 0);
        }).catch(() => {});
      });
    }`
);

// 3. Add stars in header after brand text
c = c.replace(
  "        <Text style={sStyles.brand} numberOfLines={1}>{listing.brand_name} · {listing.category_name}</Text>",
  `        <Text style={sStyles.brand} numberOfLines={1}>{listing.brand_name} · {listing.category_name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 }}>
          <Text style={{ fontSize: 12, letterSpacing: 1, color: '#F2C94C' }}>
            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
          </Text>
          {reviewCount > 0 && (
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
              {avgRating.toFixed(1)} ({reviewCount} reviews)
            </Text>
          )}
          {reviewCount === 0 && (
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>No reviews yet</Text>
          )}
        </View>`
);

fs.writeFileSync('src/screens/ProductDetailScreen.js', c);
console.log('Done');
