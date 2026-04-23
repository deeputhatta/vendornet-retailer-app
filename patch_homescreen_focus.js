const fs = require('fs');
let c = fs.readFileSync('./src/screens/HomeScreen.js', 'utf8');

c = c.replace(
  `useEffect(() => {
    loadAll();
    loadRecentlyViewed();
  }, []);`,
  `useFocusEffect(
    React.useCallback(() => {
      loadAll();
      loadRecentlyViewed();
    }, [])
  );`
);

fs.writeFileSync('./src/screens/HomeScreen.js', c);
console.log('Fixed:', c.includes('useFocusEffect('));
