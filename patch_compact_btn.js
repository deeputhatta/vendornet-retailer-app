const fs = require('fs');
let a = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/AnalyticsScreen.js', 'utf8');

// Make button more compact - shorter padding and text
a = a.replace(
  `paddingHorizontal:16,paddingVertical:12,flexDirection:'row',alignItems:'center',gap:6,borderWidth:1,borderColor:'rgba(255,255,255,0.3)'}}`,
  `paddingHorizontal:10,paddingVertical:7,flexDirection:'row',alignItems:'center',gap:4,borderWidth:1,borderColor:'rgba(255,255,255,0.3)'}`
);

// Shorten button text
a = a.replace(
  `<Text style={{fontSize:16}}>\uD83D\uDCE5</Text><Text style={{color:'#fff',fontWeight:'800',fontSize:14}}>  Download Report</Text>`,
  `<Text style={{fontSize:14}}>\uD83D\uDCE5</Text><Text style={{color:'#fff',fontWeight:'700',fontSize:12}}> Export</Text>`
);

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/AnalyticsScreen.js', a);
console.log('Done');
