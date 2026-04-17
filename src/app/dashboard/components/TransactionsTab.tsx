"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    History,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    CreditCard,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Filter,
    Activity,
    Calendar
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `transactions-${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        toast.success("Transactions exported successfully")
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Transactions</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Your complete wallet transaction history</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    disabled={filteredTransactions.length === 0}
                    className="h-12 px-6 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group shadow-xl disabled:opacity-50"
                >
                    <Download className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                    Export CSV
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="glass-effect border border-white/60 rounded-[2.5rem] p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search description or reference..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white/50 border-none rounded-2xl text-xs font-bold placeholder:text-gray-300 focus:ring-0 shadow-inner"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['all', 'credit', 'debit'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === type
                                    ? 'bg-gray-900 text-white shadow-lg'
                                    : 'bg-white/40 text-gray-400 hover:text-gray-900 border border-white/60'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="glass-effect border border-white/60 rounded-[3rem] p-24 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-gray-900/10 border-t-gray-900 rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading transactions...</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="glass-effect border border-white/60 rounded-[3rem] p-24 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <History className="h-10 w-10 text-gray-200" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No Transactions</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs mx-auto">No transactions found for this filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode="popLayout">
                            {currentItems.map((transaction, idx) => (
                                <motion.div
                                    key={transaction.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <div className="group relative overflow-hidden glass-effect border border-white/60 rounded-[2rem] hover:bg-white/60 transition-all duration-300 p-6 sm:p-8 premium-shadow-sm hover:premium-shadow">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 duration-500 ${transaction.type === 'credit'
                                                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                                                    }`}>
                                                    {transaction.type === 'credit' ? (
                                                        <TrendingUp className="h-7 w-7" />
                                                    ) : (
                                                        <CreditCard className="h-7 w-7" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${transaction.type === 'credit'
                                                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                                : 'bg-red-500/10 text-red-600 border-red-500/20'
                                                            }`}>
                                                            {transaction.type}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(transaction.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-base sm:text-lg font-black text-gray-900 tracking-tight truncate max-w-[200px] sm:max-w-md">
                                                        {transaction.description}
                                                    </h4>
                                                    <code className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 block group-hover:text-gray-500 transition-colors">
                                                        Ref: {transaction.reference || "N/A"}
                                                    </code>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-10 w-full sm:w-auto">
                                                <div className="flex flex-col items-start sm:items-end">
                                                    <span className={`text-2xl sm:text-3xl font-black tracking-tighter tabular-nums ${transaction.type === 'credit' ? 'text-green-600' : 'text-gray-900'
                                                        }`}>
                                                        {transaction.type === 'credit' ? '+' : '-'}{formatPrice(transaction.amount)}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${transaction.status === 'COMPLETED' ? 'bg-green-500' :
                                                                transaction.status === 'FAILED' ? 'bg-red-500' : 'bg-amber-500'
                                                            }`} />
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                            {transaction.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-gray-900 group-hover:text-white transition-all duration-500">
                                                    {transaction.type === 'credit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Decorative Background Icon */}
                                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                                            {transaction.type === 'credit' ? <TrendingUp className="w-32 h-32" /> : <CreditCard className="w-32 h-32" />}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-14 h-14 glass-effect border border-white/60 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-14 h-14 rounded-2xl text-xs font-black transition-all ${currentPage === page
                                            ? "bg-gray-900 text-white shadow-xl shadow-black/10 scale-110"
                                            : "glass-effect border border-white/60 text-gray-400 hover:text-gray-900"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-14 h-14 glass-effect border border-white/60 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
