
const catalog = [
  // Men's Wear
  ["Men's Casual Shirt", "Men's Wear", 899, 520, "Urban Style", "M", "Blue", "GAR-SH"],
  ["Men's Formal Shirt", "Men's Wear", 1199, 700, "Classic Fit", "L", "White", "GAR-FS"],
  ["Men's Printed Shirt", "Men's Wear", 999, 560, "Urban Style", "XL", "Black", "GAR-PS"],
  ["Men's Denim Jeans", "Men's Wear", 1499, 900, "Denim Co.", "32", "Black", "GAR-JN"],
  ["Men's Slim Fit Jeans", "Men's Wear", 1699, 980, "Denim Co.", "34", "Blue", "GAR-SJ"],
  ["Men's Cotton T-Shirt", "Men's Wear", 499, 250, "Urban Style", "M", "Black", "GAR-TS"],
  ["Men's Polo T-Shirt", "Men's Wear", 699, 350, "Urban Style", "L", "Navy", "GAR-PT"],
  ["Men's Hoodie", "Men's Wear", 1199, 650, "Winter Wear", "L", "Grey", "GAR-HD"],
  ["Men's Sweatshirt", "Men's Wear", 999, 540, "Winter Wear", "XL", "Black", "GAR-SW"],
  ["Men's Chinos", "Men's Wear", 1299, 740, "Classic Fit", "32", "Beige", "GAR-CH"],
  ["Men's Kurta", "Men's Wear", 1099, 600, "Ethnic House", "L", "Cream", "GAR-KU"],
  ["Men's Track Pants", "Men's Wear", 799, 420, "Active Fit", "M", "Black", "GAR-TP"],

  // Women's Wear
  ["Women's Printed Kurti", "Women's Wear", 799, 420, "Style Diva", "M", "Pink", "GAR-KR"],
  ["Women's Cotton Kurti", "Women's Wear", 699, 360, "Style Diva", "L", "Blue", "GAR-CK"],
  ["Women's Casual Top", "Women's Wear", 599, 300, "Style Diva", "S", "White", "GAR-CT"],
  ["Women's Party Top", "Women's Wear", 999, 550, "Fashion Lane", "M", "Black", "GAR-PT"],
  ["Women's Skinny Jeans", "Women's Wear", 1299, 720, "Denim Co.", "30", "Blue", "GAR-WJ"],
  ["Women's Wide Leg Jeans", "Women's Wear", 1599, 900, "Denim Co.", "28", "Black", "GAR-WL"],
  ["Women's Leggings", "Women's Wear", 399, 180, "Comfort Wear", "M", "Black", "GAR-LG"],
  ["Women's Palazzo", "Women's Wear", 699, 350, "Comfort Wear", "L", "Maroon", "GAR-PL"],
  ["Women's Maxi Dress", "Women's Wear", 1799, 950, "Fashion Lane", "M", "Green", "GAR-MD"],
  ["Women's Summer Dress", "Women's Wear", 1299, 700, "Fashion Lane", "S", "Yellow", "GAR-SD"],
  ["Women's Saree", "Women's Wear", 1999, 1100, "Ethnic House", "Free Size", "Red", "GAR-SA"],
  ["Women's Cardigan", "Women's Wear", 1199, 650, "Winter Wear", "L", "Cream", "GAR-CG"],

  // Kids Wear
  ["Kids' Cotton T-Shirt", "Kids Wear", 399, 190, "Little Stars", "28", "Yellow", "KID-TS"],
  ["Kids' Printed T-Shirt", "Kids Wear", 349, 160, "Little Stars", "30", "Blue", "KID-PT"],
  ["Kids' Denim Jeans", "Kids Wear", 699, 360, "Little Stars", "28", "Blue", "KID-JN"],
  ["Kids' Casual Shorts", "Kids Wear", 299, 140, "Little Stars", "26", "Green", "KID-CS"],
  ["Kids' Party Dress", "Kids Wear", 999, 520, "Tiny Trends", "30", "Pink", "KID-PD"],
  ["Kids' Hoodie", "Kids Wear", 799, 400, "Tiny Trends", "32", "Red", "KID-HD"],
  ["Kids' School Uniform Shirt", "Kids Wear", 449, 220, "School Basics", "30", "White", "KID-US"],
  ["Kids' School Uniform Pants", "Kids Wear", 499, 250, "School Basics", "32", "Navy", "KID-UP"],

  // Men's Footwear
  ["Men's Running Shoes", "Men's Footwear", 1999, 1150, "RunPro", "9", "Black", "FT-RS"],
  ["Men's Formal Shoes", "Men's Footwear", 2499, 1450, "Classic Walk", "8", "Brown", "FT-FS"],
  ["Men's Casual Sneakers", "Men's Footwear", 1799, 950, "StreetStep", "9", "White", "FT-CS"],
  ["Men's Sports Shoes", "Men's Footwear", 2299, 1300, "RunPro", "10", "Navy", "FT-SS"],
  ["Men's Loafers", "Men's Footwear", 1599, 850, "Classic Walk", "8", "Tan", "FT-LF"],
  ["Men's Leather Sandals", "Men's Footwear", 999, 480, "Comfort Step", "9", "Brown", "FT-LS"],
  ["Men's Flip Flops", "Men's Footwear", 299, 120, "Daily Comfort", "8", "Black", "FT-FF"],
  ["Men's Chelsea Boots", "Men's Footwear", 2799, 1600, "Classic Walk", "9", "Black", "FT-CB"],

  // Women's Footwear
  ["Women's Sandals", "Women's Footwear", 999, 480, "Comfort Step", "6", "Tan", "FT-WS"],
  ["Women's Sneakers", "Women's Footwear", 1499, 800, "RunPro", "7", "White", "FT-WN"],
  ["Women's Heels", "Women's Footwear", 1299, 680, "Style Walk", "6", "Black", "FT-HE"],
  ["Women's Ballet Flats", "Women's Footwear", 799, 390, "Style Walk", "5", "Pink", "FT-BF"],
  ["Women's Running Shoes", "Women's Footwear", 1899, 1050, "RunPro", "7", "Grey", "FT-WR"],
  ["Women's Wedges", "Women's Footwear", 1199, 620, "Style Walk", "6", "Beige", "FT-WG"],
  ["Women's Slippers", "Women's Footwear", 399, 160, "Daily Comfort", "6", "Blue", "FT-WSL"],
  ["Women's Ankle Boots", "Women's Footwear", 2199, 1200, "StreetStep", "7", "Brown", "FT-AB"],

  // Kids Footwear
  ["Kids' School Shoes", "Kids Footwear", 799, 400, "Little Steps", "3", "Black", "FT-KS"],
  ["Kids' Sports Shoes", "Kids Footwear", 999, 520, "Little Steps", "4", "Blue", "FT-KR"],
  ["Kids' Sneakers", "Kids Footwear", 899, 450, "Little Steps", "2", "White", "FT-KN"],
  ["Kids' Sandals", "Kids Footwear", 499, 230, "Little Steps", "3", "Red", "FT-KD"],

  // Accessories
  ["Leather Belt", "Accessories", 499, 220, "Urban Style", "Free Size", "Black", "ACC-BT"],
  ["Formal Belt", "Accessories", 599, 280, "Classic Fit", "Free Size", "Brown", "ACC-FB"],
  ["Baseball Cap", "Accessories", 299, 120, "StreetStep", "Free Size", "Navy", "ACC-CP"],
  ["Cotton Scarf", "Accessories", 399, 170, "Style Diva", "Free Size", "Pink", "ACC-SC"],
  ["Winter Beanie", "Accessories", 349, 150, "Winter Wear", "Free Size", "Grey", "ACC-BN"],
  ["Wallet", "Accessories", 799, 380, "Classic Fit", "Free Size", "Brown", "ACC-WL"],
  ["Socks Pack of 3", "Accessories", 249, 100, "Comfort Wear", "Free Size", "White", "ACC-SK"],
  ["Sports Cap", "Accessories", 399, 180, "RunPro", "Free Size", "Black", "ACC-SP"],
];

