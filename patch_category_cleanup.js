const fs = require('fs');
let c = fs.readFileSync('./src/navigation/AppNavigator.js', 'utf8');

// Remove ALL occurrences of categoryChecked state blocks (could be multiple)
// Use a more aggressive removal
while (c.includes('categoryChecked')) {
  const start = c.lastIndexOf('const [categoryChecked');
  if (start === -1) break;
  // Find the end of the useEffect block
  let end = c.indexOf('}, [user]);', start);
  if (end === -1) {
    // Just remove the useState line
    end = c.indexOf('\n', start);
  } else {
    end += '}, [user]);'.length;
  }
  c = c.substring(0, start) + c.substring(end);
}

console.log('categoryChecked remaining:', c.includes('categoryChecked'));

// Now find AppNavigator and insert state ONLY ONCE
const appNavIdx = c.indexOf('export default function AppNavigator()');
const useAuthLine = 'const { user, loading } = useAuth();';
const useAuthIdx = c.indexOf(useAuthLine, appNavIdx);

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

const insertAt = useAuthIdx + useAuthLine.length;
c = c.substring(0, insertAt) + stateCode + c.substring(insertAt);

fs.writeFileSync('./src/navigation/AppNavigator.js', c);
console.log('categoryChecked count:', (c.match(/categoryChecked/g)||[]).length);
console.log('CategorySetup:', c.includes('CategorySetup'));

// Verify placement
const idx = c.indexOf('categoryChecked');
console.log('Context before:', c.substring(idx-150, idx).slice(-50));
