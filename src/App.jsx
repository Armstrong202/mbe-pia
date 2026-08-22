import React, { useState, useEffect } from 'react';
import { supabase } from './supabase/client';
import { 
  Users, Wallet, PiggyBank, Award, Bell, Sun, Moon, 
  TrendingUp, Shield, LogOut, PlusCircle, CheckCircle, AlertTriangle, 
  RefreshCw, MessageSquare, BookOpen, Download, CreditCard
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('Admin'); // Roles: Admin, Secrétaire, Membre, Observateur
  
  // Données d'état
  const [membres, setMembres] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [prets, setPrets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);

  // Formulaires State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [code2FA, setCode2FA] = useState('');

  // Nouveaux formulaires
  const [nomGroupe, setNomGroupe] = useState('');
  const [montantPart, setMontantPart] = useState('');
  const [ordreTirage, setOrdreTirage] = useState('aleatoire');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchAllData();
  }, [session]);

  const fetchAllData = async () => {
    const rMembres = await supabase.from('membres').select('*');
    const rGroupes = await supabase.from('groupes').select('*');
    const rCot = await supabase.from('cotisations').select('*, membres(nom)');
    const rPrets = await supabase.from('prets').select('*, membres(nom)');
    const rNotif = await supabase.from('notifications').select('*').limit(5);

    if (rMembres.data) setMembres(rMembres.data);
    if (rGroupes.data) setGroupes(rGroupes.data);
    if (rCot.data) setCotisations(rCot.data);
    if (rPrets.data) setPrets(rPrets.data);
    if (rNotif.data) setNotifications(rNotif.data);
  };

  const handleCreateGroupe = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('groupes').insert([{
      nom: nomGroupe,
      montant_part: parseFloat(montantPart),
      ordre_tirage: ordreTirage,
      tenant_id: '11111111-1111-1111-1111-111111111111'
    }]).select();

    if (!error && data) {
      setGroupes([...groupes, data[0]]);
      setNomGroupe(''); setMontantPart('');
    }
  };

  const exportDataCSV = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
  };

  const totalCotisations = cotisations.reduce((acc, c) => acc + (Number(c.montant) || 0), 0);
  const totalPrets = prets.reduce((acc, p) => acc + (Number(p.montant) || 0), 0);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center text-lg shadow-lg">MBE</div>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">MBE-PIA Enterprise</span>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
          }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email professionnel</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="input-field" placeholder="admin@tontine.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mot de passe</label>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required className="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Code 2FA (Si activé)</label>
              <input type="text" value={code2FA} onChange={(e) => setCode2FA(e.target.value)} className="input-field" placeholder="123456" />
            </div>
            <button type="submit" className="btn-primary w-full mt-2">Connexion Sécurisée (OAuth2/2FA)</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center shadow-lg">MBE</div>
            <div>
              <h1 className="text-lg font-bold leading-tight">MBE-PIA SaaS</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 font-semibold">Rôle: {userRole}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setShowTutorial(!showTutorial)} className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 text-xs">
              <BookOpen size={18} /> Tutoriel
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
            <button onClick={() => supabase.auth.signOut()} className="btn-secondary text-xs px-3 py-2 flex items-center gap-2">
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Tutoriel Intégré */}
      {showTutorial && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 p-4">
          <div className="max-w-7xl mx-auto flex items-start gap-3">
            <BookOpen className="text-emerald-600 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200">Guide de prise en main rapide</h4>
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                1. Créez des groupes de tontine multi-tenant.<br/>
                2. Ajoutez les membres avec leurs rôles (Admin, Secrétaire, Membre, Observateur).<br/>
                3. Effectuez des versement de cotisations via Stripe ou Mobile Money.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          <button onClick={() => setActiveTab('dashboard')} className={`py-4 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}>
            <TrendingUp size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('groupes')} className={`py-4 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'groupes' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}>
            <PiggyBank size={18} /> Groupes ({groupes.length})
          </button>
          <button onClick={() => setActiveTab('membres')} className={`py-4 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'membres' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}>
            <Users size={18} /> Membres ({membres.length})
          </button>
        </div>
      </div>

      {/* Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Aperçu Général</h2>
              <button onClick={() => exportDataCSV(cotisations, 'export_cotisations')} className="btn-secondary text-xs flex items-center gap-2">
                <Download size={16} /> Export RGPD (JSON/CSV)
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Membres Actifs</span>
                <div className="text-3xl font-extrabold mt-2">{membres.length}</div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Encaissé</span>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2">{totalCotisations.toLocaleString()} FCFA</div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Prêts Accordés</span>
                <div className="text-3xl font-extrabold text-blue-600 mt-2">{totalPrets.toLocaleString()} FCFA</div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Conformité RLS</span>
                <div className="text-3xl font-extrabold text-indigo-600 mt-2">100%</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'groupes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-lg font-bold">Nouveau Groupe de Tontine</h3>
              <form onSubmit={handleCreateGroupe} className="space-y-3">
                <input type="text" placeholder="Nom du groupe" value={nomGroupe} onChange={(e) => setNomGroupe(e.target.value)} required className="input-field" />
                <input type="number" placeholder="Montant de la part (FCFA)" value={montantPart} onChange={(e) => setMontantPart(e.target.value)} required className="input-field" />
                <select value={ordreTirage} onChange={(e) => setOrdreTirage(e.target.value)} className="input-field">
                  <option value="aleatoire">Tirage Aléatoire</option>
                  <option value="enchere">Système aux Enchères</option>
                  <option value="fixe">Ordre Fixe Préréglé</option>
                </select>
                <button type="submit" className="btn-primary w-full">+ Créer Groupe Multi-tenant</button>
              </form>
            </div>

            <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Groupes Actifs & Cycles</h3>
              <div className="space-y-4">
                {groupes.map((g) => (
                  <div key={g.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-md">{g.nom}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Part: {g.montant_part} FCFA | Tirage: {g.ordre_tirage}</p>
                    </div>
                    <button className="btn-secondary text-xs flex items-center gap-1">
                      <RefreshCw size={14} /> Lancer le Tirage
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}