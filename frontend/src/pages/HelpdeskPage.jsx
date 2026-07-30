import { useState, useEffect } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Send, CheckCircle, Search, AlertCircle, RefreshCw } from "lucide-react";

const BRAND = "#6366f1";

const DEPARTMENTS = [
  "Manufacturing", "R&D / Research", "Supply Chain / Logistics",
  "Quality Assurance (QA)", "Sales & Marketing", "Finance & Accounts",
  "HR & Admin", "Regulatory Affairs", "IT", "Management", "Other"
];

const CATEGORIES = [
  { value: "Hardware", label: "ðŸ’» Hardware Issue", desc: "Laptop, desktop, printer, scanner" },
  { value: "Software", label: "âš™ï¸ Software Issue", desc: "Application not working, installation needed" },
  { value: "Network", label: "ðŸŒ Network / Internet", desc: "WiFi, VPN, connectivity issues" },
  { value: "Access", label: "ðŸ”‘ Access / Permissions", desc: "Cannot login, need access to system" },
  { value: "Email", label: "ðŸ“§ Email Issue", desc: "Cannot send/receive, configuration" },
  { value: "Printer", label: "ðŸ–¨ï¸ Printer / Scanner", desc: "Printing issues, scanner not working" },
  { value: "Phone", label: "ðŸ“ž Phone / Teams", desc: "Phone, Microsoft Teams, video calls" },
  { value: "Other", label: "ðŸ”§ Other", desc: "Any other IT issue" },
];

const inputStyle = {
  width: "100%", padding: "12px 16px", borderRadius: "12px",
  border: "1px solid #e2e8f0", fontSize: "14px", color: "#0f172a",
  background: "white", outline: "none", boxSizing: "border-box",
};

const STATUS_COLORS = {
  OPEN: { bg: "#fee2e2", color: "#dc2626", label: "Open", icon: "ðŸ”´", desc: "Your ticket has been received and is waiting to be picked up by the IT team." },
  IN_PROGRESS: { bg: "#dbeafe", color: "#1d4ed8", label: "In Progress", icon: "ðŸ”µ", desc: "The IT team is actively working on your issue." },
  RESOLVED: { bg: "#dcfce7", color: "#16a34a", label: "Resolved", icon: "ðŸŸ¢", desc: "Your issue has been resolved! Please check the resolution below." },
  CLOSED: { bg: "#f1f5f9", color: "#64748b", label: "Closed", icon: "âš«", desc: "This ticket has been closed." },
};

