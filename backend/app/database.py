"""
Database connection and seed data for SwiftBite.
Supports MongoDB (Motor async driver) with automatic fallback to in-memory storage.
"""

import os
from copy import deepcopy

# Try MongoDB, fall back to in-memory
USE_MONGO = True
db_client = None
db = None


# ===== In-Memory Database Fallback =====
class InMemoryCollection:
    """Simple in-memory collection that mimics MongoDB operations."""

    def __init__(self):
        self._data = []

    async def find_one(self, query):
        for doc in self._data:
            if self._matches(doc, query):
                return deepcopy(doc)
        return None

    def find(self, query=None):
        if query is None:
            query = {}
        results = [deepcopy(d) for d in self._data if self._matches(d, query)]
        return InMemoryCursor(results)

    async def insert_one(self, doc):
        doc = deepcopy(doc)
        if "_id" not in doc:
            import uuid
            doc["_id"] = str(uuid.uuid4())
        self._data.append(doc)
        return type("Result", (), {"inserted_id": doc["_id"]})()

    async def insert_many(self, docs):
        import uuid
        for doc in docs:
            d = deepcopy(doc)
            if "_id" not in d:
                d["_id"] = str(uuid.uuid4())
            self._data.append(d)

    async def count_documents(self, query=None):
        if not query:
            return len(self._data)
        return sum(1 for d in self._data if self._matches(d, query))

    async def update_one(self, query, update):
        for doc in self._data:
            if self._matches(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                return type("Result", (), {"modified_count": 1, "matched_count": 1})()
        return type("Result", (), {"modified_count": 0, "matched_count": 0})()

    async def delete_many(self, query=None):
        if not query:
            count = len(self._data)
            self._data = []
            return type("Result", (), {"deleted_count": count})()
        init_len = len(self._data)
        self._data = [d for d in self._data if not self._matches(d, query)]
        return type("Result", (), {"deleted_count": init_len - len(self._data)})()

    def _matches(self, doc, query):
        if not query:
            return True
        for key, value in query.items():
            if key == "$or":
                if not any(self._matches(doc, subq) for subq in value):
                    return False
                continue
            doc_val = doc.get(key)
            if isinstance(value, dict):
                # Handle $regex
                if "$regex" in value:
                    import re
                    flags = re.IGNORECASE if "i" in value.get("$options", "") else 0
                    pattern = value["$regex"]
                    if isinstance(doc_val, list):
                        if not any(re.search(pattern, str(v), flags) for v in doc_val):
                            return False
                    elif not re.search(pattern, str(doc_val or ""), flags):
                        return False
                elif "$in" in value:
                    if doc_val not in value["$in"]:
                        return False
                else:
                    if doc_val != value:
                        return False
            else:
                if doc_val != value:
                    return False
        return True


class InMemoryCursor:
    def __init__(self, data):
        self._data = data

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            key, direction = key_or_list[0]
        else:
            key = key_or_list
        reverse = direction == -1
        self._data.sort(key=lambda d: d.get(key, 0) if d.get(key) is not None else 0, reverse=reverse)
        return self

    async def to_list(self, length=100):
        return self._data[:length]


class InMemoryDB:
    def __init__(self):
        self._collections = {}

    def __getattr__(self, name):
        if name.startswith("_"):
            return super().__getattribute__(name)
        if name not in self._collections:
            self._collections[name] = InMemoryCollection()
        return self._collections[name]


async def connect_db():
    """Connect to MongoDB, or fall back to in-memory storage."""
    global db_client, db, USE_MONGO

    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DATABASE_NAME", "swiftbite")

    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=3000)
        # Test connection
        await client.admin.command("ping")
        db_client = client
        db = client[db_name]
        USE_MONGO = True
        print(f"[OK] Connected to MongoDB: {db_name}")
    except Exception as e:
        print(f"[WARN] MongoDB not available ({e}). Using in-memory database.")
        USE_MONGO = False
        db = InMemoryDB()


async def close_db():
    """Close MongoDB connection."""
    global db_client
    if db_client:
        db_client.close()
        print("[INFO] MongoDB connection closed")


def get_db():
    """Get database instance."""
    return db


