import { ShoppingBag, Search, MapPin, Tag, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Placeholder data -- this will be connected to the backend
const sampleBusinesses = [
  { id: 1, name: "Grace Bakery", category: "Food & Beverage", description: "Homemade breads, cakes, and pastries by a church family member.", location: "Downtown", isChurchMember: true },
  { id: 2, name: "Faith Auto Repair", category: "Automotive", description: "Honest, affordable auto repair with a Christian foundation.", location: "Eastside", isChurchMember: true },
  { id: 3, name: "Living Waters Landscaping", category: "Home & Garden", description: "Professional landscaping and yard maintenance.", location: "Citywide", isChurchMember: true },
];

const sampleItems = [
  { id: 1, title: "Used Study Bible (ESV)", price: 1500, seller: "John M.", category: "Books", condition: "Good" },
  { id: 2, title: "Children's Sunday School Curriculum", price: 2500, seller: "Sarah K.", category: "Education", condition: "New" },
  { id: 3, title: "Worship Guitar (Acoustic)", price: 15000, seller: "Mike D.", category: "Music", condition: "Like New" },
];

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function MarketplacePage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="size-6" /> Marketplace
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Support church family businesses and browse community items
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search marketplace..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Tabs defaultValue="businesses">
        <TabsList>
          <TabsTrigger value="businesses">Church Businesses</TabsTrigger>
          <TabsTrigger value="items">Buy & Sell</TabsTrigger>
          <TabsTrigger value="skills">Skill Exchange</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleBusinesses.map((b) => (
              <Card key={b.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-[10px]">{b.category}</Badge>
                    {b.isChurchMember && (
                      <Badge className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                        Church Member
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mt-2">{b.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{b.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {b.location}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <ExternalLink className="size-4 mr-2" /> Visit Business
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground mb-2">Own a business? List it here to connect with the church community.</p>
            <Button variant="outline">Add Your Business</Button>
          </div>
        </TabsContent>

        <TabsContent value="items" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                    <Badge variant="outline" className="text-[10px]">{item.condition}</Badge>
                  </div>
                  <h3 className="font-semibold mt-2">{item.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-primary">{formatPrice(item.price)}</span>
                    <span className="text-xs text-muted-foreground">by {item.seller}</span>
                  </div>
                  <Button size="sm" className="w-full mt-3">Contact Seller</Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button variant="outline">List an Item for Sale</Button>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <div className="text-center py-12">
            <Tag className="size-12 text-muted-foreground/50 mx-auto" />
            <h3 className="font-semibold text-lg mt-4">Skill Exchange</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
              Trade skills with other church members. Offer tutoring, home repair, cooking lessons, and more. Coming soon!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
