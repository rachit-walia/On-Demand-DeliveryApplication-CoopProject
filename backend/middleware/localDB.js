const fs   = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "../data");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const FILES = {
  users:       path.join(DIR, "users.json"),
  orders:      path.join(DIR, "orders.json"),
  restaurants: path.join(DIR, "restaurants.json"),
  riders:      path.join(DIR, "riders.json"),
  offers:      path.join(DIR, "offers.json"),
  reviews:     path.join(DIR, "reviews.json"),
  zones:       path.join(DIR, "zones.json"),
  categories:  path.join(DIR, "categories.json"),
};

const SEED = {
  users:   [],
  orders:  [],
  reviews: [],

  categories: [
    { id:"c1",  name:"Pizza",         icon:"🍕", color:"#FF5A1F" },
    { id:"c2",  name:"Burgers",       icon:"🍔", color:"#F59E0B" },
    { id:"c3",  name:"Biryani",       icon:"🍛", color:"#8B5CF6" },
    { id:"c4",  name:"Chinese",       icon:"🥡", color:"#EF4444" },
    { id:"c5",  name:"Sushi",         icon:"🍱", color:"#06B6D4" },
    { id:"c6",  name:"Tacos",         icon:"🌮", color:"#22C55E" },
    { id:"c7",  name:"Desserts",      icon:"🍰", color:"#EC4899" },
    { id:"c8",  name:"Healthy",       icon:"🥗", color:"#84CC16" },
    { id:"c9",  name:"Sandwiches",    icon:"🥪", color:"#F97316" },
    { id:"c10", name:"Pasta",         icon:"🍝", color:"#A855F7" },
  ],

  zones: [
    { id:"z1", name:"Sector 17",  lat:30.7410, lng:76.7780, surgeMultiplier:1.0 },
    { id:"z2", name:"Sector 22",  lat:30.7360, lng:76.7900, surgeMultiplier:1.2 },
    { id:"z3", name:"Sector 8",   lat:30.7280, lng:76.7720, surgeMultiplier:1.0 },
    { id:"z4", name:"Sector 35",  lat:30.7480, lng:76.8020, surgeMultiplier:1.5 },
  ],

  offers: [
    { id:"o1", code:"FIRST50",   discount:50, type:"percent",       minOrder:0,   maxDiscount:150, description:"50% off your first order!",               emoji:"🎉", expiry:"2026-12-31" },
    { id:"o2", code:"SAVE100",   discount:100, type:"flat",          minOrder:499, maxDiscount:100, description:"Flat ₹100 off on orders above ₹499",       emoji:"💸", expiry:"2026-12-31" },
    { id:"o3", code:"FREEDEL",   discount:0,  type:"free_delivery", minOrder:199, maxDiscount:0,   description:"Free delivery on orders above ₹199",        emoji:"🛵", expiry:"2026-12-31" },
    { id:"o4", code:"WEEKEND20", discount:20, type:"percent",       minOrder:299, maxDiscount:80,  description:"20% off every weekend",                     emoji:"🎊", expiry:"2026-12-31" },
    { id:"o5", code:"NEWUSER",   discount:60, type:"percent",       minOrder:0,   maxDiscount:200, description:"60% off for new users",                     emoji:"🆕", expiry:"2026-12-31" },
    { id:"o6", code:"FLASH30",   discount:30, type:"percent",       minOrder:149, maxDiscount:90,  description:"Flash deal — 30% off limited time",          emoji:"⚡", expiry:"2026-12-31" },
  ],

  riders: [
    { id:"rd1", name:"Arjun Singh",    phone:"+91-9876543210", rating:4.8, vehicle:"Bike",    status:"available", lat:30.7333, lng:76.7794, completedOrders:234, avatar:"A", onlineHours:6 },
    { id:"rd2", name:"Rahul Sharma",   phone:"+91-9823456701", rating:4.6, vehicle:"Scooter", status:"available", lat:30.7400, lng:76.7900, completedOrders:189, avatar:"R", onlineHours:4 },
    { id:"rd3", name:"Priya Mehta",    phone:"+91-9812345678", rating:4.9, vehicle:"Bike",    status:"busy",      lat:30.7250, lng:76.7700, completedOrders:312, avatar:"P", onlineHours:8 },
    { id:"rd4", name:"Vikram Patel",   phone:"+91-9801234567", rating:4.5, vehicle:"Scooter", status:"available", lat:30.7450, lng:76.8000, completedOrders:156, avatar:"V", onlineHours:3 },
    { id:"rd5", name:"Sneha Kapoor",   phone:"+91-9790123456", rating:4.7, vehicle:"Bike",    status:"busy",      lat:30.7200, lng:76.7850, completedOrders:278, avatar:"S", onlineHours:7 },
    { id:"rd6", name:"Deepak Verma",   phone:"+91-9781234567", rating:4.4, vehicle:"Scooter", status:"available", lat:30.7350, lng:76.7750, completedOrders:98,  avatar:"D", onlineHours:2 },
  ],

  restaurants: [
    {
      id:"r1", name:"Pizza Palace", cuisine:"Italian", rating:4.5, totalReviews:342,
      deliveryTime:"25-35 min", deliveryFee:49, image:"🍕", badge:"Bestseller",
      address:"123 Main St, Sector 17", lat:30.7410, lng:76.7780,
      tags:["Pizza","Pasta","Italian"], isOpen:true, minOrder:199,
      isPureVeg:false, isPromoted:true, discount:"20% OFF",
      categories:["c1","c10"],
      menu:[
        { id:"m1",  name:"Margherita Pizza",    price:299, category:"Pizza",    description:"Classic tomato & mozzarella", isVeg:true,  isBestseller:true,  calories:680,  prepTime:"15 min" },
        { id:"m2",  name:"Pepperoni Pizza",      price:349, category:"Pizza",    description:"Loaded with premium pepperoni", isVeg:false, isBestseller:true,  calories:820,  prepTime:"18 min" },
        { id:"m3",  name:"BBQ Chicken Pizza",    price:379, category:"Pizza",    description:"Smoky BBQ base with grilled chicken", isVeg:false, isBestseller:false, calories:900,  prepTime:"20 min" },
        { id:"m4",  name:"Four Cheese Pizza",    price:399, category:"Pizza",    description:"Mozz, cheddar, gouda & parmesan", isVeg:true,  isBestseller:false, calories:960,  prepTime:"18 min" },
        { id:"m5",  name:"Truffle Mushroom Pizza",price:449,category:"Pizza",    description:"Wild mushrooms & truffle oil",  isVeg:true,  isBestseller:false, calories:740,  prepTime:"22 min" },
        { id:"m6",  name:"Garlic Bread",         price:99,  category:"Sides",    description:"Crispy garlic bread with butter", isVeg:true,  isBestseller:false, calories:320, prepTime:"8 min" },
        { id:"m7",  name:"Stuffed Garlic Bread", price:149, category:"Sides",    description:"Cheese-stuffed garlic bread", isVeg:true,  isBestseller:false, calories:480, prepTime:"10 min" },
        { id:"m8",  name:"Caesar Salad",         price:199, category:"Salads",   description:"Romaine, croutons, caesar dressing", isVeg:false, isBestseller:false, calories:290, prepTime:"8 min" },
        { id:"m9",  name:"Pasta Arrabbiata",     price:249, category:"Pasta",    description:"Spicy tomato pasta",          isVeg:true,  isBestseller:false, calories:540, prepTime:"15 min" },
        { id:"m10", name:"Penne Alfredo",        price:269, category:"Pasta",    description:"Creamy white sauce pasta",    isVeg:true,  isBestseller:true,  calories:620, prepTime:"15 min" },
        { id:"m11", name:"Tiramisu",             price:149, category:"Desserts", description:"Classic Italian dessert",     isVeg:true,  isBestseller:false, calories:380, prepTime:"5 min" },
        { id:"m12", name:"Coke 300ml",           price:49,  category:"Drinks",   description:"Chilled Coca-Cola",           isVeg:true,  isBestseller:false, calories:140, prepTime:"2 min" },
        { id:"m13", name:"Fresh Lemonade",       price:79,  category:"Drinks",   description:"Freshly squeezed lemonade",   isVeg:true,  isBestseller:false, calories:90,  prepTime:"5 min" },
        { id:"m14", name:"Cheesy Dips",          price:69,  category:"Sides",    description:"Marinara + ranch dips combo", isVeg:true,  isBestseller:false, calories:180, prepTime:"3 min" },
      ],
    },
    {
      id:"r2", name:"Burger Barn", cuisine:"American", rating:4.3, totalReviews:289,
      deliveryTime:"20-30 min", deliveryFee:29, image:"🍔", badge:"Popular",
      address:"456 Oak Ave, Sector 22", lat:30.7360, lng:76.7900,
      tags:["Burgers","Fries","Shakes"], isOpen:true, minOrder:149,
      isPureVeg:false, isPromoted:false, discount:null,
      categories:["c2"],
      menu:[
        { id:"m15", name:"Classic Smash Burger",  price:199, category:"Burgers",  description:"Double smash patty, special sauce", isVeg:false, isBestseller:true,  calories:720, prepTime:"12 min" },
        { id:"m16", name:"BBQ Bacon Burger",       price:299, category:"Burgers",  description:"Crispy bacon & smoky BBQ sauce",    isVeg:false, isBestseller:true,  calories:880, prepTime:"15 min" },
        { id:"m17", name:"Mushroom Swiss Burger",  price:279, category:"Burgers",  description:"Sauteed mushrooms & Swiss cheese",  isVeg:false, isBestseller:false, calories:750, prepTime:"14 min" },
        { id:"m18", name:"Veggie Deluxe Burger",   price:189, category:"Burgers",  description:"Crispy veggie patty, avocado",      isVeg:true,  isBestseller:false, calories:580, prepTime:"12 min" },
        { id:"m19", name:"Spicy Chicken Burger",   price:239, category:"Burgers",  description:"Crispy fried chicken, spicy mayo",  isVeg:false, isBestseller:false, calories:690, prepTime:"14 min" },
        { id:"m20", name:"Loaded Cheese Fries",    price:149, category:"Sides",    description:"Fries loaded with cheese & jalapenos", isVeg:true, isBestseller:true, calories:520, prepTime:"8 min" },
        { id:"m21", name:"Classic Fries",          price:79,  category:"Sides",    description:"Golden crispy salted fries",         isVeg:true, isBestseller:false, calories:310, prepTime:"6 min" },
        { id:"m22", name:"Onion Rings",            price:99,  category:"Sides",    description:"Beer-battered crispy onion rings",   isVeg:true, isBestseller:false, calories:380, prepTime:"8 min" },
        { id:"m23", name:"Chocolate Shake",        price:149, category:"Shakes",   description:"Thick premium chocolate milkshake",  isVeg:true, isBestseller:false, calories:480, prepTime:"5 min" },
        { id:"m24", name:"Oreo Cookie Shake",      price:169, category:"Shakes",   description:"Oreo blended with vanilla ice cream", isVeg:true, isBestseller:false, calories:520, prepTime:"5 min" },
        { id:"m25", name:"Chicken Wings (6pc)",    price:229, category:"Snacks",   description:"Buffalo-style crispy chicken wings", isVeg:false, isBestseller:false, calories:490, prepTime:"16 min" },
        { id:"m26", name:"Brownie Sundae",         price:149, category:"Desserts", description:"Warm brownie with vanilla ice cream", isVeg:true, isBestseller:false, calories:540, prepTime:"5 min" },
        { id:"m27", name:"Hot Dog",                price:159, category:"Snacks",   description:"Grilled dog with mustard & relish",  isVeg:false, isBestseller:false, calories:420, prepTime:"8 min" },
        { id:"m28", name:"Coleslaw",               price:59,  category:"Sides",    description:"Creamy homemade coleslaw",           isVeg:true, isBestseller:false, calories:180, prepTime:"3 min" },
      ],
    },
    {
      id:"r3", name:"Sushi Spot", cuisine:"Japanese", rating:4.7, totalReviews:198,
      deliveryTime:"30-45 min", deliveryFee:69, image:"🍱", badge:"Top Rated",
      address:"789 Elm Rd, Sector 8", lat:30.7280, lng:76.7720,
      tags:["Sushi","Ramen","Japanese"], isOpen:true, minOrder:299,
      isPureVeg:false, isPromoted:true, discount:"Free Delivery",
      categories:["c5"],
      menu:[
        { id:"m29", name:"California Roll (8pc)",   price:249, category:"Rolls",  description:"Crab, avocado & cucumber",         isVeg:false, isBestseller:true,  calories:320, prepTime:"15 min" },
        { id:"m30", name:"Dragon Roll (8pc)",        price:349, category:"Rolls",  description:"Shrimp tempura, avocado on top",   isVeg:false, isBestseller:true,  calories:410, prepTime:"18 min" },
        { id:"m31", name:"Spicy Tuna Roll (8pc)",    price:299, category:"Rolls",  description:"Fresh tuna with spicy mayo",        isVeg:false, isBestseller:false, calories:380, prepTime:"15 min" },
        { id:"m32", name:"Rainbow Roll (8pc)",       price:379, category:"Rolls",  description:"6 types of fresh fish",            isVeg:false, isBestseller:false, calories:450, prepTime:"20 min" },
        { id:"m33", name:"Salmon Sashimi (6pc)",     price:329, category:"Sashimi",description:"Premium fresh salmon slices",      isVeg:false, isBestseller:false, calories:290, prepTime:"12 min" },
        { id:"m34", name:"Tuna Nigiri (2pc)",        price:199, category:"Nigiri", description:"Premium tuna on seasoned rice",    isVeg:false, isBestseller:false, calories:180, prepTime:"10 min" },
        { id:"m35", name:"Tonkotsu Ramen",           price:349, category:"Ramen",  description:"Rich pork broth, chashu, noodles", isVeg:false, isBestseller:true,  calories:680, prepTime:"20 min" },
        { id:"m36", name:"Miso Ramen",               price:299, category:"Ramen",  description:"Light miso broth with veggies",   isVeg:true,  isBestseller:false, calories:520, prepTime:"18 min" },
        { id:"m37", name:"Gyoza (6pc)",              price:179, category:"Sides",  description:"Pan-fried pork & cabbage dumplings", isVeg:false, isBestseller:false, calories:340, prepTime:"12 min" },
        { id:"m38", name:"Edamame",                  price:99,  category:"Sides",  description:"Steamed salted edamame",           isVeg:true,  isBestseller:false, calories:120, prepTime:"5 min" },
        { id:"m39", name:"Miso Soup",                price:79,  category:"Soups",  description:"Traditional miso with tofu",       isVeg:true,  isBestseller:false, calories:90,  prepTime:"5 min" },
        { id:"m40", name:"Matcha Latte",             price:99,  category:"Drinks", description:"Ceremonial matcha with oat milk",  isVeg:true,  isBestseller:false, calories:140, prepTime:"5 min" },
        { id:"m41", name:"Matcha Ice Cream",         price:129, category:"Desserts",description:"Japanese green tea ice cream",    isVeg:true,  isBestseller:false, calories:280, prepTime:"3 min" },
        { id:"m42", name:"Mochi (3pc)",              price:149, category:"Desserts",description:"Soft rice cake with ice cream",   isVeg:true,  isBestseller:false, calories:320, prepTime:"5 min" },
      ],
    },
    {
      id:"r4", name:"Taco Town", cuisine:"Mexican", rating:4.4, totalReviews:167,
      deliveryTime:"15-25 min", deliveryFee:19, image:"🌮", badge:"Fast Delivery",
      address:"321 Pine Blvd, Sector 35", lat:30.7480, lng:76.8020,
      tags:["Tacos","Burritos","Mexican"], isOpen:true, minOrder:149,
      isPureVeg:false, isPromoted:false, discount:null,
      categories:["c6"],
      menu:[
        { id:"m43", name:"Carne Asada Tacos (3)",   price:249, category:"Tacos",    description:"Grilled beef, pico, cilantro",     isVeg:false, isBestseller:true,  calories:520, prepTime:"12 min" },
        { id:"m44", name:"Al Pastor Tacos (3)",      price:229, category:"Tacos",    description:"Marinated pork, pineapple, onion", isVeg:false, isBestseller:false, calories:490, prepTime:"12 min" },
        { id:"m45", name:"Fish Tacos (3)",           price:269, category:"Tacos",    description:"Crispy fish, cabbage, chipotle",   isVeg:false, isBestseller:false, calories:440, prepTime:"14 min" },
        { id:"m46", name:"Veggie Tacos (3)",         price:199, category:"Tacos",    description:"Grilled veggies & guacamole",      isVeg:true,  isBestseller:false, calories:360, prepTime:"10 min" },
        { id:"m47", name:"Chicken Burrito",          price:279, category:"Burritos", description:"Grilled chicken, rice, beans, cheese", isVeg:false, isBestseller:true, calories:720, prepTime:"14 min" },
        { id:"m48", name:"Surf & Turf Burrito",      price:349, category:"Burritos", description:"Shrimp + beef with all toppings",  isVeg:false, isBestseller:false, calories:890, prepTime:"16 min" },
        { id:"m49", name:"Veggie Burrito Bowl",      price:249, category:"Burritos", description:"Black beans, corn, guac, salsa",   isVeg:true,  isBestseller:false, calories:580, prepTime:"10 min" },
        { id:"m50", name:"Street Nachos",            price:199, category:"Snacks",   description:"Tortillas, 3 cheeses, jalapenos",  isVeg:true,  isBestseller:false, calories:620, prepTime:"10 min" },
        { id:"m51", name:"Loaded Nachos Supreme",    price:279, category:"Snacks",   description:"Nachos with chicken, cheese, guac",isVeg:false, isBestseller:false, calories:780, prepTime:"12 min" },
        { id:"m52", name:"Guacamole & Chips",        price:149, category:"Sides",    description:"Fresh avocado guacamole",          isVeg:true,  isBestseller:false, calories:340, prepTime:"8 min" },
        { id:"m53", name:"Churros with Dip",         price:129, category:"Desserts", description:"Cinnamon churros, chocolate dip",  isVeg:true,  isBestseller:false, calories:480, prepTime:"8 min" },
        { id:"m54", name:"Horchata",                 price:89,  category:"Drinks",   description:"Sweet rice & cinnamon drink",      isVeg:true,  isBestseller:false, calories:180, prepTime:"3 min" },
        { id:"m55", name:"Mango Tajin Juice",        price:79,  category:"Drinks",   description:"Fresh mango with tajin spice",     isVeg:true,  isBestseller:false, calories:120, prepTime:"5 min" },
      ],
    },
    {
      id:"r5", name:"Curry House", cuisine:"Indian", rating:4.6, totalReviews:412,
      deliveryTime:"30-40 min", deliveryFee:29, image:"🍛", badge:"Most Loved",
      address:"654 Spice Lane, Sector 11", lat:30.7320, lng:76.7840,
      tags:["Curry","Biryani","Indian"], isOpen:true, minOrder:199,
      isPureVeg:false, isPromoted:true, discount:"15% OFF",
      categories:["c3"],
      menu:[
        { id:"m56", name:"Butter Chicken",          price:319, category:"Mains",    description:"Creamy tomato-based chicken curry", isVeg:false, isBestseller:true,  calories:540, prepTime:"18 min" },
        { id:"m57", name:"Paneer Butter Masala",    price:289, category:"Mains",    description:"Cottage cheese in rich tomato gravy",isVeg:true, isBestseller:true,  calories:480, prepTime:"15 min" },
        { id:"m58", name:"Dal Makhani",             price:239, category:"Mains",    description:"Slow-cooked black lentils with butter",isVeg:true,isBestseller:false, calories:420, prepTime:"20 min" },
        { id:"m59", name:"Lamb Rogan Josh",         price:389, category:"Mains",    description:"Aromatic Kashmiri lamb curry",       isVeg:false, isBestseller:false, calories:580, prepTime:"25 min" },
        { id:"m60", name:"Chicken Biryani",         price:349, category:"Biryani",  description:"Fragrant basmati with spiced chicken",isVeg:false,isBestseller:true,  calories:680, prepTime:"25 min" },
        { id:"m61", name:"Hyderabadi Dum Biryani",  price:399, category:"Biryani",  description:"Slow-cooked dum biryani, raita",     isVeg:false, isBestseller:false, calories:720, prepTime:"30 min" },
        { id:"m62", name:"Veg Biryani",             price:279, category:"Biryani",  description:"Aromatic veggie biryani",            isVeg:true,  isBestseller:false, calories:560, prepTime:"25 min" },
        { id:"m63", name:"Garlic Naan",             price:59,  category:"Breads",   description:"Soft garlic flatbread from tandoor", isVeg:true,  isBestseller:false, calories:190, prepTime:"8 min" },
        { id:"m64", name:"Stuffed Paratha",         price:89,  category:"Breads",   description:"Whole wheat stuffed paratha + butter",isVeg:true, isBestseller:false, calories:340, prepTime:"10 min" },
        { id:"m65", name:"Chicken Tikka (6pc)",     price:299, category:"Starters", description:"Tandoor-grilled marinated chicken",  isVeg:false, isBestseller:false, calories:380, prepTime:"18 min" },
        { id:"m66", name:"Samosa Chaat (2pc)",      price:119, category:"Starters", description:"Crispy samosa with chutneys & yogurt",isVeg:true, isBestseller:false, calories:320, prepTime:"8 min" },
        { id:"m67", name:"Mango Lassi",             price:99,  category:"Drinks",   description:"Sweet mango yogurt drink",           isVeg:true,  isBestseller:false, calories:240, prepTime:"5 min" },
        { id:"m68", name:"Gulab Jamun (3pc)",       price:99,  category:"Desserts", description:"Soft milk dumplings in rose syrup",  isVeg:true,  isBestseller:false, calories:360, prepTime:"5 min" },
        { id:"m69", name:"Kulfi Falooda",           price:149, category:"Desserts", description:"Pistachio kulfi with falooda noodles",isVeg:true, isBestseller:false, calories:420, prepTime:"8 min" },
      ],
    },
    {
      id:"r6", name:"Dragon Wok", cuisine:"Chinese", rating:4.2, totalReviews:134,
      deliveryTime:"20-30 min", deliveryFee:39, image:"🥡", badge:"New",
      address:"987 Noodle St, Sector 26", lat:30.7390, lng:76.7960,
      tags:["Chinese","Noodles","Dim Sum"], isOpen:true, minOrder:179,
      isPureVeg:false, isPromoted:false, discount:null,
      categories:["c4"],
      menu:[
        { id:"m70", name:"Kung Pao Chicken",        price:299, category:"Mains",    description:"Spicy stir-fried chicken, peanuts", isVeg:false, isBestseller:true,  calories:480, prepTime:"14 min" },
        { id:"m71", name:"Mongolian Beef",          price:349, category:"Mains",    description:"Tender beef in savory brown sauce",  isVeg:false, isBestseller:false, calories:540, prepTime:"16 min" },
        { id:"m72", name:"Mapo Tofu",               price:249, category:"Mains",    description:"Silken tofu in spicy chili sauce",   isVeg:true,  isBestseller:false, calories:340, prepTime:"12 min" },
        { id:"m73", name:"Sweet & Sour Pork",       price:319, category:"Mains",    description:"Classic sweet & sour pork dish",    isVeg:false, isBestseller:false, calories:560, prepTime:"16 min" },
        { id:"m74", name:"Egg Fried Rice",          price:199, category:"Rice",     description:"Classic egg fried rice",             isVeg:true,  isBestseller:false, calories:420, prepTime:"10 min" },
        { id:"m75", name:"Hakka Noodles",           price:219, category:"Noodles",  description:"Stir-fried noodles with veggies",    isVeg:true,  isBestseller:true,  calories:460, prepTime:"12 min" },
        { id:"m76", name:"Dim Sum Basket (6pc)",    price:199, category:"Starters", description:"Assorted steamed dumplings",         isVeg:false, isBestseller:false, calories:340, prepTime:"15 min" },
        { id:"m77", name:"Crispy Spring Rolls (4)", price:149, category:"Starters", description:"Crispy veggie spring rolls",          isVeg:true,  isBestseller:false, calories:320, prepTime:"10 min" },
        { id:"m78", name:"Hot & Sour Soup",         price:109, category:"Soups",    description:"Classic tangy Chinese soup",         isVeg:true,  isBestseller:false, calories:180, prepTime:"8 min" },
        { id:"m79", name:"Wonton Soup",             price:129, category:"Soups",    description:"Delicate wontons in clear broth",    isVeg:false, isBestseller:false, calories:220, prepTime:"10 min" },
        { id:"m80", name:"Jasmine Tea",             price:59,  category:"Drinks",   description:"Fragrant hot or iced jasmine tea",   isVeg:true,  isBestseller:false, calories:10,  prepTime:"3 min" },
        { id:"m81", name:"Lychee Mojito",           price:99,  category:"Drinks",   description:"Fresh lychee with mint & lime",      isVeg:true,  isBestseller:false, calories:120, prepTime:"5 min" },
      ],
    },
    {
      id:"r7", name:"Green Bowl", cuisine:"Healthy", rating:4.8, totalReviews:89,
      deliveryTime:"20-30 min", deliveryFee:39, image:"🥗", badge:"Healthy Pick",
      address:"11 Wellness Ave, Sector 5", lat:30.7300, lng:76.7800,
      tags:["Salads","Bowls","Vegan"], isOpen:true, minOrder:249,
      isPureVeg:true, isPromoted:false, discount:"Free Delivery",
      categories:["c8"],
      menu:[
        { id:"m82", name:"Buddha Bowl",             price:349, category:"Bowls",    description:"Quinoa, roasted veggies, tahini",   isVeg:true,  isBestseller:true,  calories:480, prepTime:"12 min" },
        { id:"m83", name:"Acai Bowl",               price:299, category:"Bowls",    description:"Acai base, granola, fresh fruit",   isVeg:true,  isBestseller:true,  calories:380, prepTime:"8 min" },
        { id:"m84", name:"Poke Bowl",               price:379, category:"Bowls",    description:"Salmon, sushi rice, edamame, mango",isVeg:false, isBestseller:false, calories:520, prepTime:"15 min" },
        { id:"m85", name:"Caesar Salad",            price:249, category:"Salads",   description:"Romaine, parmesan, croutons",       isVeg:false, isBestseller:false, calories:320, prepTime:"8 min" },
        { id:"m86", name:"Avocado Toast",           price:199, category:"Snacks",   description:"Sourdough, smashed avo, poached egg",isVeg:false,isBestseller:false, calories:420, prepTime:"10 min" },
        { id:"m87", name:"Green Smoothie",          price:149, category:"Drinks",   description:"Spinach, banana, almond milk",      isVeg:true,  isBestseller:false, calories:180, prepTime:"5 min" },
        { id:"m88", name:"Protein Shake",           price:199, category:"Drinks",   description:"Whey protein, banana, peanut butter",isVeg:true, isBestseller:false, calories:340, prepTime:"5 min" },
      ],
    },
  ],
};

Object.entries(FILES).forEach(([k,f])=>{ if(!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(SEED[k]||[], null, 2)); });

const read      = col => JSON.parse(fs.readFileSync(FILES[col],"utf-8"));
const write     = (col,d) => fs.writeFileSync(FILES[col], JSON.stringify(d,null,2));
const findOne   = (col,field,val) => read(col).find(i=>i[field]===val)||null;
const findMany  = (col,fn) => { const d=read(col); return fn?d.filter(fn):d; };
const insertOne = (col,item) => { const d=read(col); d.push(item); write(col,d); return item; };
const updateOne = (col,id,up) => { const d=read(col); const i=d.findIndex(x=>x.id===id); if(i===-1)return null; d[i]={...d[i],...up}; write(col,d); return d[i]; };
const deleteOne = (col,id) => { const d=read(col); const i=d.findIndex(x=>x.id===id); if(i===-1)return false; d.splice(i,1); write(col,d); return true; };

module.exports = { read, write, findOne, findMany, insertOne, updateOne, deleteOne };
