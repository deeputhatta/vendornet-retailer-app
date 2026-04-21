const fs = require('fs');
let c = fs.readFileSync('./src/navigation/AppNavigator.js', 'utf8');

// Fix the scrambled StaffManagement + CategoryPicker section
// Remove the broken section and replace with clean version
const broken = /\s*<Stack\.Screen\s*\n\s*name="StaffManagement"\s*\n\s*\/>\s*\n\s*<Stack\.Screen\s*\n\s*name="CategoryPicker"\s*\n\s*component=\{CategoryPickerScreen\}\s*\n\s*options=\{\{ headerShown: false \}\}\s*\n\s*component=\{StaffManagementScreen\}\s*\n\s*options=\{\{ headerShown: false \}\}\s*\n\s*\/>/;

const clean = `
        <Stack.Screen
          name="StaffManagement"
          component={StaffManagementScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CategoryPicker"
          component={CategoryPickerScreen}
          options={{ headerShown: false }}
        />`;

if (broken.test(c)) {
  c = c.replace(broken, clean);
  fs.writeFileSync('./src/navigation/AppNavigator.js', c);
  console.log('Fixed successfully');
} else {
  console.log('Pattern not matched — trying alternative fix...');
  // Alternative: find and fix manually
  const idx = c.indexOf('name="StaffManagement"');
  if (idx > -1) {
    console.log('Context around StaffManagement:');
    console.log(c.substring(idx - 20, idx + 300));
  }
}
