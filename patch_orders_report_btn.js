const fs = require('fs');
let c = fs.readFileSync('./src/screens/OrdersScreen.js', 'utf8');

// Find the notifications button and add report button before it
const marker = 'navigation.navigate(\'Notifications\')';
const idx = c.indexOf(marker);
if (idx > -1) {
  // Find the TouchableOpacity start before this
  const toStart = c.lastIndexOf('<TouchableOpacity', idx);
  const toEnd = c.indexOf('</TouchableOpacity>', idx) + '</TouchableOpacity>'.length;
  const original = c.substring(toStart, toEnd);
  const replacement = `<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate('ReportDownload')}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Report</Text>
            </TouchableOpacity>
            ${original}
          </View>`;
  c = c.substring(0, toStart) + replacement + c.substring(toEnd);
  fs.writeFileSync('./src/screens/OrdersScreen.js', c);
  console.log('Done');
  console.log('ReportDownload found:', c.includes('ReportDownload'));
} else {
  console.log('Marker not found');
}
