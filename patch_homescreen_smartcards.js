const fs = require('fs');
let c = fs.readFileSync('./src/screens/HomeScreen.js', 'utf8');

// 1. Add new state variables after existing states
c = c.replace(
  `  const [recentlyViewed, setRecentlyViewed] = useState([]);`,
  `  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [dispatchedOrders, setDispatchedOrders] = useState([]);
  const [bestDeal, setBestDeal] = useState(null);`
);

// 2. Add loading in loadAll
c = c.replace(
  `      if (offersRes.status === 'fulfilled') setOffers((offersRes.value.data.listings || []).filter(l => l.offer_price));`,
  `      if (offersRes.status === 'fulfilled') {
        const offerList = (offersRes.value.data.listings || []).filter(l => l.offer_price);
        setOffers(offerList);
        if (offerList.length > 0) {
          const best = offerList.reduce((a, b) => {
            const discA = (a.price - a.offer_price) / a.price;
            const discB = (b.price - b.offer_price) / b.price;
            return discA > discB ? a : b;
          });
          setBestDeal(best);
        }
      }`
);

// 3. Load pending and dispatched orders
c = c.replace(
  `        api.get('/orders/wholesaler-spotlight'),
      ]);`,
  `        api.get('/orders/wholesaler-spotlight'),
        api.get('/orders/my'),
      ]);`
);

c = c.replace(
  `      if (spotRes.status === 'fulfilled') setSpotlight(spotRes.value.data.wholesaler);`,
  `      if (spotRes.status === 'fulfilled') setSpotlight(spotRes.value.data.wholesaler);
      const ordersRes = results[7];
      if (ordersRes?.status === 'fulfilled') {
        const allOrders = ordersRes.value.data.orders || [];
        const pending = allOrders.filter(o => o.sub_orders?.some(s => ['pending','accepted'].includes(s.status)));
        const dispatched = allOrders.filter(o => o.sub_orders?.some(s => s.status === 'dispatched'));
        setPendingOrders(pending.slice(0, 3));
        setDispatchedOrders(dispatched.slice(0, 3));
      }`
);

// 4. Replace quick actions with smart info cards
c = c.replace(
  `          {/* QUICK ACTIONS */}
          <View style={[styles.quickActions, { backgroundColor: c.surface, borderColor: c.border }]}>
            {[
              { icon: '🛒', label: 'Cart', screen: 'Cart' },
              { icon: '📋', label: 'Orders', screen: 'Orders' },
              { icon: '❤️', label: 'Wishlist', screen: 'Wishlist' },
              { icon: '👤', label: 'Profile', screen: 'Profile' },
            ].map((a, i) => (
              <TouchableOpacity key={i} style={styles.quickAction} onPress={() => navigation.navigate(a.screen)}>
                <View style={[styles.quickActionIcon, { backgroundColor: c.primaryLight }]}>
                  <Text style={{ fontSize: 20 }}>{a.icon}</Text>
                </View>
                <Text style={[styles.quickActionLabel, { color: c.textMuted }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>`,
  `          {/* SMART INFO CARDS */}
          {(pendingOrders.length > 0 || dispatchedOrders.length > 0 || bestDeal) && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.smartCardsScroll}>

              {/* Pending orders */}
              {pendingOrders.length > 0 && (
                <TouchableOpacity
                  style={[styles.smartCard, { backgroundColor: '#2A1F00', borderColor: '#F2C94C' }]}
                  onPress={() => navigation.navigate('Orders')}>
                  <Text style={styles.smartCardIcon}>⏳</Text>
                  <Text style={[styles.smartCardTitle, { color: '#F2C94C' }]}>
                    {pendingOrders.length} Pending Order{pendingOrders.length > 1 ? 's' : ''}
                  </Text>
                  <Text style={[styles.smartCardSub, { color: '#F2C94C', opacity: 0.75 }]}>
                    Awaiting wholesaler confirmation
                  </Text>
                  <Text style={[styles.smartCardAction, { color: '#F2C94C' }]}>View Orders →</Text>
                </TouchableOpacity>
              )}

              {/* Dispatched orders */}
              {dispatchedOrders.length > 0 && (
                <TouchableOpacity
                  style={[styles.smartCard, { backgroundColor: '#001830', borderColor: '#0A84FF' }]}
                  onPress={() => navigation.navigate('Orders')}>
                  <Text style={styles.smartCardIcon}>🚚</Text>
                  <Text style={[styles.smartCardTitle, { color: '#0A84FF' }]}>
                    {dispatchedOrders.length} Order{dispatchedOrders.length > 1 ? 's' : ''} On the Way
                  </Text>
                  <Text style={[styles.smartCardSub, { color: '#0A84FF', opacity: 0.75 }]}>
                    {dispatchedOrders[0]?.sub_orders?.find(s => s.status === 'dispatched')?.wholesaler_name}
                  </Text>
                  <Text style={[styles.smartCardAction, { color: '#0A84FF' }]}>Track Delivery →</Text>
                </TouchableOpacity>
              )}

              {/* Best deal */}
              {bestDeal && (
                <TouchableOpacity
                  style={[styles.smartCard, { backgroundColor: '#003A10', borderColor: '#30D158' }]}
                  onPress={() => navigateToProduct({ ...bestDeal, effective_price: bestDeal.offer_price, has_offer: true })}>
                  <Text style={styles.smartCardIcon}>🔥</Text>
                  <Text style={[styles.smartCardTitle, { color: '#30D158' }]}>
                    {Math.round(((bestDeal.price - bestDeal.offer_price) / bestDeal.price) * 100)}% OFF Today
                  </Text>
                  <Text style={[styles.smartCardSub, { color: '#30D158', opacity: 0.75 }]} numberOfLines={1}>
                    {bestDeal.generic_name} — {bestDeal.brand_name}
                  </Text>
                  <Text style={[styles.smartCardAction, { color: '#30D158' }]}>Grab Deal →</Text>
                </TouchableOpacity>
              )}

            </ScrollView>
          )}`
);

// 5. Replace quickActions styles with smartCard styles
c = c.replace(
  `  quickActions: { flexDirection: 'row', marginHorizontal: 12, marginTop: 10, borderRadius: 14, borderWidth: 1, padding: 10 },
  quickAction: { flex: 1, alignItems: 'center', gap: 5 },
  quickActionIcon: { width: 42, height: 42, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  quickActionLabel: { fontSize: 10, fontWeight: '600' },`,
  `  smartCardsScroll: { paddingHorizontal: 12, paddingTop: 10, gap: 10 },
  smartCard: { width: 180, borderRadius: 14, padding: 14, borderWidth: 1.5, gap: 4 },
  smartCardIcon: { fontSize: 22, marginBottom: 2 },
  smartCardTitle: { fontSize: 13, fontWeight: '800' },
  smartCardSub: { fontSize: 11, lineHeight: 15 },
  smartCardAction: { fontSize: 11, fontWeight: '700', marginTop: 6 },`
);

fs.writeFileSync('./src/screens/HomeScreen.js', c);
console.log('Done');
console.log('smartCard found:', c.includes('smartCard'));
console.log('pendingOrders found:', c.includes('pendingOrders'));
