const fs = require('fs');

// Fix Orders screen button
let o = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/OrdersScreen.js', 'utf8');
o = o.replace(
  `style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>`,
  `style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>`
);

// Get the Text inside the button and see what it says
const btnTextIdx = o.indexOf('ReportDownload') + 200;
const nextTextStart = o.indexOf('<Text style={{', btnTextIdx - 400);
const nextTextEnd = o.indexOf('</Text>', nextTextStart) + 7;
const oldText = o.substring(nextTextStart, nextTextEnd);
console.log('Old text:', oldText);

// Replace just the text content
o = o.replace(
  /<Text style=\{\{[\s\S]{0,50}color: '#fff'[\s\S]{0,50}\}\}>Report<\/Text>/,
  `<Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>\uD83D\uDCE5  Report</Text>`
);

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/OrdersScreen.js', o);
console.log('Orders done');

// Fix Analytics screen button  
let a = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/AnalyticsScreen.js', 'utf8');
const dlIdx = a.indexOf('Download');
console.log('Analytics Download context:', a.substring(dlIdx-150, dlIdx+100));

a = a.replace(
  /paddingHorizontal:12,paddingVertical:7\}\} onPress=\{\(\) => navigation\.getParent\(\)\?\.navigate\('ReportDownload'/,
  `paddingHorizontal:16,paddingVertical:12,flexDirection:'row',alignItems:'center',gap:6,borderWidth:1,borderColor:'rgba(255,255,255,0.3)'}} onPress={() => navigation.getParent()?.navigate('ReportDownload'`
);

a = a.replace(
  /<Text style=\{\{color:'#fff',fontWeight:'700',fontSize:12\}\}>[\s\S]{0,5}Download<\/Text>/,
  `<Text style={{fontSize:16}}>\uD83D\uDCE5</Text><Text style={{color:'#fff',fontWeight:'800',fontSize:14}}>  Download Report</Text>`
);

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/AnalyticsScreen.js', a);
console.log('Analytics done');
