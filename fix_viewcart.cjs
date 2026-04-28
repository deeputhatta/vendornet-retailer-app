const fs = require('fs');
let c = fs.readFileSync('src/screens/ProductDetailScreen.js', 'utf8');

// Remove sticky view cart footer outside ScrollView
c = c.replace(
  `      {/* Sticky View Cart footer */}
      {cartItems.length > 0 && (
        <TouchableOpacity
          style={[sStyles.viewCartBtn, { borderColor: c.primary, backgroundColor: c.primaryLight }]}
          onPress={goToCart}>
          <Text style={[sStyles.viewCartText, { color: c.primary }]}>
            🛒 View Cart ({cartItems.length} item{cartItems.length > 1 ? 's' : ''}) →
          </Text>
        </TouchableOpacity>
      )}
    </View>`,
  `    </View>`
);

// Add view cart right after btnRow inside ScrollView (before the height spacer)
c = c.replace(
  `        <View style={{ height: 16 }} />
      </ScrollView>`,
  `        {cartItems.length > 0 && (
          <TouchableOpacity
            style={[sStyles.viewCartBtn, { borderColor: c.primary, backgroundColor: c.primaryLight }]}
            onPress={goToCart}>
            <Text style={[sStyles.viewCartText, { color: c.primary }]}>
              🛒 View Cart ({cartItems.length} item{cartItems.length > 1 ? 's' : ''}) →
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>`
);

fs.writeFileSync('src/screens/ProductDetailScreen.js', c);
console.log('Done');
