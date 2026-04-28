const fs = require('fs');
let c = fs.readFileSync('src/screens/CartScreen.js', 'utf8');

// Add TextInput to imports
c = c.replace(
  "  View, Text, ScrollView, TouchableOpacity,\n  StyleSheet, Alert, ActivityIndicator",
  "  View, Text, ScrollView, TouchableOpacity,\n  StyleSheet, Alert, ActivityIndicator, TextInput"
);

// Replace qty control section
c = c.replace(
  `                      {/* Qty control */}
                      <View style={styles.qtyRow}>
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: c.primaryLight }]}
                          onPress={() => updateQuantity(item.listing_id, Math.max(item.min_order_qty, item.quantity - 1))}>
                          <Text style={[styles.qtyBtnText, { color: c.primary }]}>âˆ'</Text>
                        </TouchableOpacity>
                        <Text style={[styles.qtyValue, { color: c.text }]}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: c.primaryLight }]}
                          onPress={() => updateQuantity(item.listing_id, item.quantity + 1)}>
                          <Text style={[styles.qtyBtnText, { color: c.primary }]}>+</Text>
                        </TouchableOpacity>
                      </View>`,
  `                      {/* Qty control */}
                      <View style={styles.qtyRow}>
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: c.primaryLight }]}
                          onPress={() => updateQuantity(item.listing_id, Math.max(item.min_order_qty, item.quantity - 1))}>
                          <Text style={[styles.qtyBtnText, { color: c.primary }]}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={[styles.qtyValue, { color: c.text, borderBottomWidth: 1, borderBottomColor: c.border }]}
                          value={String(item.quantity)}
                          onChangeText={v => {
                            const n = parseInt(v);
                            if (!isNaN(n) && n > 0) updateQuantity(item.listing_id, n);
                          }}
                          onBlur={() => {
                            const n = parseInt(item.quantity);
                            if (isNaN(n) || n < item.min_order_qty) updateQuantity(item.listing_id, item.min_order_qty);
                          }}
                          keyboardType="numeric"
                          selectTextOnFocus
                        />
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: c.primaryLight }]}
                          onPress={() => updateQuantity(item.listing_id, item.quantity + 1)}>
                          <Text style={[styles.qtyBtnText, { color: c.primary }]}>+</Text>
                        </TouchableOpacity>
                      </View>`
);

fs.writeFileSync('src/screens/CartScreen.js', c);
console.log('Done');
