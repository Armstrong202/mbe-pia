import React, { useState, useEffect } from 'react';
import { supabase } from './supabase/client';
import { 
  Users, Wallet, PiggyBank, Award, Bell, Sun, Moon, 
  TrendingUp, Shield, LogOut, PlusCircle, CheckCircle, AlertTriangle 
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Données BDD
  const [membres, setMembres] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [prets, setPrets] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Formulaires
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Formulaire Membre
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Membre');
  const [cotisationMensuelle, setCotisationMensuelle] = useState('');

  // Formulaire Cotisation & Prêt
  const [selectedMembreCot, setSelectedMembreCot] = useState('');
  const [montantCot, setMontantCot] = useState('');
  const [moisCot, setMoisCot] = useState(new Date().toISOString().substring(0, 7));
  
  const [selectedMembrePret, setSelectedMembrePret] = useState('');
  const [montantPret, setMontantPret] = useState('');
  const [tauxPret, setTauxPret] = useState('5');

  // Dark Mode Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auth Supabase Init
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data
  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    setLoading(true);
    const resMembres = await supabase.from('membres').select('*').order('created_at', { ascending: false });
    const resCot = await supabase.from('cotisations').select('*, membres(nom)').order('date_paiement', { ascending: false });
    const resPrets = await supabase.from('prets').select('*, membres(nom)').order('date_octroi', { ascending: false });

    if (resMembres.data) setMembres(resMembres.data);
    if (resCot.data) setCotisations(resCot.data);
    if (resPrets.data) setPrets(resPrets.data);
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword
    });
    if (error) setAuthError(error.message);
  };

  const handleAddMembre = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('membres').insert([{
      nom, email, role, cotisation_mensuelle: parseFloat(cotisationMensuelle) || 0
    }]).select();

    if (!error && data) {
      setMembres([data[0], ...membres]);
      setNom(''); setEmail(''); setCotisationMensuelle('');
    }
  };

  const handleAddCotisation = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('cotisations').insert([{
      membre_id: selectedMembreCot,
      montant: parseFloat(montantCot),
      mois: moisCot
    }]).select('*, membres(nom)');

    if (!error && data) {
      setCotisations([data[0], ...cotisations]);
      setMontantCot('');
    }
  };

  const handleAddPret = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('prets').insert([{
      membre_id: selectedMembrePret,
      montant: parseFloat(montantPret),
      taux_interet: parseFloat(tauxPret)
    }]).select('*, membres(nom)');

    if (!error && data) {
      setPrets([data[0], ...prets]);
      setMontantPret('');
    }
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
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">MBE-PIA</span>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Espace Connexion</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Plateforme SaaS de Gestion de Tontine</p>

          {authError && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-xl">{authError}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="input-field" placeholder="admin@tontine.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mot de passe</label>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required className="input-field" placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary w-full mt-2">Se connecter</button>
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
              <p className="text-xs text-slate-500 dark:text-slate-400">Gestion de Tontine Intelligente</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
            <button onClick={() => supabase.auth.signOut()} className="btn-secondary text-xs px-3 py-2 flex items-center gap-2">
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          <button onClick={() => setActiveTab('dashboard')} className={`py-4 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}>
            <TrendingUp size={18} /> Tableau de Bord
          </button>
          <button onClick={() => setActiveTab('membres')} className={`py-4 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'membres' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}>
            <Users size={18} /> Membres ({membres.length})
          </button>
          <button onClick={() => setActiveTab('finances')} className={`py-4 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'finances' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}>
            <Wallet size={18} /> Cotisations & Prêts
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Membres Actifs</span>
                <div className="text-3xl font-extrabold mt-2">{membres.length}</div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Cotisations Totales</span>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2">{totalCotisations.toLocaleString()} FCFA</div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Prêts Accordés</span>
                <div className="text-3xl font-extrabold text-blue-600 mt-2">{totalPrets.toLocaleString()} FCFA</div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Taux de Santé</span>
                <div className="text-3xl font-extrabold text-indigo-600 mt-2">99.2%</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'membres' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Ajouter un Adhérent</h3>
              <form onSubmit={handleAddMembre} className="space-y-4">
                <input type="text" placeholder="Nom complet" value={nom} onChange={(e) => setNom(e.target.value)} required className="input-field" />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
                <input type="number" placeholder="Cotisation Fixe (FCFA)" value={cotisationMensuelle} onChange={(e) => setCotisationMensuelle(e.target.value)} className="input-field" />
                <button type="submit" className="btn-primary w-full">+ Enregistrer Membre</button>
              </form>
            </div>

            <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Répertoire Général</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {membres.map((m) => (
                  <div key={m.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{m.nom}</div>
                      <div className="text-xs text-slate-400">{m.email}</div>
                    </div>
                    <span className="badge badge-success">{m.role || 'Membre'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Module Cotisations */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-lg font-bold">Enregistrer une Cotisation</h3>
              <form onSubmit={handleAddCotisation} className="space-y-3">
                <select value={selectedMembreCot} onChange={(e) => setSelectedMembreCot(e.target.value)} required className="input-field">
                  <option value="">-- Sélectionner Membre --</option>
                  {membres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
                <input type="number" placeholder="Montant (FCFA)" value={montantCot} onChange={(e) => setMontantCot(e.target.value)} required className="input-field" />
                <input type="month" value={moisCot} onChange={(e) => setMoisCot(e.target.value)} className="input-field" />
                <button type="submit" className="btn-primary w-full">Valider Versement</button>
              </form>
            </div>

            {/* Module Prêts */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-lg font-bold">Octroyer un Prêt</h3>
              <form onSubmit={handleAddPret} className="space-y-3">
                <select value={selectedMembrePret} onChange={(e) => setSelectedMembrePret(e.target.value)} required className="input-field">
                  <option value="">-- Emprunteur --</option>
                  {membres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
                <input type="number" placeholder="Montant du prêt (FCFA)" value={montantPret} onChange={(e) => setMontantPret(e.target.value)} required className="input-field" />
                <button type="submit" className="btn-primary w-full bg-blue-600 hover:from-blue-700">Accorder le Prêt</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}