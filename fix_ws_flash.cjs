const fs = require('fs');
let c = fs.readFileSync('src/screens/WholesalerListScreen.js', 'utf8');

// Remove the setListings([]) call when selecting wholesaler and during search
// Keep old listings visible while new ones load
c = c.replace(
  "    setListings(p === 1 ? newListings : [...listings, ...newListings]);",
  "    if (p === 1) {\n        setListings(newListings);\n      } else {\n        setListings(prev => [...prev, ...newListings]);\n      }"
);

// Don't clear listings on wholesaler select - let them load naturally
c = c.replace(
  "    setSelectedWholesaler(ws);\n    setListings([]);\n    setListingSearch('');\n    setPage(1);\n    loadListings(ws.wholesaler_id, 1, '');",
  "    setSelectedWholesaler(ws);\n    setListingSearch('');\n    setPage(1);\n    setInitialLoad(true);\n    setListings([]);\n    loadListings(ws.wholesaler_id, 1, '');"
);

// Don't clear listings during search - let new results replace smoothly
c = c.replace(
  "    searchTimer.current = setTimeout(() => {\n      setPage(1);\n      if (selectedWholesaler) loadListings(selectedWholesaler.wholesaler_id, 1, text);\n    }, 500);",
  "    searchTimer.current = setTimeout(() => {\n      setPage(1);\n      setInitialLoad(true);\n      if (selectedWholesaler) loadListings(selectedWholesaler.wholesaler_id, 1, text);\n    }, 500);"
);

fs.writeFileSync('src/screens/WholesalerListScreen.js', c);
console.log('Done');
