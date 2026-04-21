const fs = require('fs');
let c = fs.readFileSync('./src/screens/HomeScreen.js', 'utf8');

// 1. Add myCategories state
c = c.replace(
  `  const [stats, setStats] = useState(null);`,
  `  const [stats, setStats] = useState(null);
  const [myCategories, setMyCategories] = useState([]);`
);

// 2. Load myCategories on mount
c = c.replace(
  `  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);`,
  `  useEffect(() => {
    loadCategories();
    loadStats();
    loadMyCategories();
  }, []);`
);

// 3. Add loadMyCategories function after loadStats
c = c.replace(
  `  const loadStats = async () => {`,
  `  const loadMyCategories = async () => {
    try {
      const res = await api.get('/categories/my');
      setMyCategories(res.data.categories?.map(cat => cat.category_id) || []);
    } catch (err) { console.error(err); }
  };

  const loadStats = async () => {`
);

// 4. Update section header to show category info
c = c.replace(
  `          {/* â"€â"€ SECTION HEADER â"€â"€ */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              Browse Categories
            </Text>
            <Text style={[styles.sectionCount, { color: c.textMuted }]}>
              {categories.length} categories
            </Text>
          </View>`,
  `          {/* SECTION HEADER */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Browse Categories</Text>
              {myCategories.length > 0 && (
                <Text style={[styles.sectionSub, { color: c.textMuted }]}>
                  {myCategories.length} active · tap to browse
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('CategoryPicker')}
              style={[styles.editCatBtn, { backgroundColor: c.primaryLight }]}>
              <Text style={[styles.editCatText, { color: c.primary }]}>✏ Edit</Text>
            </TouchableOpacity>
          </View>`
);

// 5. Update category card rendering with active/inactive state
c = c.replace(
  `          {/* â"€â"€ CATEGORY GRID â"€â"€ */}
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.category_id}
                style={[styles.categoryCard, {
                  backgroundColor: c.surface,
                  shadowColor: c.text,
                  borderColor: c.borderLight,
                }]}
                onPress={() => navigation.navigate('Category', { category: cat })}
                activeOpacity={0.8}
              >
                <View style={[styles.emojiBox, { backgroundColor: c.primaryLight }]}>
                  <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat.slug)}</Text>
                </View>
                <Text style={[styles.categoryName, { color: c.text }]} numberOfLines={2}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>`,
  `          {/* CATEGORY GRID */}
          <View style={styles.categoryGrid}>
            {/* My categories first — active */}
            {myCategories.length > 0 && categories.filter(cat => myCategories.includes(cat.category_id)).map(cat => (
              <TouchableOpacity
                key={cat.category_id}
                style={[styles.categoryCard, styles.categoryCardActive, {
                  backgroundColor: c.primary,
                  borderColor: c.primary,
                  shadowColor: c.primary,
                }]}
                onPress={() => navigation.navigate('Category', { category: cat })}
                activeOpacity={0.8}>
                <View style={[styles.emojiBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat.slug)}</Text>
                </View>
                <Text style={[styles.categoryName, { color: '#fff' }]} numberOfLines={2}>
                  {cat.name}
                </Text>
                <View style={styles.activeDot} />
              </TouchableOpacity>
            ))}

            {/* Other categories — dimmed */}
            {categories.filter(cat => myCategories.length === 0 || !myCategories.includes(cat.category_id)).map(cat => (
              <TouchableOpacity
                key={cat.category_id}
                style={[styles.categoryCard, {
                  backgroundColor: c.surface,
                  shadowColor: c.text,
                  borderColor: c.borderLight,
                  opacity: myCategories.length > 0 ? 0.45 : 1,
                }]}
                onPress={() => navigation.navigate('Category', { category: cat })}
                activeOpacity={0.8}>
                <View style={[styles.emojiBox, { backgroundColor: c.primaryLight }]}>
                  <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat.slug)}</Text>
                </View>
                <Text style={[styles.categoryName, { color: c.text }]} numberOfLines={2}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>`
);

// 6. Add new styles
c = c.replace(
  `  categoryName: { fontSize: 11, textAlign: 'center', fontWeight: '600', lineHeight: 16 },`,
  `  categoryName: { fontSize: 11, textAlign: 'center', fontWeight: '600', lineHeight: 16 },
  categoryCardActive: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6,
  },
  activeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#F2C94C', marginTop: 4,
  },
  sectionSub: { fontSize: 11, marginTop: 2 },
  editCatBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  editCatText: { fontSize: 12, fontWeight: '600' },`
);

fs.writeFileSync('./src/screens/HomeScreen.js', c);
console.log('Done');
