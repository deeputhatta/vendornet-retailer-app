const fs = require('fs');

function fix(path) {
  let c = fs.readFileSync(path, 'utf8');

  // Add gstinChecking state
  c = c.replace(
    `  const [gstinError, setGstinError] = useState('');`,
    `  const [gstinError, setGstinError] = useState('');
  const [gstinChecking, setGstinChecking] = useState(false);`
  );

  // Add checkGSTIN function after validateGSTIN
  c = c.replace(
    `export default function LoginScreen() {`,
    `const checkGSTINUnique = async (gstin) => {
  try {
    const res = await authAPI.checkGSTIN(gstin);
    return res.data;
  } catch {
    return { exists: false };
  }
};

export default function LoginScreen() {`
  );

  // Add onBlur GSTIN check to GSTIN TextInput
  c = c.replace(
    `                  onChangeText={(v) => { setGstin(v.toUpperCase()); setGstinError(''); }}
                  maxLength={15}
                  autoCapitalize="characters"`,
    `                  onChangeText={(v) => { setGstin(v.toUpperCase()); setGstinError(''); }}
                  onBlur={async () => {
                    if (gstin.length === 15 && validateGSTIN(gstin)) {
                      setGstinChecking(true);
                      const result = await checkGSTINUnique(gstin);
                      setGstinChecking(false);
                      if (result.exists) {
                        setGstinError('This GSTIN is already registered as ' + (result.role||'').replace(/_/g,' '));
                      }
                    }
                  }}
                  maxLength={15}
                  autoCapitalize="characters"`
  );

  // Show checking indicator next to GSTIN hint
  c = c.replace(
    `                <Text style={[styles.hintText, { color: c.textMuted }]}>Mandatory for wholesaler registration</Text>`,
    `                {gstinChecking 
                  ? <Text style={[styles.hintText, { color: c.textMuted }]}>Checking GSTIN...</Text>
                  : <Text style={[styles.hintText, { color: c.textMuted }]}>Mandatory for wholesaler registration</Text>
                }`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed:', path);
  console.log('checkGSTINUnique:', c.includes('checkGSTINUnique'));
  console.log('gstinChecking:', c.includes('gstinChecking'));
}

fix('C:/Users/leksh/retailer-app2/src/screens/LoginScreen.js');
fix('C:/Users/leksh/wholesaler-app/src/screens/LoginScreen.js');
