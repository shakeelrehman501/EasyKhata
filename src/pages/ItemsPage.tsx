import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, X, ChevronDown } from 'lucide-react';
import { FullscreenToggle } from '@/components/FullscreenToggle';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Checkbox } from '@/components/ui/checkbox';

interface Item {
  id: number;
  itemName: string;
  price: number;
  productStatus: 'Available' | 'Sold';
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, itemName: 'iPhone 14 Pro', price: 450000, productStatus: 'Available' },
    { id: 2, itemName: 'Samsung Galaxy S23', price: 380000, productStatus: 'Sold' },
    { id: 3, itemName: 'OnePlus 11', price: 180000, productStatus: 'Available' },
    { id: 4, itemName: 'Xiaomi 13 Pro', price: 250000, productStatus: 'Available' },
    { id: 5, itemName: 'Google Pixel 8', price: 320000, productStatus: 'Sold' },
    { id: 6, itemName: 'iPhone 13', price: 350000, productStatus: 'Available' },
    { id: 7, itemName: 'Samsung Galaxy A54', price: 120000, productStatus: 'Available' },
    { id: 8, itemName: 'Realme GT 3', price: 95000, productStatus: 'Sold' },
    { id: 9, itemName: 'Oppo Find X6', price: 210000, productStatus: 'Available' },
    { id: 10, itemName: 'Vivo X90 Pro', price: 280000, productStatus: 'Available' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Form states
  const [formItemName, setFormItemName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formProductStatus, setFormProductStatus] = useState<'Available' | 'Sold'>('Available');

  // Filter items by search
  const filteredItems = items.filter(item =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.price.toString().includes(searchQuery)
  );

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleAddItem = () => {
    if (!formItemName.trim() || !formPrice) return;

    const newItem: Item = {
      id: Math.max(...items.map(i => i.id), 0) + 1,
      itemName: formItemName,
      price: parseFloat(formPrice),
      productStatus: formProductStatus
    };

    setItems([...items, newItem]);
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleEditItem = () => {
    if (!editingItem || !formItemName.trim() || !formPrice) return;

    setItems(items.map(item =>
      item.id === editingItem.id
        ? { ...item, itemName: formItemName, price: parseFloat(formPrice), productStatus: formProductStatus }
        : item
    ));

    resetForm();
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: number) => {
    setDeleteItemId(id);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteModalOpen(true);
  };

  const handleStatusChange = (id: number, newStatus: 'Available' | 'Sold') => {
    setItems(items.map(item =>
      item.id === id ? { ...item, productStatus: newStatus } : item
    ));
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setFormItemName(item.itemName);
    setFormPrice(item.price.toString());
    setFormProductStatus(item.productStatus);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormItemName('');
    setFormPrice('');
    setFormProductStatus('Available');
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK')}`;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 dark:bg-[#0d0d0d] pb-16 lg:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 lg:px-8 py-4 lg:py-6 dark:bg-[#1a1a1a]/80 dark:border-[#2d2d2d]">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-[#e8e8e8] tracking-tight">Items</h1>
            <p className="text-sm lg:text-base text-slate-500 dark:text-[#9ca3af] mt-1 hidden sm:block">Manage your mobile shop inventory</p>
          </div>
          
          <FullscreenToggle />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-[#2d2d2d] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] text-sm"
            />
          </div>

          {/* Actions */}
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 lg:px-4 py-2.5 bg-red-600 dark:bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-700 transition-colors flex items-center gap-2 text-sm shrink-0"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Delete ({selectedItems.length})</span>
              <span className="sm:hidden">({selectedItems.length})</span>
            </button>
          )}
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 lg:px-6 py-2.5 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 text-sm lg:text-base shrink-0"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add New Item</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 lg:p-8">
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2d2d2d] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#2a2a2a] border-b border-slate-200 dark:border-[#2d2d2d]">
                <th className="px-6 py-4 text-left">
                  <Checkbox
                    checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-[#e8e8e8]">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-[#e8e8e8]">Item Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-[#e8e8e8]">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-[#e8e8e8]">Product Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-[#e8e8e8]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-[#2d2d2d] hover:bg-slate-50 dark:hover:bg-[#2a2a2a]">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleSelectItem(item.id)}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-[#9ca3af]">{item.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-[#e8e8e8]">{item.itemName}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-[#9ca3af]">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select
                        value={item.productStatus}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as 'Available' | 'Sold')}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          item.productStatus === 'Available'
                            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <option value="Available" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">Available</option>
                        <option value="Sold" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300">Sold</option>
                      </select>
                      <ChevronDown 
                        className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                          item.productStatus === 'Available'
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-red-700 dark:text-red-400'
                        }`}
                        size={14}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-[#2d2d2d] flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-[#9ca3af]">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} items
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] rounded-lg text-sm font-medium text-slate-600 dark:text-[#9ca3af] hover:bg-slate-50 dark:hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-slate-700 dark:text-[#e8e8e8]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] rounded-lg text-sm font-medium text-slate-600 dark:text-[#9ca3af] hover:bg-slate-50 dark:hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {paginatedItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2d2d2d] p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleSelectItem(item.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e8e8e8] mb-1">{item.itemName}</h3>
                    <p className="text-xs text-slate-500 dark:text-[#9ca3af]">ID: {item.id}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#2d2d2d]">
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#9ca3af] mb-1">Price</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-[#e8e8e8]">{formatCurrency(item.price)}</p>
                </div>
                <div className="relative">
                  <select
                    value={item.productStatus}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as 'Available' | 'Sold')}
                    className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      item.productStatus === 'Available'
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                  </select>
                  <ChevronDown 
                    className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                      item.productStatus === 'Available'
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}
                    size={12}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2d2d2d] p-4">
              <p className="text-xs text-slate-600 dark:text-[#9ca3af] mb-3 text-center">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] rounded-lg text-xs font-medium text-slate-600 dark:text-[#9ca3af] hover:bg-slate-50 dark:hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="flex items-center px-3 text-xs text-slate-700 dark:text-[#e8e8e8] whitespace-nowrap">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] rounded-lg text-xs font-medium text-slate-600 dark:text-[#9ca3af] hover:bg-slate-50 dark:hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-[#2d2d2d]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#e8e8e8]">Add New Item</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formItemName}
                  onChange={(e) => setFormItemName(e.target.value)}
                  placeholder="Enter item name"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                  Price (Rs.) *
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="Enter price"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                  Product Status
                </label>
                <select
                  value={formProductStatus}
                  onChange={(e) => setFormProductStatus(e.target.value as 'Available' | 'Sold')}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <button
                onClick={handleAddItem}
                className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-[#2d2d2d]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#e8e8e8]">Edit Item</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formItemName}
                  onChange={(e) => setFormItemName(e.target.value)}
                  placeholder="Enter item name"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                  Price (Rs.) *
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="Enter price"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                  Product Status
                </label>
                <select
                  value={formProductStatus}
                  onChange={(e) => setFormProductStatus(e.target.value as 'Available' | 'Sold')}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <button
                onClick={handleEditItem}
                className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Modal */}
      {isDeleteModalOpen && deleteItemId !== null && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            setItems(items.filter(item => item.id !== deleteItemId));
            setIsDeleteModalOpen(false);
            setDeleteItemId(null);
          }}
          title="Delete Item"
          message="Are you sure you want to delete this item?"
        />
      )}

      {/* Bulk Delete Items Modal */}
      {isBulkDeleteModalOpen && (
        <DeleteConfirmModal
          isOpen={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          onConfirm={() => {
            setItems(items.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
            setIsBulkDeleteModalOpen(false);
          }}
          title="Delete Items"
          message={`Are you sure you want to delete ${selectedItems.length} items?`}
        />
      )}
    </div>
  );
}