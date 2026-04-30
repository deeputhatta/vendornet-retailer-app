const fs = require('fs');
let c = fs.readFileSync('src/screens/WholesalerListScreen.js', 'utf8');

// Add hasLoaded ref to track first load completion
c = c.replace(
  "  const searchTimer = useRef(null);\n  const currentSearch = useRef('');",
  "  const searchTimer = useRef(null);\n  const currentSearch = useRef('');\n  const hasLoaded = useRef(false);"
);

// Set hasLoaded after first load
c = c.replace(
  "    setListings(p === 1 ? newListings : prev => [...prev, ...newListings]);",
  "    hasLoaded.current = true;\n      setListings(p === 1 ? newListings : prev => [...prev, ...newListings]);"
);

// Reset hasLoaded when selecting new wholesaler
c = c.replace(
  "    setSelectedWholesaler(ws);\n    setListingSearch('');\n    currentSearch.current = '';\n    setPage(1);\n    setListings([]);\n    loadListings(ws.wholesaler_id, 1, '', myCategories);",
  "    hasLoaded.current = false;\n    setSelectedWholesaler(ws);\n    setListingSearch('');\n    currentSearch.current = '';\n    setPage(1);\n    setListings([]);\n    loadListings(ws.wholesaler_id, 1, '', myCategories);"
);

// Fix empty component - only show when hasLoaded is true
c = c.replace(
  `          ListEmptyComponent={
            (!searchLoading && !listingsLoading) ? (
              <View style={styles.center}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={[styles.emptyText, { color: c.textMuted }]}>No products found</Text>
              </View>
            ) : null
          }`,
  `          ListEmptyComponent={
            (hasLoaded.current && !searchLoading && !listingsLoading) ? (
              <View style={styles.center}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={[styles.emptyText, { color: c.textMuted }]}>No products found</Text>
              </View>
            ) : null
          }`
);

fs.writeFileSync('src/screens/WholesalerListScreen.js', c);
console.log('Done');
