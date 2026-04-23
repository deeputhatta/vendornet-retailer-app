const fs = require('fs');
let c = fs.readFileSync('./src/navigation/AppNavigator.js', 'utf8');

// Add useEffect to React import
c = c.replace(`import React from 'react';`, `import React, { useState, useEffect } from 'react';`);

// Add api import
if (!c.includes("import api from")) {
  c = c.replace(
    `import { CartProvider } from '../context/CartContext';`,
    `import { CartProvider } from '../context/CartContext';
import api from '../services/api';`
  );
}

// Add state and check after existing const declarations in AppNavigator
c = c.replace(
  `export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();`,
  `export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [categoryChecked, setCategoryChecked] = useState(false);
  const [hasCategories, setHasCategories] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/categories/my')
        .then(res => {
          const cats = res.data.categories || [];
          setHasCategories(cats.length > 0);
        })
        .catch(() => setHasCategories(true))
        .finally(() => setCategoryChecked(true));
    } else {
      setCategoryChecked(false);
      setHasCategories(true);
    }
  }, [user]);`
);

// Update navigation logic
c = c.replace(
  `        {user ? (
          <Stack.Screen name="MainStack" component={MainStack} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}`,
  `        {user ? (
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
