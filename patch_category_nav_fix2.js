const fs = require('fs');

// The cleanest fix: pass setCategoryChecked as a route param callback
let nav = fs.readFileSync('./src/navigation/AppNavigator.js', 'utf8');

// Replace CategorySetup screen to pass onDone callback
nav = nav.replace(
  `? <Stack.Screen
              name="CategorySetup"
              component={CategoryPickerScreen}
              initialParams={{ isOnboarding: true }}
              listeners={{
                beforeRemove: () => {
                  setCategoryChecked(false);
                }
              }}
            />`,
  `? <Stack.Screen name="CategorySetup" component={CategoryPickerScreen} initialParams={{ isOnboarding: true }} />`
);

// Simpler: just watch hasCategories, re-check periodically using AppState
// Actually simplest: use a global event emitter approach
// But cleanest for RN: pass callback in initialParams

nav = nav.replace(
  `? <Stack.Screen name="CategorySetup" component={CategoryPickerScreen} initialParams={{ isOnboarding: true }} />`,
  `? <Stack.Screen 
              name="CategorySetup"
              initialParams={{ isOnboarding: true, onDone: () => { setCategoryChecked(false); } }}>
              {props => <CategoryPickerScreen {...props} />}
            </Stack.Screen>`
);

fs.writeFileSync('./src/navigation/AppNavigator.js', nav);

// Fix CategoryPickerScreen to call route.params.onDone()
let cat = fs.readFileSync('./src/screens/CategoryPickerScreen.js', 'utf8');

cat = cat.replace(
  /if \(isOnboarding\) \{[\s\S]*?\}/m,
  `if (isOnboarding) {
        route?.params?.onDone?.();
      }`
);

fs.writeFileSync('./src/screens/CategoryPickerScreen.js', cat);
console.log('Done');
console.log('onDone in nav:', nav.includes('onDone'));
console.log('onDone in cat:', cat.includes('onDone'));
