const fs = require('fs');
let c = fs.readFileSync('src/screens/WholesalerListScreen.js', 'utf8');

// Don't clear listings during search - just replace when new results arrive
c = c.replace(
  `    searchTimer.current = setTimeout(() => {
      setPage(1);
      setHasFirstLoad(false);
      setListings([]);
      if (selectedWholesaler) loadListings(selectedWholesaler.wholesaler_id, 1, text);
    }, 500);`,
  `    searchTimer.current = setTimeout(() => {
      setPage(1);
      if (selectedWholesaler) loadListings(selectedWholesaler.wholesaler_id, 1, text);
    }, 500);`
);

fs.writeFileSync('src/screens/WholesalerListScreen.js', c);
console.log('Done');
