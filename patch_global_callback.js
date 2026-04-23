const fs = require('fs');

// Create a global callback ref file
const callbackRef = `// Global callback refs for navigation
export const callbacks = {};
`;
fs.writeFileSync('C:/Users/leksh/retailer-app2/src/utils/callbacks.js', callbackRef);
fs.writeFileSync('C:/Users/leksh/wholesaler-app/src/utils/callbacks.js', callbackRef);

// Fix AppNavigator
['C:/Users/leksh/retailer-app2/src/navigation/AppNavigator.js',
 'C:/Users/leksh/wholesaler-app/src/navigation/AppNavigator.js'].forEach(path => {
  let c = fs.readFileSync(path, 'utf8');

  // Add callbacks import
  if (!c.includes('callbacks')) {
    c = c.replace(
      `import api from '../services/api';`,
      `import api from '../services/api';
import { callbacks } from '../utils/callbacks';`
    );
  }

  // Register callback after state declarations
  c = c.replace(
    `  useEffect(() => {
    const handler = () => { setHasCategories(true); setCategoryChecked(true); };
    appEvents.on('categoryDone', handler);
    return () => appEvents.off('categoryDone', handler);
  }, []);`,
    `  // Register global callback for category completion
  callbacks.onCategoryDone = () => { setHasCategories(true); setCategoryChecked(true); };`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed AppNavigator:', path);
});

// Fix CategoryPickerScreen to call global callback
['C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js',
 'C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js'].forEach(path => {
  let c = fs.readFileSync(path, 'utf8');

  if (!c.includes('callbacks')) {
    c = c.replace(
      `import { CommonActions } from '@react-navigation/native';`,
      `import { CommonActions } from '@react-navigation/native';
import { callbacks } from '../utils/callbacks';`
    );
  }

  // Replace emit with callback call
  c = c.replace(
    `appEvents.emit('categoryDone');`,
    `if (callbacks.onCategoryDone) callbacks.onCategoryDone();`
  );

  // Also replace any reset attempt
  c = c.replace(
    `navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'MainStack' }] }));`,
    `if (callbacks.onCategoryDone) callbacks.onCategoryDone();`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed CategoryPicker:', path, '| callbacks:', c.includes('callbacks.onCategoryDone'));
});