# ===== Seed Data =====
SEED_RESTAURANTS = [
    {
        "_id": "rest_001",
        "name": "Dindigul Thalappakatti",
        "cuisines": ["Biryani", "South Indian", "Chettinad"],
        "rating": 4.6,
        "delivery_time": 25,
        "price_for_two": 450,
        "distance": 1.2,
        "address": "Pondy Bazaar, T. Nagar, Chennai",
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop",
        "offer": "60% OFF up to ₹120",
        "is_open": True,
    },
    {
        "_id": "rest_002",
        "name": "Tuscana Pizza & Italian Trattoria",
        "cuisines": ["Pizza", "Italian", "Pasta"],
        "rating": 4.4,
        "delivery_time": 30,
        "price_for_two": 650,
        "distance": 2.1,
        "address": "Khader Nawaz Khan Road, Nungambakkam, Chennai",
        "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
        "offer": "Buy 1 Get 1 Free",
        "is_open": True,
    },
    {
        "_id": "rest_003",
        "name": "Sandy's Chocolate Laboratory",
        "cuisines": ["Burger", "American", "Dessert"],
        "rating": 4.5,
        "delivery_time": 20,
        "price_for_two": 400,
        "distance": 1.5,
        "address": "Cenotaph Road, Alwarpet, Chennai",
        "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
        "offer": "20% OFF on all orders",
        "is_open": True,
    },
    {
        "_id": "rest_004",
        "name": "Mainland China & Dragon Wok",
        "cuisines": ["Chinese", "Thai", "Asian"],
        "rating": 4.3,
        "delivery_time": 35,
        "price_for_two": 550,
        "distance": 3.2,
        "address": "Phoenix Marketcity, Velachery, Chennai",
        "image_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&h=400&fit=crop",
        "offer": "Free delivery",
        "is_open": True,
    },
    {
        "_id": "rest_005",
        "name": "Murugan Idli Shop",
        "cuisines": ["South Indian", "Breakfast", "Snacks"],
        "rating": 4.8,
        "delivery_time": 15,
        "price_for_two": 200,
        "distance": 0.8,
        "address": "North Usman Road, T. Nagar, Chennai",
        "image_url": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=400&fit=crop",
        "offer": "₹50 OFF above ₹199",
        "is_open": True,
    },
    {
        "_id": "rest_006",
        "name": "Anjappar Chettinad Restaurant",
        "cuisines": ["Chettinad", "Biryani", "South Indian"],
        "rating": 4.5,
        "delivery_time": 30,
        "price_for_two": 500,
        "distance": 2.8,
        "address": "2nd Avenue, Anna Nagar, Chennai",
        "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
        "offer": "Flat 30% OFF",
        "is_open": True,
    },
    {
        "_id": "rest_007",
        "name": "Writer's Cafe",
        "cuisines": ["Dessert", "Bakery", "Cafe"],
        "rating": 4.7,
        "delivery_time": 25,
        "price_for_two": 350,
        "distance": 1.9,
        "address": "Peters Road, Gopalapuram, Chennai",
        "image_url": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop",
        "offer": "Free dessert on ₹500+",
        "is_open": True,
    },
    {
        "_id": "rest_008",
        "name": "Madras Coffee House & Beach Bites",
        "cuisines": ["Beverages", "Snacks", "South Indian"],
        "rating": 4.6,
        "delivery_time": 15,
        "price_for_two": 150,
        "distance": 0.5,
        "address": "Elliot's Beach Road, Besant Nagar, Chennai",
        "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop",
        "offer": None,
        "is_open": True,
    },
]

