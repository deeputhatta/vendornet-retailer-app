const fs = require('fs');
let c = fs.readFileSync('src/components/ReviewSection.js', 'utf8');

// Add title and subtitle props
c = c.replace(
  'export default function ReviewSection({ entityType, entityId, colors: c }) {',
  'export default function ReviewSection({ entityType, entityId, colors: c, title = "Reviews", subtitle = null }) {'
);

// Use title and subtitle in header
c = c.replace(
  '      <View style={styles.header}>\n        <Text style={[styles.title, { color: c.text }]}>Reviews</Text>',
  '      <View style={styles.header}>\n        <View>\n          <Text style={[styles.title, { color: c.text }]}>{title}</Text>\n          {subtitle && <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>{subtitle}</Text>}\n        </View>'
);

c = c.replace(
  '        {totalReviews > 0 && (\n          <View style={styles.statsRow}>',
  '        </View>\n        {totalReviews > 0 && (\n          <View style={styles.statsRow}>'
);

// Remove the extra closing tag we just added wrongly - fix structure
c = c.replace(
  '      <View style={styles.header}>\n        <View>\n          <Text style={[styles.title, { color: c.text }]}>{title}</Text>\n          {subtitle && <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>{subtitle}</Text>}\n        </View>\n        </View>\n        {totalReviews > 0 && (\n          <View style={styles.statsRow}>',
  '      <View style={styles.header}>\n        <View style={{ flex: 1 }}>\n          <Text style={[styles.title, { color: c.text }]}>{title}</Text>\n          {subtitle && <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>{subtitle}</Text>}\n        </View>\n        {totalReviews > 0 && (\n          <View style={styles.statsRow}>'
);

fs.writeFileSync('src/components/ReviewSection.js', c);
console.log('ReviewSection fixed');
