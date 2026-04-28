const fs = require('fs');

[
  'C:/Users/leksh/retailer-app2/src/screens/ReportDownloadScreen.js',
  'C:/Users/leksh/wholesaler-app/src/screens/ReportDownloadScreen.js'
].forEach(path => {
  let c = fs.readFileSync(path, 'utf8');

  // Fix From date display
  c = c.replace(
    `{customFrom || 'Select date'}`,
    `{customFrom ? formatDisplayDate(customFrom) : 'DD/MM/YYYY'}`
  );

  // Fix To date display
  c = c.replace(
    `{customTo || 'Select date'}`,
    `{customTo ? formatDisplayDate(customTo) : 'DD/MM/YYYY'}`
  );

  // Also fix wholesaler version which may use different text
  c = c.replace(
    `{customFrom ? formatDisplayDate(customFrom) : 'DD/MM/YYYY'} 📅`,
    `{customFrom ? formatDisplayDate(customFrom) : 'DD/MM/YYYY'}`
  );
  c = c.replace(
    `{customTo ? formatDisplayDate(customTo) : 'DD/MM/YYYY'} 📅`,
    `{customTo ? formatDisplayDate(customTo) : 'DD/MM/YYYY'}`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed:', path);
  console.log('formatDisplayDate in From:', c.includes("customFrom ? formatDisplayDate(customFrom)"));
  console.log('formatDisplayDate in To:', c.includes("customTo ? formatDisplayDate(customTo)"));
});
