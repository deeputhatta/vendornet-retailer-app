const fs = require('fs');

// Fix Analytics screen download button
let a = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/AnalyticsScreen.js', 'utf8');

// Replace the entire download button with enhanced version
a = a.replace(
  /style=\{styles\.heroTopRow\}>[\s\S]*?<\/View>\s*<\/View>\s*<View style=\{\[styles\.heroTop/,
  `style={styles.heroTopRow}>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginBottom: 12,
              alignSelf: 'flex-end',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
            }}
            onPress={() => navigation.getParent()?.navigate('ReportDownload', { reportType: 'full' })}>
            <Text style={{ fontSize: 16 }}>\uD83D\uDCE5</Text>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Download Report</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.heroTop`
);

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/AnalyticsScreen.js', a);
console.log('Analytics fixed:', a.includes('Download Report'));

// Fix Orders screen report button
let o = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/OrdersScreen.js', 'utf8');

o = o.replace(
  /style=\{ backgroundColor: 'rgba\(255,255,255,0\.2\)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 \}>\s*<Text style=\{ color: '#fff', fontSize: 11, fontWeight: '700' \}>Report<\/Text>/,
  `style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
              <Text style={{ fontSize: 14 }}>\uD83D\uDCE5</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Report</Text>`
);

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/OrdersScreen.js', o);
console.log('Orders fixed:', o.includes('fontSize: 14'));
