const fs = require('fs');
let c = fs.readFileSync('./src/screens/OrdersScreen.js', 'utf8');

// Remove ALL existing invoice button blocks (there are duplicates)
// Match from {/* Invoice button */} to the blank line before {/* View detail hint */}
c = c.replace(/\s*\{\/\* Invoice button \*\/\}[\s\S]*?(?=\s*\{\/\* View detail hint \*\/\})/g, '\n');

// Now add ONE clean invoice button before viewDetail
c = c.replace(
  `        {/* View detail hint */}`,
  `        {item.sub_orders?.some(s => s.status === 'invoice_uploaded') && (
          <TouchableOpacity
            style={[styles.invoiceBtn, { borderColor: '#30D158' }]}
            onPress={(e) => { e.stopPropagation(); navigation.navigate('Invoices'); }}>
            <Text style={[styles.invoiceBtnText, { color: '#30D158' }]}>🧾 View Invoice →</Text>
          </TouchableOpacity>
        )}

        {/* View detail hint */}`
);

fs.writeFileSync('./src/screens/OrdersScreen.js', c);

// Verify only one invoice button
const count = (c.match(/invoiceBtn/g) || []).length;
console.log('invoiceBtn occurrences (should be ~3 for button + 2 styles):', count);
console.log('Done');
