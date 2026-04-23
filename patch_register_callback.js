const fs = require('fs');
let c = fs.readFileSync('./src/navigation/AppNavigator.js', 'utf8');

// Find where to insert - after categoryChecked state declarations
const marker = `  callbacks.onCategoryDone = () => { setHasCategories(true); setCategoryChecked(true); };`;

if (!c.includes(marker)) {
  // Find the useEffect that checks categories and add callback after it
  const insertAfter = `  }, [user]);`;
  const idx = c.indexOf(insertAfter) + insertAfter.length;
  c = c.substring(0, idx) + `\n\n  // Register global callback for category completion\n  callbacks.onCategoryDone = () => { setHasCategories(true); setCategoryChecked(true); };` + c.substring(idx);
  console.log('Registered callback');
} else {
  console.log('Already registered');
}

fs.writeFileSync('./src/navigation/AppNavigator.js', c);
console.log('callbacks.onCategoryDone:', c.includes('callbacks.onCategoryDone'));
