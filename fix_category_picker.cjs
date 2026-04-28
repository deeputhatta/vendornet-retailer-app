const fs = require('fs');
const path = require('path');

const file = 'src/screens/CategoryPickerScreen.js';
let c = fs.readFileSync(file, 'utf8');

// 1. Fix CATEGORY_CONFIG to match new B2B categories
const newConfig = `const CATEGORY_CONFIG = {
  'Grocery & FMCG':      { icon: '🛒', color: '#e6f1fb', textColor: '#185FA5' },
  'Pharma & Medicine':   { icon: '💊', color: '#fdf4ff', textColor: '#9333ea' },
  'Stationery & Paper':  { icon: '📝', color: '#fefce8', textColor: '#ca8a04' },
  'Bags & Luggage':      { icon: '👜', color: '#fff7ed', textColor: '#ea580c' },
  'Electronics':         { icon: '📱', color: '#eff6ff', textColor: '#2563eb' },
  'Textiles & Garments': { icon: '👕', color: '#f0fdf4', textColor: '#16a34a' },
  'Food & Beverage':     { icon: '🍱', color: '#fef2f2', textColor: '#dc2626' },
  'Cleaning & Hygiene':  { icon: '🧹', color: '#e1f5ee', textColor: '#1D9E75' },
  'Hardware & Tools':    { icon: '🔧', color: '#fff7ed', textColor: '#ea580c' },
  'Others':              { icon: '📦', color: '#f8fafc', textColor: '#475569' },
};`;

// Replace old CATEGORY_CONFIG
c = c.replace(/const CATEGORY_CONFIG = \{[\s\S]*?\};/, newConfig);

// 2. Remove the fake 'others' push - Others already exists in DB with real UUID
c = c.replace(
  `      // Add Others option
      if (!cats.find(cat => cat.name === 'Others')) {
        cats.push({ category_id: 'others', name: 'Others', slug: 'others' });
      }`,
  `      // Others category comes from API with real UUID`
);

// Also fix the simple version if it exists
c = c.replace(
  `if (!cats.find(cat => cat.name === 'Others')) {
        cats.push({ category_id: 'others', name: 'Others', slug: 'others' });
      }`,
  `// Others category comes from API with real UUID`
);

fs.writeFileSync(file, c);
console.log('Fixed CategoryPickerScreen.js');
