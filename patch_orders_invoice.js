const fs = require('fs');
let c = fs.readFileSync('./src/screens/OrdersScreen.js', 'utf8');

// Add invoice button before viewDetail section
c = c.replace(
  `        {/* View detail hint */}`,
  `        {/* Invoice button */}
        {item.sub_orders?.some(s => s.status === 'invoice_uploaded') && (
          <TouchableOpacity
            style={[styles.invoiceBtn, { borderColor: '#30D158' }]}
            onPress={(e) => { e.stopPropagation(); navigation.navigate('Invoices'); }}>
            <Text style={styles.invoiceBtnIcon}>{'🧾'}</Text>
            <Text style={[styles.invoiceBtnText, { color: '#30D158' }]}>View Invoice {'→'}</Text>
          </TouchableOpacity>
        )}

        {/* View detail hint */}`
);

// Add styles before closing StyleSheet
c = c.replace(
  `  shopBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },`,
  `  shopBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  invoiceBtn: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginBottom: 10, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, gap: 8, backgroundColor: 'rgba(48,209,88,0.08)' },
  invoiceBtnIcon: { fontSize: 16 },
  invoiceBtnText: { flex: 1, fontSize: 13, fontWeight: '700' },`
);

fs.writeFileSync('./src/screens/OrdersScreen.js', c);

// Verify
const check = fs.readFileSync('./src/screens/OrdersScreen.js', 'utf8');
console.log('invoiceBtn found:', check.includes('invoiceBtn'));
console.log('invoice_uploaded found:', check.includes('invoice_uploaded'));
