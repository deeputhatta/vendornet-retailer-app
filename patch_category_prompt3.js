const fs = require('fs');
let c = fs.readFileSync('./src/navigation/AppNavigator.js', 'utf8');

// Add useEffect to React import
if (!c.includes('useEffect')) {
  c = c.replace(`import React from 'react';`, `import React, { useState, useEffect } from 'react';`);
}

// Add api import
if (!c.includes("import api from")) {
  c = c.replace(
    `import { CartProvider } from '../context/CartContext';`,
    `import { CartProvider } from '../context/CartContext';\nimport api from '../services/api';`
  );
}

// Add state after useAuth/useTheme using index
const insertAfter = `  const { theme } = useTheme();`;
const insertIdx = c.indexOf(insertAfter) + insertAfter.length;
const stateCode = `
  const [categoryChecked, setCategoryChecked] = useState(false);
  const [hasCategories, setHasCategories] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/categories/my')
        .then(res => { setHasCategories((res.data.categories||[]).length > 0); })
        .catch(() => setHasCategories(true))
        .finally(() => setCategoryChecked(true));
    } else {
      setCategoryChecked(false);
      setHasCategories(true);
    }
  }, [user]);`;

if (!c.includes('categoryChecked')) {
  c = c.substring(0, insertIdx) + stateCode + c.substring(insertIdx);
}

// Replace navigation block using regex to handle CRLF
c = c.replace(
  /\{user \? \(\s*<Stack\.Screen name="MainStack" component=\{MainStack\} \/>\s*\) : \(\s*<Stack\.Screen name="Login" component=\{LoginScreen\} \/>\s*\)\}/,
  `{user ? (
          !categoryChecked ? null :
          !hasCategories
            ? <Stack.Screen name="CategorySetup" component={CategoryPickerScreen} initialParams={{ isOnboarding: true }} />
            : <Stack.Screen name="MainStack" component={MainStack} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}`
);

fs.writeFileSync('./src/navigation/AppNavigator.js', c);
console.log('categoryChecked:', c.includes('categoryChecked'));
console.log('CategorySetup:', c.includes('CategorySetup'));
