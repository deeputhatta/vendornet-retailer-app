const fs = require('fs');
let c = fs.readFileSync('./src/screens/HomeScreen.js', 'utf8');

// Fix 1: Remove wrong AsyncStorage import from react-native
c = c.replace(
  `import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, StatusBar,
  Dimensions, AsyncStorage
} from 'react-native';
import AsyncStorageLib from '@react-native-async-storage/async-storage';`,
  `import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, StatusBar,
  Dimensions
} from 'react-native';
import AsyncStorageLib from '@react-native-async-storage/async-storage';`
);

// Fix 2: Add null safety to activeCategories and otherCategories
c = c.replace(
  `  const activeCategories = categories.filter(cat => myCategories.includes(cat.category_id));
  const otherCategories = categories.filter(cat => !myCategories.includes(cat.category_id));`,
  `  const activeCategories = (categories || []).filter(cat => cat && myCategories.includes(cat.category_id));
  const otherCategories = (categories || []).filter(cat => cat && !myCategories.includes(cat.category_id));`
);

// Fix 3: Add null safety to spotlight name
c = c.replace(
  `<Text style={styles.spotlightAvatarText}>{(spotlight.business_name || spotlight.name)?.charAt(0)}</Text>`,
  `<Text style={styles.spotlightAvatarText}>{((spotlight.business_name || spotlight.name) || 'W').charAt(0)}</Text>`
);

fs.writeFileSync('./src/screens/HomeScreen.js', c);
console.log('Fixed');
