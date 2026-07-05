import { useQuery } from "convex/react";
import {
  Package,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";

const CATEGORIES = [
  { value: "all", label: "All Items", icon: "🏪" },
  { value: "apparel", label: "Apparel", icon: "👕" },
  { value: "accessories", label: "Accessories", icon: "🧢" },
  { value: "books", label: "Books", icon: "📚" },
  { value: "media", label: "Media", icon: "💿" },
  { value: "supplies", label: "Supplies", icon: "📦" },
  { value: "food", label: "Food & Drink", icon: "☕" },
  { value: "art", label: "Art & Decor", icon: "🎨" },
  { value: "gifts", label: "Gifts", icon: "🎁" },
];

const SAMPLE_PRODUCTS = [
  {
    name: "Church Logo T-Shirt",
    description: "Premium cotton tee with embroidered church logo. Available in S-3XL. Unisex fit.",
    category: "apparel",
    price: 24.99,
    compareAtPrice: 34.99,
    isDigital: false,
    isFeatured: true,
    tags: ["bestseller", "new"],
    inventory: 150,
  },
  {
    name: "Faith Over Fear Hoodie",
    description: "Heavyweight fleece hoodie with 'Faith Over Fear' print. Perfect for cool mornings.",
    category: "apparel",
    price: 44.99,
    isDigital: false,
    isFeatured: true,
    tags: ["bestseller"],
    inventory: 75,
  },
  {
    name: "Worship Team Cap",
    description: "Adjustable snapback cap with church emblem. One size fits most.",
    category: "accessories",
    price: 18.99,
    isDigital: false,
    isFeatured: false,
    tags: [],
    inventory: 200,
  },
  {
    name: "Blessed & Grateful Mug",
    description: "Ceramic 12oz mug with gold foil lettering. Microwave & dishwasher safe.",
    category: "gifts",
    price: 14.99,
    isDigital: false,
    isFeatured: true,
    tags: ["popular"],
    inventory: 120,
  },
  {
    name: "Sunday Service Journal",
    description: "120-page sermon notes journal with scripture references. Linen-bound.",
    category: "supplies",
    price: 12.99,
    isDigital: false,
    isFeatured: false,
    tags: [],
    inventory: 300,
  },
  {
    name: "Live Worship Album (Digital)",
    description: "12 tracks recorded live at our annual worship conference. Instant download.",
    category: "media",
    price: 9.99,
    isDigital: true,
    isFeatured: true,
    tags: ["digital", "new"],
    inventory: undefined,
  },
  {
    name: "Church Anniversary Canvas",
    description: "18x24 gallery-wrapped canvas celebrating our church history. Limited edition.",
    category: "art",
    price: 39.99,
    isDigital: false,
    isFeatured: false,
    tags: ["limited"],
    inventory: 50,
  },
  {
    name: "Cross Pendant Necklace",
    description: "Sterling silver cross pendant on 18-inch chain. Gift box included.",
    category: "accessories",
    price: 29.99,
    isDigital: false,
    isFeatured: true,
    tags: ["gift"],
    inventory: 80,
  },
  {
    name: "Church Blend Coffee",
    description: "Fair trade medium roast. 12oz bag. Roasted locally. Perfect for fellowship.",
    category: "food",
    price: 15.99,
    isDigital: false,
    isFeatured: false,
    tags: ["fair-trade"],
    inventory: 200,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  apparel: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  accessories: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  books: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  media: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  supplies: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  food: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  art: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  gifts: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  other: "bg-gray-100 text-gray-800",
};

function ProductCard({ product }: { product: typeof SAMPLE_PRODUCTS[0] }) {
  const cat = CATEGORIES.find((c) => c.value === product.category);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Card className="hover:shadow-lg transition-shadow group overflow-hidden">
      <div className="aspect-square bg-muted/50 flex items-center justify-center relative">
        <Package className="size-16 text-muted-foreground/30" />
        {product.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-950">
            <Star className="size-3 mr-1 fill-current" /> Featured
          </Badge>
        )}
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 bg-red-500">
            Sale
          </Badge>
        )}
        {product.isDigital && (
          <Badge variant="secondary" className="absolute bottom-2 right-2">
            Digital
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
        </div>
        <Badge variant="outline" className={`w-fit text-xs ${CATEGORY_COLORS[product.category] || ""}`}>
          {cat?.icon} {cat?.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.compareAtPrice?.toFixed(2)}
              </span>
            )}
          </div>
          <Button size="sm">
            <ShoppingCart className="size-3.5 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChurchStorePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const member = useCurrentMember();

  const products = useQuery(
    api.store.listProducts,
    member?.churchId
      ? { churchId: member.churchId, category: selectedCategory !== "all" ? selectedCategory : undefined }
      : "skip",
  );

  const allProducts = products && products.length > 0
    ? products
    : SAMPLE_PRODUCTS.filter(
        (p) => selectedCategory === "all" || p.category === selectedCategory,
      );

  const displayProducts = search
    ? allProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : allProducts;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">Church Store</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Official merchandise, supplies, and gifts from your church
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={cartOpen} onOpenChange={setCartOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ShoppingCart className="size-4 mr-1" />
                Cart (0)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Shopping Cart</DialogTitle>
                <DialogDescription>Your cart is empty. Browse the store to add items.</DialogDescription>
              </DialogHeader>
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingCart className="size-12 mx-auto mb-3 opacity-30" />
                <p>No items in cart</p>
              </div>
            </DialogContent>
          </Dialog>
          <Button>
            <Plus className="size-4 mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Truck className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Free shipping on orders over $50</p>
            <p className="text-xs text-muted-foreground">
              All proceeds support church programs and community outreach. Digital items delivered instantly.
            </p>
          </div>
          <Badge variant="outline" className="shrink-0">
            <Tag className="size-3 mr-1" />
            Member Pricing
          </Badge>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayProducts.length > 0 ? (
          displayProducts.map((product, i) => (
            <ProductCard key={i} product={product as any} />
          ))
        ) : (
          <Card className="col-span-3 py-16">
            <CardContent className="flex flex-col items-center text-center">
              <ShoppingBag className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">No Products Found</h3>
              <p className="text-muted-foreground mt-1">
                No products match your search. Try a different category or check back soon.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