export default function HelpdeskPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(null);
  const [liveTicket, setLiveTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trackEmail, setTrackEmail] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [tickets, setTickets] = useState(null);
  const [activeTab, setActiveTab] = useState("submit");
  const [form, setForm] = useState({ name: "", email: "", department: "", category: "", title: "", description: "" });
  const [errors, setErrors] = useState({});
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Auto-refresh submitted ticket status every 10 seconds
  useEffect(() => {
    if (!submitted?.ticketNumber) return;
    const fetchStatus = async () => {
      try {
        const res = await api.get("/tickets/track/" + encodeURIComponent(form.email));
        const found = res.data.tickets.find(t => t.ticketNumber === submitted.ticketNumber);
        if (found) { setLiveTicket(found); setLastRefreshed(new Date()); }
      } catch {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [submitted, form.email]);

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.department) errs.department = "Please select your department";
    return errs;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!form.title.trim() || form.title.length < 10) errs.title = "Please be more specific (min 10 chars)";
    if (!form.description.trim() || form.description.length < 20) errs.description = "Please provide more details (min 20 chars)";
    return errs;
  };

  const handleNext = () => {
    if (step === 1) {
      const errs = validateStep1();
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    }
    if (step === 2 && !form.category) { setErrors({ category: "Please select an issue type" }); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    const errs = validateStep3();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await api.post("/tickets/submit", form);
      setSubmitted(res.data);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit. Please try again.");
    } finally { setLoading(false); }
  };

  const handleTrack = async () => {
    if (!trackEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trackEmail)) { toast.error("Please enter a valid email"); return; }
    setTrackLoading(true);
    try {
      const res = await api.get("/tickets/track/" + encodeURIComponent(trackEmail));
      setTickets(res.data.tickets);
    } catch { toast.error("Could not find tickets"); } finally { setTrackLoading(false); }
  };

  const card = { background: "white", borderRadius: "20px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };

  return (
    <div style={{minHeight: "100vh", background: "#f8fafc", fontFamily: "DM Sans, system-ui, sans-serif"}}>
      <div style={{background: "white", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)"}}>
        <div style={{maxWidth: "800px", margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px"}}>
          <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
            <img src="https://https://via.placeholder.com/120x40/6366f1/ffffff?text=TaskFlow+Pro" alt="Flamingo" style={{height: "36px", objectFit: "contain"}} />
            <div>
              <p style={{fontWeight: "700", color: "#0f172a", margin: 0, fontSize: "15px"}}>IT Helpdesk</p>
              <p style={{color: "#64748b", margin: 0, fontSize: "12px"}}>TaskFlow Pro Â· IT Support</p>
            </div>
          </div>
          <div style={{display: "flex", gap: "8px"}}>
            {["submit", "track"].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); if(tab==="submit"){setStep(1);setSubmitted(null);setLiveTicket(null);} setTickets(null); setTrackEmail(""); }}
                style={{padding: "8px 20px", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px",
                  background: activeTab === tab ? BRAND : "#f1f5f9", color: activeTab === tab ? "white" : "#64748b"}}>
                {tab === "submit" ? "ðŸŽ« Raise a Ticket" : "ðŸ” Track My Tickets"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth: "620px", margin: "0 auto", padding: "32px 24px"}}>
        {activeTab === "submit" && (
          <>
            {step < 4 && (
              <div style={{marginBottom: "28px"}}>
                <div style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px"}}>
                  {[1,2,3].map(s => (
                    <div key={s} style={{display: "flex", alignItems: "center", gap: "8px"}}>
                      <div style={{width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        background: step >= s ? BRAND : "#e2e8f0", color: step >= s ? "white" : "#94a3b8", fontWeight: "700", fontSize: "13px"}}>
                        {step > s ? "âœ“" : s}
                      </div>
                      {s < 3 && <div style={{height: "2px", width: "60px", background: step > s ? BRAND : "#e2e8f0", borderRadius: "2px"}} />}
                    </div>
                  ))}
                </div>
                <p style={{color: "#64748b", fontSize: "13px", margin: 0}}>
                  {step === 1 ? "Step 1 of 3 â€” Your details" : step === 2 ? "Step 2 of 3 â€” Issue type" : "Step 3 of 3 â€” Describe the issue"}
                </p>
              </div>
            )}

            {step === 1 && (
              <div style={card}>
                <h2 style={{color: "#0f172a", fontWeight: "700", fontSize: "20px", margin: "0 0 4px"}}>Tell us about yourself</h2>
                <p style={{color: "#64748b", fontSize: "13px", margin: "0 0 24px"}}>We need your details to follow up on your ticket</p>
                <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                  <div>
                    <label style={{display: "block", fontWeight: "500", fontSize: "13px", color: "#334155", marginBottom: "6px"}}>Full Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Rajesh Kumar"
                      style={{...inputStyle, borderColor: errors.name ? "#ef4444" : "#e2e8f0"}} />
                    {errors.name && <p style={{color: "#ef4444", fontSize: "12px", margin: "4px 0 0"}}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={{display: "block", fontWeight: "500", fontSize: "13px", color: "#334155", marginBottom: "6px"}}>Work Email *</label>
                    <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" placeholder="rajesh@taskflow.app"
                      style={{...inputStyle, borderColor: errors.email ? "#ef4444" : "#e2e8f0"}} />
                    {errors.email && <p style={{color: "#ef4444", fontSize: "12px", margin: "4px 0 0"}}>{errors.email}</p>}
                  </div>
                  <div>
                    <label style={{display: "block", fontWeight: "500", fontSize: "13px", color: "#334155", marginBottom: "6px"}}>Your Department *</label>
                    <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                      style={{...inputStyle, borderColor: errors.department ? "#ef4444" : "#e2e8f0"}}>
                      <option value="">Select your department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.department && <p style={{color: "#ef4444", fontSize: "12px", margin: "4px 0 0"}}>{errors.department}</p>}
                  </div>
                  <button onClick={handleNext} style={{width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: BRAND, color: "white", fontWeight: "600", fontSize: "14px", cursor: "pointer"}}>
                    Continue â†’
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={card}>
                <h2 style={{color: "#0f172a", fontWeight: "700", fontSize: "20px", margin: "0 0 4px"}}>What type of issue?</h2>
                <p style={{color: "#64748b", fontSize: "13px", margin: "0 0 20px"}}>Select the category that best matches your problem</p>
                {errors.category && <p style={{color: "#ef4444", fontSize: "12px", marginBottom: "12px"}}>{errors.category}</p>}
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px"}}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => { setForm({...form, category: cat.value}); setErrors({}); }}
                      style={{padding: "14px", borderRadius: "14px", border: "2px solid", textAlign: "left", cursor: "pointer",
                        borderColor: form.category === cat.value ? BRAND : "#e2e8f0", background: form.category === cat.value ? BRAND + "08" : "white"}}>
                      <p style={{fontWeight: "600", fontSize: "13px", color: "#0f172a", margin: "0 0 3px"}}>{cat.label}</p>
                      <p style={{fontSize: "11px", color: "#64748b", margin: 0}}>{cat.desc}</p>
                    </button>
                  ))}
                </div>
                <div style={{display: "flex", gap: "10px"}}>
                  <button onClick={() => setStep(1)} style={{flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: "600", fontSize: "13px", cursor: "pointer"}}>â† Back</button>
                  <button onClick={handleNext} style={{flex: 2, padding: "12px", borderRadius: "12px", border: "none", background: BRAND, color: "white", fontWeight: "600", fontSize: "13px", cursor: "pointer"}}>Continue â†’</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={card}>
                <h2 style={{color: "#0f172a", fontWeight: "700", fontSize: "20px", margin: "0 0 4px"}}>Describe your issue</h2>
                <p style={{color: "#64748b", fontSize: "13px", margin: "0 0 16px"}}>More detail = faster resolution</p>
                <div style={{padding: "10px 14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "16px"}}>
                  <span style={{color: "#64748b", fontSize: "13px"}}>Category: </span>
                  <span style={{color: "#0f172a", fontWeight: "600", fontSize: "13px"}}>{CATEGORIES.find(c => c.value === form.category)?.label}</span>
                </div>
                <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                  <div>
                    <label style={{display: "block", fontWeight: "500", fontSize: "13px", color: "#334155", marginBottom: "6px"}}>Issue Title *</label>
                    <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      placeholder="e.g. Cannot connect to office WiFi since this morning"
                      style={{...inputStyle, borderColor: errors.title ? "#ef4444" : "#e2e8f0"}} />
                    {errors.title && <p style={{color: "#ef4444", fontSize: "12px", margin: "4px 0 0"}}>{errors.title}</p>}
                  </div>
                  <div>
                    <label style={{display: "block", fontWeight: "500", fontSize: "13px", color: "#334155", marginBottom: "6px"}}>Detailed Description *</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      rows={5} placeholder={"Describe:\nâ€¢ What happened exactly?\nâ€¢ When did it start?\nâ€¢ What have you already tried?\nâ€¢ Does it affect others too?"}
                      style={{...inputStyle, resize: "none", height: "130px", borderColor: errors.description ? "#ef4444" : "#e2e8f0"}} />
                    {errors.description && <p style={{color: "#ef4444", fontSize: "12px", margin: "4px 0 0"}}>{errors.description}</p>}
                  </div>
                  <div style={{display: "flex", gap: "10px"}}>
                    <button onClick={() => setStep(2)} style={{flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: "600", fontSize: "13px", cursor: "pointer"}}>â† Back</button>
                    <button onClick={handleSubmit} disabled={loading}
                      style={{flex: 2, padding: "12px", borderRadius: "12px", border: "none", background: loading ? "#f87171" : BRAND, color: "white", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"}}>
                      {loading ? <div style={{width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%"}} /> : "ðŸŽ« Submit Ticket"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && submitted && (
              <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                <div style={{...card, textAlign: "center"}}>
                  <div style={{width: "64px", height: "64px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"}}>
                    <CheckCircle style={{width: "32px", height: "32px", color: "#16a34a"}} />
                  </div>
                  <h2 style={{color: "#0f172a", fontWeight: "700", fontSize: "22px", margin: "0 0 8px"}}>Ticket Submitted!</h2>
                  <p style={{color: "#64748b", fontSize: "14px", margin: "0 0 20px"}}>Your ticket is now live. IT team has been notified.</p>
                  <div style={{padding: "16px 20px", borderRadius: "14px", background: BRAND + "08", border: "1px solid " + BRAND + "25", marginBottom: "8px"}}>
                    <p style={{color: "#64748b", fontSize: "12px", margin: "0 0 4px"}}>Your ticket number</p>
                    <p style={{color: BRAND, fontWeight: "800", fontSize: "28px", margin: "0 0 4px", letterSpacing: "1px"}}>{submitted.ticketNumber}</p>
                    <p style={{color: "#94a3b8", fontSize: "11px", margin: 0}}>Save this number for your records</p>
                  </div>
                  <button onClick={() => { setStep(1); setForm({ name: "", email: "", department: "", category: "", title: "", description: "" }); setSubmitted(null); setLiveTicket(null); }}
                    style={{marginTop: "8px", padding: "10px 24px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "white", color: "#475569", fontWeight: "600", fontSize: "13px", cursor: "pointer"}}>
                    + Raise Another Ticket
                  </button>
                </div>

                {/* Live ticket status - auto updates */}
                <div style={card}>
                  <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"}}>
                    <div>
                      <p style={{fontWeight: "700", color: "#0f172a", margin: "0 0 2px", fontSize: "15px"}}>Live Ticket Status</p>
                      <p style={{color: "#94a3b8", fontSize: "11px", margin: 0}}>
                        {lastRefreshed ? "Last updated: " + lastRefreshed.toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit", second: "2-digit"}) : "Loading..."}
                        Â· Auto-refreshes every 10s
                      </p>
                    </div>
                    <div style={{width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite"}} title="Live" />
                  </div>

                  {liveTicket ? (
                    <>
                      <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderRadius: "14px", marginBottom: "14px",
                        background: STATUS_COLORS[liveTicket.status]?.bg + "60", border: "1px solid " + STATUS_COLORS[liveTicket.status]?.color + "30"}}>
                        <span style={{fontSize: "20px"}}>{STATUS_COLORS[liveTicket.status]?.icon}</span>
                        <div>
                          <p style={{fontWeight: "700", fontSize: "15px", color: STATUS_COLORS[liveTicket.status]?.color, margin: "0 0 2px"}}>{STATUS_COLORS[liveTicket.status]?.label}</p>
                          <p style={{fontSize: "12px", color: "#475569", margin: 0}}>{STATUS_COLORS[liveTicket.status]?.desc}</p>
                        </div>
                      </div>

                      {liveTicket.assignee && (
                        <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "12px"}}>
                          <div style={{width: "32px", height: "32px", borderRadius: "50%", background: BRAND, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px"}}>
                            {liveTicket.assignee.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{fontWeight: "600", fontSize: "13px", color: "#0f172a", margin: "0 0 1px"}}>Assigned to {liveTicket.assignee.name}</p>
                            <p style={{fontSize: "11px", color: "#64748b", margin: 0}}>IT Team Member handling your ticket</p>
                          </div>
                        </div>
                      )}

                      {liveTicket.resolution && (
                        <div style={{padding: "14px 16px", borderRadius: "14px", background: "#dcfce7", border: "1px solid #bbf7d0", marginBottom: "12px"}}>
                          <p style={{fontWeight: "700", fontSize: "12px", color: "#16a34a", margin: "0 0 6px"}}>âœ… Resolution from IT Team</p>
                          <p style={{fontSize: "13px", color: "#166534", margin: 0, lineHeight: "1.6"}}>{liveTicket.resolution}</p>
                        </div>
                      )}

                      {liveTicket.notes?.length > 0 && (
                        <div>
                          <p style={{fontWeight: "600", fontSize: "12px", color: "#64748b", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.5px"}}>Updates from IT Team</p>
                          {liveTicket.notes.map(note => (
                            <div key={note.id} style={{padding: "10px 14px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "8px"}}>
                              <p style={{fontSize: "11px", fontWeight: "600", color: "#64748b", margin: "0 0 4px"}}>
                                {note.author.name} Â· {new Date(note.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}
                              </p>
                              <p style={{fontSize: "13px", color: "#0f172a", margin: 0}}>{note.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {liveTicket.notes?.length === 0 && !liveTicket.resolution && (
                        <div style={{textAlign: "center", padding: "20px 0", color: "#94a3b8"}}>
                          <p style={{fontSize: "13px", margin: 0}}>Waiting for IT team to pick up your ticket...</p>
                          <p style={{fontSize: "12px", margin: "6px 0 0"}}>You will see updates here automatically</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{textAlign: "center", padding: "20px 0"}}>
                      <div style={{width: "24px", height: "24px", border: "3px solid #e2e8f0", borderTop: "3px solid " + BRAND, borderRadius: "50%", margin: "0 auto 10px"}} />
                      <p style={{color: "#94a3b8", fontSize: "13px", margin: 0}}>Loading ticket status...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "track" && (
          <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
            <div style={card}>
              <h2 style={{color: "#0f172a", fontWeight: "700", fontSize: "20px", margin: "0 0 4px"}}>Track Your Tickets</h2>
              <p style={{color: "#64748b", fontSize: "13px", margin: "0 0 16px"}}>Enter your email to see all tickets and live status updates</p>
              <div style={{display: "flex", gap: "10px"}}>
                <input value={trackEmail} onChange={e => setTrackEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTrack()} type="email" placeholder="your@taskflow.app"
                  style={{...inputStyle, flex: 1}} />
                <button onClick={handleTrack} disabled={trackLoading}
                  style={{padding: "12px 20px", borderRadius: "12px", border: "none", background: BRAND, color: "white", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap"}}>
                  {trackLoading ? <div style={{width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%"}} /> : <><Search style={{width: "14px", height: "14px"}} /> Search</>}
                </button>
              </div>
            </div>

            {tickets !== null && (
              tickets.length === 0 ? (
                <div style={{...card, textAlign: "center"}}>
                  <AlertCircle style={{width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px"}} />
                  <p style={{fontWeight: "600", color: "#0f172a", margin: "0 0 4px"}}>No tickets found</p>
                  <p style={{color: "#64748b", fontSize: "13px", margin: 0}}>No tickets submitted from this email address</p>
                </div>
              ) : tickets.map(ticket => {
                const sc = STATUS_COLORS[ticket.status];
                return (
                  <div key={ticket.id} style={card}>
                    <div style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px"}}>
                      <div>
                        <div style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap"}}>
                          <span style={{fontWeight: "700", fontSize: "13px", color: BRAND}}>{ticket.ticketNumber}</span>
                          <span style={{padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", background: sc.bg, color: sc.color}}>{sc.icon} {sc.label}</span>
                          <span style={{fontSize: "12px", color: "#64748b"}}>{ticket.category}</span>
                        </div>
                        <p style={{fontWeight: "600", color: "#0f172a", margin: "0 0 4px", fontSize: "15px"}}>{ticket.title}</p>
                        <p style={{fontSize: "12px", color: "#64748b", margin: 0}}>Submitted: {new Date(ticket.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"})}</p>
                      </div>
                    </div>
                    <p style={{fontSize: "13px", color: "#475569", margin: "0 0 12px", lineHeight: "1.6"}}>{ticket.description}</p>
                    {ticket.assignee && (
                      <div style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px"}}>
                        <div style={{width: "24px", height: "24px", borderRadius: "50%", background: BRAND, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700"}}>
                          {ticket.assignee.name[0].toUpperCase()}
                        </div>
                        <p style={{fontSize: "13px", color: "#64748b", margin: 0}}>Handled by <strong style={{color: "#0f172a"}}>{ticket.assignee.name}</strong></p>
                      </div>
                    )}
                    {ticket.resolution && (
                      <div style={{padding: "12px 16px", borderRadius: "12px", background: "#dcfce7", border: "1px solid #bbf7d0", marginBottom: "10px"}}>
                        <p style={{fontWeight: "700", fontSize: "12px", color: "#16a34a", margin: "0 0 6px"}}>âœ… Resolution</p>
                        <p style={{fontSize: "13px", color: "#166534", margin: 0}}>{ticket.resolution}</p>
                      </div>
                    )}
                    {ticket.notes?.length > 0 && (
                      <div>
                        <p style={{fontWeight: "600", fontSize: "12px", color: "#64748b", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px"}}>Updates from IT Team</p>
                        {ticket.notes.map(note => (
                          <div key={note.id} style={{padding: "10px 14px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "8px"}}>
                            <p style={{fontSize: "11px", fontWeight: "600", color: "#64748b", margin: "0 0 4px"}}>
                              {note.author.name} Â· {new Date(note.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}
                            </p>
                            <p style={{fontSize: "13px", color: "#0f172a", margin: 0}}>{note.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <div style={{textAlign: "center", padding: "24px", borderTop: "1px solid #e2e8f0", marginTop: "20px"}}>
        <p style={{color: "#94a3b8", fontSize: "12px", margin: "0 0 4px"}}>Â© 2024 TaskFlow Pro Ltd Â· Workspace</p>
        <p style={{color: "#94a3b8", fontSize: "12px", margin: 0}}>For urgent issues: <strong>Ext. 100</strong> Â· Working hours: Monâ€“Fri 9amâ€“6pm</p>
      </div>
    </div>
  );
}