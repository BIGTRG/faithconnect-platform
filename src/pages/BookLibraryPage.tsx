import { useQuery } from "convex/react";
import {
  BookOpen,
  Download,
  Eye,
  Library,
  Search,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  { value: "all", label: "All Books", icon: "📚" },
  { value: "devotional", label: "Devotionals", icon: "🙏" },
  { value: "theology", label: "Theology", icon: "📖" },
  { value: "marriage", label: "Marriage", icon: "💍" },
  { value: "parenting", label: "Parenting", icon: "👨‍👩‍👧" },
  { value: "leadership", label: "Leadership", icon: "👑" },
  { value: "youth", label: "Youth", icon: "🎓" },
  { value: "prayer", label: "Prayer", icon: "🕊️" },
  { value: "healing", label: "Healing", icon: "❤️‍🩹" },
  { value: "finance", label: "Finance", icon: "💰" },
  { value: "missions", label: "Missions", icon: "🌍" },
  { value: "testimony", label: "Testimonies", icon: "✨" },
  { value: "study_guide", label: "Study Guides", icon: "📝" },
];

const BOOK_COLORS = [
  "from-blue-600 to-blue-800",
  "from-purple-600 to-purple-800",
  "from-emerald-600 to-emerald-800",
  "from-amber-600 to-amber-800",
  "from-rose-600 to-rose-800",
  "from-indigo-600 to-indigo-800",
  "from-teal-600 to-teal-800",
  "from-orange-600 to-orange-800",
];

const SAMPLE_BOOKS = [
  {
    title: "Walking in Purpose",
    author: "AI Faith Writer",
    description: "A 30-day devotional journey to discover God's unique calling for your life. Each chapter includes scripture meditation, reflection questions, and a daily prayer.",
    category: "devotional",
    price: 7.99,
    pageCount: 120,
    isAiGenerated: true,
    isFeatured: true,
    rating: 4.8,
    totalSales: 234,
  },
  {
    title: "Foundations of Grace",
    author: "AI Faith Writer",
    description: "A comprehensive study guide exploring the doctrine of grace through systematic theology. Perfect for small groups and personal study.",
    category: "theology",
    price: 12.99,
    pageCount: 280,
    isAiGenerated: true,
    isFeatured: true,
    rating: 4.9,
    totalSales: 189,
  },
  {
    title: "Marriage God's Way",
    author: "AI Faith Writer",
    description: "Practical wisdom for building a strong, faith-centered marriage. Covers communication, conflict resolution, intimacy, and shared spiritual growth.",
    category: "marriage",
    price: 9.99,
    pageCount: 200,
    isAiGenerated: true,
    isFeatured: false,
    rating: 4.7,
    totalSales: 156,
  },
  {
    title: "Raising Kingdom Kids",
    author: "AI Faith Writer",
    description: "A parent's guide to nurturing children's faith from toddlers to teens. Age-specific strategies, family devotion ideas, and milestone markers.",
    category: "parenting",
    price: 11.99,
    pageCount: 240,
    isAiGenerated: true,
    isFeatured: true,
    rating: 4.6,
    totalSales: 142,
  },
  {
    title: "The Prayer Warrior's Handbook",
    author: "AI Faith Writer",
    description: "Transform your prayer life with 52 weeks of guided intercession, warfare prayers, and declarations. Includes morning and evening prayer templates.",
    category: "prayer",
    price: 8.99,
    pageCount: 160,
    isAiGenerated: true,
    isFeatured: true,
    rating: 4.9,
    totalSales: 312,
  },
  {
    title: "Financial Freedom Through Faith",
    author: "AI Faith Writer",
    description: "Biblical principles for debt freedom, wise investing, generous giving, and building wealth God's way. Worksheets and budgeting tools included.",
    category: "finance",
    price: 14.99,
    pageCount: 220,
    isAiGenerated: true,
    isFeatured: false,
    rating: 4.5,
    totalSales: 98,
  },
  {
    title: "Healing from the Inside Out",
    author: "AI Faith Writer",
    description: "Integrating faith and emotional healing for trauma, grief, and past wounds. Written with both clinical understanding and spiritual depth.",
    category: "healing",
    price: 10.99,
    pageCount: 190,
    isAiGenerated: true,
    isFeatured: false,
    rating: 4.8,
    totalSales: 176,
  },
  {
    title: "Voices of Faith: Real Stories",
    author: "AI Faith Writer",
    description: "A curated collection of powerful testimonies from everyday believers. Stories of redemption, miracles, and God's faithfulness in ordinary lives.",
    category: "testimony",
    price: 6.99,
    pageCount: 150,
    isAiGenerated: true,
    isFeatured: false,
    rating: 4.7,
    totalSales: 201,
  },
  {
    title: "Next Gen Leaders",
    author: "AI Faith Writer",
    description: "Equipping young adults for servant leadership in church, career, and community. Real-world case studies with biblical leadership principles.",
    category: "youth",
    price: 9.99,
    pageCount: 180,
    isAiGenerated: true,
    isFeatured: true,
    rating: 4.6,
    totalSales: 87,
  },
];

