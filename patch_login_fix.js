const fs = require('fs');
let c = fs.readFileSync('./src/screens/LoginScreen.js', 'utf8');

// Fix 1: Move FormInput outside component (it's defined inside causing re-renders)
// Change FormInput from const inside component to a regular function outside
// First remove the FormInput definition from inside the component
c = c.replace(
  `  const FormInput = ({ label, value, onChangeText, placeholder, keyboardType, maxLength, error, hint, autoCapitalize }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.inputBackground, borderColor: error ? '#FF453A' : c.border, color: c.text }]}
        placeholder={placeholder}
        placeholderTextColor={c.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize || 'sentences'}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {hint ? <Text style={[styles.hintText, { color: c.textMuted }]}>{hint}</Text> : null}
    </View>
  );`,
  ``
);

// Fix 2: Make GSTIN mandatory - update label and validation
c = c.replace(
  `label="GSTIN (optional)"`,
  `label="GSTIN *"`
);
c = c.replace(
  `hint="15-character GST number (optional but recommended)"`,
  `hint="15-character GST Identification Number"`
);
c = c.replace(
  `if (gstin && !validateGSTIN(gstin)) {`,
  `if (!gstin.trim()) {
    setGstinError('GSTIN is required');
    return;
  }
  if (!validateGSTIN(gstin)) {`
);

// Fix 3: Use inline TextInput instead of FormInput component to avoid re-render issues
// Replace FormInput usages with inline TextInput blocks
c = c.replace(
  `              <FormInput
                label="GSTIN *"
                value={gstin}
                onChangeText={(v) => { setGstin(v.toUpperCase()); setGstinError(''); }}
                placeholder="e.g. 29ABCDE1234F1Z5"
                maxLength={15}
                error={gstinError}
                hint="15-character GST Identification Number"
                autoCapitalize="characters"
              />`,
  `              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { color: c.textSecondary }]}>GSTIN *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.inputBackground, borderColor: gstinError ? '#FF453A' : c.border, color: c.text }]}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  placeholderTextColor={c.placeholder}
                  value={gstin}
                  onChangeText={(v) => { setGstin(v.toUpperCase()); setGstinError(''); }}
                  maxLength={15}
                  autoCapitalize="characters"
                />
                {gstinError ? <Text style={styles.errorText}>{gstinError}</Text> : null}
                <Text style={[styles.hintText, { color: c.textMuted }]}>15-character GST Identification Number</Text>
              </View>`
);

c = c.replace(
  `              <FormInput
                label="Shop / Business Address *"
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. 123, Main Street, Koramangala"
              />`,
  `              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { color: c.textSecondary }]}>Shop / Business Address *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.inputBackground, borderColor: c.border, color: c.text }]}
                  placeholder="e.g. 123, Main Street, Koramangala"
                  placeholderTextColor={c.placeholder}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>`
);

c = c.replace(
  `              <FormInput
                label="Pincode *"
                value={pincode}
                onChangeText={setPincode}
                placeholder="e.g. 560034"
                keyboardType="numeric"
                maxLength={6}
              />`,
  `              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { color: c.textSecondary }]}>Pincode *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.inputBackground, borderColor: c.border, color: c.text }]}
                  placeholder="e.g. 560034"
                  placeholderTextColor={c.placeholder}
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>`
);

// Fix name input - also inline
c = c.replace(
  `              <FormInput
                label="Your Name / Business Name *"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Ravi Kumar Traders"
                hint="This will be shown to wholesalers"
              />`,
  `              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { color: c.textSecondary }]}>Your Name / Business Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.inputBackground, borderColor: c.border, color: c.text }]}
                  placeholder="e.g. Ravi Kumar Traders"
                  placeholderTextColor={c.placeholder}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
                <Text style={[styles.hintText, { color: c.textMuted }]}>This will be shown to wholesalers</Text>
              </View>`
);

fs.writeFileSync('./src/screens/LoginScreen.js', c);
console.log('Done');
console.log('FormInput remaining:', c.includes('const FormInput'));
console.log('GSTIN required:', c.includes('GSTIN is required'));
