const fs = require('fs');

['C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js',
 'C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js'].forEach(path => {
  let c = fs.readFileSync(path, 'utf8');

  // Find full footer JSX and replace
  const footerStart = c.lastIndexOf('<View style={[styles.footer,');
  const footerEnd = c.indexOf('</View>', c.indexOf('</View>', c.indexOf('</View>', footerStart) + 1) + 1) + 7;
  
  const oldFooter = c.substring(footerStart, footerEnd);
  console.log('Old footer length:', oldFooter.length);

  const newFooter = `<View style={[styles.footer, { backgroundColor: c.surface, borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
        <Text style={[styles.footerCount, { color: c.text }]}>{selected.length}/{MAX_CATEGORIES} selected</Text>
        <View style={styles.footerBtns}>
          {!isOnboarding && (
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: c.border }]} onPress={() => navigation.goBack()}>
              <Text style={[styles.cancelBtnText, { color: c.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: selected.length > 0 ? c.primary : c.border }]}
            onPress={handleSave}
            disabled={saving || selected.length === 0}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>{isOnboarding ? 'Continue →' : 'Save'}</Text>}
          </TouchableOpacity>
        </View>
      </View>`;

  c = c.substring(0, footerStart) + newFooter + c.substring(footerEnd);

  // Update footer style to be a single row
  c = c.replace(
    `footer: { paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },`,
    `footer: { paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed:', path);
});
