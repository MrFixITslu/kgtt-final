import React, { useState, useRef } from 'react';
import { useAppContext, LedgerEntry, ReceiptFile } from '../../context/AppContext';
import { PlusCircle, Receipt, TrendingDown, TrendingUp, Upload, FileText, Paperclip, X, Eye } from 'lucide-react';

const EXPENSE_CATEGORIES = ['Fuel', 'Tires', 'Maintenance', 'Tech Fees', 'Marketing', 'Other'] as const;

export default function FinancialLedger() {
  const { state, dispatch } = useAppContext();
  
  const [category, setCategory] = useState<LedgerEntry['category']>('Fuel');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState<ReceiptFile | null>(null);
  
  const [adding, setAdding] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<LedgerEntry | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile({
        name: file.name,
        size: file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${Math.round(file.size / 1024)} KB`
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setReceiptFile({
        name: file.name,
        size: file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${Math.round(file.size / 1024)} KB`
      });
    }
  };

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || !description.trim()) return;
    setAdding(true);
    
    setTimeout(() => {
      const entry: LedgerEntry = {
        id: `led-${Date.now()}`,
        type: 'Investment',
        amount: amt,
        category,
        description: description.trim(),
        date: new Date().toISOString().split('T')[0],
        receiptFile: receiptFile,
      };
      
      dispatch({ type: 'ADD_LEDGER_ENTRY', entry });
      
      // Reset form
      setCategory('Fuel');
      setDescription('');
      setAmount('');
      setReceiptFile(null);
      setAdding(false);
    }, 400);
  };

  const recent = [...state.ledger].reverse().slice(0, 7);

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-slate-800/50 p-5">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <Receipt size={18} className="text-indigo-400" />
        <h3 className="font-bold text-white text-base">Expense & Receipt Ledger</h3>
      </div>

      {/* Log expense form */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Log Operational Cost</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] text-slate-500 font-bold uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as LedgerEntry['category'])}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-slate-500 font-bold uppercase">Amount ($USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-slate-500 font-bold uppercase">Description / Details</label>
          <input
            type="text"
            placeholder="e.g. Fuel purchase Dennery Rubis"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Drag & Drop Receipt Upload Zone */}
        <div>
          <label className="mb-1.5 block text-[10px] text-slate-500 font-bold uppercase">Attach Invoice/Receipt</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center cursor-pointer transition-all ${
              receiptFile 
                ? 'border-emerald-500/30 bg-emerald-500/5' 
                : dragOver 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
            />
            {receiptFile ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <FileText size={20} className="shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-white max-w-[150px] truncate">{receiptFile.name}</p>
                  <p className="text-[10px] text-slate-400">{receiptFile.size} · Uploaded</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Upload size={18} className="text-slate-400" />
                <p className="text-xs font-semibold text-slate-300">Drag Receipt here or Browse</p>
                <p className="text-[10px] text-slate-500">Supports PDF, JPG, PNG (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding || !amount || !description}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
        >
          <PlusCircle size={15} />
          {adding ? 'Registering Expense…' : 'Log Expense & Invoice'}
        </button>
      </div>

      {/* Recent Ledger Entries */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Transactions</p>
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {recent.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-900/40 px-3.5 py-2.5 transition-colors hover:bg-slate-900/60"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                entry.type === 'Income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {entry.type === 'Income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{entry.description}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{entry.category} · {entry.date}</p>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {entry.receiptFile && (
                  <button
                    onClick={() => setSelectedReceipt(entry)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                    title="View Attached Invoice"
                  >
                    <Paperclip size={12} />
                  </button>
                )}
                <p className={`text-xs font-black ${entry.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {entry.type === 'Income' ? '+' : '-'}${entry.amount.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Receipt Invoice Overlay Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Receipt Invoice Graphic */}
            <div className="rounded-xl border border-slate-700 bg-white p-5 text-slate-900 font-mono shadow-inner text-sm">
              <div className="text-center border-b-2 border-dashed border-slate-300 pb-3">
                <h4 className="font-sans font-black tracking-wide text-base">WAVE FLEET OPERATIONS</h4>
                <p className="text-[10px] text-slate-500">Castries, Saint Lucia</p>
                <p className="text-[10px] text-slate-500">TEL: +1 (758) 555-RIDE</p>
              </div>

              <div className="my-4 flex flex-col gap-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Txn ID:</span>
                  <span className="font-semibold text-slate-950">{selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-semibold text-slate-950">{selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-semibold text-slate-950">{selectedReceipt.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attachment:</span>
                  <span className="font-semibold text-slate-950 text-indigo-600 truncate max-w-[150px]">
                    {selectedReceipt.receiptFile?.name}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-slate-300 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-sans font-bold mb-1">Description</p>
                <p className="font-semibold text-slate-900 text-xs italic">{selectedReceipt.description}</p>
              </div>

              <div className="border-t-2 border-dashed border-slate-300 pt-3 flex justify-between items-center text-slate-900">
                <span className="font-sans font-black text-sm uppercase">Total paid</span>
                <span className="font-black text-lg">${selectedReceipt.amount.toFixed(2)}</span>
              </div>

              {/* Barcode representation */}
              <div className="mt-6 flex flex-col items-center gap-1 opacity-80 select-none">
                <div className="h-6 w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#1e293b_2px,#1e293b_6px)]" />
                <span className="text-[9px] text-slate-500 font-sans uppercase font-bold tracking-wider">Approved Operator Invoice</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
