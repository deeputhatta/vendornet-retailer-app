const fs = require('fs');
let c = fs.readFileSync('./src/screens/ProfileScreen.js', 'utf8');

// Remove theme toggle row
const themeStart = c.indexOf('{/* Theme Toggle Row */}');
const themeEnd = c.indexOf('</View>', c.indexOf('toggleTheme', themeStart)) + '</View>'.length;

if (themeStart > -1) {
  c = c.substring(0, themeStart) + c.substring(themeEnd);
  console.log('Theme toggle removed');
} else {
  console.log('Not found with that marker, trying isDark...');
  // Find the View containing isDark
  const rowStart = c.lastIndexOf('<View style={[styles.row', c.indexOf('isDark'));
  const rowEnd = c.indexOf('</View>', c.indexOf('toggleTheme', rowStart)) + '</View>'.length;
  console.log('rowStart:', rowStart, 'rowEnd:', rowEnd);
  c = c.substring(0, rowStart) + c.substring(rowEnd);
  console.log('Removed via isDark');
}

// Remove isDark and toggleTheme from useTheme
c = c.replace(
  `const { theme, isDark, toggleTheme } = useTheme();`,
  `const { theme } = useTheme();`
);

fs.writeFileSync('./src/screens/ProfileScreen.js', c);
console.log('isDark remaining:', (c.match(/isDark/g)||[]).length);
console.log('toggleTheme remaining:', c.includes('toggleTheme'));