SEED_MENU_ITEMS = [
    # ===== 1. Dindigul Thalappakatti menu (rest_001) =====
    {
        "_id": "item_001",
        "restaurant_id": "rest_001",
        "name": "Thalappakatti Mutton Biryani",
        "description": "Legendary Seeraga Samba rice layered with succulent tender farm mutton, infused with heirloom secret spices.",
        "price": 399,
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "biryani",
        "is_bestseller": True,
    },
    {
        "_id": "item_002",
        "restaurant_id": "rest_001",
        "name": "Chennai Chicken 65",
        "description": "Original Chennai-style crispy boneless chicken tossed with fresh curry leaves, crushed garlic, and green chilies.",
        "price": 269,
        "image_url": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_003",
        "restaurant_id": "rest_001",
        "name": "Paneer Butter Masala",
        "description": "Soft fresh malai paneer cubes simmered in rich creamy tomato and cashew nut gravy with butter.",
        "price": 249,
        "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "north_indian",
        "is_bestseller": False,
    },
    {
        "_id": "item_004",
        "restaurant_id": "rest_001",
        "name": "Thalappakatti Chicken Biryani",
        "description": "Aromatic Seeraga Samba chicken biryani slow-cooked on firewood dum with caramelized onions and curd mint raita.",
        "price": 299,
        "image_url": "https://images.unsplash.com/photo-1642821373181-696a54913e93?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "biryani",
        "is_bestseller": True,
    },
    {
        "_id": "item_022",
        "restaurant_id": "rest_001",
        "name": "Thalappakatti Special Mutton Chukka",
        "description": "Tender bone-in mutton dry-roasted in freshly roasted coriander, Tellicherry pepper, shallots, and crisp curry leaves.",
        "price": 369,
        "image_url": "/images/dishes/mutton_sukka.jpg",
        "is_veg": False,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_023",
        "restaurant_id": "rest_001",
        "name": "Nattu Kozhi Pepper Roast",
        "description": "Authentic free-range country chicken pan-roasted in rustic village pepper blend with green chilies and caramelized shallots.",
        "price": 329,
        "image_url": "/images/dishes/pepper_chicken.jpg",
        "is_veg": False,
        "category": "south_indian",
        "is_bestseller": False,
    },
    {
        "_id": "item_024",
        "restaurant_id": "rest_001",
        "name": "Ennai Kathirikai Kulambu",
        "description": "Baby eggplants slow-simmered in tangy roasted sesame, peanut, tamarind and ground spice gravy. Classic biryani side.",
        "price": 199,
        "image_url": "/images/dishes/ennai_kathirikai.jpg",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": False,
    },
    {
        "_id": "item_025",
        "restaurant_id": "rest_001",
        "name": "Egg Kothu Parotta",
        "description": "Shredded layered Malabar parotta wok-beaten with farm eggs, sliced onions, green chilies and spicy Thalappakatti salna.",
        "price": 219,
        "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_026",
        "restaurant_id": "rest_001",
        "name": "Special Madurai Jigarthanda",
        "description": "Chilled royal dessert drink with badam pisin (almond gum), nannari herbal syrup, thick reduced milk, and malai ice cream.",
        "price": 129,
        "image_url": "/images/dishes/jigarthanda.jpg",
        "is_veg": True,
        "category": "beverages",
        "is_bestseller": True,
    },

    # ===== 2. Tuscana Pizza & Italian Trattoria (rest_002) =====
    {
        "_id": "item_005",
        "restaurant_id": "rest_002",
        "name": "Margherita Pizza",
        "description": "Classic thin-crust wood-fired pizza with San Marzano tomato sauce, fresh buffalo mozzarella, and aromatic basil.",
        "price": 299,
        "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "pizza",
        "is_bestseller": True,
    },
    {
        "_id": "item_006",
        "restaurant_id": "rest_002",
        "name": "Pepperoni Feast",
        "description": "Loaded with double spicy pepperoni, stretchy mozzarella cheese, and our handcrafted herb tomato sauce.",
        "price": 449,
        "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "pizza",
        "is_bestseller": True,
    },
    {
        "_id": "item_007",
        "restaurant_id": "rest_002",
        "name": "Penne Alfredo",
        "description": "Creamy Parmesan Alfredo sauce tossed with durum wheat penne pasta, sauteed button mushrooms, and cracked black pepper.",
        "price": 349,
        "image_url": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "pizza",
        "is_bestseller": False,
    },
    {
        "_id": "item_027",
        "restaurant_id": "rest_002",
        "name": "Quattro Formaggi Wood-Fired Pizza",
        "description": "Artisanal hand-stretched sourdough crust topped with creamy gorgonzola, fresh fior di latte, aged parmesan, and smoked scamorza.",
        "price": 499,
        "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "pizza",
        "is_bestseller": True,
    },
    {
        "_id": "item_028",
        "restaurant_id": "rest_002",
        "name": "Truffle Wild Mushroom Risotto",
        "description": "Creamy Carnaroli arborio rice slow-simmered with porcini and cremini mushrooms, finished with white truffle oil and Grana Padano.",
        "price": 399,
        "image_url": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "pizza",
        "is_bestseller": False,
    },
    {
        "_id": "item_029",
        "restaurant_id": "rest_002",
        "name": "Classic Bruschetta Pomodoro",
        "description": "Toasted sourdough slices rubbed with garlic, crowned with diced vine-ripened tomatoes, sweet basil, cold-pressed olive oil & balsamic glaze.",
        "price": 219,
        "image_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "pizza",
        "is_bestseller": False,
    },
    {
        "_id": "item_030",
        "restaurant_id": "rest_002",
        "name": "Spaghetti Aglio Olio e Peperoncino",
        "description": "Al dente Italian spaghetti tossed with golden garlic slivers, crushed red pepper flakes, fresh parsley, and cold-pressed extra virgin olive oil.",
        "price": 329,
        "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "pizza",
        "is_bestseller": True,
    },
    {
        "_id": "item_031",
        "restaurant_id": "rest_002",
        "name": "Tiramisu Classico",
        "description": "Espresso-soaked Savoiardi ladyfinger biscuits layered with velvety mascarpone zabaglione and dusted with bitter cocoa powder.",
        "price": 279,
        "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "dessert",
        "is_bestseller": True,
    },

    # ===== 3. Sandy's Chocolate Laboratory (rest_003) =====
    {
        "_id": "item_008",
        "restaurant_id": "rest_003",
        "name": "Classic Smash Burger",
        "description": "Juicy double smashed patty with yellow cheddar cheese, gherkins, grilled onions, and Sandy's secret burger relish.",
        "price": 249,
        "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "burger",
        "is_bestseller": True,
    },
    {
        "_id": "item_009",
        "restaurant_id": "rest_003",
        "name": "Veggie Crunch Burger",
        "description": "Crispy spiced vegetable patty with iceberg lettuce, vine tomatoes, melted cheese, and smoky chipotle mayo.",
        "price": 199,
        "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "burger",
        "is_bestseller": False,
    },
    {
        "_id": "item_010",
        "restaurant_id": "rest_003",
        "name": "Loaded Peri Peri Fries",
        "description": "Crispy golden skin-on fries dusted with African bird's eye peri-peri spice and drizzled with warm cheese sauce.",
        "price": 159,
        "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "burger",
        "is_bestseller": True,
    },
    {
        "_id": "item_032",
        "restaurant_id": "rest_003",
        "name": "BBQ Pulled Chicken Burger",
        "description": "Slow-smoked tender shredded chicken tossed in sweet hickory BBQ sauce, topped with creamy red cabbage slaw in a toasted brioche bun.",
        "price": 279,
        "image_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "burger",
        "is_bestseller": True,
    },
    {
        "_id": "item_033",
        "restaurant_id": "rest_003",
        "name": "Sandy's Triple Chocolate Monster Shake",
        "description": "Decadent milkshake blended with Belgian chocolate ganache, brownie crumbles, chocolate curls, and Sandy's signature chocolate syringe.",
        "price": 259,
        "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "dessert",
        "is_bestseller": True,
    },
    {
        "_id": "item_034",
        "restaurant_id": "rest_003",
        "name": "Truffle Parmesan Fries",
        "description": "Hand-cut crispy golden fries drizzled with aromatic white truffle oil, freshly grated parmesan cheese, and fine chopped chives.",
        "price": 189,
        "image_url": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "burger",
        "is_bestseller": False,
    },
    {
        "_id": "item_035",
        "restaurant_id": "rest_003",
        "name": "Crispy Buffalo Chicken Wings (6 pcs)",
        "description": "Crunchy golden wings coated in tangy New York cayenne pepper glaze, served with cool cucumber sticks and blue cheese dip.",
        "price": 289,
        "image_url": "https://images.unsplash.com/photo-1527477378408-1bc09c2a5c02?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "burger",
        "is_bestseller": True,
    },
    {
        "_id": "item_036",
        "restaurant_id": "rest_003",
        "name": "Nutella French Toast",
        "description": "Thick golden brioche French toast stuffed with melted Nutella, garnished with caramelized banana coins and toasted hazelnuts.",
        "price": 229,
        "image_url": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "dessert",
        "is_bestseller": False,
    },

    # ===== 4. Mainland China & Dragon Wok (rest_004) =====
    {
        "_id": "item_011",
        "restaurant_id": "rest_004",
        "name": "Kung Pao Chicken",
        "description": "Wok-tossed chicken chunks with toasted peanuts, scallions, and dry red chilies in sweet-savory Kung Pao glaze.",
        "price": 329,
        "image_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "chinese",
        "is_bestseller": True,
    },
    {
        "_id": "item_012",
        "restaurant_id": "rest_004",
        "name": "Veg Hakka Noodles",
        "description": "Street-style wok tossed noodles with julienned bell peppers, spring onion, cabbage, and light soy sauce.",
        "price": 229,
        "image_url": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "chinese",
        "is_bestseller": False,
    },
    {
        "_id": "item_037",
        "restaurant_id": "rest_004",
        "name": "Steamed Chicken Siu Mai Dim Sum (6 pcs)",
        "description": "Handcrafted open-face steamed dim sum dumplings filled with minced chicken, fresh water chestnuts, sesame oil, and ginger.",
        "price": 299,
        "image_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "chinese",
        "is_bestseller": True,
    },
    {
        "_id": "item_038",
        "restaurant_id": "rest_004",
        "name": "Crispy Chilli Baby Corn",
        "description": "Golden crisp baby corn spears tossed with crunchy bell peppers, onions, crushed schezwan pepper, and scallions.",
        "price": 219,
        "image_url": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "chinese",
        "is_bestseller": True,
    },
    {
        "_id": "item_039",
        "restaurant_id": "rest_004",
        "name": "Schezwan Egg Fried Rice",
        "description": "Wok-charred fragrant basmati rice tossed with farm eggs, finely diced garden veggies, and fiery home-made schezwan chili paste.",
        "price": 249,
        "image_url": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "chinese",
        "is_bestseller": False,
    },
    {
        "_id": "item_040",
        "restaurant_id": "rest_004",
        "name": "Thai Green Curry with Jasmine Rice",
        "description": "Fragrant coconut milk curry simmered with lemongrass, kaffir lime, galangal, bamboo shoots, and served with fluffy steamed jasmine rice.",
        "price": 379,
        "image_url": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "chinese",
        "is_bestseller": True,
    },
    {
        "_id": "item_041",
        "restaurant_id": "rest_004",
        "name": "Prawn Tempura with Sweet Chili Dip",
        "description": "Crisp golden Japanese-style panko crumbed butterfly king prawns, served with a piquant sweet chili dipping sauce.",
        "price": 389,
        "image_url": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "chinese",
        "is_bestseller": True,
    },

    # ===== 5. Murugan Idli Shop (rest_005) =====
    {
        "_id": "item_013",
        "restaurant_id": "rest_005",
        "name": "Ghee Podi Idli (4 pcs)",
        "description": "Murugan's signature melt-in-mouth steamed idlis generously smeared with aromatic pure ghee and spicy gun powder podi.",
        "price": 120,
        "image_url": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_014",
        "restaurant_id": "rest_005",
        "name": "Madras Degree Filter Coffee",
        "description": "Authentic Madras decoction coffee poured frothy in a traditional brass davarah tumbler. Rich, intense, and aromatic.",
        "price": 60,
        "image_url": "/images/dishes/filter_coffee.jpg",
        "is_veg": True,
        "category": "beverages",
        "is_bestseller": True,
    },
    {
        "_id": "item_015",
        "restaurant_id": "rest_005",
        "name": "Crispy Ghee Roast Masala Dosa",
        "description": "Paper-crisp golden dosa roasted with pure cow ghee and spiced potato masala, served with 4 fresh chutneys and sambar.",
        "price": 130,
        "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_042",
        "restaurant_id": "rest_005",
        "name": "Crispy Medu Vada (2 pcs)",
        "description": "Crisp golden black-gram lentil doughnuts flavored with cumin, ginger, green chilies, and black pepper. Served with coconut chutney and piping hot sambar.",
        "price": 70,
        "image_url": "/images/dishes/medu_vada.jpg",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_043",
        "restaurant_id": "rest_005",
        "name": "Ghee Ven Pongal with Sambar",
        "description": "Mouthwatering hot rice and moong dal preparation roasted with whole black peppercorns, ginger, cashews and copious amounts of pure melted ghee.",
        "price": 110,
        "image_url": "/images/dishes/ven_pongal.jpg",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_044",
        "restaurant_id": "rest_005",
        "name": "Onion Rava Masala Dosa",
        "description": "Crisp netted semolina crepe topped with diced shallots, chopped cashews, cumin seeds, and rolled with savory potato masala.",
        "price": 140,
        "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": False,
    },
    {
        "_id": "item_045",
        "restaurant_id": "rest_005",
        "name": "Ghee Podi Onion Uttapam",
        "description": "Thick spongy fermented rice pancake topped with finely diced red onions, cilantro, fiery green chilies, roasted podi, and melted ghee.",
        "price": 135,
        "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": False,
    },
    {
        "_id": "item_046",
        "restaurant_id": "rest_005",
        "name": "Traditional Sakkarai Pongal",
        "description": "Festive South Indian sweet rice delicacy simmered in organic jaggery syrup, pure cow ghee, crushed green cardamom, and golden fried cashews & raisins.",
        "price": 90,
        "image_url": "/images/dishes/sakkarai_pongal.jpg",
        "is_veg": True,
        "category": "dessert",
        "is_bestseller": False,
    },

    # ===== 6. Anjappar Chettinad Restaurant (rest_006) =====
    {
        "_id": "item_016",
        "restaurant_id": "rest_006",
        "name": "Chettinad Pepper Chicken",
        "description": "Country chicken pieces dry roasted with stone-ground Tellicherry black pepper, shallots, and fragrant curry leaves.",
        "price": 349,
        "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_017",
        "restaurant_id": "rest_006",
        "name": "Chettinad Veg Kothu Parotta",
        "description": "Shredded layered parottas wok-beaten with garden vegetables, Chettinad salna gravy, and green chilies.",
        "price": 219,
        "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_047",
        "restaurant_id": "rest_006",
        "name": "Anjappar Mutton Sukka Varuval",
        "description": "Signature dry-roasted bone-in mutton tossed with cracked Tellicherry black pepper, shallots, garlic, and fresh curry leaves.",
        "price": 389,
        "image_url": "/images/dishes/mutton_sukka.jpg",
        "is_veg": False,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_048",
        "restaurant_id": "rest_006",
        "name": "Chettinad Crab Roast / Nandu Masala",
        "description": "Fresh coastal blue swimmer crab cooked in an intensely spiced roasted fennel, coriander, pepper and coconut masala gravy.",
        "price": 429,
        "image_url": "/images/dishes/crab_roast.jpg",
        "is_veg": False,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_049",
        "restaurant_id": "rest_006",
        "name": "Bun Parotta with Chicken Salna (2 pcs)",
        "description": "Crisp, golden-brown puffed Madurai-style spiral bun parottas served with rich spicy roadside chicken salna.",
        "price": 229,
        "image_url": "/images/dishes/bun_parotta.jpg",
        "is_veg": False,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_050",
        "restaurant_id": "rest_006",
        "name": "Seer Fish Pollichathu",
        "description": "Fresh coastal Vanjaram (king fish) steak smothered in spicy onion-tomato masala, wrapped in tender banana leaf and pan-grilled.",
        "price": 399,
        "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "south_indian",
        "is_bestseller": False,
    },
    {
        "_id": "item_051",
        "restaurant_id": "rest_006",
        "name": "Chettinad Egg Biryani",
        "description": "Fragrant Seeraga Samba rice dum-cooked with roasted spices, mint, coriander, and two seasoned hard-boiled farm eggs.",
        "price": 249,
        "image_url": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "biryani",
        "is_bestseller": False,
    },

    # ===== 7. Writer's Cafe (rest_007) =====
    {
        "_id": "item_018",
        "restaurant_id": "rest_007",
        "name": "Belgian Dark Chocolate Cake",
        "description": "Decadent, rich dark chocolate fudge slice crafted with 70% Callebaut Belgian chocolate ganache.",
        "price": 349,
        "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "dessert",
        "is_bestseller": True,
    },
    {
        "_id": "item_019",
        "restaurant_id": "rest_007",
        "name": "Madras Alphonso Mango Tart",
        "description": "Butter pastry tart filled with silky vanilla cream and crowned with fresh Alphonso mango slices.",
        "price": 229,
        "image_url": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "dessert",
        "is_bestseller": False,
    },
    {
        "_id": "item_052",
        "restaurant_id": "rest_007",
        "name": "Artisanal Swiss Hot Chocolate",
        "description": "Thick, velvety melted dark Swiss chocolate drink infused with vanilla bean and topped with soft toasted marshmallows.",
        "price": 199,
        "image_url": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "beverages",
        "is_bestseller": True,
    },
    {
        "_id": "item_053",
        "restaurant_id": "rest_007",
        "name": "Smoked Chicken & Pesto Panini",
        "description": "Crusty grilled sourdough panini loaded with hickory smoked chicken breast, basil pesto, melted mozzarella and sundried tomatoes.",
        "price": 289,
        "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&h=350&fit=crop",
        "is_veg": False,
        "category": "north_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_054",
        "restaurant_id": "rest_007",
        "name": "Fresh Blueberry Waffle with Gelato",
        "description": "Crisp golden Brussels waffle topped with warm wild blueberry compote, powdered sugar, and Madagascar vanilla bean gelato.",
        "price": 269,
        "image_url": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "dessert",
        "is_bestseller": True,
    },
    {
        "_id": "item_055",
        "restaurant_id": "rest_007",
        "name": "Red Velvet Cupcake with Cream Cheese",
        "description": "Moist cocoa-buttermilk sponge crowned with a swirl of rich Philadelphia cream cheese frosting and red velvet crumble.",
        "price": 139,
        "image_url": "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "dessert",
        "is_bestseller": False,
    },
    {
        "_id": "item_056",
        "restaurant_id": "rest_007",
        "name": "Flaky French Butter Croissant",
        "description": "Laminated golden French pastry made with cultured Brittany butter, baked fresh daily with honeycomb airy layers.",
        "price": 149,
        "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "dessert",
        "is_bestseller": False,
    },

    # ===== 8. Madras Coffee House & Beach Bites (rest_008) =====
    {
        "_id": "item_020",
        "restaurant_id": "rest_008",
        "name": "Madras Ginger Masala Chai",
        "description": "Slow-brewed strong tea infused with crushed organic ginger, green cardamom, and clove.",
        "price": 49,
        "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "beverages",
        "is_bestseller": True,
    },
    {
        "_id": "item_021",
        "restaurant_id": "rest_008",
        "name": "Bessie Beach Sundal & Samosa",
        "description": "Famous Besant Nagar beach tempered sundal with grated coconut & raw mango, paired with 2 hot crunchy samosas.",
        "price": 79,
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_057",
        "restaurant_id": "rest_008",
        "name": "Madras Bun Butter Jam",
        "description": "Soft sweet bakery bun packed with thick fresh white butter and mixed fruit jam. Madras' timeless school & college comfort bite.",
        "price": 69,
        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_058",
        "restaurant_id": "rest_008",
        "name": "Marina Beach Tawa Fish Fry",
        "description": "Fresh caught coastal fish slices coated in fiery red chili-garlic paste and semolina, crisp shallow-fried on tawa with onion rings.",
        "price": 249,
        "image_url": "/images/dishes/fish_fry.jpg",
        "is_veg": False,
        "category": "south_indian",
        "is_bestseller": True,
    },
    {
        "_id": "item_059",
        "restaurant_id": "rest_008",
        "name": "Chilli Cheese Garlic Toast",
        "description": "Crusty golden bread slices topped with melted cheddar, chopped fiery green chilies, bell peppers, garlic butter and oregano.",
        "price": 119,
        "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": False,
    },
    {
        "_id": "item_060",
        "restaurant_id": "rest_008",
        "name": "Chilled Rose Milk with Sabja",
        "description": "Madras-style fragrant chilled rose milk infused with sweet basil seeds (sabja) and pure condensed milk. Ultra refreshing.",
        "price": 79,
        "image_url": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "beverages",
        "is_bestseller": True,
    },
    {
        "_id": "item_061",
        "restaurant_id": "rest_008",
        "name": "Delhi Samosa Chaat",
        "description": "Golden crushed vegetable samosas layered with warm spiced white peas ragda, tamarind saunth, spicy mint chutney and crunchy sev.",
        "price": 99,
        "image_url": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&h=350&fit=crop",
        "is_veg": True,
        "category": "south_indian",
        "is_bestseller": False,
    },
]


async def seed_data():
    """Seed the database with initial restaurant and menu data if empty or incomplete."""
    global db
    if db is None:
        return

    # Seed restaurants
    count = await db.restaurants.count_documents({})
    if count == 0:
        await db.restaurants.insert_many(SEED_RESTAURANTS)
        print(f"[SEED] Seeded {len(SEED_RESTAURANTS)} restaurants")

    # Seed menu items
    count = await db.menu_items.count_documents({})
    if count < len(SEED_MENU_ITEMS):
        if hasattr(db.menu_items, "delete_many"):
            await db.menu_items.delete_many({})
        await db.menu_items.insert_many(SEED_MENU_ITEMS)
        print(f"[SEED] Seeded {len(SEED_MENU_ITEMS)} menu items")
