import React, { useState } from 'react';
import {
  Plus,
  Check,
  Copy,
  Trash2,
  Percent,
  DollarSign,
  Ticket,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import { getDatabase } from '../data/mockDatabase';

export default function CouponGenerator() {
  const db = getDatabase();
  const [coupons, setCoupons] = useState(db.getCoupons());
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DISABLED'
  const [copiedCode, setCopiedCode] = useState('');
  const [notification, setNotification] = useState('');

  // Form State
  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENT'); // PERCENT or FLAT
  const [discountValue, setDiscountValue] = useState('');
  const [description, setDescription] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const applyPreset = (type, val, desc) => {
    setDiscountType(type);
    setDiscountValue(val.toString());
    setDescription(desc);
    const prefixes = ['VIP', 'PRO', 'SAVE', 'STREAM'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    setNewCode(`${prefix}${val}`);
  };

  const generateRandomCode = () => {
    const prefixes = ['VIP', 'STREAM', 'PASS', 'PRO', 'DEAL'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setNewCode(`${prefix}${num}`);
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCode.trim()) {
      alert("Please enter or generate a coupon code.");
      return;
    }
    const codeUpper = newCode.trim().toUpperCase();

    if (coupons.some(c => c.code === codeUpper)) {
      alert(`Coupon code "${codeUpper}" already exists.`);
      return;
    }

    const val = parseFloat(discountValue) || 10;
    const newCoupon = {
      id: `coup-${Date.now()}`,
      code: codeUpper,
      discountType,
      discountValue: val,
      description: description.trim() || `${val}${discountType === 'PERCENT' ? '%' : '$'} Promotional Discount`,
      maxUses: parseInt(maxUses) || 100,
      timesRedeemed: 0,
      expiresAt: expiresAt || null,
      isActive: true
    };

    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    db.saveCoupons(updated);
    setNotification(`Coupon "${codeUpper}" created & synced to Viewer Portal!`);
    setTimeout(() => setNotification(''), 3500);

    // Reset Form
    setNewCode('');
    setDiscountValue('');
    setDescription('');
    setMaxUses('');
    setExpiresAt('');
  };

  const handleToggleActive = (id) => {
    const updated = coupons.map(c => {
      if (c.id === id) return { ...c, isActive: !c.isActive };
      return c;
    });
    setCoupons(updated);
    db.saveCoupons(updated);
  };

  const handleDelete = (id, code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      const updated = coupons.filter(c => c.id !== id);
      setCoupons(updated);
      db.saveCoupons(updated);
      setNotification(`Coupon "${code}" deleted.`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filteredCoupons = coupons.filter(c => {
    if (filterStatus === 'ACTIVE') return c.isActive;
    if (filterStatus === 'DISABLED') return !c.isActive;
    return true;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-400" />
              <span>Promotion & Coupon Generator</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {coupons.filter(c => c.isActive).length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create discount passes for ad-free VIP upgrades. Viewers can redeem codes directly during checkout.
          </p>
        </div>

        {/* Presets Chips */}
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
            <Zap className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('PERCENT', 20, '20% Special Discount')}
            className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            20% OFF
          </button>
          <button
            type="button"
            onClick={() => applyPreset('PERCENT', 50, '50% Half Price VIP Pass')}
            className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
          >
            50% OFF
          </button>
          <button
            type="button"
            onClick={() => applyPreset('FLAT', 5, '$5 Flat Discount')}
            className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors"
          >
            $5 FLAT
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid: Form + Card Voucher Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Create New Coupon
            </h3>
            <button
              type="button"
              onClick={generateRandomCode}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Random Code</span>
            </button>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VIP50"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Discount Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENT')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center space-x-1 border transition-colors ${discountType === 'PERCENT'
                        ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    <Percent className="w-3 h-3 mr-1 text-blue-400" />
                    <span>Percent (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('FLAT')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center space-x-1 border transition-colors ${discountType === 'FLAT'
                        ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    <DollarSign className="w-3 h-3 mr-1 text-emerald-400" />
                    <span>Flat ($)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Discount Value {discountType === 'PERCENT' ? '(%)' : '($)'} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={discountType === 'PERCENT' ? "100" : "500"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 50% discount on 3-month VIP upgrade"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create & Sync Coupon</span>
              </button>
            </div>
          </form>
        </div>

        {/* Voucher Preview Card */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Coupon Voucher Preview</h4>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-medium text-slate-300">StreamVault Pass</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                PROMO TICKET
              </span>
            </div>

            <div className="text-center py-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                {discountValue ? (discountType === 'PERCENT' ? `${discountValue}% OFF` : `$${discountValue} FLAT OFF`) : '0% OFF'}
              </p>
              <p className="text-xs text-slate-400 mt-1">{description || 'Enter offer details to preview voucher.'}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-dashed border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Code</span>
                <span className="font-mono text-sm font-bold text-slate-100 tracking-wide">
                  {newCode || 'COUPON_CODE'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Expires</span>
                <span className="text-xs text-slate-300 font-mono">{expiresAt || 'No Expiry'}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Viewers can enter this code on the streaming platform during subscription checkout.
            </p>
          </div>
        </div>
      </div>

      {/* Coupons List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-100 text-xs sm:text-sm">Active Promo Codes ({filteredCoupons.length})</h3>
            <span className="text-xs text-slate-400">Synced with Viewer Checkout</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${filterStatus === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              All ({coupons.length})
            </button>
            <button
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${filterStatus === 'ACTIVE' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Active ({coupons.filter(c => c.isActive).length})
            </button>
            <button
              onClick={() => setFilterStatus('DISABLED')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${filterStatus === 'DISABLED' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Disabled ({coupons.filter(c => !c.isActive).length})
            </button>
          </div>
        </div>

        {filteredCoupons.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-1">
            <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No coupons found</p>
            <p className="text-[11px] text-slate-500">Create a promotional code above to provide subscription discounts to viewers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 sm:px-5 py-3">Code</th>
                  <th className="px-4 sm:px-5 py-3">Discount</th>
                  <th className="px-4 sm:px-5 py-3">Description</th>
                  <th className="px-4 sm:px-5 py-3">Redemptions</th>
                  <th className="px-4 sm:px-5 py-3">Status</th>
                  <th className="px-4 sm:px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredCoupons.map((c) => {
                  const percentUsed = c.maxUses ? Math.round((c.timesRedeemed / c.maxUses) * 100) : 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="px-4 sm:px-5 py-3.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-100 text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {c.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(c.code)}
                            className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
                            title="Copy Code"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 sm:px-5 py-3.5 font-bold text-slate-100">
                        {c.discountType === 'PERCENT' ? `${c.discountValue}% OFF` : `$${c.discountValue} FLAT`}
                      </td>

                      <td className="px-4 sm:px-5 py-3.5">
                        <p className="text-slate-200 font-medium">{c.description}</p>
                        <span className="text-[10px] text-slate-500">Expires: {c.expiresAt || 'Never'}</span>
                      </td>

                      <td className="px-4 sm:px-5 py-3.5">
                        <div className="w-28 sm:w-36">
                          <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                            <span>{c.timesRedeemed} / {c.maxUses || 100}</span>
                            <span>{percentUsed}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(percentUsed, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 sm:px-5 py-3.5">
                        <button
                          onClick={() => handleToggleActive(c.id)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${c.isActive
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      <td className="px-4 sm:px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
