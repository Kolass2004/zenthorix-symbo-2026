"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

interface UserRecord {
  id: string;
  name: string;
  collegeName: string;
  year: string;
  department?: string;
  phoneNo: string;
  ticketId: string;
  timestamp: string;
  eventPair1: string;
  eventPair2: string;
  eventPair3: string;
  greenWave: string;
  provider?: string;
  status?: string;
}

interface StatsData {
  totalOnline: number;
  totalOfflinePending: number;
  totalOfflineVerified: number;
  totalValidAndPaid: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'stats'|'pending'|'all'>('stats');

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingState, setIsVerifyingState] = useState<boolean>(false);
  const [isRejectingState, setIsRejectingState] = useState<boolean>(false);
  
  const [stats, setStats] = useState<StatsData | null>(null);
  const [pendingUsers, setPendingUsers] = useState<UserRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  
  // Phase 5 Bulk Selection State
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Authenticate
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setPendingUsers(data.pending);
        toast.success("Authentication successful");
      } else {
        toast.error(data.message || "Invalid Credentials");
      }
    } catch (error) {
      toast.error("Network error executing login");
    } finally {
      setIsLoading(false);
    }
  };

  const reSyncData = () => {
      fetch("/api/admin/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password })})
        .then(res => res.json()).then(data => data.success && setStats(data.stats));
      fetch("/api/admin/pending", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password })})
        .then(res => res.json()).then(data => data.success && setPendingUsers(data.pending));
      fetch("/api/admin/all", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password })})
        .then(res => res.json()).then(data => data.success && setAllUsers(data.all));
  };

  // Fetch Logic based on active tab
  useEffect(() => {
    if (!isLoggedIn) return;
    
    if (activeTab === 'stats') {
      fetch("/api/admin/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password })})
        .then(res => res.json())
        .then(data => data.success && setStats(data.stats))
        .catch(() => toast.error("Failed to load statistics"));
    }
    else if (activeTab === 'pending') {
      fetch("/api/admin/pending", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password })})
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setPendingUsers(data.pending);
                setSelectedTickets([]); // clear selections on refresh
            }
        })
        .catch(() => toast.error("Failed to load pending queue"));
    }
    else if (activeTab === 'all') {
      fetch("/api/admin/all", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password })})
        .then(res => res.json())
        .then(data => data.success && setAllUsers(data.all))
        .catch(() => toast.error("Failed to load global ledger"));
    }
  }, [activeTab, isLoggedIn, email, password]);


  // Phase 5 Bulk Verification Handlers
  const handleToggleSelectAll = () => {
    if (selectedTickets.length === pendingUsers.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(pendingUsers.map(u => u.ticketId));
    }
  };

  const handleToggleSingle = (ticketId: string) => {
    if (selectedTickets.includes(ticketId)) {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId));
    } else {
      setSelectedTickets(prev => [...prev, ticketId]);
    }
  };

  const handleBulkVerify = async () => {
    if (!confirm(`Are you sure you want to verify and send QR tickets to ${selectedTickets.length} students?`)) return;
    
    setIsVerifyingState(true);
    try {
      const response = await fetch("/api/admin/bulk-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ticketIds: selectedTickets }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setSelectedTickets([]);
        reSyncData();
      } else {
        toast.error(data.message || "Bulk Verification Failed");
      }
    } catch (error) {
      toast.error("Network error during bulk verification");
    } finally {
      setIsVerifyingState(false);
    }
  };

  const handleBulkReject = async () => {
    if (!confirm(`Are you sure you want to REJECT and delete ${selectedTickets.length} students from the pending queue?`)) return;
    
    setIsRejectingState(true);
    try {
      const response = await fetch("/api/admin/bulk-reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ticketIds: selectedTickets }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setSelectedTickets([]);
        reSyncData();
      } else {
        toast.error(data.message || "Bulk Rejection Failed");
      }
    } catch (error) {
      toast.error("Network error during bulk rejection");
    } finally {
      setIsRejectingState(false);
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Toaster position="top-center" />
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-neutral-400">Restricted secure zone.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Email Address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-white" 
                placeholder="admin123@gmail.com" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-white" 
                placeholder="••••••••" 
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 p-4 rounded-xl disabled:opacity-50 transition-colors flex justify-center items-center"
            >
              {isLoading ? "Authenticating..." : "Sign In securely"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <span className="bg-red-600 w-3 h-8 rounded shrink-0 mr-3"></span>
              Zenthorix Mission Control
            </h1>
            <p className="text-neutral-400 mt-2">Manage all online uploads and hard-cash transactions seamlessly.</p>
          </div>
          <button 
            onClick={() => {
              reSyncData();
              toast.success("Synchronized from Firestore", { icon: "🔄" });
            }}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-700 text-sm font-medium"
          >
            Force Sync Data
          </button>
        </div>

        {/* 3-Tab Navigation System */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 bg-neutral-900 border border-neutral-800 p-2 rounded-xl">
          <button 
            onClick={() => setActiveTab('stats')} 
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold text-sm md:text-base transition-colors ${activeTab === 'stats' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            📊 Homepage Stats
          </button>
          <button 
            onClick={() => setActiveTab('pending')} 
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold text-sm md:text-base transition-colors ${activeTab === 'pending' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            🕒 Pending Offline
          </button>
          <button 
            onClick={() => setActiveTab('all')} 
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold text-sm md:text-base transition-colors ${activeTab === 'all' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            ✅ Online / Verified
          </button>
        </div>

        {/* TAB 1: HOMEPAGE STATS */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Massive Revenue Block */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-red-900/40 to-black border border-red-900/50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between">
              <div>
                <p className="text-red-400 font-bold uppercase tracking-widest text-sm mb-2">Total Gross Revenue</p>
                <h2 className="text-5xl md:text-7xl font-black text-white">₹{stats.totalRevenue.toLocaleString()}</h2>
                <p className="text-neutral-400 mt-3 text-sm">Calculated exclusively from {stats.totalValidAndPaid} paid transactions at ₹200 / head.</p>
              </div>
              <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mt-6 md:mt-0 border border-red-600/30">
                <span className="text-4xl text-red-500">💰</span>
              </div>
            </div>

            {/* Standard Metrics */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
              <p className="text-neutral-400 font-medium text-sm mb-1">Total Authorized Scale</p>
              <h3 className="text-4xl font-bold text-white mb-4">{stats.totalValidAndPaid}</h3>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute right-[-20%] top-[-20%] w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <p className="text-neutral-400 font-medium text-sm mb-1">Digital Processing</p>
              <h3 className="text-4xl font-bold text-white mb-4">{stats.totalOnline}</h3>
              <p className="text-xs text-blue-400">Scanned instantly by Gemini AI</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute right-[-20%] top-[-20%] w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
              <p className="text-neutral-400 font-medium text-sm mb-1">Pending Cash Handlers</p>
              <h3 className="text-4xl font-bold text-white mb-4">{stats.totalOfflinePending}</h3>
              <p className="text-xs text-yellow-400">Awaiting desk review.</p>
            </div>
          </div>
        )}

        {/* TAB 2: PENDING OFFLINE (LIST VIEW & BULK ACTIONS) */}
        {activeTab === 'pending' && (
          <div className="animate-in fade-in duration-500 space-y-4">
            
            {/* Sticky Bulk Selection Bar */}
            {selectedTickets.length > 0 && (
              <div className="sticky top-4 z-20 bg-neutral-800 border border-red-500/50 shadow-2xl p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
                <div className="text-white font-bold flex items-center">
                   <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center mr-3 text-sm">{selectedTickets.length}</div>
                   Tickets Selected
                </div>
                <div className="flex gap-3">
                   <button 
                     onClick={handleBulkReject}
                     disabled={isRejectingState || isVerifyingState}
                     className="px-4 py-2 bg-neutral-900 border border-neutral-700 hover:bg-neutral-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                   >
                     {isRejectingState ? "Rejecting..." : "Reject All"}
                   </button>
                   <button 
                     onClick={handleBulkVerify}
                     disabled={isRejectingState || isVerifyingState}
                     className="px-6 py-2 bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                   >
                     {isVerifyingState ? "Verifying & Sending Emails..." : "Approve & Send Emails"}
                   </button>
                </div>
              </div>
            )}

            {pendingUsers.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center shadow-inner">
                <span className="text-5xl border border-neutral-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-black">🎉</span>
                <h3 className="text-xl font-medium text-white mb-1">Zero pending tickets</h3>
                <p className="text-neutral-500">All offline cash desks are perfectly synced.</p>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/50 border-b border-neutral-800 text-neutral-400 text-sm font-medium">
                        <th className="p-4 w-12 text-center">
                           <input 
                             type="checkbox" 
                             checked={selectedTickets.length === pendingUsers.length && pendingUsers.length > 0}
                             onChange={handleToggleSelectAll}
                             className="w-5 h-5 accent-red-600 bg-neutral-800 cursor-pointer"
                           />
                        </th>
                        <th className="p-4 whitespace-nowrap">Ticket ID</th>
                        <th className="p-4">Demographics</th>
                        <th className="p-4">Events Map</th>
                        <th className="p-4 whitespace-nowrap">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50 relative">
                      {/* Overlap Loader */}
                      {(isVerifyingState || isRejectingState) && (
                        <tr className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                          <td colSpan={5}>
                             <svg className="animate-spin h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          </td>
                        </tr>
                      )}
                      
                      {pendingUsers.map((user) => {
                        const isSelected = selectedTickets.includes(user.ticketId);
                        
                        return (
                          <tr 
                            key={user.id} 
                            onClick={() => handleToggleSingle(user.ticketId)}
                            className={`transition-colors cursor-pointer ${isSelected ? 'bg-red-900/20' : 'hover:bg-neutral-800/30'}`}
                          >
                            <td className="p-4 text-center">
                               <input 
                                 type="checkbox" 
                                 checked={isSelected}
                                 onChange={() => handleToggleSingle(user.ticketId)}
                                 onClick={(e) => e.stopPropagation()}
                                 className="w-5 h-5 accent-red-600 bg-neutral-800 cursor-pointer"
                               />
                            </td>
                            <td className="p-4 font-mono text-white text-sm whitespace-nowrap">
                              <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded inline-block mr-2 text-[10px] font-bold tracking-wider">PENDING</span>
                              <br className="md:hidden" />
                              <span className="mt-2 inline-block text-red-400">{user.ticketId}</span>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-white text-base md:text-lg">{user.name}</p>
                              <p className="text-xs text-neutral-400 mt-1">{user.collegeName} ({user.year})</p>
                              <p className="text-xs text-neutral-500 mt-1 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-neutral-600 mr-2"></span>
                                {user.phoneNo}
                              </p>
                            </td>
                            <td className="p-4 text-sm text-neutral-300">
                              <div className="flex flex-col space-y-1">
                                <span className="bg-neutral-800 px-2 py-1 rounded w-max text-xs">{user.eventPair1}</span>
                                <span className="bg-neutral-800 px-2 py-1 rounded w-max text-xs">{user.eventPair2}</span>
                                <span className="bg-neutral-800 px-2 py-1 rounded w-max text-xs">{user.eventPair3}</span>
                                {user.greenWave === "Yes" && <span className="text-green-500 text-xs mt-1 block font-bold border border-green-500/20 bg-green-500/10 px-2 py-1 rounded w-max">+ GreenWave</span>}
                              </div>
                            </td>
                            <td className="p-4 text-xs text-neutral-500 whitespace-nowrap">
                              {new Date(user.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ONLINE / VERIFIED LEDGER */}
        {activeTab === 'all' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/50 border-b border-neutral-800 text-neutral-400 text-sm font-medium">
                    <th className="p-4 whitespace-nowrap">Ticket ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Status / Origin</th>
                    <th className="p-4">Institution</th>
                    <th className="p-4 whitespace-nowrap">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {allUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500">No verified registrations found in ledger.</td>
                    </tr>
                  ) : null}
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="p-4 font-mono text-white text-sm whitespace-nowrap border-l-4 border-transparent hover:border-red-500">{user.ticketId}</td>
                      <td className="p-4">
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.phoneNo}</p>
                      </td>
                      <td className="p-4">
                        {user.status === 'verified' ? (
                          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">OFFLINE VERIFIED</span>
                        ) : (
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">ONLINE AI PAYMENT</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-neutral-300">{user.collegeName} ({user.year})</td>
                      <td className="p-4 text-xs text-neutral-500 whitespace-nowrap">{new Date(user.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
