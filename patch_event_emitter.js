const fs = require('fs');

// Create a simple event emitter file
const emitterContent = `import { EventEmitter } from 'eventemitter3';
export const appEvents = new EventEmitter();
`;

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/utils/appEvents.js', emitterContent);
fs.writeFileSync('C:/Users/leksh/wholesaler-app/src/utils/appEvents.js', emitterContent);
console.log('Event emitter created');

// Fix AppNavigator to listen for category done event
['C:/Users/leksh/retailer-app2/src/navigation/AppNavigator.js',
 'C:/Users/leksh/wholesaler-app/src/navigation/AppNavigator.js'].forEach(path => {
  let c = fs.readFileSync(path, 'utf8');

  // Add appEvents import
  if (!c.includes('appEvents')) {
    c = c.replace(
      `import api from '../services/api';`,
      `import api from '../services/api';
import { appEvents } from '../utils/appEvents';`
    );
  }

  // Listen for categoryDone event
  c = c.replace(
    `  useEffect(() => {
    if (user) {
      api.get('/categories/my')
        .then(res => { const cats = res.data.categories||[]; console.log('Categories found:', cats.length); setHasCategories(cats.length > 0); })
        .catch((err) => { console.log('Categories error:', err.message); setHasCategories(false); })
        .finally(() => setCategoryChecked(true));
    } else {
      setCategoryChecked(false);
      setHasCategories(true);
    }
  }, [user]);`,
    `  useEffect(() => {
    if (user) {
      api.get('/categories/my')
        .then(res => { const cats = res.data.categories||[]; setHasCategories(cats.length > 0); })
        .catch(() => setHasCategories(false))
        .finally(() => setCategoryChecked(true));
    } else {
      setCategoryChecked(false);
      setHasCategories(true);
    }
  }, [user]);

  useEffect(() => {
    const handler = () => { setHasCategories(true); setCategoryChecked(true); };
    appEvents.on('categoryDone', handler);
    return () => appEvents.off('categoryDone', handler);
  }, []);`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed:', path, '| appEvents:', c.includes('appEvents'));
});

// Fix CategoryPickerScreen to emit event instead of reset
['C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js',
 'C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js'].forEach(path => {
  let c = fs.readFileSync(path, 'utf8');

  if (!c.includes('appEvents')) {
    c = c.replace(
      `import { CommonActions } from '@react-navigation/native';`,
      `import { CommonActions } from '@react-navigation/native';
import { appEvents } from '../utils/appEvents';`
    );
  }

  c = c.replace(
    `navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'MainStack' }] }));`,
    `appEvents.emit('categoryDone');`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed:', path, '| appEvents emit:', c.includes("emit('categoryDone')"));
});