function BookCard({ book, colorIndex }: { book: typeof SAMPLE_BOOKS[0]; colorIndex: number }) {
  const cat = CATEGORIES.find((c) => c.value === book.category);
  const bgGradient = BOOK_COLORS[colorIndex % BOOK_COLORS.length];
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
      <DialogTrigger asChild>
        <Card className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
          <div className={`aspect-[3/4] bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center p-6 text-white relative`}>
            {book.isFeatured && (
              <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-950 text-xs">
                <Star className="size-3 mr-0.5 fill-current" /> Featured
              </Badge>
            )}
            {book.isAiGenerated && (
              <Badge className="absolute top-2 left-2 bg-white/20 text-white text-xs backdrop-blur-sm">
                <Sparkles className="size-3 mr-0.5" /> AI Generated
              </Badge>
            )}
            <BookOpen className="size-10 mb-3 opacity-80" />
            <h3 className="text-center font-bold text-sm leading-tight">{book.title}</h3>
            <p className="text-center text-xs opacity-75 mt-1">{book.author}</p>
          </div>
          <CardContent className="py-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {cat?.icon} {cat?.label}
              </Badge>
              <span className="font-bold text-lg">${book.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                {book.rating}
              </span>
              <span>{book.pageCount} pages</span>
              <span>{book.totalSales} sold</span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{book.title}</DialogTitle>
          <DialogDescription>by {book.author}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className={`h-48 bg-gradient-to-br ${bgGradient} rounded-lg flex flex-col items-center justify-center text-white`}>
            <BookOpen className="size-12 mb-2 opacity-80" />
            <p className="font-bold">{book.title}</p>
          </div>
          <p className="text-sm text-muted-foreground">{book.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{cat?.icon} {cat?.label}</Badge>
            <Badge variant="outline">{book.pageCount} pages</Badge>
            <Badge variant="outline">
              <Star className="size-3 mr-1 fill-yellow-400 text-yellow-400" />
              {book.rating} rating
            </Badge>
            {book.isAiGenerated && (
              <Badge variant="secondary">
                <Sparkles className="size-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" size="lg">
              <Download className="size-4 mr-2" />
              Buy Now -- ${book.price.toFixed(2)}
            </Button>
            <Button variant="outline" size="lg">
              <Eye className="size-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BookLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const member = useCurrentMember();

  const books = useQuery(
    api.bookLibrary.listBooks,
    member?.churchId
      ? { churchId: member.churchId, category: selectedCategory !== "all" ? selectedCategory : undefined }
      : "skip",
  );

  const allBooks = books && books.length > 0
    ? books
    : SAMPLE_BOOKS.filter(
        (b) => selectedCategory === "all" || b.category === selectedCategory,
      );

  const displayBooks = search
    ? allBooks.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
    : allBooks;

  const featuredBooks = SAMPLE_BOOKS.filter((b) => b.isFeatured);

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Library className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">Book Library</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            AI-generated faith books tailored to your church's beliefs and teachings
          </p>
        </div>
      </div>

      <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-900">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
            <Sparkles className="size-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">New Books Every Week</p>
            <p className="text-xs text-muted-foreground">
              Our AI generates fresh faith-based content tailored to your church's denomination, beliefs, and spiritual focus. Books range from $3 to $30.
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 border-purple-300 text-purple-700 dark:text-purple-300">
            <Tag className="size-3 mr-1" />
            $3 - $30
          </Badge>
        </CardContent>
      </Card>

      {selectedCategory === "all" && !search && (
        <div>
          <h2 className="text-lg font-semibold mb-3">This Week's Featured</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {featuredBooks.map((book, i) => (
              <BookCard key={i} book={book} colorIndex={i} />
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search books..."
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

      <div>
        <h2 className="text-lg font-semibold mb-3">
          {selectedCategory === "all" ? "All Books" : CATEGORIES.find((c) => c.value === selectedCategory)?.label}
          <span className="text-sm text-muted-foreground font-normal ml-2">({displayBooks.length} books)</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayBooks.length > 0 ? (
            displayBooks.map((book, i) => (
              <BookCard key={i} book={book as any} colorIndex={i + 3} />
            ))
          ) : (
            <Card className="col-span-5 py-16">
              <CardContent className="flex flex-col items-center text-center">
                <Library className="size-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">No Books Found</h3>
                <p className="text-muted-foreground mt-1">
                  No books match your search. Try a different category or check back for new releases.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
