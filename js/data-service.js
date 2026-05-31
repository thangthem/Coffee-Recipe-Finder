const DataService = (() => {
  let _recipes = [];

  async function load() {
    try {
      const res = await fetch('data/recipes.json');
      if (!res.ok) throw new Error('fetch failed');
      _recipes = await res.json();
    } catch {
      // Fallback: inline data for file:// protocol
      _recipes = RECIPES_INLINE;
    }
    return _recipes;
  }

  function filter(tool, preference) {
    return _recipes.filter(
      r => r.tool === tool && (!r.preference || r.preference === preference)
    );
  }

  function search(query, pool = _recipes) {
    const q = query.toLowerCase().trim();
    if (!q) return pool;
    return pool.filter(r => {
      const haystack = [
        r.coffee.name,
        r.coffee.origin,
        ...r.coffee.notes,
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  function getById(id) {
    return _recipes.find(r => r.id === id) || null;
  }

  function getAll() { return _recipes; }

  // ── Inline fallback (mirrors data/recipes.json) ─────────────────────
  // NOTE: kept minimal — full data loads via fetch in normal operation
  const RECIPES_INLINE = [
    {
      id: 1, tool: 'PHIN', preference: 'BALANCED', score: 4.8,
      description: 'A classic Vietnamese phin experience with rich cocoa sweetness and a smooth, lingering finish.',
      coffee: { name: 'Lâm Đồng Arabica', origin: 'Vietnam', notes: ['Chocolate', 'Nutty', 'Sweet'] },
      recipe: { ratio: '1:5', temperature: 96, grind: 'Medium', waterPPM: '55-60', brewTime: '5 min', milkRatio: '1:2' },
      steps: [
        { name: 'Bloom',  water: '30g',  start: 0,   end: 30  },
        { name: 'Pour 1', water: '70g',  start: 30,  end: 120 },
        { name: 'Pour 2', water: '100g', start: 120, end: 240 },
        { name: 'Finish', water: '0g',   start: 240, end: 300 },
      ],
    },
    {
      id: 2, tool: 'PHIN', preference: 'BALANCED', score: 4.6,
      description: 'A soft mountain blend with caramel sweetness and almond notes — ideal as a daily morning ritual.',
      coffee: { name: 'Da Lat Mountain Blend', origin: 'Vietnam', notes: ['Caramel', 'Almond', 'Brown Sugar'] },
      recipe: { ratio: '1:5', temperature: 94, grind: 'Medium-Coarse', waterPPM: '50-65', brewTime: '6 min', milkRatio: '1:1.5' },
      steps: [
        { name: 'Bloom',  water: '25g',  start: 0,   end: 30  },
        { name: 'Pour 1', water: '75g',  start: 30,  end: 150 },
        { name: 'Pour 2', water: '100g', start: 150, end: 300 },
        { name: 'Finish', water: '0g',   start: 300, end: 360 },
      ],
    },
    {
      id: 3, tool: 'PHIN', preference: 'FRUITY', score: 4.7,
      description: 'Bright citrus acidity with a clean, tea-like finish — surprising complexity from the phin.',
      coffee: { name: 'Cầu Đất Washed', origin: 'Vietnam', notes: ['Citrus', 'Peach', 'Floral'] },
      recipe: { ratio: '1:6', temperature: 92, grind: 'Medium-Fine', waterPPM: '50-55', brewTime: '4 min', milkRatio: 'None' },
      steps: [
        { name: 'Bloom',  water: '20g', start: 0,   end: 30  },
        { name: 'Pour 1', water: '60g', start: 30,  end: 90  },
        { name: 'Pour 2', water: '80g', start: 90,  end: 180 },
        { name: 'Finish', water: '0g',  start: 180, end: 240 },
      ],
    },
    {
      id: 4, tool: 'PHIN', preference: 'FRUITY', score: 4.5,
      description: 'A natural processed Bourbon with tropical sweetness and a floral jasmine aroma.',
      coffee: { name: 'Bourbon Yellow Natural', origin: 'Vietnam', notes: ['Tropical Fruit', 'Honey', 'Jasmine'] },
      recipe: { ratio: '1:6', temperature: 90, grind: 'Medium', waterPPM: '45-55', brewTime: '5 min', milkRatio: 'None' },
      steps: [
        { name: 'Bloom',  water: '25g', start: 0,   end: 45  },
        { name: 'Pour 1', water: '75g', start: 45,  end: 150 },
        { name: 'Pour 2', water: '75g', start: 150, end: 270 },
        { name: 'Finish', water: '0g',  start: 270, end: 300 },
      ],
    },
    {
      id: 5, tool: 'PHIN', preference: 'STRONG', score: 4.9,
      description: 'Intense Robusta with a smoky depth and heavy body — the real deal Vietnamese ca phe.',
      coffee: { name: 'Moka Robusta Blend', origin: 'Vietnam', notes: ['Dark Chocolate', 'Smoky', 'Heavy Body'] },
      recipe: { ratio: '1:3', temperature: 97, grind: 'Fine', waterPPM: '60-80', brewTime: '7 min', milkRatio: '1:3' },
      steps: [
        { name: 'Bloom',  water: '20g', start: 0,   end: 30  },
        { name: 'Pour 1', water: '40g', start: 30,  end: 180 },
        { name: 'Pour 2', water: '40g', start: 180, end: 360 },
        { name: 'Finish', water: '0g',  start: 360, end: 420 },
      ],
    },
    {
      id: 6, tool: 'PHIN', preference: 'STRONG', score: 4.7,
      description: 'Bold and uncompromising — a Vietnamese coffee icon with deep, roasty bitterness.',
      coffee: { name: 'Trung Nguyen Classic', origin: 'Vietnam', notes: ['Espresso-like', 'Bitter', 'Bold'] },
      recipe: { ratio: '1:4', temperature: 98, grind: 'Fine-Medium', waterPPM: '65-75', brewTime: '6 min', milkRatio: '1:2' },
      steps: [
        { name: 'Bloom',  water: '20g', start: 0,   end: 30  },
        { name: 'Pour 1', water: '50g', start: 30,  end: 150 },
        { name: 'Pour 2', water: '50g', start: 150, end: 300 },
        { name: 'Finish', water: '0g',  start: 300, end: 360 },
      ],
    },
    {
      id: 7, tool: 'ESPRESSO', preference: 'BALANCED', score: 4.8,
      description: 'A silky, balanced shot with hazelnut warmth and a clean milk-chocolate finish.',
      coffee: { name: 'Central Highlands Blend', origin: 'Vietnam', notes: ['Hazelnut', 'Milk Chocolate', 'Smooth'] },
      recipe: { ratio: '1:2', temperature: 93, grind: 'Fine', waterPPM: '50-60', brewTime: '28 sec', milkRatio: '1:4' },
      steps: [
        { name: 'Pre-infuse', water: '5g',  start: 0,  end: 8  },
        { name: 'Extract',    water: '35g', start: 8,  end: 28 },
        { name: 'Finish',     water: '0g',  start: 28, end: 30 },
      ],
    },
    {
      id: 8, tool: 'ESPRESSO', preference: 'BALANCED', score: 4.6,
      description: 'Elegant SL28 with orange-peel brightness balanced by sweet caramel — versatile for any milk drink.',
      coffee: { name: 'SL28 Vietnam', origin: 'Vietnam', notes: ['Caramel', 'Orange Peel', 'Balanced Acidity'] },
      recipe: { ratio: '1:2.2', temperature: 94, grind: 'Fine', waterPPM: '50-65', brewTime: '30 sec', milkRatio: '1:3' },
      steps: [
        { name: 'Pre-infuse', water: '5g',  start: 0,  end: 10 },
        { name: 'Extract',    water: '45g', start: 10, end: 30 },
        { name: 'Finish',     water: '0g',  start: 30, end: 32 },
      ],
    },
    {
      id: 9, tool: 'ESPRESSO', preference: 'FRUITY', score: 4.9,
      description: 'A honey processed jewel bursting with stone fruit and vibrant acidity — exceptional as a straight shot.',
      coffee: { name: 'Da Lat Honey Process', origin: 'Vietnam', notes: ['Apricot', 'Grape', 'Bright Acidity'] },
      recipe: { ratio: '1:2.5', temperature: 92, grind: 'Fine', waterPPM: '45-55', brewTime: '32 sec', milkRatio: 'None' },
      steps: [
        { name: 'Pre-infuse', water: '4g',  start: 0,  end: 8  },
        { name: 'Extract',    water: '51g', start: 8,  end: 32 },
        { name: 'Finish',     water: '0g',  start: 32, end: 34 },
      ],
    },
    {
      id: 10, tool: 'ESPRESSO', preference: 'FRUITY', score: 4.7,
      description: "Vietnam's rare Gesha — bergamot elegance and blueberry sweetness in a cup that challenges expectations.",
      coffee: { name: 'Gesha Vietnam', origin: 'Vietnam', notes: ['Bergamot', 'Blueberry', 'Floral'] },
      recipe: { ratio: '1:3', temperature: 91, grind: 'Fine', waterPPM: '40-50', brewTime: '35 sec', milkRatio: 'None' },
      steps: [
        { name: 'Pre-infuse', water: '3g',  start: 0,  end: 10 },
        { name: 'Extract',    water: '57g', start: 10, end: 35 },
        { name: 'Finish',     water: '0g',  start: 35, end: 37 },
      ],
    },
    {
      id: 11, tool: 'ESPRESSO', preference: 'STRONG', score: 4.8,
      description: 'A ristretto-style powerhouse with tobacco depth and dark chocolate intensity.',
      coffee: { name: 'Italian Style Blend', origin: 'Vietnam / Brazil', notes: ['Dark Chocolate', 'Tobacco', 'Intense'] },
      recipe: { ratio: '1:1.5', temperature: 95, grind: 'Extra Fine', waterPPM: '70-80', brewTime: '25 sec', milkRatio: '1:5' },
      steps: [
        { name: 'Pre-infuse', water: '5g',  start: 0,  end: 6  },
        { name: 'Extract',    water: '20g', start: 6,  end: 25 },
        { name: 'Finish',     water: '0g',  start: 25, end: 27 },
      ],
    },
    {
      id: 12, tool: 'ESPRESSO', preference: 'STRONG', score: 4.6,
      description: 'Dark and punchy with burnt caramel sweetness and a cedar-like dry finish.',
      coffee: { name: 'Dark Roast Espresso', origin: 'Vietnam', notes: ['Burnt Caramel', 'Cedar', 'Bold Finish'] },
      recipe: { ratio: '1:1.8', temperature: 96, grind: 'Fine', waterPPM: '65-75', brewTime: '26 sec', milkRatio: '1:4' },
      steps: [
        { name: 'Pre-infuse', water: '4g',  start: 0,  end: 7  },
        { name: 'Extract',    water: '32g', start: 7,  end: 26 },
        { name: 'Finish',     water: '0g',  start: 26, end: 28 },
      ],
    },
    {
      id: 13, tool: 'FILTER', preference: 'BALANCED', score: 4.7,
      description: 'A gentle, approachable pour-over with walnut sweetness and a smooth, clean body.',
      coffee: { name: 'Kon Tum Arabica', origin: 'Vietnam', notes: ['Brown Sugar', 'Walnut', 'Smooth'] },
      recipe: { ratio: '1:15', temperature: 93, grind: 'Medium', waterPPM: '50-60', brewTime: '3:30 min', milkRatio: 'None' },
      steps: [
        { name: 'Bloom',  water: '50g',  start: 0,   end: 30  },
        { name: 'Pour 1', water: '150g', start: 30,  end: 90  },
        { name: 'Pour 2', water: '150g', start: 90,  end: 150 },
        { name: 'Pour 3', water: '150g', start: 150, end: 200 },
        { name: 'Drain',  water: '0g',   start: 200, end: 210 },
      ],
    },
    {
      id: 14, tool: 'FILTER', preference: 'BALANCED', score: 4.5,
      description: "Culi peaberry's concentrated sweetness shines in pour-over — vanilla and toffee in perfect balance.",
      coffee: { name: 'Culi Peaberry', origin: 'Vietnam', notes: ['Vanilla', 'Toffee', 'Medium Body'] },
      recipe: { ratio: '1:14', temperature: 92, grind: 'Medium-Coarse', waterPPM: '55-65', brewTime: '4 min', milkRatio: 'None' },
      steps: [
        { name: 'Bloom',  water: '40g',  start: 0,   end: 30  },
        { name: 'Pour 1', water: '130g', start: 30,  end: 90  },
        { name: 'Pour 2', water: '130g', start: 90,  end: 180 },
        { name: 'Drain',  water: '0g',   start: 180, end: 240 },
      ],
    },
    {
      id: 15, tool: 'FILTER', preference: 'FRUITY', score: 4.8,
      description: 'Washed Ethiopian-style processing brings out lemon zest and strawberry with a delicate tea-like clarity.',
      coffee: { name: 'Washed Ethiopian Style', origin: 'Vietnam', notes: ['Lemon', 'Strawberry', 'Tea-like'] },
      recipe: { ratio: '1:16', temperature: 90, grind: 'Medium-Coarse', waterPPM: '45-55', brewTime: '3 min', milkRatio: 'None' },
      steps: [
        { name: 'Bloom',  water: '30g',  start: 0,   end: 30  },
        { name: 'Pour 1', water: '120g', start: 30,  end: 75  },
        { name: 'Pour 2', water: '120g', start: 75,  end: 130 },
        { name: 'Drain',  water: '0g',   start: 130, end: 180 },
      ],
    },
    {
      id: 16, tool: 'FILTER', preference: 'FRUITY', score: 4.6,
      description: 'Honey process filter with plum and raisin notes — a sweeter, more complex fruity experience.',
      coffee: { name: 'Honey Process Filter', origin: 'Vietnam', notes: ['Plum', 'Raisin', 'Sweet Acidity'] },
      recipe: { ratio: '1:15', temperature: 91, grind: 'Medium', waterPPM: '48-58', brewTime: '3:30 min', milkRatio: 'None' },
      steps: [
        { name: 'Bloom',  water: '35g',  start: 0,   end: 35  },
        { name: 'Pour 1', water: '115g', start: 35,  end: 90  },
        { name: 'Pour 2', water: '115g', start: 90,  end: 150 },
        { name: 'Drain',  water: '0g',   start: 150, end: 210 },
      ],
    },
    {
      id: 17, tool: 'FILTER', preference: 'STRONG', score: 4.7,
      description: 'Full city roast at high concentration — dark cocoa depth with a roasted, weighty finish.',
      coffee: { name: 'Full City Roast', origin: 'Vietnam', notes: ['Dark Cocoa', 'Roasted Nut', 'Heavy'] },
      recipe: { ratio: '1:12', temperature: 96, grind: 'Medium-Fine', waterPPM: '65-75', brewTime: '4 min', milkRatio: '1:3' },
      steps: [
        { name: 'Bloom',  water: '50g',  start: 0,   end: 30  },
        { name: 'Pour 1', water: '150g', start: 30,  end: 100 },
        { name: 'Pour 2', water: '150g', start: 100, end: 190 },
        { name: 'Drain',  water: '0g',   start: 190, end: 240 },
      ],
    },
    {
      id: 18, tool: 'FILTER', preference: 'STRONG', score: 4.5,
      description: 'Northern Robusta with raw intensity — molasses and charcoal notes for the bold drinker.',
      coffee: { name: 'Yen Bai Robusta', origin: 'Vietnam', notes: ['Charcoal', 'Molasses', 'Bitter Finish'] },
      recipe: { ratio: '1:11', temperature: 97, grind: 'Fine', waterPPM: '70-80', brewTime: '4:30 min', milkRatio: '1:4' },
      steps: [
        { name: 'Bloom',  water: '45g',  start: 0,   end: 30  },
        { name: 'Pour 1', water: '135g', start: 30,  end: 120 },
        { name: 'Pour 2', water: '135g', start: 120, end: 220 },
        { name: 'Drain',  water: '0g',   start: 220, end: 270 },
      ],
    },
    {
      id: 19, tool: 'COLD_BREW', preference: 'BALANCED', score: 4.8,
      description: 'Velvety cold brew with chocolate-milk smoothness — the perfect late-night companion.',
      coffee: { name: 'Night Owl Blend', origin: 'Vietnam', notes: ['Chocolate Milk', 'Smooth', 'Mellow'] },
      recipe: { ratio: '1:8', temperature: 4, grind: 'Coarse', waterPPM: '50-65', brewTime: '12 hrs', milkRatio: '1:1' },
      steps: [
        { name: 'Coarse Grind', water: '0g',   start: 0,   end: 60  },
        { name: 'Combine',      water: '400g', start: 60,  end: 120 },
        { name: 'Steep',        water: '0g',   start: 120, end: 180, passive: true, passiveLabel: 'Refrigerate 12 hours' },
        { name: 'Filter',       water: '0g',   start: 180, end: 240 },
        { name: 'Serve',        water: '0g',   start: 240, end: 270 },
      ],
    },
    {
      id: 20, tool: 'COLD_BREW', preference: 'BALANCED', score: 4.6,
      description: 'A gentle overnight immersion yielding low-acid smoothness with dark fruit and mild sweetness.',
      coffee: { name: 'Cold Brew Classic', origin: 'Vietnam', notes: ['Dark Fruit', 'Mild Sweet', 'Low Acidity'] },
      recipe: { ratio: '1:7', temperature: 4, grind: 'Coarse', waterPPM: '55-70', brewTime: '14 hrs', milkRatio: '1:1.5' },
      steps: [
        { name: 'Coarse Grind', water: '0g',   start: 0,   end: 60  },
        { name: 'Combine',      water: '350g', start: 60,  end: 120 },
        { name: 'Steep',        water: '0g',   start: 120, end: 180, passive: true, passiveLabel: 'Refrigerate 14 hours' },
        { name: 'Filter',       water: '0g',   start: 180, end: 240 },
        { name: 'Serve',        water: '0g',   start: 240, end: 270 },
      ],
    },
    {
      id: 21, tool: 'COLD_BREW', preference: 'FRUITY', score: 4.7,
      description: 'Blackberry brightness and cherry sweetness in a refreshing cold format.',
      coffee: { name: 'Berry Cold Brew', origin: 'Vietnam', notes: ['Blackberry', 'Cherry', 'Bright'] },
      recipe: { ratio: '1:9', temperature: 4, grind: 'Coarse', waterPPM: '45-55', brewTime: '10 hrs', milkRatio: 'None' },
      steps: [
        { name: 'Coarse Grind', water: '0g',   start: 0,   end: 60  },
        { name: 'Combine',      water: '450g', start: 60,  end: 120 },
        { name: 'Steep',        water: '0g',   start: 120, end: 180, passive: true, passiveLabel: 'Refrigerate 10 hours' },
        { name: 'Filter',       water: '0g',   start: 180, end: 240 },
        { name: 'Serve',        water: '0g',   start: 240, end: 270 },
      ],
    },
    {
      id: 22, tool: 'COLD_BREW', preference: 'FRUITY', score: 4.5,
      description: 'Mango and passion fruit sweetness with floral notes — tropical cold brew that surprises every sip.',
      coffee: { name: 'Tropical Bloom', origin: 'Vietnam', notes: ['Mango', 'Passion Fruit', 'Floral'] },
      recipe: { ratio: '1:10', temperature: 4, grind: 'Coarse', waterPPM: '42-52', brewTime: '8 hrs', milkRatio: 'None' },
      steps: [
        { name: 'Coarse Grind', water: '0g',   start: 0,   end: 60  },
        { name: 'Combine',      water: '500g', start: 60,  end: 120 },
        { name: 'Steep',        water: '0g',   start: 120, end: 180, passive: true, passiveLabel: 'Refrigerate 8 hours' },
        { name: 'Filter',       water: '0g',   start: 180, end: 240 },
        { name: 'Serve',        water: '0g',   start: 240, end: 270 },
      ],
    },
    {
      id: 23, tool: 'COLD_BREW', preference: 'STRONG', score: 4.9,
      description: 'Concentrate-style cold brew with espresso-like intensity — dilute to taste or drink straight over ice.',
      coffee: { name: 'Dark Cold Brew', origin: 'Vietnam', notes: ['Espresso-like', 'Dark Chocolate', 'Bold'] },
      recipe: { ratio: '1:5', temperature: 4, grind: 'Medium-Coarse', waterPPM: '70-85', brewTime: '18 hrs', milkRatio: '1:2' },
      steps: [
        { name: 'Coarse Grind', water: '0g',   start: 0,   end: 60  },
        { name: 'Combine',      water: '250g', start: 60,  end: 120 },
        { name: 'Steep',        water: '0g',   start: 120, end: 180, passive: true, passiveLabel: 'Refrigerate 18 hours' },
        { name: 'Filter',       water: '0g',   start: 180, end: 240 },
        { name: 'Serve',        water: '0g',   start: 240, end: 270 },
      ],
    },
    {
      id: 24, tool: 'COLD_BREW', preference: 'STRONG', score: 4.7,
      description: 'Whiskey-like depth and velvety mouthfeel — a cold brew that rivals a fine dark spirit.',
      coffee: { name: 'Nitro Blend', origin: 'Vietnam', notes: ['Whiskey-like', 'Dark Fruit', 'Velvety'] },
      recipe: { ratio: '1:6', temperature: 4, grind: 'Coarse', waterPPM: '75-85', brewTime: '16 hrs', milkRatio: 'None' },
      steps: [
        { name: 'Coarse Grind', water: '0g',   start: 0,   end: 60  },
        { name: 'Combine',      water: '300g', start: 60,  end: 120 },
        { name: 'Steep',        water: '0g',   start: 120, end: 180, passive: true, passiveLabel: 'Refrigerate 16 hours' },
        { name: 'Filter',       water: '0g',   start: 180, end: 240 },
        { name: 'Serve',        water: '0g',   start: 240, end: 270 },
      ],
    },
  ];

  return { load, filter, search, getById, getAll };
})();
