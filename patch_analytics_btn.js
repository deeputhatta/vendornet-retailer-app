const fs = require('fs');
let c = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/AnalyticsScreen.js', 'utf8');

// Add navigation prop
c = c.replace(
  'export default function AnalyticsScreen() {',
  'export default function AnalyticsScreen({ navigation }) {'
);

// Add download button in heroTop next to FY badge
c = c.replace(
  `          <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={styles.heroBadgeText}>FY {selectedFY}</Text>
          </View>`,
  `          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={styles.heroBadgeText}>FY {selectedFY}</Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 }}
              onPress={() => navigation.getParent()?.navigate('ReportDownload')}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>📥 Download</Text>
            </TouchableOpacity>
          </View>`
);

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/AnalyticsScreen.js', c);
const updated = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/AnalyticsScreen.js', 'utf8');
console.log('Download found:', updated.includes('Download'));
console.log('navigation found:', updated.includes('navigation.getParent'));
