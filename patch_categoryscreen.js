const fs = require('fs');
let c = fs.readFileSync('./src/screens/CategoryScreen.js', 'utf8');

// Fix 1: Extract wholesaler_id from params safely
c = c.replace(
  `export default function CategoryScreen({ route, navigation }) {
  const { category } = route.params;`,
  `export default function CategoryScreen({ route, navigation }) {
  const { category, wholesaler_id } = route.params || {};`
);

// Fix 2: Update loadListings to support wholesaler_id filter
c = c.replace(
  `  const loadListings = async () => {
    try {
      const res = await listingsAPI.getListings({ category_id: category.category_id });
      setListings(res.data.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };`,
  `  const loadListings = async () => {
    try {
      const params = {};
      if (category?.category_id) params.category_id = category.category_id;
      if (wholesaler_id) params.wholesaler_id = wholesaler_id;
      const res = await listingsAPI.getListings(params);
      setListings(res.data.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };`
);

// Fix 3: Update header to show wholesaler name or category name safely
c = c.replace(
  `        <Text style={styles.headerTitle}>{category.name}</Text>`,
  `        <Text style={styles.headerTitle}>{category?.name || 'All Products'}</Text>`
);

fs.writeFileSync('./src/screens/CategoryScreen.js', c);
console.log('Done');
