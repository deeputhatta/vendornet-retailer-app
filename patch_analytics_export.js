const fs = require('fs');
let c = fs.readFileSync('./src/screens/AnalyticsScreen.js', 'utf8');

// 1. Add imports
c = c.replace(
  `import api from '../services/api';
import { useTheme } from '../context/ThemeContext';`,
  `import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';`
);

// 2. Add navigation prop and sharing state
c = c.replace(
  `export default function AnalyticsScreen() {`,
  `export default function AnalyticsScreen({ navigation }) {`
);

c = c.replace(
  `  const { theme } = useTheme();`,
  `  const [sharing, setSharing] = useState(false);
  const { theme } = useTheme();`
);

// 3. Add share report function before return
c = c.replace(
  `  if (loading) return (`,
  `  const shareReport = async () => {
    if (!analytics) return;
    setSharing(true);
    try {
      const summary = analytics.summary || {};
      const topItems = analytics.top_items || [];
      const topWholesalers = analytics.top_wholesalers || [];
      const statusBreakdown = analytics.status_breakdown || [];
      const monthlyData = getMonthlyData();
      const avgOrderValue = summary.total_orders > 0 ? summary.total_spend / summary.total_orders : 0;

      let csv = '';

      // Summary
      csv += 'VENDORNET — PURCHASE ANALYTICS REPORT\\n';
      csv += \`Financial Year: FY \${selectedFY}\\n\`;
      csv += \`Generated: \${new Date().toLocaleString('en-IN')}\\n\\n\`;

      csv += '== SUMMARY ==\\n';
      csv += \`Total Spent,₹\${summary.total_spend?.toFixed(2) || 0}\\n\`;
      csv += \`Total Orders,\${summary.total_orders || 0}\\n\`;
      csv += \`Average Order Value,₹\${avgOrderValue.toFixed(2)}\\n\`;
      csv += \`Total Suppliers,\${topWholesalers.length}\\n\\n\`;

      // Monthly spend
      csv += '== MONTHLY SPEND ==\\n';
      csv += 'Month,Spend (₹),Orders\\n';
      const MONTHS_LIST = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
      const MONTH_NUMS_LIST = [4,5,6,7,8,9,10,11,12,1,2,3];
      MONTHS_LIST.forEach((month, i) => {
        const found = analytics.monthly_spend?.find(r => parseInt(r.month) === MONTH_NUMS_LIST[i]);
        csv += \`\${month},\${found ? parseFloat(found.spend).toFixed(2) : 0},\${found ? found.orders : 0}\\n\`;
      });
      csv += '\\n';

      // Top items
      csv += '== TOP PURCHASED ITEMS ==\\n';
      csv += 'Product,Brand,Qty Ordered,Total Spent (₹)\\n';
      topItems.forEach(item => {
        csv += \`\${item.generic_name},\${item.brand_name},\${item.total_qty},\${parseFloat(item.total_spend || 0).toFixed(2)}\\n\`;
      });
      csv += '\\n';

      // Top wholesalers
      csv += '== TOP SUPPLIERS ==\\n';
      csv += 'Supplier,Orders,Total Spent (₹)\\n';
      topWholesalers.forEach(w => {
        csv += \`\${w.wholesaler_name},\${w.order_count},\${parseFloat(w.total_spent || 0).toFixed(2)}\\n\`;
      });
      csv += '\\n';

      // Status breakdown
      csv += '== ORDER STATUS BREAKDOWN ==\\n';
      csv += 'Status,Count\\n';
      statusBreakdown.forEach(s => {
        csv += \`\${s.status},\${s.count}\\n\`;
      });

      // Write file
      const fileName = \`VendorNet_Analytics_FY\${selectedFY.replace('-','_')}.csv\`;
      const filePath = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });

      // Share
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: \`Analytics Report FY \${selectedFY}\`,
        });
      }
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setSharing(false);
    }
  };

  if (loading) return (`
);

// 4. Add download button to hero section
c = c.replace(
  `        <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={styles.heroBadgeText}>FY {selectedFY}</Text>
          </View>`,
  `          <View style={styles.heroTopRight}>
            <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={styles.heroBadgeText}>FY {selectedFY}</Text>
            </View>
            <TouchableOpacity
              style={[styles.downloadBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={shareReport}
              disabled={sharing}>
              {sharing
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.downloadBtnText}>⬇ Export</Text>
              }
            </TouchableOpacity>
          </View>`
);

// 5. Add styles
c = c.replace(
  `  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },`,
  `  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  heroTopRight: { alignItems: 'flex-end', gap: 8 },
  downloadBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  downloadBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },`
);

fs.writeFileSync('./src/screens/AnalyticsScreen.js', c);
console.log('Done');
console.log('shareReport found:', c.includes('shareReport'));
console.log('expo-file-system found:', c.includes('expo-file-system'));
