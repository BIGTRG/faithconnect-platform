import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  MessageSquare,
  Send,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const DEFAULT_CATEGORIES = [
  { name: "Ask the Pastor", icon: "⛪", desc: "Spiritual guidance and pastoral counsel", free: true },
  { name: "Faith & Legal", icon: "⚖️", desc: "Legal questions through a faith lens", free: false, price: 1.99 },
  { name: "Marriage & Family", icon: "💍", desc: "Relationship and family counsel", free: false, price: 0.99 },
  { name: "Financial Wisdom", icon: "💰", desc: "Biblical financial advice", free: false, price: 1.99 },
  { name: "Youth Mentorship", icon: "🎓", desc: "Guidance for young adults", free: true },
  { name: "Grief Counseling", icon: "💔", desc: "Walking through loss and grief", free: true },
];

export function ExpertQAPage() {
  const categories = useQuery(api.expertQA.listCategories);
  const myQuestions = useQuery(api.expertQA.listQuestions, {});
  const askQuestion = useMutation(api.expertQA.askQuestion);

  const [selectedCat, setSelectedCat] = useState<Id<"expertCategories"> | null>(null);
  const [question, setQuestion] = useState("");

  const selectedCategory = categories?.find((c) => c._id === selectedCat);

  async function handleAsk() {
    if (!question.trim() || !selectedCat) return;
    await askQuestion({ categoryId: selectedCat, question: question.trim() });
    setQuestion("");
    toast.success("Question submitted");
  }

  if (selectedCat && selectedCategory) {
    const catQuestions = myQuestions?.filter((q) => q.categoryId === selectedCat) ?? [];
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => setSelectedCat(null)} className="mb-4">
          <ArrowLeft className="size-4 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{selectedCategory.icon ?? "💬"}</span>
          <div>
            <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedCategory.isFree ? "Free" : `$${(selectedCategory.pricePerQuestion / 100).toFixed(2)} per question`}
              {selectedCategory.expertName && ` · Answered by ${selectedCategory.expertName}`}
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="py-4">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question..."
              rows={3}
            />
            <Button onClick={handleAsk} className="mt-3 w-full">
              <Send className="size-4 mr-2" />
              {selectedCategory.isFree ? "Ask Question" : `Ask ($${(selectedCategory.pricePerQuestion / 100).toFixed(2)})`}
            </Button>
          </CardContent>
        </Card>

        <h3 className="font-semibold mb-3">Your Questions</h3>
        {catQuestions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No questions yet. Ask your first one above.</p>
        ) : (
          <div className="space-y-3">
            {catQuestions.map((q) => (
              <Card key={q._id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    {q.status === "answered" ? (
                      <CheckCircle2 className="size-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <Clock className="size-5 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{q.question}</p>
                      {q.answer && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium text-primary mb-1">Answer:</p>
                          <p className="text-sm">{q.answer}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(q.askedAt).toLocaleDateString()} · {q.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const displayCats = categories && categories.length > 0 ? categories : null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <MessageSquare className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">Expert Q&A</h1>
      </div>
      <p className="text-muted-foreground mb-6">Get answers from trusted experts in your faith community</p>

      {displayCats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayCats.map((cat) => (
            <Card key={cat._id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedCat(cat._id)}>
              <CardContent className="py-6 text-center">
                <span className="text-4xl">{cat.icon ?? "💬"}</span>
                <h3 className="font-bold mt-3">{cat.name}</h3>
                {cat.description && <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>}
                <p className="text-xs mt-2 font-medium text-primary">
                  {cat.isFree ? "Free" : `$${(cat.pricePerQuestion / 100).toFixed(2)}/question`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_CATEGORIES.map((cat) => (
            <Card key={cat.name} className="opacity-90">
              <CardContent className="py-6 text-center">
                <span className="text-4xl">{cat.icon}</span>
                <h3 className="font-bold mt-3">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{cat.desc}</p>
                <p className="text-xs mt-2 font-medium text-primary">
                  {cat.free ? "Free" : `$${cat.price?.toFixed(2)}/question`}
                </p>
              </CardContent>
            </Card>
          ))}
          <Card className="border-dashed">
            <CardContent className="py-6 text-center">
              <HelpCircle className="size-10 mx-auto text-muted-foreground" />
              <h3 className="font-bold mt-3">More Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-1">Expert categories are set up by your church admin</p>
            </CardContent>
          </Card>
        </div>
      )}

      {myQuestions && myQuestions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">My Recent Questions</h2>
          <div className="space-y-3">
            {myQuestions.slice(0, 5).map((q) => (
              <Card key={q._id}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    {q.status === "answered" ? <CheckCircle2 className="size-4 text-green-500" /> : <Clock className="size-4 text-amber-500" />}
                    <p className="text-sm flex-1 truncate">{q.question}</p>
                    <span className="text-xs text-muted-foreground">{q.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
