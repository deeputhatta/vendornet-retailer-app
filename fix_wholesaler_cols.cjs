const fs = require('fs');
let c = fs.readFileSync('src/screens/WholesalerListScreen.js', 'utf8');

// Add key to listings FlatList to force re-render when switching views
c = c.replace(
  `        <FlatList
          data={listings}
          keyExtractor={item => item.listing_id}
          contentContainerStyle={{ padding: 12 }}
          numColumns={2}
          columnWrapperStyle={{ gap: 10 }}`,
  `        <FlatList
          key="listings-2col"
          data={listings}
          keyExtractor={item => item.listing_id}
          contentContainerStyle={{ padding: 12 }}
          numColumns={2}
          columnWrapperStyle={{ gap: 10 }}`
);

// Add key to wholesaler FlatList too
c = c.replace(
  `        <FlatList
          data={wholesalers}
          keyExtractor={item => item.wholesaler_id}
          contentContainerStyle={{ padding: 12 }}`,
  `        <FlatList
          key="wholesalers-1col"
          data={wholesalers}
          keyExtractor={item => item.wholesaler_id}
          contentContainerStyle={{ padding: 12 }}`
);

fs.writeFileSync('src/screens/WholesalerListScreen.js', c);
console.log('done');
