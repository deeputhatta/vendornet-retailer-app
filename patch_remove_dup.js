const fs = require('fs');

['C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js',
 'C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js'].forEach(path => {
  let c = fs.readFileSync(path, 'utf8');
  const marker = "const [searchQuery, setSearchQuery] = useState('');";
  const first = c.indexOf(marker);
  const second = c.indexOf(marker, first + 1);
  if (second > -1) {
    c = c.substring(0, second) + c.substring(second + marker.length);
    fs.writeFileSync(path, c);
    console.log('Fixed:', path, '| count:', (c.match(/searchQuery/g)||[]).length);
  } else {
    console.log('No duplicate in:', path);
  }
});
