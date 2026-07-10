import { useState } from "react";
import { CheckCircle2, XCircle, FileText, User, ChevronDown } from "lucide-react";

// Mock data for pending professionals
const mockPendingPros = [
  {
    id: "p1",
    name: "Ajay Dev",
    profession: "Plumber",
    experience: 5,
    date: "2026-07-09",
    status: "pending",
    docs: {
      idProof: "aadhaar_front.jpg",
      certificate: "plumbing_cert.pdf",
    }
  },
  {
    id: "p2",
    name: "Sneha Nair",
    profession: "Painter",
    experience: 3,
    date: "2026-07-10",
    status: "pending",
    docs: {
      idProof: "driving_license.jpg",
      certificate: null,
    }
  }
];

export default function AdminDashboard() {
  const [pendingPros, setPendingPros] = useState(mockPendingPros);
  const [expandedId, setExpandedId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (id) => {
    // API Call to update status to 'verified'
    setPendingPros(prev => prev.filter(pro => pro.id !== id));
  };

  const handleReject = (id) => {
    if (!rejectReason) {
      alert("Please provide a reason for rejection");
      return;
    }
    // API Call to update status to 'rejected' with reason
    setPendingPros(prev => prev.filter(pro => pro.id !== id));
    setRejectReason("");
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-20 sm:pt-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full font-bold text-sm">
            {pendingPros.length} Pending Verifications
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {pendingPros.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="mx-auto h-12 w-12 mb-4 text-emerald-400" />
              <p className="text-lg font-semibold">All caught up!</p>
              <p>No pending professional verifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingPros.map(pro => (
                <div key={pro.id} className="p-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === pro.id ? null : pro.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{pro.name}</h3>
                        <p className="text-sm text-slate-500">{pro.profession} • {pro.experience} Years Exp • Applied {pro.date}</p>
                      </div>
                    </div>
                    <ChevronDown className={`text-slate-400 transition-transform ${expandedId === pro.id ? 'rotate-180' : ''}`} />
                  </div>

                  {expandedId === pro.id && (
                    <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-4">Submitted Documents</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                              <FileText className="text-blue-500" />
                              <span className="text-sm font-medium">{pro.docs.idProof}</span>
                              <button className="ml-auto text-xs font-bold text-blue-600 hover:underline">View</button>
                            </div>
                            {pro.docs.certificate && (
                              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                                <FileText className="text-purple-500" />
                                <span className="text-sm font-medium">{pro.docs.certificate}</span>
                                <button className="ml-auto text-xs font-bold text-blue-600 hover:underline">View</button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-900">Verification Actions</h4>
                          
                          <button 
                            onClick={() => handleApprove(pro.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 transition"
                          >
                            <CheckCircle2 size={18} /> Approve Professional
                          </button>
                          
                          <div className="pt-4">
                            <input 
                              type="text" 
                              placeholder="Reason for rejection (if rejecting)" 
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm mb-3 focus:outline-none focus:border-rose-400"
                            />
                            <button 
                              onClick={() => handleReject(pro.id)}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-600 px-4 py-3 font-bold hover:bg-rose-100 transition"
                            >
                              <XCircle size={18} /> Reject Application
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
