const fs = require('fs');
let c = fs.readFileSync('./src/navigation/AppNavigator.js', 'utf8');

// Remove the misplaced state from MoreScreen
c = c.replace(
  `  const [categoryChecked, setCategoryChecked] = useState(false);
  const [hasCategories, setHasCategories] = useState(true);
  useEffect(() => {
    if (user) {
      api.get('/categories/my')
        .then(res => { setHasCategories((res.data.categories||[]).length > 0); })
        .catch(() => setHasCategories(true))
        .finally(() => setCategoryChecked(true));
    } else {
      setCategoryChecked(false);
      setHasCategories(true);
    }
  }, [user]);`,
  ``
);

// Now insert correctly after AppNavigator's useAuth line
// Find AppNavigator function specifically
const appNavStart = c.indexOf('export default function AppNavigator()');
const insertMarker = 'const { user, loading } = useAuth();';
const insertIdx = c.indexOf(insertMarker, appNavStart) + insertMarker.length;

const stateCode = `
  const [categoryChecked, setCategoryChecked] = useState(false);
  const [hasCategories, setHasCategories] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/categories/my')
        .then(res => { setHasCategories((res.data.categories||[]).length > 0); })
        .catch(() => setHasCategories(true))
        .finally(() => setCategoryChecked(true));
    } else {
      setCategoryChecked(false);
      setHasCategories(true);
    }
  }, [user]);`;

c = c.substring(0, insertIdx) + stateCode + c.substring(insertIdx);

fs.writeFileSync('./src/navigation/AppNavigator.js', c);

// Verify placement
const idx = c.indexOf('categoryChecked');
console.log('Placed in:', c.substring(idx-200, idx-100).includes('AppNavigator') ? 'AppNavigator ✓' : 'wrong function ✗');
console.log('CategorySetup:', c.includes('CategorySetup'));
