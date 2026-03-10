"use client"

import { useState } from "react"

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
]

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [deductibleOnly, setDeductibleOnly] = useState(false)

  const handleExportCSV = async () => {
    if (!startDate || !endDate) {
      alert("Please select start and end dates")
      return
    }

    setIsExporting(true)

    try {
      const response = await fetch("/api/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          categories: selectedCategories,
          includeDeductibleOnly: deductibleOnly,
        }),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `expenses_${startDate}_${endDate}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export expenses")
    } finally {
      setIsExporting(false)
    }
  }

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Export Reports</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Date Range</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Ranges</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                setStartDate(`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`)
                const lastDay = new Date(currentYear, currentMonth, 0).getDate()
                setEndDate(`${currentYear}-${String(currentMonth).padStart(2, "0")}-${lastDay}`)
              }}
              className="w-full py-2 px-4 border rounded-md hover:bg-accent text-left"
            >
              This Month
            </button>
            <button
              onClick={() => {
                const quarter = Math.ceil(currentMonth / 3)
                const startMonth = (quarter - 1) * 3 + 1
                setStartDate(`${currentYear}-${String(startMonth).padStart(2, "0")}-01`)
                const endMonth = startMonth + 2
                const lastDay = new Date(currentYear, endMonth, 0).getDate()
                setEndDate(`${currentYear}-${String(endMonth).padStart(2, "0")}-${lastDay}`)
              }}
              className="w-full py-2 px-4 border rounded-md hover:bg-accent text-left"
            >
              This Quarter
            </button>
            <button
              onClick={() => {
                setStartDate(`${currentYear}-01-01`)
                setEndDate(`${currentYear}-12-31`)
              }}
              className="w-full py-2 px-4 border rounded-md hover:bg-accent text-left"
            >
              This Year
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategories((prev) =>
                    prev.includes(cat.value)
                      ? prev.filter((c) => c !== cat.value)
                      : [...prev, cat.value]
                  )
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategories.includes(cat.value)
                    ? "bg-primary text-primary-foreground"
                    : "border hover:bg-accent"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="deductibleOnly"
            type="checkbox"
            checked={deductibleOnly}
            onChange={(e) => setDeductibleOnly(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="deductibleOnly" className="text-sm font-medium">
            Only deductible expenses
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleExportCSV}
          disabled={isExporting || !startDate || !endDate}
          className="flex-1 py-3 px-6 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>
    </div>
  )
}
