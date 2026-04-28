const fs = require('fs');
let c = fs.readFileSync('src/screens/ProductDetailScreen.js', 'utf8');

// Add TextInput to imports
c = c.replace(
  "  View, Text, ScrollView, TouchableOpacity,\n  StyleSheet, Alert, LayoutAnimation, UIManager, Platform",
  "  View, Text, ScrollView, TouchableOpacity,\n  StyleSheet, Alert, LayoutAnimation, UIManager, Platform, TextInput"
);

// Replace the header qty row inline
c = c.replace(
  `    <View style={sStyles.qtyRowInline}>
              <TouchableOpacity
                style={sStyles.qtyBtnSmall}
                onPress={() => setQuantity(Math.max(listing.min_order_qty, quantity - 1))}>
                <Text style={sStyles.qtyBtnSmallText}>−</Text>
              </TouchableOpacity>
              <Text style={sStyles.qtyValueSmall}>{quantity}</Text>
              <TouchableOpacity
                style={sStyles.qtyBtnSmall}
                onPress={() => setQuantity(quantity + 1)}>
                <Text style={sStyles.qtyBtnSmallText}>+</Text>
              </TouchableOpacity>
            </View>`,
  `    <View style={sStyles.qtyRowInline}>
              <TouchableOpacity
                style={sStyles.qtyBtnSmall}
                onPress={() => setQuantity(Math.max(listing.min_order_qty, quantity - 1))}>
                <Text style={sStyles.qtyBtnSmallText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={sStyles.qtyValueSmall}
                value={String(quantity)}
                onChangeText={v => {
                  const n = parseInt(v);
                  if (!isNaN(n) && n > 0) setQuantity(n);
                  else if (v === '') setQuantity('');
                }}
                onBlur={() => {
                  const n = parseInt(quantity);
                  setQuantity(!isNaN(n) && n >= listing.min_order_qty ? n : listing.min_order_qty);
                }}
                keyboardType="numeric"
                selectTextOnFocus
              />
              <TouchableOpacity
                style={sStyles.qtyBtnSmall}
                onPress={() => setQuantity(quantity + 1)}>
                <Text style={sStyles.qtyBtnSmallText}>+</Text>
              </TouchableOpacity>
            </View>`
);

// Replace the main qty row
c = c.replace(
  `          <View style={sStyles.qtyRow}>
            <TouchableOpacity
              style={[sStyles.qtyBtn, { backgroundColor: c.primaryLight }]}
              onPress={() => setQuantity(Math.max(listing.min_order_qty, quantity - 1))}>
              <Text style={[sStyles.qtyBtnText, { color: c.primary }]}>−</Text>
            </TouchableOpacity>
            <Text style={[sStyles.qtyValue, { color: c.text }]}>{quantity}</Text>
            <TouchableOpacity
              style={[sStyles.qtyBtn, { backgroundColor: c.primaryLight }]}
              onPress={() => setQuantity(quantity + 1)}>
              <Text style={[sStyles.qtyBtnText, { color: c.primary }]}>+</Text>
            </TouchableOpacity>
          </View>`,
  `          <View style={sStyles.qtyRow}>
            <TouchableOpacity
              style={[sStyles.qtyBtn, { backgroundColor: c.primaryLight }]}
              onPress={() => setQuantity(Math.max(listing.min_order_qty, quantity - 1))}>
              <Text style={[sStyles.qtyBtnText, { color: c.primary }]}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={[sStyles.qtyValue, { color: c.text, borderBottomWidth: 1, borderBottomColor: c.border, minWidth: 60, textAlign: 'center' }]}
              value={String(quantity)}
              onChangeText={v => {
                const n = parseInt(v);
                if (!isNaN(n) && n > 0) setQuantity(n);
                else if (v === '') setQuantity('');
              }}
              onBlur={() => {
                const n = parseInt(quantity);
                setQuantity(!isNaN(n) && n >= listing.min_order_qty ? n : listing.min_order_qty);
              }}
              keyboardType="numeric"
              selectTextOnFocus
            />
            <TouchableOpacity
              style={[sStyles.qtyBtn, { backgroundColor: c.primaryLight }]}
              onPress={() => setQuantity(quantity + 1)}>
              <Text style={[sStyles.qtyBtnText, { color: c.primary }]}>+</Text>
            </TouchableOpacity>
          </View>`
);

// Update qtyValueSmall style to work as TextInput
c = c.replace(
  "  qtyValueSmall: { color: '#fff', fontSize: 16, fontWeight: '700', marginHorizontal: 12 },",
  "  qtyValueSmall: { color: '#fff', fontSize: 16, fontWeight: '700', marginHorizontal: 12, minWidth: 40, textAlign: 'center' },"
);

fs.writeFileSync('src/screens/ProductDetailScreen.js', c);
console.log('Done');
