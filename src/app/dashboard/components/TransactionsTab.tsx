"use client"

import { useState, useEffect } from "react"
import {
    History,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    Calendar,
    CreditCard,
    TrendingUp,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import toast from "react-hot-toast"

interface Transaction {
    id: string
    type: 'credit' | 'debit'
    amount: number
    description: string
    status?: 'COMPLETED' | 'PENDING' | 'FAILED'
    reference?: string
    date: string
}

export default function TransactionsTab() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const formatPrice = (price: number) => {
        return `₦${price.toLocaleString()}`
    }

    useEffect(() => {
        fetchTransactions()
    }, [])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch('/api/wallet/transactions', {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            })

            if (response.ok) {
                const data = await response.json()
                setTransactions(data.transactions || [])
                setFilteredTransactions(data.transactions || [])
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
            toast.error("Failed to load transactions")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let result = transactions

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(t =>
                t.description.toLowerCase().includes(query) ||
                t.reference?.toLowerCase().includes(query)
            )
        }

        if (filterType !== "all") {
            result = result.filter(t => t.type === filterType)
        }

        setFilteredTransactions(result)
        setCurrentPage(1)
    }, [searchQuery, filterType, transactions])

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
    const currentItems = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleExport = () => {
        if (filteredTransactions.length === 0) return

        const headers = ["Date", "Description", "Type", "Amount", "Status", "Reference"]
        const rows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.description,
            t.type.toUpperCase(),
            t.amount,
            t.status || "N/A",
            t.reference || "N/A"
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success("Transactions exported successfully")
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                    <p className="text-gray-600 mt-1">View and manage all your wallet activities</p>
                </div>
                <Button
                    onClick={handleExport}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                    disabled={filteredTransactions.length === 0}
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Card className="shadow-sm border-gray-200">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by description or reference..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="credit">Credit</SelectItem>
                                    <SelectItem value="debit">Debit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                            <p className="text-gray-500 font-medium">Fetching transactions...</p>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <History className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                {searchQuery || filterType !== "all"
                                    ? "We couldn't find any transactions matching your filters."
                                    : "Your transaction history will appear here once you make purchases or receive payments."}
                            </p>
                            {(searchQuery || filterType !== "all") && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => { setSearchQuery(""); setFilterType("all"); }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-100">
                                        <tr>
                                            <th className="text-left py-4 px-6">Transaction</th>
                                            <th className="text-left py-4 px-6 whitespace-nowrap">Date</th>
                                            <th className="text-left py-4 px-6">Amount</th>
                                            <th className="text-left py-4 px-6">Status</th>
                                            <th className="text-right py-4 px-6">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentItems.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2.5 rounded-full ${transaction.type === 'credit'
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-red-100 text-red-600'
                                                            }`}>
                                                            {transaction.type === 'credit' ? (
                                                                <TrendingUp className="h-5 w-5" />
                                                            ) : (
                                                                <CreditCard className="h-5 w-5" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 truncate max-w-[200px] md:max-w-md">
                                                                {transaction.description}
                                                            </p>
                                                            <Badge variant="outline" className={`text-[10px] uppercase font-bold px-1.5 py-0 mt-1 ${transaction.type === 'credit' ? "text-green-700 border-green-200 bg-green-50" : "text-red-700 border-red-200 bg-red-50"
                                                                }`}>
                                                                {transaction.type}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                                                    {new Date(transaction.date).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`font-bold text-lg ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {transaction.type === 'credit' ? '+' : '-'}{formatPrice(transaction.amount)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge className={`px-2 py-0.5 rounded-full text-xs font-semibold ${transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                            transaction.status === 'FAILED' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                                'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                                        }`}>
                                                        {transaction.status === 'COMPLETED' ? 'Completed' :
                                                            transaction.status === 'FAILED' ? 'Failed' :
                                                                'Pending'}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <code className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                        {transaction.reference || "N/A"}
                                                    </code>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                                    <p className="text-sm text-gray-600">
                                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="font-medium">{filteredTransactions.length}</span> entries
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="flex items-center gap-1 mx-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === page
                                                            ? "bg-orange-600 text-white"
                                                            : "text-gray-600 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
