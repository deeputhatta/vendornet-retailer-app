const fs = require('fs');
let c = fs.readFileSync('src/screens/WholesalerListScreen.js', 'utf8');

// Fix empty component to not show during loading
c = c.replace(
  `          ListEmptyComponent={
            listingsLoading ? null : (
              <View style={styles.center}>
                <Text style={[styles.emptyText, { color: c.textMuted }]}>No products found</Text>
              </View>
            )
          }`,
  `          ListEmptyComponent={
            (!listingsLoading && listings.length === 0) ? (
              <View style={styles.center}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={[styles.emptyText, { color: c.textMuted }]}>No products found</Text>
              </View>
            ) : null
          }`
);

// Also add a loading overlay state to prevent flash
c = c.replace(
  "  const [listingsLoading, setListingsLoading] = useState(false);",
  "  const [listingsLoading, setListingsLoading] = useState(false);\n  const [initialLoad, setInitialLoad] = useState(true);"
);

// Set initialLoad false after first load
c = c.replace(
  "    } catch (err) { console.error(err); }\n    finally { setListingsLoading(false); }",
  "    } catch (err) { console.error(err); }\n    finally { setListingsLoading(false); setInitialLoad(false); }"
);

// Hide empty component during initial load
c = c.replace(
  "            (!listingsLoading && listings.length === 0) ? (",
  "            (!listingsLoading && !initialLoad && listings.length === 0) ? ("
);

fs.writeFileSync('src/screens/WholesalerListScreen.js', c);
console.log('Done');
