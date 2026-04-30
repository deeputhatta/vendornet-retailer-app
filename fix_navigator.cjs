const fs = require('fs');
let c = fs.readFileSync('src/navigation/AppNavigator.js', 'utf8');

// Add import
c = c.replace(
  "import ReportDownloadScreen from '../screens/ReportDownloadScreen';",
  "import ReportDownloadScreen from '../screens/ReportDownloadScreen';\nimport WholesalerListScreen from '../screens/WholesalerListScreen';"
);

// Add screen before ReportDownload
c = c.replace(
  `          name="ReportDownload"`,
  `          name="WholesalerList"
          component={WholesalerListScreen}
        />
        <Stack.Screen
          name="ReportDownload"`
);

fs.writeFileSync('src/navigation/AppNavigator.js', c);
console.log('done');
