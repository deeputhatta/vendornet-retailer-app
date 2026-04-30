const fs = require('fs');
let c = fs.readFileSync('src/screens/WholesalerListScreen.js', 'utf8');

// Remove setHasFirstLoad(false) from search handler too
c = c.replace(
  `    searchTimer.current = setTimeout(() => {
      setPage(1);
      setHasFirstLoad(false);
      if (selectedWholesaler) loadListings(selectedWholesaler.wholesaler_id, 1, text);
    }, 500);`,
  `    searchTimer.current = setTimeout(() => {
      setPage(1);
      if (selectedWholesaler) loadListings(selectedWholesaler.wholesaler_id, 1, text);
    }, 500);`
);

// Also remove setHasFirstLoad(false) from search if it's still there
c = c.replace('      setHasFirstLoad(false);\n      if (selectedWholesaler) loadListings', '      if (selectedWholesaler) loadListings');

// Make ListEmptyComponent never show during any loading
c = c.replace(
  `          ListEmptyComponent={
            hasFirstLoad && !listingsLoading ? (
              <View style={styles.center}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={[styles.emptyText, { color: c.textMuted }]}>No products found</Text>
              </View>
            ) : null
          }`,
  `          ListEmptyComponent={null}`
);

fs.writeFileSync('src/screens/WholesalerListScreen.js', c);
console.log('Done');
