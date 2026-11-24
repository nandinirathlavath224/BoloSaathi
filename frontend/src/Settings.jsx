import React, { useState, useEffect } from "react";
import {
  Store, Globe, Palette, Bell, ShieldCheck, Save, User, Phone, Mail,
  MapPin, CheckCircle, Settings as SettingsIcon, Languages, Bot, Briefcase,
  Database, Users, Plug, CreditCard, Info, Download, Upload, Trash2, Plus,
  Mic, Volume2, CalendarDays, IndianRupee, LockKeyhole
} from "lucide-react";
import "./Settings.css";

const STORAGE_KEYS = [
  "boloBusinessProfile", "boloPreferences", "boloNotifications",
  "boloAISettings", "boloTeamMembers", "boloIntegrations"
];

const loadSaved = (key, defaults) => {
  try {
    return { ...defaults, ...(JSON.parse(localStorage.getItem(key) || "{}")) };
  } catch {
    return defaults;
  }
};

function applyTheme(theme) {
  const value = theme?.toLowerCase() === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", value);
  document.documentElement.style.colorScheme = value;
}
const Field = ({ label, children, full = false }) => (
  <div className={`settings-field ${full ? "full-width" : ""}`}>
    <label>{label}</label>
    {children}
  </div>
);

function Settings() {
  const [activeTab, setActiveTab] = useState("Business Profile");
  const [message, setMessage] = useState("");

  const [profile, setProfile] = useState({
    businessName: "My Business", ownerName: "Business Owner",
    phone: "", email: "", address: ""
  });
  const [preferences, setPreferences] = useState({
    language: "English", currency: "INR", dateFormat: "DD/MM/YYYY",
    paymentMethod: "Cash", theme: "Dark", financialYear: "April-March"
  });
  const [notifications, setNotifications] = useState({
    salesAlerts: true, expenseAlerts: true, lowStockAlerts: true,
    paymentReminders: true, aiTips: true, weeklySummary: false
  });
  const [aiSettings, setAiSettings] = useState({
    voiceAssistant: true, spokenReplies: true, saveHistory: true,
    responseStyle: "Friendly", speechRate: "1"
  });
  const [team, setTeam] = useState([]);
  const [integrations, setIntegrations] = useState({
    email: false, whatsapp: false, calendar: false
  });
  const [member, setMember] = useState({ name: "", email: "", role: "Staff" });

  useEffect(() => {
    setProfile(loadSaved("boloBusinessProfile", profile));
    const savedPreferences = loadSaved("boloPreferences", preferences);
    setPreferences(savedPreferences);
    applyTheme(savedPreferences.theme);
    setNotifications(loadSaved("boloNotifications", notifications));
    setAiSettings(loadSaved("boloAISettings", aiSettings));
    try {
      setTeam(JSON.parse(localStorage.getItem("boloTeamMembers") || "[]"));
    } catch { setTeam([]); }
    setIntegrations(loadSaved("boloIntegrations", integrations));
    // Load stored settings once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = [
    { name: "Business Profile", icon: Store },
    { name: "Preferences", icon: Globe },
    { name: "Appearance", icon: Palette },
    { name: "Notifications", icon: Bell },
    { name: "Security", icon: ShieldCheck },
    { name: "Language & Voice", icon: Languages },
    { name: "AI Assistant", icon: Bot },
    { name: "Business Preferences", icon: Briefcase },
    { name: "Data & Backup", icon: Database },
    { name: "Team Management", icon: Users },
    { name: "Integrations", icon: Plug },
    { name: "Billing & Subscription", icon: CreditCard },
    { name: "About BoloSaathi", icon: Info }
  ];

  const notify = (text) => {
    setMessage(text);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setMessage(""), 3500);
  };
const changeProfile = (e) => {
    console.log("Typing:", e.target.name, e.target.value);

    setProfile((old) => ({
        ...old,
        [e.target.name]: e.target.value
    }));
};

  const changePreferences = (e) => {
    const { name, value } = e.target;
    setPreferences((old) => ({ ...old, [name]: value }));
    if (name === "theme") applyTheme(value);
  };

  const changeNotifications = (e) =>
    setNotifications((old) => ({ ...old, [e.target.name]: e.target.checked }));

  const changeAI = (e) => {
    const { name, value, checked, type } = e.target;
    setAiSettings((old) => ({ ...old, [name]: type === "checkbox" ? checked : value }));
  };

  const saveSettings = () => {
    try {
      localStorage.setItem("boloBusinessProfile", JSON.stringify(profile));
      localStorage.setItem("boloPreferences", JSON.stringify(preferences));
      localStorage.setItem("boloNotifications", JSON.stringify(notifications));
      localStorage.setItem("boloAISettings", JSON.stringify(aiSettings));
      localStorage.setItem("boloTeamMembers", JSON.stringify(team));
      localStorage.setItem("boloIntegrations", JSON.stringify(integrations));
      applyTheme(preferences.theme);
      window.dispatchEvent(new Event("businessProfileUpdated"));
      notify("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      notify("Unable to save settings.");
    }
  };

  const exportBackup = () => {
    try {
      const data = {};
      STORAGE_KEYS.forEach((key) => {
        const raw = localStorage.getItem(key);
        data[key] = raw ? JSON.parse(raw) : null;
      });
      const blob = new Blob([JSON.stringify({
        application: "BoloSaathi", exportedAt: new Date().toISOString(), data
      }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bolosaathi-settings-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      notify("Settings backup downloaded.");
    } catch (error) {
      console.error(error);
      notify("Could not create backup.");
    }
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result);
        if (!backup.data || typeof backup.data !== "object") throw new Error("Invalid backup");
        STORAGE_KEYS.forEach((key) => {
          if (backup.data[key] !== undefined && backup.data[key] !== null) {
            localStorage.setItem(key, JSON.stringify(backup.data[key]));
          }
        });
        notify("Backup imported. Refresh the page to load restored settings.");
      } catch {
        notify("Invalid BoloSaathi backup file.");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const addMember = () => {
    if (!member.name.trim()) return notify("Please enter a team member name.");
    setTeam((old) => [...old, { ...member, id: Date.now() }]);
    setMember({ name: "", email: "", role: "Staff" });
    notify("Team member added. Click Save Changes to keep it.");
  };

  

  const Toggle = ({ name, title, description, value, onChange }) => (
    <div className="notification-setting">
      <div><h4>{title}</h4><p>{description}</p></div>
      <label className="settings-switch">
        <input type="checkbox" name={name} checked={!!value} onChange={onChange} />
        <span className="settings-slider" />
      </label>
    </div>
  );

  const businessProfile = () => (
    <div className="settings-section">
      <h2>Business Profile</h2><p>Manage your business information.</p>
      <div className="settings-form-grid">
        <Field label={<><Store size={16} /> Business Name</>}>
          <input 
    name="businessName"
    value={profile.businessName}
    onChange={changeProfile}
    onBlur={() => console.log("Business Name lost focus")}
    onFocus={() => console.log("Business Name focused")}
    placeholder="Enter business name"
/>
        </Field>
        <Field label={<><User size={16} /> Owner Name</>}>
          <input name="ownerName" value={profile.ownerName} onChange={changeProfile} placeholder="Enter owner name" />
        </Field>
        <Field label={<><Phone size={16} /> Phone Number</>}>
          <input name="phone" value={profile.phone} onChange={changeProfile} placeholder="Enter phone number" />
        </Field>
        <Field label={<><Mail size={16} /> Email Address</>}>
          <input type="email" name="email" value={profile.email} onChange={changeProfile} placeholder="Enter email address" />
        </Field>
        <Field full label={<><MapPin size={16} /> Business Address</>}>
          <textarea name="address" value={profile.address} onChange={changeProfile} placeholder="Enter business address" rows="3" />
        </Field>
      </div>
    </div>
  );

  const preferencesPage = () => (
    <div className="settings-section">
      <h2>Preferences</h2><p>Customize your language, currency and business defaults.</p>
      <div className="settings-form-grid">
        <Field label="Preferred Language">
          <select name="language" value={preferences.language} onChange={changePreferences}>
            {["English", "Telugu", "Hindi", "Tamil"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Currency">
          <select name="currency" value={preferences.currency} onChange={changePreferences}>
            <option value="INR">Indian Rupee (₹)</option><option value="USD">US Dollar ($)</option><option value="EUR">Euro (€)</option>
          </select>
        </Field>
        <Field label="Date Format">
          <select name="dateFormat" value={preferences.dateFormat} onChange={changePreferences}>
            {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Default Payment Method">
          <select name="paymentMethod" value={preferences.paymentMethod} onChange={changePreferences}>
            {["Cash", "UPI", "Card", "Bank Transfer"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );

  const appearancePage = () => (
    <div className="settings-section">
      <h2>Appearance</h2><p>Choose your preferred application theme.</p>
      <div className="theme-options">
        {["Light", "Dark"].map((theme) => (
          <button key={theme} type="button" className={`theme-option ${preferences.theme === theme ? "selected" : ""}`}
            onClick={() => changePreferences({ target: { name: "theme", value: theme } })}>
            <Palette size={25} /><strong>{theme} Mode</strong>
            <span>{theme === "Light" ? "Clean and bright interface" : "Comfortable dark interface"}</span>
            {preferences.theme === theme && <CheckCircle size={19} />}
          </button>
        ))}
      </div>
      <p className="settings-note">Your selected theme is applied immediately. Click Save Changes to keep your preference.</p>
    </div>
  );

  const notificationsPage = () => (
    <div className="settings-section">
      <h2>Notification Preferences</h2><p>Choose which business notifications you want to receive.</p>
      {[
        ["salesAlerts", "Sales Alerts", "Get notified when a new sale is recorded."],
        ["expenseAlerts", "Expense Alerts", "Receive updates when expenses are added."],
        ["lowStockAlerts", "Low Stock Alerts", "Know when products are running low."],
        ["paymentReminders", "Payment Reminders", "Receive reminders about pending payments."],
        ["aiTips", "AI Business Tips", "Receive useful suggestions from BoloSaathi AI."],
        ["weeklySummary", "Weekly Summary", "Enable a weekly business performance summary."]
      ].map(([name, title, description]) => (
        <Toggle key={name} name={name} title={title} description={description}
          value={notifications[name]} onChange={changeNotifications} />
      ))}
    </div>
  );

  const securityPage = () => (
    <div className="settings-section">
      <h2>Security Settings</h2><p>Manage your account security.</p>
      <div className="security-card">
        <ShieldCheck size={35} />
        <div><h3>Account Security</h3>
          <p>Password management and login protection will be connected after authentication is implemented.</p>
          <span className="security-status">Authentication not configured</span>
        </div>
      </div>
      <div className="settings-note"><LockKeyhole size={15} /> Preferences are currently stored in this browser. Avoid shared devices for sensitive business information.</div>
    </div>
  );

  const languageVoicePage = () => (
    <div className="settings-section">
      <h2>Language & Voice</h2><p>Set the preferred language and speech experience.</p>
      <div className="settings-form-grid">
        <Field label={<><Languages size={16} /> Assistant Language</>}>
          <select name="language" value={preferences.language} onChange={changePreferences}>
            {["English", "Telugu", "Hindi", "Tamil"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
        <Field label={<><Volume2 size={16} /> Speech Speed</>}>
          <select name="speechRate" value={aiSettings.speechRate} onChange={changeAI}>
            <option value="0.8">Slow</option><option value="1">Normal</option><option value="1.2">Fast</option><option value="1.4">Very Fast</option>
          </select>
        </Field>
      </div>
      <p className="settings-note">Language preference is shared with general preferences. The voice assistant must read speech speed to apply it to spoken replies.</p>
    </div>
  );

  const aiPage = () => (
    <div className="settings-section">
      <h2>AI Assistant Settings</h2><p>Control the conversational features of BoloSaathi.</p>
      <Toggle name="voiceAssistant" title="Voice Assistant" description="Enable the voice assistant experience." value={aiSettings.voiceAssistant} onChange={changeAI} />
      <Toggle name="spokenReplies" title="Spoken Replies" description="Allow spoken responses where supported by the assistant." value={aiSettings.spokenReplies} onChange={changeAI} />
      <Toggle name="saveHistory" title="Conversation History" description="Allow conversation history to be retained locally when supported." value={aiSettings.saveHistory} onChange={changeAI} />
      <Field label="AI Response Style">
        <select name="responseStyle" value={aiSettings.responseStyle} onChange={changeAI}>
          {["Friendly", "Professional", "Concise", "Detailed"].map((v) => <option key={v}>{v}</option>)}
        </select>
      </Field>
      <p className="settings-note">These preferences are saved locally. The AI conversation component must read them to change its response behaviour.</p>
    </div>
  );

  const businessPreferencesPage = () => (
    <div className="settings-section">
      <h2>Business Preferences</h2><p>Set defaults for daily business operations.</p>
      <div className="settings-form-grid">
        <Field label={<><IndianRupee size={16} /> Business Currency</>}>
          <select name="currency" value={preferences.currency} onChange={changePreferences}>
            <option value="INR">INR – Indian Rupee (₹)</option><option value="USD">USD – US Dollar ($)</option><option value="EUR">EUR – Euro (€)</option>
          </select>
        </Field>
        <Field label={<><CalendarDays size={16} /> Financial Year</>}>
          <select name="financialYear" value={preferences.financialYear || "April-March"} onChange={changePreferences}>
            <option value="April-March">April – March (India)</option><option value="January-December">January – December</option>
          </select>
        </Field>
        <Field label="Default Payment Method">
          <select name="paymentMethod" value={preferences.paymentMethod} onChange={changePreferences}>
            {["Cash", "UPI", "Card", "Bank Transfer"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Date Format">
          <select name="dateFormat" value={preferences.dateFormat} onChange={changePreferences}>
            {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
      </div>
      <p className="settings-note">These are saved defaults. Individual modules must read these preferences to apply them to their own formatting.</p>
    </div>
  );

  const backupPage = () => (
    <div className="settings-section">
      <h2>Data & Backup</h2><p>Export or restore settings saved in this browser.</p>
      <div className="security-card"><Database size={35} /><div><h3>Settings Backup</h3>
        <p>Download a JSON backup of your business profile, preferences, notification settings, AI preferences, team list and integration preferences.</p>
      </div></div>
      <div className="settings-action-row">
        <button type="button" className="settings-action-button" onClick={exportBackup}><Download size={17} /> Download Backup</button>
        <label className="settings-action-button upload-button"><Upload size={17} /> Import Backup
          <input type="file" accept=".json,application/json" onChange={importBackup} />
        </label>
      </div>
      <p className="settings-note">This backup covers settings stored in this browser only. It does not export sales, expenses, inventory or customer database records.</p>
    </div>
  );

  const teamPage = () => (
    <div className="settings-section">
      <h2>Team Management</h2><p>Maintain a simple list of your business team members.</p>
      <div className="settings-form-grid">
        <Field label="Member Name"><input value={member.name} onChange={(e) => setMember({ ...member, name: e.target.value })} placeholder="Enter member name" /></Field>
        <Field label="Email Address"><input type="email" value={member.email} onChange={(e) => setMember({ ...member, email: e.target.value })} placeholder="Enter email address" /></Field>
        <Field label="Role"><select value={member.role} onChange={(e) => setMember({ ...member, role: e.target.value })}><option>Staff</option><option>Manager</option><option>Accountant</option></select></Field>
      </div>
      <button type="button" className="settings-action-button add-member" onClick={addMember}><Plus size={17} /> Add Team Member</button>
      <div className="team-list">
        {team.length === 0 ? <p className="settings-empty">No team members added yet.</p> : team.map((person) => (
          <div className="team-row" key={person.id}>
            <div className="team-avatar">{person.name?.charAt(0)?.toUpperCase() || "?"}</div>
            <div className="team-person"><strong>{person.name}</strong><span>{person.email || "No email"} · {person.role}</span></div>
            <button type="button" className="remove-team" title="Remove member" onClick={() => setTeam((old) => old.filter((x) => x.id !== person.id))}><Trash2 size={17} /></button>
          </div>
        ))}
      </div>
      <p className="settings-note">This is a local team directory only. It does not create login accounts or enforce permissions. Backend authentication and role permissions are required for that.</p>
    </div>
  );

  const integrationsPage = () => (
    <div className="settings-section">
      <h2>Integrations</h2><p>Record which external services you plan to connect.</p>
      {[
        ["email", "Email Notifications", "Email service for business updates."],
        ["whatsapp", "WhatsApp Business", "Messaging integration for customer communication."],
        ["calendar", "Calendar", "Calendar connection for reminders and events."]
      ].map(([key, title, description]) => (
        <div className="notification-setting" key={key}>
          <div><h4>{title}</h4><p>{description}</p><span className="integration-status">{integrations[key] ? "Preference enabled — not connected" : "Not connected"}</span></div>
          <label className="settings-switch"><input type="checkbox" checked={!!integrations[key]} onChange={(e) => setIntegrations((old) => ({ ...old, [key]: e.target.checked }))} /><span className="settings-slider" /></label>
        </div>
      ))}
      <p className="settings-note">These switches only save your preferences. They do not connect external accounts or send messages.</p>
    </div>
  );

  const billingPage = () => (
    <div className="settings-section">
      <h2>Billing & Subscription</h2><p>Subscription and payment plan information.</p>
      <div className="security-card"><CreditCard size={35} /><div><h3>Current Plan</h3>
        <p>BoloSaathi local development version.</p>
        <span className="security-status">No paid subscription configured</span>
      </div></div>
      <p className="settings-note">Subscription upgrades, invoices and payment history are not configured in this project yet. No billing details are collected here.</p>
    </div>
  );

  const aboutPage = () => (
    <div className="settings-section">
      <h2>About BoloSaathi</h2><p>Your smart business companion for everyday business management and AI-powered assistance.</p>
      <div className="security-card"><Mic size={35} /><div><h3>BoloSaathi · SMART BUSINESS AI</h3><p>Application information</p><span className="security-status">Version 1.0.0 · Development</span></div></div>
      <div className="about-details">
        <div><span>Application</span><strong>BoloSaathi</strong></div>
        <div><span>Version</span><strong>1.0.0</strong></div>
        <div><span>Platform</span><strong>Web Application</strong></div>
      </div>
      <p className="settings-note">Add verified privacy policy, terms and production support details before public release.</p>
    </div>
  );

  const pageMap = {
    "Business Profile": businessProfile,
    "Preferences": preferencesPage,
    "Appearance": appearancePage,
    "Notifications": notificationsPage,
    "Security": securityPage,
    "Language & Voice": languageVoicePage,
    "AI Assistant": aiPage,
    "Business Preferences": businessPreferencesPage,
    "Data & Backup": backupPage,
    "Team Management": teamPage,
    "Integrations": integrationsPage,
    "Billing & Subscription": billingPage,
    "About BoloSaathi": aboutPage
  };

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div><h1><SettingsIcon size={27} /> Settings</h1><p>Personalize and manage your BoloSaathi experience.</p></div>
      </div>

      {message && <div className="settings-success"><CheckCircle size={18} />{message}</div>}

      <div className="settings-layout">
        <div className="settings-sidebar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button type="button" key={tab.name}
                className={`settings-tab ${activeTab === tab.name ? "active" : ""}`}
                onClick={() => setActiveTab(tab.name)}>
                <Icon size={19} /><span>{tab.name}</span>
              </button>
            );
          })}
        </div>
        <div className="settings-main">
          {(pageMap[activeTab] || businessProfile)()}
          <div className="settings-footer">
            <button className="settings-save" onClick={saveSettings}><Save size={18} /> Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
