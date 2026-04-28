const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

// Add Animated to imports if not there
if (!c.includes('Animated,') && !c.includes(', Animated')) {
  c = c.replace(
    "  View, Text, TextInput, FlatList, TouchableOpacity,",
    "  View, Text, TextInput, FlatList, TouchableOpacity, Animated,"
  );
}

// Add pulse animation hook after useState declarations (find a good insertion point)
const pulseHook = `
  // Pulse animation for grab deal
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
`;

// Insert after the last useState
c = c.replace(
  "  const [bestDeal, setBestDeal] = useState(null);",
  "  const [bestDeal, setBestDeal] = useState(null);\n" + pulseHook
);

// Replace the bestDeal TouchableOpacity with Animated version
c = c.replace(
  `              {bestDeal && (
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
              )}`,
  `              {bestDeal && (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    style={[styles.smartCard, { backgroundColor: '#003A10', borderColor: '#30D158', borderWidth: 2, shadowColor: '#30D158', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }]}
                    onPress={() => navigateToProduct({ ...bestDeal, effective_price: bestDeal.offer_price, has_offer: true })}>
                    <Text style={styles.smartCardIcon}>🔥</Text>
                    <View style={{ backgroundColor: '#30D158', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 }}>
                      <Text style={{ color: '#000', fontSize: 10, fontWeight: '800' }}>
                        {Math.round(((bestDeal.price - bestDeal.offer_price) / bestDeal.price) * 100)}% OFF
                      </Text>
                    </View>
                    <Text style={[styles.smartCardTitle, { color: '#30D158' }]}>Today's Deal</Text>
                    <Text style={[styles.smartCardSub, { color: '#30D158', opacity: 0.85 }]} numberOfLines={1}>
                      {bestDeal.generic_name} — {bestDeal.brand_name}
                    </Text>
                    <Text style={[styles.smartCardAction, { color: '#30D158', fontWeight: '800' }]}>⚡ Grab Deal →</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}`
);

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Done');
