import React from 'react';
import { X, FileText, Download, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

interface GSTExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GSTExportModal: React.FC<GSTExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const gstData = [
    { invoice: 'MX-2024-0891', date: '24 Oct 2024', athlete: 'Priya Sharma', gstin: 'Unregistered (B2C)', sac: '999723', taxable: 20339, cgst: 1830.5, sgst: 1830.5, total: 24000 },
    { invoice: 'MX-2024-0892', date: '24 Oct 2024', athlete: 'Rohan Mehta', gstin: 'Unregistered (B2C)', sac: '999723', taxable: 3559, cgst: 320.5, sgst: 320.5, total: 4200 },
    { invoice: 'MX-2024-0893', date: '23 Oct 2024', athlete: 'Vikram Malhotra', gstin: '27AABCM8921R1ZG', sac: '999723', taxable: 2119, cgst: 190.5, sgst: 190.5, total: 2500 },
    { invoice: 'MX-2024-0894', date: '23 Oct 2024', athlete: 'Ananya Deshmukh', gstin: 'Unregistered (B2C)', sac: '999723', taxable: 4068, cgst: 366.0, sgst: 366.0, total: 4800 },
  ];

  const handleDownloadCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Invoice No,Date,Athlete,GSTIN,SAC Code,Taxable Value,CGST (9%),SGST (9%),Total Invoice\n' +
      gstData
        .map(
          (r) =>
            `${r.invoice},${r.date},${r.athlete},${r.gstin},${r.sac},${r.taxable},${r.cgst},${r.sgst},${r.total}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Madabolicx_GST_Audit_Oct2024.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-[#bae6fd]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-[#0b1c30]">
                  GST Summary & Compliance Audit
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#dcfce7] text-[#15803d]">
                  GSTR-1 READY
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                SAC: 999723 (Fitness Centre & Physical Well-being Services)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GSTIN Details */}
        <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-2xl bg-[#f8faff] border border-[#e2e8f0] text-center">
          <div>
            <span className="text-[9px] font-mono uppercase text-slate-400 block">GSTIN</span>
            <span className="text-xs font-mono font-bold text-[#0b1c30]">27AAECM5541L1Z9</span>
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-slate-400 block">TAX RATE</span>
            <span className="text-xs font-mono font-bold text-[#0284c7]">18% (9% + 9%)</span>
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-slate-400 block">OCT TOTAL TAX</span>
            <span className="text-xs font-mono font-bold text-[#0b1c30]">₹26,730</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-56 border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px]">
              <tr>
                <th className="p-2">Invoice</th>
                <th className="p-2">Athlete</th>
                <th className="p-2">Taxable</th>
                <th className="p-2">CGST (9%)</th>
                <th className="p-2">SGST (9%)</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gstData.map((row) => (
                <tr key={row.invoice} className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold text-[#006194]">{row.invoice}</td>
                  <td className="p-2 text-slate-800">{row.athlete}</td>
                  <td className="p-2 font-mono">₹{row.taxable.toLocaleString()}</td>
                  <td className="p-2 font-mono text-slate-500">₹{row.cgst.toLocaleString()}</td>
                  <td className="p-2 font-mono text-slate-500">₹{row.sgst.toLocaleString()}</td>
                  <td className="p-2 font-mono font-bold text-[#0b1c30]">₹{row.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#0284c7] text-white font-display font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#0369a1] transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV (Excel)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
