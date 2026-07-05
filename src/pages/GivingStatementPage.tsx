import { useQuery } from "convex/react";
import {
  FileText, DollarSign, Download, Calendar, PieChart,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const typeLabels: Record<string, string> = {
  tithe: "Tithe", offering: "Offering", mission: "Missions", building: "Building Fund",
  benevolence: "Benevolence", campaign: "Campaign", other: "Other",
};

const typeColors: Record<string, string> = {
  tithe: "bg-purple-500", offering: "bg-blue-500", mission: "bg-green-500",
  building: "bg-amber-500", benevolence: "bg-pink-500", campaign: "bg-cyan-500", other: "bg-gray-500",
};

export function GivingStatementPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear.toString());
  const statement = useQuery(api.stripeConnect.getGivingStatement, { year: parseInt(year) });

  const totalByType = statement?.byType ?? {};
  const total = statement?.total ?? 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="size-6" /> Giving Statement
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Your tax-deductible giving summary</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="size-4 mr-2" />Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Given</p>
            <p className="text-2xl font-bold text-primary">${total.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold">{statement?.transactionCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Church</p>
            <p className="text-sm font-semibold truncate">{statement?.churchName ?? "..."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Year</p>
            <p className="text-2xl font-bold">{year}</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PieChart className="size-5" />Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(totalByType).map(([type, amount]) => {
              const pct = total > 0 ? ((amount as number) / total) * 100 : 0;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className={`size-3 rounded-full ${typeColors[type] ?? "bg-gray-500"}`} />
                      {typeLabels[type] ?? type}
                    </span>
                    <span className="font-medium">${(amount as number).toFixed(2)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${typeColors[type] ?? "bg-gray-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(totalByType).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No giving records for {year}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="size-5" />Transaction History</CardTitle>
          <CardDescription>{statement?.transactionCount ?? 0} transactions in {year}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(statement?.records ?? []).map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <DollarSign className="size-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{typeLabels[r.type] ?? r.type}</p>
                    <p className="text-xs text-muted-foreground">{r.date} via {r.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${r.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{r.transactionId}</p>
                </div>
              </div>
            ))}
            {(statement?.records ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No transactions found for {year}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tax Notice */}
      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Tax Notice:</strong> This statement is provided for your records. Contributions to {statement?.churchName ?? "your church"} may be tax-deductible to the extent allowed by law. Please consult your tax advisor. No goods or services were provided in exchange for your contributions unless otherwise noted.
          </p>
          {statement?.churchAddress && (
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-2">{statement.churchAddress}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
