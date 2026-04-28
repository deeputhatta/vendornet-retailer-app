const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

// Fix Browse card - should navigate to Category screen not Home
c = c.replace(
  `              <TouchableOpacity
                style={[styles.smartCard, { backgroundColor: '#0A1F35', borderColor: '#185FA5' }]}
                onPress={() => navigation.navigate('Home')}>
                <Text style={styles.smartCardIcon}>🛒</Text>
                <Text style={[styles.smartCardTitle, { color: '#0A84FF' }]}>Browse</Text>
                <Text style={[styles.smartCardSub, { color: '#0A84FF', opacity: 0.75 }]}>Find products</Text>
                <Text style={[styles.smartCardAction, { color: '#0A84FF' }]}>Shop Now →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smartCard, { backgroundColor: '#1A0A2A', borderColor: '#BF5AF2' }]}
                onPress={() => navigation.navigate('Orders')}>
                <Text style={styles.smartCardIcon}>📦</Text>
                <Text style={[styles.smartCardTitle, { color: '#BF5AF2' }]}>My Orders</Text>
                <Text style={[styles.smartCardSub, { color: '#BF5AF2', opacity: 0.75 }]}>Track & reorder</Text>
                <Text style={[styles.smartCardAction, { color: '#BF5AF2' }]}>View →</Text>
              </TouchableOpacity>`,
  `              <TouchableOpacity
                style={[styles.smartCard, { backgroundColor: c.primaryLight, borderColor: c.primary }]}
                onPress={() => navigation.navigate('Main', { screen: 'Catalogue' })}>
                <Text style={styles.smartCardIcon}>🛒</Text>
                <Text style={[styles.smartCardTitle, { color: c.primary }]}>Browse</Text>
                <Text style={[styles.smartCardSub, { color: c.primary, opacity: 0.75 }]}>Find products</Text>
                <Text style={[styles.smartCardAction, { color: c.primary }]}>Shop Now →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smartCard, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => navigation.navigate('Orders')}>
                <Text style={styles.smartCardIcon}>📦</Text>
                <Text style={[styles.smartCardTitle, { color: c.text }]}>My Orders</Text>
                <Text style={[styles.smartCardSub, { color: c.textMuted, opacity: 0.75 }]}>Track & reorder</Text>
                <Text style={[styles.smartCardAction, { color: c.primary }]}>View →</Text>
              </TouchableOpacity>`
);

// Reduce smartCard height by reducing padding and gap
c = c.replace(
  'smartCard: { width: 145, borderRadius: 12, padding: 8, borderWidth: 1.5, gap: 3 },',
  'smartCard: { width: 130, borderRadius: 10, padding: 8, borderWidth: 1, gap: 2 },'
);

// Reduce smartCardIcon size
c = c.replace(
  /smartCardIcon: \{[^}]+\}/,
  'smartCardIcon: { fontSize: 18, marginBottom: 2 }'
);

// Reduce smartCardTitle size
c = c.replace(
  /smartCardTitle: \{[^}]+\}/,
  'smartCardTitle: { fontSize: 11, fontWeight: \'700\' }'
);

// Reduce smartCardSub size
c = c.replace(
  /smartCardSub: \{[^}]+\}/,
  'smartCardSub: { fontSize: 10, lineHeight: 13 }'
);

// Reduce smartCardAction size
c = c.replace(
  /smartCardAction: \{[^}]+\}/,
  'smartCardAction: { fontSize: 10, fontWeight: \'600\', marginTop: 2 }'
);

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Done');
