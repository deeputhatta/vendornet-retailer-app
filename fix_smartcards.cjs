const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

// Find the condition that wraps the whole smartCards section and remove the outer condition
// so cards always show. Also add default "quick action" cards when no orders/alerts.

// Replace the condition check for the whole section
c = c.replace(
  '{(pendingOrders.length > 0 || dispatchedOrders.length > 0 || bestDeal || lowStockItems.length > 0) && (',
  '{'
);

// Remove the closing )} of that condition (find it after the ScrollView closes)
// Instead add always-visible quick action cards before bestDeal

// Add browse & reorder cards right before bestDeal card
c = c.replace(
  `              {bestDeal && (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>`,
  `              {/* Always visible quick actions */}
              <TouchableOpacity
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
              </TouchableOpacity>
              {bestDeal && (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>`
);

// Also fix the closing )} - find the one after the ScrollView section
// The outer condition was removed so we need to close the { we added
c = c.replace(
  `            </ScrollView>
          )}
          {/* OFFERS */}`,
  `            </ScrollView>
          }
          {/* OFFERS */}`
);

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Done');
