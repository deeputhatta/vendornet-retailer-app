const fs = require('fs');

['C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js',
 'C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js'].forEach(path => {
  let c = fs.readFileSync(path, 'utf8');

  // Add CommonActions import
  if (!c.includes('CommonActions')) {
    c = c.replace(
      `import React, { useState, useEffect } from 'react';`,
      `import React, { useState, useEffect } from 'react';
import { CommonActions } from '@react-navigation/native';`
    );
  }

  // Fix onboarding navigation
  c = c.replace(
    `route?.params?.onComplete?.();`,
    `navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'MainStack' }] }));`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed:', path);
  console.log('CommonActions:', c.includes('CommonActions'));
  console.log('reset MainStack:', c.includes("name: 'MainStack'"));
});
