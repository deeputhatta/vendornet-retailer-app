const fs = require('fs');
let c = fs.readFileSync('src/screens/ProfileScreen.js', 'utf8');

// Add fullUser state
c = c.replace(
  "  const [stats, setStats] = useState(null);",
  "  const [stats, setStats] = useState(null);\n  const [fullUser, setFullUser] = useState(null);"
);

// Load full user in loadStats
c = c.replace(
  "  const loadStats = async () => {\n    try {\n      const res = await api.get('/orders/retailer-analytics');",
  `  const loadStats = async () => {
    try {
      const [analyticsRes, userRes] = await Promise.allSettled([
        api.get('/orders/retailer-analytics'),
        api.get('/users/me'),
      ]);
      if (userRes.status === 'fulfilled') setFullUser(userRes.value.data.user);
      const res = analyticsRes;`
);

// Use fullUser for address and gstin display
c = c.replace(
  "        {user?.address && <MenuItem icon=\"📍\" label=\"Address\" value={user.address} arrow={false} />}",
  "        {(fullUser?.address || user?.address) && <MenuItem icon=\"📍\" label=\"Address\" value={fullUser?.address || user?.address} arrow={false} />}"
);
c = c.replace(
  "        {user?.pincode && <MenuItem icon=\"🗺\" label=\"Pincode\" value={user.pincode} arrow={false} />}",
  "        {(fullUser?.pincode || user?.pincode) && <MenuItem icon=\"🗺\" label=\"Pincode\" value={fullUser?.pincode || user?.pincode} arrow={false} />}"
);
c = c.replace(
  "        {user?.gstin && <MenuItem icon=\"📋\" label=\"GSTIN\" value={user.gstin} arrow={false} />}",
  "        {(fullUser?.gstin || user?.gstin) && <MenuItem icon=\"📋\" label=\"GSTIN\" value={fullUser?.gstin || user?.gstin} arrow={false} />}"
);
c = c.replace(
  "        {user?.email && <MenuItem icon=\"📧\" label=\"Email\" value={user.email} arrow={false} />}",
  "        {(fullUser?.email || user?.email) && <MenuItem icon=\"📧\" label=\"Email\" value={fullUser?.email || user?.email} arrow={false} />}"
);

fs.writeFileSync('src/screens/ProfileScreen.js', c);
console.log('done');