export const products = catalog.map(
  ([name, category, price, cost, brand, size, colour, sku], index) => ({
    id: index + 1,
    name,
    category,
    price,
    cost,
    stock: [21, 15, 4, 18, 3, 12, 8, 5, 14, 2][index % 10],
    sku: `${sku}-${String(index + 1).padStart(3, "0")}`,
    brand,
    size,
    colour,
    variant: { size, colour },
  })
);


// Customers demo data
export const customers = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "9876543210",
    email: "rahul@example.com",
  },
  {
    id: 2,
    name: "Priya Verma",
    phone: "9876543211",
    email: "priya@example.com",
  },
];

// Staff demo data
export const staffMembers = [
  {
    id: 1,
    name: "Amit Singh",
    role: "Cashier",
    email: "amit@example.com",
  },
  {
    id: 2,
    name: "Neha Patel",
    role: "Store Manager",
    email: "neha@example.com",
  },
];

// Recent bills demo data
export const recentBills = [
  {
    id: "BILL-1001",
    customer: "Rahul Sharma",
    amount: 1898,
  },
  {
    id: "BILL-1002",
    customer: "Priya Verma",
    amount: 2499,
  },
];

// Purchases demo data
export const purchases = [
  {
    id: "PUR-1001",
    supplier: "Fashion Wholesale",
    amount: 12500,
  },
  {
    id: "PUR-1002",
    supplier: "Footwear Distributors",
    amount: 8750,
  },
];

export const salesSummary = [
  { day: "Mon", sales: 12500, orders: 18 },
  { day: "Tue", sales: 15800, orders: 22 },
  { day: "Wed", sales: 11200, orders: 16 },
  { day: "Thu", sales: 18400, orders: 27 },
  { day: "Fri", sales: 22100, orders: 31 },
  { day: "Sat", sales: 28600, orders: 39 },
  { day: "Sun", sales: 19500, orders: 25 },
];