const fs = require('fs');
let c = fs.readFileSync('./src/screens/ReportDownloadScreen.js', 'utf8');

// Add useAuth import
c = c.replace(
  `import api from '../services/api';`,
  `import api from '../services/api';
import { useAuth } from '../context/AuthContext';`
);

// Add useAuth hook
c = c.replace(
  `  const { theme } = useTheme();`,
  `  const { user } = useAuth();
  const isAdmin = user?.role === 'retailer_admin';
  const { theme } = useTheme();`
);

// Update downloadReport to use correct endpoint based on role
c = c.replace(
  `const url = \`\${api.defaults.baseURL}/orders/retailer/excel-report?\${params}\`;`,
  `const endpoint = isAdmin ? '/orders/retailer/full-report' : '/orders/retailer/orders-report';
      const url = \`\${api.defaults.baseURL}\${endpoint}?\${params}\`;`
);

// Update filename
c = c.replace(
  `const filename = \`VendorNet_Purchase_Report_\${dateMode === 'fy' ? 'FY'+selectedFY : dateParams.from||'all'}.xlsx\`;`,
  `const filename = \`VendorNet_\${isAdmin ? 'Full' : 'Orders'}_Report_\${dateMode === 'fy' ? 'FY'+selectedFY : dateParams.from||'all'}.xlsx\`;`
);

// Update header subtitle based on role
c = c.replace(
  `<Text style={styles.subtitle}>Export your purchase history as Excel (5 sheets)</Text>`,
  `<Text style={styles.subtitle}>{isAdmin ? 'Full report: 8 sheets including analytics & savings' : 'Orders report: 5 sheets with full order details'}</Text>`
);

// Update sheet list based on role
c = c.replace(
  `        {[
          { icon: '📋', title: 'My Orders', desc: 'All orders with supplier, status, amount, dates' },
          { icon: '📊', title: 'Summary', desc: 'Total spent, avg order value, counts' },
          { icon: '📈', title: 'Status Breakdown', desc: 'Orders per status with amounts' },
          { icon: '🏪', title: 'Supplier Performance', desc: 'Top suppliers by spend, delivery rate' },
          { icon: '📦', title: 'Product Analysis', desc: 'Top products by qty ordered and spend' },
        ].map((s, i) => (`,
  `        {(isAdmin ? [
          { icon: '📊', title: 'Executive Summary', desc: 'KPIs, delivery rate, savings rate, totals' },
          { icon: '📋', title: 'All Orders', desc: 'Complete order list with all details' },
          { icon: '📦', title: 'Order Items', desc: 'Every product with MRP, offer price, savings' },
          { icon: '🏪', title: 'Supplier Performance', desc: 'Ranked by spend, delivery & rejection rates' },
          { icon: '🔍', title: 'Product Analysis', desc: 'Top products by qty and spend' },
          { icon: '🏷', title: 'Category Breakdown', desc: '% of spend by category' },
          { icon: '📅', title: 'Monthly Trend', desc: 'Month-by-month orders, spend, savings' },
          { icon: '💰', title: 'Savings Analysis', desc: 'All offer purchases with discount breakdown' },
        ] : [
          { icon: '📋', title: 'Orders', desc: 'All orders with supplier, qty, dates, status' },
          { icon: '📦', title: 'Order Items', desc: 'Every product with price, qty, savings' },
          { icon: '🏪', title: 'Supplier Summary', desc: 'Ranked by spend, delivery rate' },
          { icon: '📊', title: 'Status & KPIs', desc: 'Status breakdown with key metrics' },
          { icon: '📅', title: 'Monthly Trend', desc: 'Month-by-month spend and delivery rate' },
        ]).map((s, i) => (`
);

// Fix closing parenthesis
c = c.replace(
  `        ].map((s, i) => (
          <View key={i} style={[styles.sheetRow`,
  `        ).map((s, i) => (
          <View key={i} style={[styles.sheetRow`
);

// Update download button text
c = c.replace(
  `<Text style={styles.downloadBtnText}>📥 Download Excel Report</Text>`,
  `<Text style={styles.downloadBtnText}>{isAdmin ? '📥 Download Full Report (8 sheets)' : '📥 Download Orders Report (5 sheets)'}</Text>`
);

fs.writeFileSync('./src/screens/ReportDownloadScreen.js', c);
console.log('Done');
console.log('isAdmin found:', c.includes('isAdmin'));
console.log('full-report found:', c.includes('full-report'));
console.log('orders-report found:', c.includes('orders-report'));
