const fs = require('fs');
let c = fs.readFileSync('./src/screens/HomeScreen.js', 'utf8');

// Find the category grid section using a unique string that's definitely there
const marker = 'onPress={() => navigation.navigate(\'Category\', { category: cat })}';

if (!c.includes('categoryCardActive')) {
  // Replace the entire categories.map block
  const oldMap = `            {categories.map(cat => (
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
            ))}`;

  const newMap = `            {/* Active categories first */}
            {categories.filter(cat => myCategories.includes(cat.category_id)).map(cat => (
              <TouchableOpacity
                key={'active-' + cat.category_id}
                style={[styles.categoryCard, styles.categoryCardActive]}
                onPress={() => navigation.navigate('Category', { category: cat })}
                activeOpacity={0.8}>
                <View style={[styles.emojiBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat.slug)}</Text>
                </View>
                <Text style={[styles.categoryName, { color: '#fff' }]} numberOfLines={2}>{cat.name}</Text>
                <View style={styles.activeDot} />
              </TouchableOpacity>
            ))}
            {/* Other categories dimmed */}
            {categories.filter(cat => !myCategories.includes(cat.category_id)).map(cat => (
              <TouchableOpacity
                key={'other-' + cat.category_id}
                style={[styles.categoryCard, {
                  backgroundColor: c.surface,
                  shadowColor: c.text,
                  borderColor: c.borderLight,
                  opacity: myCategories.length > 0 ? 0.4 : 1,
                }]}
                onPress={() => navigation.navigate('Category', { category: cat })}
                activeOpacity={0.8}>
                <View style={[styles.emojiBox, { backgroundColor: c.primaryLight }]}>
                  <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat.slug)}</Text>
                </View>
                <Text style={[styles.categoryName, { color: c.text }]} numberOfLines={2}>{cat.name}</Text>
              </TouchableOpacity>
            ))}`;

  if (c.includes(oldMap)) {
    c = c.replace(oldMap, newMap);
    console.log('Grid replaced successfully');
  } else {
    console.log('Grid pattern not found — trying line count approach');
    // Find the categories.map and replace it
    const start = c.indexOf('{categories.map(cat => (');
    const end = c.indexOf('))}', start) + 3;
    if (start > -1) {
      console.log('Found at:', start, 'to', end);
      console.log('Old content:', c.substring(start, end));
      c = c.substring(0, start) + newMap + c.substring(end);
      console.log('Replaced via index');
    } else {
      console.log('Cannot find categories.map');
    }
  }

  // Add styles
  c = c.replace(
    `  categoryName: { fontSize: 11, textAlign: 'center', fontWeight: '600', lineHeight: 16 },`,
    `  categoryName: { fontSize: 11, textAlign: 'center', fontWeight: '600', lineHeight: 16 },
  categoryCardActive: { backgroundColor: '#185FA5', borderColor: '#185FA5', elevation: 4, shadowColor: '#185FA5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F2C94C', marginTop: 4 },
  sectionSub: { fontSize: 11, marginTop: 2 },
  editCatBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#e6f1fb' },
  editCatText: { fontSize: 12, fontWeight: '600', color: '#185FA5' },`
  );

  fs.writeFileSync('./src/screens/HomeScreen.js', c);
  console.log('Done');
} else {
  console.log('Already patched');
}
