"use client";

import { useState } from "react";
import { useSession } from "../../lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  DownloadIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const categories = [
  { value: "comida", label: "Comida" },
  { value: "transporte", label: "Transporte" },
  { value: "supermercado", label: "Supermercado" },
  { value: "salud", label: "Salud" },
  { value: "entretenimiento", label: "Entretenimiento" },
  { value: "software", label: "Software" },
  { value: "educacion", label: "Educación" },
  { value: "hogar", label: "Hogar" },
  { value: "servicios", label: "Servicios" },
  { value: "trabajo", label: "Trabajo" },
  { value: "otros", label: "Otros" },
];

export default function ReportsPage() {
  const { data: session } = useSession();
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [deductibleOnly, setDeductibleOnly] = useState(false);

  const handleExportCSV = async () => {
    if (!startDate || !endDate) {
      alert("Please select start and end dates");
      return;
    }

    if (!session?.user?.id) {
      alert("Not authenticated");
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch("/api/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          categories: selectedCategories,
          includeDeductibleOnly: deductibleOnly,
          userId: session.user.id,
        }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export expenses");
    } finally {
      setIsExporting(false);
    }
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const setThisMonth = () => {
    setStartDate(`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`);
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    setEndDate(
      `${currentYear}-${String(currentMonth).padStart(2, "0")}-${lastDay}`,
    );
  };

  const setThisQuarter = () => {
    const quarter = Math.ceil(currentMonth / 3);
    const startMonth = (quarter - 1) * 3 + 1;
    setStartDate(`${currentYear}-${String(startMonth).padStart(2, "0")}-01`);
    const endMonth = startMonth + 2;
    const lastDay = new Date(currentYear, endMonth, 0).getDate();
    setEndDate(
      `${currentYear}-${String(endMonth).padStart(2, "0")}-${lastDay}`,
    );
  };

  const setThisYear = () => {
    setStartDate(`${currentYear}-01-01`);
    setEndDate(`${currentYear}-12-31`);
  };

  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  };

  return (
    <div className="max-w-6xl w-full mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Export Reports</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>
              Select the start and end dates for your export.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Ranges</CardTitle>
            <CardDescription>Select a predefined date range.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              onClick={setThisMonth}
              className="w-full justify-start gap-2"
            >
              <HugeiconsIcon icon={CalendarIcon} size={18} />
              This Month
            </Button>
            <Button
              variant="outline"
              onClick={setThisQuarter}
              className="w-full justify-start gap-2"
            >
              <HugeiconsIcon icon={CalendarIcon} size={18} />
              This Quarter
            </Button>
            <Button
              variant="outline"
              onClick={setThisYear}
              className="w-full justify-start gap-2"
            >
              <HugeiconsIcon icon={CalendarIcon} size={18} />
              This Year
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter expenses by category or deductible status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-2 block">Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={
                    selectedCategories.includes(cat.value)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => toggleCategory(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="deductibleOnly"
              checked={deductibleOnly}
              onCheckedChange={(checked) =>
                setDeductibleOnly(checked as boolean)
              }
            />
            <Label htmlFor="deductibleOnly" className="text-sm font-medium">
              Only deductible expenses
            </Label>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleExportCSV}
        disabled={isExporting || !startDate || !endDate}
        className="w-full gap-2"
        size="lg"
      >
        <HugeiconsIcon
          icon={isExporting ? ArrowRight01Icon : DownloadIcon}
          size={18}
        />
        {isExporting ? "Exporting..." : "Export CSV"}
      </Button>
    </div>
  );
}
