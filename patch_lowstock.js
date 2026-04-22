const fs = require('fs');
let c = fs.readFileSync('./src/screens/HomeScreen.js', 'utf8');

// 1. Add lowStockItems state
c = c.replace(
  `  const [bestDeal, setBestDeal] = useState(null);`,
  `  const [bestDeal, setBestDeal] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);`
);

// 2. Load low stock items — products retailer ordered before with stock < 20
c = c.replace(
  `        api.get('/orders/my'),
      ]);`,
  `        api.get('/orders/my'),
        api.get('/orders/top-products?limit=20'),
      ]);`
);

c = c.replace(
  `      const ordersRes = results[7];`,
  `      const ordersRes = results[7];
      const topProductsRes = results[8];
      if (topProductsRes?.status === 'fulfilled') {
        const lowStock = (topProductsRes.value.data.products || [])
          .filter(p => p.stock_qty !== undefined && parseInt(p.stock_qty) < 20 && parseInt(p.stock_qty) > 0);
        setLowStockItems(lowStock.slice(0, 3));
      }`
);

// 3. Add low stock card to smart cards section
c = c.replace(
  `              {/* Best deal */}`,
  `              {/* Low stock alert */}
              {lowStockItems.length > 0 && (
                <TouchableOpacity
                  style={[styles.smartCard, { backgroundColor: '#2A1500', borderColor: '#FF9500' }]}
                  onPress={() => navigateToProduct({ ...lowStockItems[0], effective_price: lowStockItems[0].offer_price || lowStockItems[0].price, has_offer: !!lowStockItems[0].offer_price })}>
                  <Text style={styles.smartCardIcon}>⚠️</Text>
                  <Text style={[styles.smartCardTitle, { color: '#FF9500' }]}>Low Stock Alert</Text>
                  <Text style={[styles.smartCardSub, { color: '#FF9500', opacity: 0.75 }]} numberOfLines={2}>
                    {lowStockItems[0].generic_name} — only {lowStockItems[0].stock_qty} units left
                  </Text>
                  <Text style={[styles.smartCardAction, { color: '#FF9500' }]}>Order Now →</Text>
                </TouchableOpacity>
              )}

              {/* Best deal */}`
);

// 4. Update condition to include lowStockItems
c = c.replace(
  `{(pendingOrders.length > 0 || dispatchedOrders.length > 0 || bestDeal) && (`,
  `{(pendingOrders.length > 0 || dispatchedOrders.length > 0 || bestDeal || lowStockItems.length > 0) && (`
);

fs.writeFileSync('./src/screens/HomeScreen.js', c);
console.log('Done');
console.log('lowStockItems found:', c.includes('lowStockItems'));
