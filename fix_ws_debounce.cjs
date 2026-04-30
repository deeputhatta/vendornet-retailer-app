const fs = require('fs');
let c = fs.readFileSync('src/screens/WholesalerListScreen.js', 'utf8');

// Add useRef to imports
c = c.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

// Add timer ref after state declarations
c = c.replace(
  "  const [wsSearch, setWsSearch] = useState('');",
  "  const [wsSearch, setWsSearch] = useState('');\n  const searchTimer = useRef(null);"
);

// Replace handleListingSearch with debounced version
c = c.replace(
  "  const handleListingSearch = (text) => {\n    setListingSearch(text);\n    setPage(1);\n    if (selectedWholesaler) loadListings(selectedWholesaler.wholesaler_id, 1, text);\n  };",
  "  const handleListingSearch = (text) => {\n    setListingSearch(text);\n    if (searchTimer.current) clearTimeout(searchTimer.current);\n    searchTimer.current = setTimeout(() => {\n      setPage(1);\n      if (selectedWholesaler) loadListings(selectedWholesaler.wholesaler_id, 1, text);\n    }, 500);\n  };"
);

fs.writeFileSync('src/screens/WholesalerListScreen.js', c);
console.log('Done');
