const FOOD_REGISTRY: Array<{ key: string; path: string }> = [
  // China
  { key: 'baozi',              path: '/assets/China/baozi.png' },
  { key: 'celestial-mooncake', path: '/assets/China/CelestrialMooncake.png' },
  { key: 'dumpling',           path: '/assets/China/dumpling.png' },
  { key: 'fried-rice',         path: '/assets/China/FriedRice.png' },
  { key: 'hotpot',             path: '/assets/China/hotpot.png' },
  { key: 'mantou',             path: '/assets/China/mantou.png' },
  { key: 'mapo-tofu',          path: '/assets/China/mapotofu.png' },
  { key: 'xiaolongbao',        path: '/assets/China/xiaolongbao.png' },
  // Italy
  { key: 'arancini',           path: '/assets/Italy/Arancini.png' },
  { key: 'fettuccine-alfredo', path: '/assets/Italy/FettuccineAlfredo.png' },
  { key: 'gabagool-requiem',   path: '/assets/Italy/GabagoolRequiem.png' },
  { key: 'garlic-bread',       path: '/assets/Italy/GarlicBread.png' },
  { key: 'porchetta',          path: '/assets/Italy/Porchetta.png' },
  { key: 'spaghetti',          path: '/assets/Italy/Spaghetti.png' },
  { key: 'cappuccino-assassin',path: '/assets/Italy/TrallelotralaloCappuccinoAssassin.png' },
  // Japan
  { key: '100-year-soy-sauce', path: '/assets/Japan/100-YearSoySauce.png' },
  { key: 'basashi',            path: '/assets/Japan/Basashi.png' },
  { key: 'bizarre-onigiri',    path: '/assets/Japan/BizarreOnigiri.png' },
  { key: 'fugu',               path: '/assets/Japan/Fugu.png' },
  { key: 'ise-ebi',            path: '/assets/Japan/IseEbi.png' },
  { key: 'kaiseki',            path: '/assets/Japan/Kaiseki.png' },
  { key: 'kinacho-mochi',      path: '/assets/Japan/KinachoMochi.png' },
  { key: 'kobe-beef',          path: '/assets/Japan/KobeBeef.png' },
  { key: 'matcha-ice-cream',   path: '/assets/Japan/MatchaIceCream.png' },
  { key: 'miso-soup',          path: '/assets/Japan/MisoSoup.png' },
  { key: 'naruto-ramen',       path: "/assets/Japan/Naruto's Ichiraku Ramen.png" },
  { key: 'ochazuke',           path: '/assets/Japan/Ochazuke.png' },
  { key: 'okonomiyaki',        path: '/assets/Japan/Okonomiyaki.png' },
  { key: 'onigiri',            path: '/assets/Japan/Onigiri.png' },
  { key: 'osechi-ryori',       path: '/assets/Japan/OsechiRyori.png' },
  { key: 'otaku-cup-ramen',    path: '/assets/Japan/OtakuCupRamen.png' },
  { key: 'pokemon-omurice',    path: '/assets/Japan/PokemonOmurice.png' },
  { key: 'ramen',              path: '/assets/Japan/Ramen.png' },
  { key: 'rice',               path: '/assets/Japan/Rice.png' },
  { key: 'sakura-mochi',       path: '/assets/Japan/SakuraMochi.png' },
  { key: 'shirasu-don',        path: '/assets/Japan/ShirasuDon.png' },
  { key: 'spirit-bento-box',   path: '/assets/Japan/SpiritBentoBox.png' },
  { key: 'spirited-castella',  path: '/assets/Japan/SpiritedCastellaCake.png' },
  { key: 'taiyaki',            path: '/assets/Japan/Taiyaki.png' },
  { key: 'takoyaki',           path: '/assets/Japan/Takoyaki.png' },
  { key: 'tamagoyaki',         path: '/assets/Japan/Tamagoyaki.png' },
  { key: 'udon',               path: '/assets/Japan/Udon.png' },
  { key: 'uni',                path: '/assets/Japan/Uni.png' },
  { key: 'wagashi-jelly',      path: '/assets/Japan/WagashiJelly.png' },
  { key: 'whale-sashimi',      path: '/assets/Japan/WhaleSashimi.png' },
  // Korea
  { key: 'arise-sundubu',      path: '/assets/Korea/AriseSundubu.png' },
  { key: 'bibimbap',           path: '/assets/Korea/bibimbap.png' },
  { key: 'bingsu',             path: '/assets/Korea/Bingsu.png' },
  { key: 'bulgogi',            path: '/assets/Korea/Bulgogi.png' },
  { key: 'gimbap',             path: '/assets/Korea/Gimbap.png' },
  { key: 'japchae',            path: '/assets/Korea/Japchae.png' },
  { key: 'jeon',               path: '/assets/Korea/Jeon (savory pancake).png' },
  { key: 'kimchi',             path: '/assets/Korea/Kimchi.png' },
  { key: 'korean-fried-chicken', path: '/assets/Korea/KoreanFriedChicken.png' },
  { key: 'seaweed-soup',       path: '/assets/Korea/SeaweedSoup.png' },
  { key: 'tteokbokki',         path: '/assets/Korea/Tteokbokki.png' },
  { key: 'yukhoe',             path: '/assets/Korea/Yukhoe.png' },
  // USA
  { key: 'chocolate-brownie',  path: '/assets/USA/ChocolateBrownie.png' },
  { key: 'chocolate-chip-cookie', path: '/assets/USA/ChocolateChipCookie.png' },
  { key: 'costco-hotdog',      path: '/assets/USA/CostcoHotdog.png' },
  { key: 'deep-dish-pizza',    path: '/assets/USA/DeepDishPizza.png' },
  { key: 'donut',              path: '/assets/USA/Donut.png' },
  { key: 'hamburger',          path: '/assets/USA/hamburgar.png' },
  { key: 'jam',                path: '/assets/USA/Jam.png' },
  { key: 'maryland-blue-crab', path: '/assets/USA/MarylandBlueCrab.png' },
  { key: 'nyc-pizza',          path: '/assets/USA/NYCPizza.png' },
  { key: 'oyster',             path: '/assets/USA/Oyster.png' },
  { key: 'philly-cheesesteak', path: '/assets/USA/PhillyCheesesteak.png' },
  { key: 'sawsbuck-cake-pop',  path: '/assets/USA/SawsbuckCakePop.png' },
  { key: 'slime-waffle',       path: '/assets/USA/SlimeWaffle.png' },
  { key: 'waffle',             path: '/assets/USA/Waffle.png' },
  // Bomb
  { key: 'bomb',               path: '/assets/bomb.png' },
];

export const FOOD_KEYS: string[] = FOOD_REGISTRY
  .filter(item => item.key !== 'bomb')
  .map(item => item.key);

const cache = new Map<string, HTMLImageElement>();

export async function loadFruitAssets(): Promise<void> {
  await Promise.all(
    FOOD_REGISTRY.map(
      ({ key, path }) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = encodeURI(path);
          img.onload = () => { cache.set(key, img); resolve(); };
          img.onerror = () => resolve();
        })
    )
  );
}

export function getFruitImage(key: string): HTMLImageElement | null {
  return cache.get(key) ?? null;
}
