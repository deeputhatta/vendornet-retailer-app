const fs = require('fs');

['C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js',
 'C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js'].forEach(path => {
  let c = fs.readFileSync(path, 'utf8');

  // Fix footer styles to be compact
  c = c.replace(
    /footer: \{[^}]+\},/,
    `footer: { paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },`
  );
  c = c.replace(
    /footerCount: \{[^}]+\},/,
    `footerCount: { fontSize: 15, fontWeight: '800' },`
  );
  c = c.replace(
    /saveBtn: \{[^}]+\},/,
    `saveBtn: { borderRadius: 10, height: 38, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },`
  );
  c = c.replace(
    /cancelBtn: \{[^}]+\},/,
    `cancelBtn: { borderRadius: 10, height: 38, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },`
  );
  c = c.replace(
    /saveBtnText: \{[^}]+\},/,
    `saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },`
  );

  // Add paddingBottom dynamic based on insets but smaller
  c = c.replace(
    `paddingBottom: Math.max(insets.bottom + 8, 16),`,
    `paddingBottom: Math.max(insets.bottom + 4, 8),`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed footer:', path);
});
