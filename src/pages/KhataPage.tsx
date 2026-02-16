import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ArrowDown, 
  ArrowUp,
  Trash2,
  X,
  FileText,
  AlertTriangle,
  FileDown
} from 'lucide-react';
import { FullscreenToggle } from '@/components/FullscreenToggle';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Checkbox } from '@/components/ui/checkbox';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


interface Customer {
  id: number;
  name: string;
  balance: number;
  type: 'lene' | 'dene'; // lene = receive, dene = give
}

interface Transaction {
  id: number;
  date: string;
  maineDiye: number;
  maineLiye: number;
  tafseel?: string;
}

export function KhataPage() {
  // Load data from localStorage on mount
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('khata_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [customerTransactions, setCustomerTransactions] = useState<Record<number, Transaction[]>>(() => {
    const saved = localStorage.getItem('khata_transactions');
    return saved ? JSON.parse(saved) : {};
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'diye' | 'liye'>('diye');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionTafseel, setTransactionTafseel] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 42; // 7 columns x 6 rows for desktop

  // Delete confirmation states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCustomerIds, setDeleteCustomerIds] = useState<number[]>([]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('khata_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('khata_transactions', JSON.stringify(customerTransactions));
  }, [customerTransactions]);

  // Calculate totals
  const totalLene = customers
    .filter(c => c.type === 'lene')
    .reduce((sum, c) => sum + c.balance, 0);
  
  const totalDene = customers
    .filter(c => c.type === 'dene')
    .reduce((sum, c) => sum + c.balance, 0);

  // Filter customers by search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  const startIndex = (currentPage - 1) * customersPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + customersPerPage);

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleAddCustomer = () => {
    if (newCustomerName.trim()) {
      const newCustomer: Customer = {
        id: Date.now(),
        name: newCustomerName,
        balance: 0,
        type: 'lene'
      };
      setCustomers([...customers, newCustomer]);
      setCustomerTransactions({ ...customerTransactions, [newCustomer.id]: [] });
      setNewCustomerName('');
      setIsAddCustomerModalOpen(false);
    }
  };

  const handleDeleteCustomers = () => {
    if (selectedCustomers.length > 0) {
      setCustomers(customers.filter(c => !selectedCustomers.includes(c.id)));
      setSelectedCustomers([]);
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const toggleCustomerSelection = (id: number) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleClearAllTransactions = () => {
    if (selectedCustomer) {
      setCustomerTransactions(prev => ({
        ...prev,
        [selectedCustomer.id]: []
      }));
      
      // Reset customer balance to 0
      setCustomers(prev => prev.map(c => 
        c.id === selectedCustomer.id ? { ...c, balance: 0, type: 'lene' } : c
      ));
      
      // Update selected customer state
      setSelectedCustomer(prev => prev ? ({
        ...prev,
        balance: 0,
        type: 'lene'
      }) : null);
      
      setIsClearAllModalOpen(false);
    }
  };

  const handleAddTransaction = () => {
    if (!transactionAmount || !selectedCustomer) return;

    const amount = parseFloat(transactionAmount);
    const newTransaction: Transaction = {
      id: Date.now(),
      date: new Date(transactionDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      maineDiye: transactionType === 'diye' ? amount : 0,
      maineLiye: transactionType === 'liye' ? amount : 0,
      tafseel: transactionTafseel || undefined
    };

    // Add transaction to customer's history
    const existingTransactions = customerTransactions[selectedCustomer.id] || [];
    setCustomerTransactions({
      ...customerTransactions,
      [selectedCustomer.id]: [newTransaction, ...existingTransactions]
    });

    // Update customer balance
    setCustomers(customers.map(c => {
      if (c.id === selectedCustomer.id) {
        const newBalance = transactionType === 'diye' 
          ? c.balance + amount 
          : c.balance - amount;
        return { ...c, balance: Math.abs(newBalance), type: newBalance >= 0 ? 'lene' : 'dene' };
      }
      return c;
    }));

    // Update selected customer state
    const updatedCustomer = customers.find(c => c.id === selectedCustomer.id);
    if (updatedCustomer) {
      const newBalance = transactionType === 'diye' 
        ? updatedCustomer.balance + amount 
        : updatedCustomer.balance - amount;
      setSelectedCustomer({
        ...updatedCustomer,
        balance: Math.abs(newBalance),
        type: newBalance >= 0 ? 'lene' : 'dene'
      });
    }

    // Reset form
    setTransactionAmount('');
    setTransactionTafseel('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setIsAddTransactionModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK')}`;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const handleExportPDF = () => {
    if (selectedCustomer) {
      const customer = customers.find(c => c.id === selectedCustomer.id) || selectedCustomer;
      const transactions = customerTransactions[customer.id] || [];
      const hasTransactions = transactions.length > 0;
      
      // Calculate totals using the new formula: Maine Diye - Maine Liye
      const totalMaineDiye = transactions.reduce((sum, t) => sum + t.maineDiye, 0);
      const totalMaineLiye = transactions.reduce((sum, t) => sum + t.maineLiye, 0);
      const netBalance = totalMaineDiye - totalMaineLiye;
      
      // Determine what to show based on Net Balance
      const showLeneHain = netBalance > 0;
      const showDeneHain = netBalance < 0;
      const showBalanceClear = netBalance === 0;
      const displayBalance = Math.abs(netBalance);
      
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Customer: ${customer.name}`, 10, 10);
      doc.text(`Balance: ${formatCurrency(displayBalance)}`, 10, 20);
      doc.text(`Type: ${showLeneHain ? 'Maine lene hain' : showDeneHain ? 'Maine dene hain' : 'Balance Clear'}`, 10, 30);
      
      if (hasTransactions) {
        autoTable(doc, {
          head: [['Date', 'Maine Diye', 'Maine Liye', 'Tafseel']],
          body: transactions.map(t => [
            t.date,
            t.maineDiye > 0 ? formatCurrency(t.maineDiye) : '-',
            t.maineLiye > 0 ? formatCurrency(t.maineLiye) : '-',
            t.tafseel || '-'
          ]),
          startY: 40
        });
      }
      
      doc.save(`${customer.name}_transactions.pdf`);
    }
  };

  // If a customer is selected, show customer detail page
  if (selectedCustomer) {
    const customer = customers.find(c => c.id === selectedCustomer.id) || selectedCustomer;
    const transactions = customerTransactions[customer.id] || [];
    const hasTransactions = transactions.length > 0;
    
    // Calculate totals using the new formula: Maine Diye - Maine Liye
    const totalMaineDiye = transactions.reduce((sum, t) => sum + t.maineDiye, 0);
    const totalMaineLiye = transactions.reduce((sum, t) => sum + t.maineLiye, 0);
    const netBalance = totalMaineDiye - totalMaineLiye;
    
    // Determine what to show based on Net Balance
    const showLeneHain = netBalance > 0;
    const showDeneHain = netBalance < 0;
    const showBalanceClear = netBalance === 0;
    const displayBalance = Math.abs(netBalance);
    
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 dark:bg-[#0d0d0d] pb-16 lg:pb-0">
        <div className="px-4 lg:px-8 py-4 lg:py-8 ">
          {/* Header with back button and toggle on right */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2a2a2a] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors shrink-0"
              >
                ←
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-[#e8e8e8] tracking-tight truncate">{customer.name}</h1>
                <p className="text-slate-500 dark:text-[#9ca3af] mt-1 text-sm lg:text-base hidden sm:block">Customer transaction details</p>
              </div>
            </div>
            
            <FullscreenToggle />
          </div>

          {/* Summary and Action Buttons */}
          <div className="flex flex-col gap-4 mb-6 ">
            {/* Summary - Show only one based on net balance */}
            {showBalanceClear ? (
              <div className="inline-block w-fit px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                <p className="text-xs lg:text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Balance Clear</p>
                <p className="text-xl lg:text-2xl font-bold text-slate-700 dark:text-slate-300">{formatCurrency(0)}</p>
              </div>
            ) : showLeneHain ? (
              <div className="inline-block w-fit px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-red-50/30 dark:bg-red-950/30">
                <p className="text-xs lg:text-sm font-medium mb-1 text-red-500 dark:text-red-400">Maine lene hain</p>
                <p className="text-xl lg:text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(displayBalance)}</p>
              </div>
            ) : (
              <div className="inline-block w-fit px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-green-50/30 dark:bg-green-950/30">
                <p className="text-xs lg:text-sm font-medium mb-1 text-green-500 dark:text-green-400">Maine dene hain</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(displayBalance)}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:flex gap-2 lg:gap-3 sm:justify-end">
              <button
                onClick={() => {
                  setTransactionType('diye');
                  setIsAddTransactionModalOpen(true);
                }}
                className="px-3 lg:px-6 py-2.5 lg:py-3 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors shadow-sm text-sm lg:text-base"
              >
                Maine Diye
              </button>
              <button
                onClick={() => {
                  setTransactionType('liye');
                  setIsAddTransactionModalOpen(true);
                }}
                className="px-3 lg:px-6 py-2.5 lg:py-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm text-sm lg:text-base"
              >
                Maine Liye
              </button>
              <button
                onClick={handleExportPDF}
                className="p-2.5 lg:p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm flex items-center justify-center"
                title="Export PDF"
              >
                <FileDown size={18} className="lg:w-5 lg:h-5" />
              </button>
              <button
                onClick={() => setIsClearAllModalOpen(true)}
                className="p-2.5 lg:p-3 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors shadow-sm flex items-center justify-center"
                title="Clear All"
              >
                <Trash2 size={18} className="lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>

          {/* Transaction Table or Empty State */}
          {!hasTransactions ? (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2d2d2d] p-8 lg:p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4 lg:mb-6">
                <FileText className="text-slate-300 dark:text-slate-600" size={32} />
              </div>
              <p className="text-slate-500 dark:text-[#9ca3af] text-sm lg:text-lg max-w-md">
                Customer ka hisaab kitaab shuru karne ke liye pehli entry darj karein
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2d2d2d] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#2a2a2a] border-b border-slate-200 dark:border-[#2d2d2d]">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-[#e8e8e8]">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-[#e8e8e8]">Maine Diye</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-[#e8e8e8]">Maine Liye</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-[#e8e8e8]">Tafseel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-slate-100 dark:border-[#2d2d2d] hover:bg-slate-50 dark:hover:bg-[#2a2a2a]">
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-[#9ca3af]">{transaction.date}</td>
                        <td className="px-6 py-4 text-sm font-medium text-green-500 dark:text-green-400">
                          {transaction.maineDiye > 0 ? formatCurrency(transaction.maineDiye) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-red-500 dark:text-red-400">
                          {transaction.maineLiye > 0 ? formatCurrency(transaction.maineLiye) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-[#9ca3af]">
                          {transaction.tafseel || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3  ">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2d2d2d] p-4 shadow-sm"
                  >
                    {/* Date */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-[#2d2d2d]">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Date</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-[#e8e8e8]">{transaction.date}</span>
                    </div>

                    {/* Maine Diye and Maine Liye */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-green-50/50 dark:bg-green-950/20 rounded-lg p-3 border border-green-100 dark:border-green-900/30">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Maine Diye</p>
                        <p className="text-base font-bold text-green-600 dark:text-green-400">
                          {transaction.maineDiye > 0 ? formatCurrency(transaction.maineDiye) : '-'}
                        </p>
                      </div>
                      <div className="bg-red-50/50 dark:bg-red-950/20 rounded-lg p-3 border border-red-100 dark:border-red-900/30">
                        <p className="text-xs text-red-600 dark:text-red-400 mb-1">Maine Liye</p>
                        <p className="text-base font-bold text-red-600 dark:text-red-400">
                          {transaction.maineLiye > 0 ? formatCurrency(transaction.maineLiye) : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Tafseel */}
                    {transaction.tafseel && (
                      <div className="bg-slate-50 dark:bg-[#2a2a2a] rounded-lg p-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tafseel</p>
                        <p className="text-sm text-slate-700 dark:text-[#9ca3af]">{transaction.tafseel}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Add Transaction Modal */}
        {isAddTransactionModalOpen && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-[#2d2d2d]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#e8e8e8]">
                  {transactionType === 'diye' ? 'Maine Diye' : 'Maine Liye'}
                </h2>
                <button
                  onClick={() => setIsAddTransactionModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                    Tafseel (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionTafseel}
                    onChange={(e) => setTransactionTafseel(e.target.value)}
                    placeholder="Enter description"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-40 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleAddTransaction}
                  className={`w-full px-6 py-3 text-white rounded-lg font-medium transition-colors ${
                    transactionType === 'diye' 
                      ? 'bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-700' 
                      : 'bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700'
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {isClearAllModalOpen && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-[#2d2d2d]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-500 dark:text-red-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-[#e8e8e8]">Clear All Transactions?</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    This will permanently delete all transaction history for {customer.name}.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsClearAllModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 dark:border-[#2d2d2d] text-slate-700 dark:text-[#e8e8e8] bg-white dark:bg-[#1e1e1e] rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllTransactions}
                  className="flex-1 px-6 py-3 bg-red-500 dark:bg-red-600 text-white rounded-lg font-medium hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main customer overview page
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 dark:bg-[#0d0d0d] pb-16 lg:pb-0">
      <div className="px-4 lg:px-8 py-4 lg:py-8">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-[#e8e8e8] tracking-tight">Khata</h1>
            <p className="text-slate-500 dark:text-[#9ca3af] mt-1 text-sm lg:text-base hidden sm:block">Manage your customer accounts and transactions</p>
          </div>

          <FullscreenToggle />
        </div>

        {/* Top Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Maine lene hain */}
          <div className="bg-red-50/50 dark:bg-red-950/20 p-4 lg:p-6 rounded-xl border border-red-100/50 dark:border-red-900/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100/50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <ArrowDown className="text-red-500 dark:text-red-400" size={20} />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-red-600 dark:text-red-400">Maine lene hain</h3>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalLene)}</p>
            <p className="text-xs lg:text-sm text-red-500 dark:text-red-400/80 mt-1">Total amount to receive</p>
          </div>

          {/* Maine dene hain */}
          <div className="bg-green-50/50 dark:bg-green-950/20 p-4 lg:p-6 rounded-xl border border-green-100/50 dark:border-green-900/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100/50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <ArrowUp className="text-green-500 dark:text-green-400" size={20} />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-green-600 dark:text-green-400">Maine dene hain</h3>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalDene)}</p>
            <p className="text-xs lg:text-sm text-green-500 dark:text-green-400/80 mt-1">Total amount to give</p>
          </div>
        </div>

        {/* Search and Add Customer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 lg:gap-4 mb-6">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Customer search karein"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex gap-2 lg:gap-3">
            {selectedCustomers.length > 0 && (
              <button
                onClick={() => {
                  setDeleteCustomerIds(selectedCustomers);
                  setIsDeleteModalOpen(true);
                }}
                className="px-3 lg:px-4 py-2.5 bg-red-500 dark:bg-red-600 text-white rounded-lg font-medium hover:bg-red-600 dark:hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Delete ({selectedCustomers.length})</span>
                <span className="sm:hidden">({selectedCustomers.length})</span>
              </button>
            )}
            <button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="px-4 lg:px-6 py-2.5 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 text-sm lg:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Customer Cards Grid or Empty State */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2d2d2d] p-12 lg:p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 lg:w-24 h-20 lg:h-24 bg-slate-50 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4 lg:mb-6">
              <FileText className="text-slate-300 dark:text-slate-600" size={40} />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-slate-700 dark:text-[#e8e8e8] mb-2">No Customers Yet</h3>
            <p className="text-sm lg:text-base text-slate-500 dark:text-[#9ca3af] max-w-md mb-4 lg:mb-6">
              Start by adding your first customer to keep track of transactions
            </p>
            <button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="px-5 lg:px-6 py-2.5 lg:py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 text-sm lg:text-base"
            >
              <Plus size={18} />
              Add Your First Customer
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Customer Cards Container */}
            <div className="h-[calc(100vh-420px)] lg:h-[calc(100vh-380px)] overflow-y-scroll overflow-x-hidden pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4">
                {paginatedCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="bg-white dark:bg-[#1a1a1a] p-3 lg:p-4 rounded-xl border border-slate-200 dark:border-[#2d2d2d] hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all cursor-pointer relative group"
                  >
                    {/* Selection checkbox - minimal white */}
                    <div 
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={() => toggleCustomerSelection(customer.id)}
                      />
                    </div>

                    <div onClick={() => handleCustomerClick(customer)} className="flex flex-col items-center text-center pt-2">
                      {/* Avatar - Minimal light gray */}
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-slate-600 dark:text-[#9ca3af] font-bold text-base lg:text-lg mb-2 lg:mb-3 bg-slate-200/50 dark:bg-[#2a2a2a]">
                        {getInitials(customer.name)}
                      </div>

                      {/* Name */}
                      <h4 className="font-semibold text-slate-900 dark:text-[#e8e8e8] mb-1 lg:mb-2 text-xs lg:text-sm truncate w-full px-1">{customer.name}</h4>

                      {/* Balance - Minimal Red and Green - NO TEXT LABEL */}
                      <p className={`text-base lg:text-lg font-bold ${
                        customer.type === 'lene' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
                      }`}>
                        {formatCurrency(customer.balance)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-[#2d2d2d]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#e8e8e8]">Add Customer</h2>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomer()}
                />
              </div>

              <button
                onClick={handleAddCustomer}
                className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            setCustomers(customers.filter(c => !deleteCustomerIds.includes(c.id)));
            setSelectedCustomers([]);
            setIsDeleteModalOpen(false);
          }}
          title="Delete Customers"
          message={`Are you sure you want to delete ${deleteCustomerIds.length} customer(s)?`}
        />
      )}
    </div>
  );
}