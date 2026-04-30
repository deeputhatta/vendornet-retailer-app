const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

// Fix all corrupted links first
c = c.replace(/\[([a-zA-Z0-9_.]+)\]\(http:\/\/[^\)]+\)/g, '$1');

// Find where we re-fetch offers after myCategories loads and add new arrivals too
c = c.replace(
  `          } catch(e) {}
        }
      }`,
  `          } catch(e) {}
          // Re-fetch new arrivals filtered by categories
          try {
            const filteredNew = await api.get('/listings/?new_arrivals=true&days=7&limit=8&category_ids=' + myCats.join(','));
            const newList = (filteredNew.data.listings || []).map(l => ({
              ...l,
              effective_price: l.offer_price && parseFloat(l.offer_price) < parseFloat(l.price) ? parseFloat(l.offer_price) : parseFloat(l.price),
              has_offer: !!(l.offer_price && parseFloat(l.offer_price) < parseFloat(l.price)),
            }));
            setNewArrivals(newList);
          } catch(e) {}
        }
      }`
);

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Done');
