import React, { useState, useMemo } from 'react';
import { 
  Users, TrendingUp, TrendingDown, DollarSign, Plus, Edit2, Trash2, X, Check, Menu, 
  FileText, CreditCard, Clock, AlertCircle, Download, Search, Bell, Wallet, ArrowUpRight, 
  Activity, CheckCircle, Send, Eye, BarChart3, Lock, LogOut, Shield, BookOpen, Settings, 
  Calendar, Target, Award, PieChart, AlertTriangle, ChevronRight, Filter, RefreshCw, User, 
  Phone, Mail, MapPin, Building, History, Calculator, Percent, CircleDollarSign 
} from 'lucide-react';
import { 
  initialUsers, 
  initialParametres, 
  initialReglement, 
  initialMembres, 
  initialDettes, 
  initialRemboursements, 
  initialCotisations,
  initialReunions,
  initialNotifications 
} from './data/initialData';
import { formatCurrency, formatDate, getStatusColor, getScoringColor, getScoringGradient, calculateStats } from './utils/helpers';

const TontineApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [filterStatus, setFilterStatus] = useState('all');

  const parametres = initialParametres;
  const reglement = initialReglement;
  const reunions = initialReunions;
  const notifications = initialNotifications;

  const [membres, setMembres] = useState(initialMembres);
  const [dettes, setDettes] = useState(initialDettes);
  const [remboursements, setRemboursements] = useState(initialRemboursements);
  const [cotisations, setCotisations] = useState(initialCotisations);

  const users = initialUsers;

  const stats = useMemo(() => {
    return calculateStats(dettes, remboursements, cotisations, membres, notifications);
  }, [dettes, remboursements, cotisations, membres, notifications]);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('❌ Identifiants incorrects !');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const isAdmin = currentUser?.role === 'admin';

  const openModal = (type, item = null) => {
    if (!isAdmin) {
      alert('⛔ Accès refusé : Seul l\'administrateur peut effectuer cette action.');
      return;
    }
    setModalType(type);
    setEditingItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const handleSave = () => {
    if (!isAdmin) return;

    const newItem = { ...formData, id: editingItem ? editingItem.id : Date.now() };
    
    switch(modalType) {
      case 'membre':
        newItem.scoring = newItem.scoring || 80;
        newItem.avatar = newItem.avatar || '👤';
        setMembres(editingItem ? membres.map(m => m.id === editingItem.id ? newItem : m) : [...membres, newItem]);
        break;
      case 'dette':
        newItem.montantRestant = newItem.montantRestant || newItem.montant;
        const membre = membres.find(m => m.id === parseInt(newItem.membreId));
        if (membre) newItem.membre = membre.nom;
        setDettes(editingItem ? dettes.map(d => d.id === editingItem.id ? newItem : d) : [...dettes, newItem]);
        break;
      case 'remboursement':
        const dette = dettes.find(d => d.id === parseInt(newItem.detteId));
        if (dette) {
          const nouveauRestant = dette.montantRestant - parseFloat(newItem.montant);
          const nouveauStatut = nouveauRestant <= 0 ? 'remboursé' : dette.statut;
          setDettes(dettes.map(d => d.id === dette.id ? { ...d, montantRestant: Math.max(0, nouveauRestant), statut: nouveauStatut } : d));
          newItem.membre = dette.membre;
          newItem.membreId = dette.membreId;
          newItem.recu = `REC${String(remboursements.length + 1).padStart(3, '0')}`;
          newItem.valide = true;
        }
        setRemboursements(editingItem ? remboursements.map(r => r.id === editingItem.id ? newItem : r) : [...remboursements, newItem]);
        break;
      case 'cotisation':
        const membreCot = membres.find(m => m.id === parseInt(newItem.membreId));
        if (membreCot) {
          newItem.membre = membreCot.nom;
          newItem.montant = newItem.montant || membreCot.cotisation;
          newItem.recu = `COT${String(cotisations.length + 1).padStart(3, '0')}`;
        }
        setCotisations(editingItem ? cotisations.map(c => c.id === editingItem.id ? newItem : c) : [...cotisations, newItem]);
        break;
      default:
        break;
    }
    
    setShowModal(false);
    setFormData({});
  };

  const handleDelete = (type, id) => {
    if (!isAdmin) return;

    if (window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      switch(type) {
        case 'membre':
          setMembres(membres.filter(m => m.id !== id));
          break;
        case 'dette':
          setDettes(dettes.filter(d => d.id !== id));
          break;
        case 'remboursement':
          setRemboursements(remboursements.filter(r => r.id !== id));
          break;
        case 'cotisation':
          setCotisations(cotisations.filter(c => c.id !== id));
          break;
        default:
          break;
      }
    }
  };

  const handleExport = (format) => {
    alert(`📥 Exportation ${format} en cours...\n✅ Téléchargement disponible !`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition">
              <Wallet size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">MBE PIA</h1>
            <p className="text-gray-600 font-medium">Gestion Professionnelle de Tontine</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Shield size={16} />
              Plateforme Sécurisée
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom d'utilisateur</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="Entrez votre identifiant"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
            </div>

            <button
              onClick={(e) => handleLogin(e)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg transform hover:scale-105 transition flex items-center justify-center gap-2"
            >
              <LogOut className="rotate-180" size={20} />
              Se connecter
            </button>
          </div>


          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Tout droit reserver• © 2026 MBE-PIA </p>
          </div>
        </div>
      </div>
    );
  }

  const renderModal = () => {
    if (!showModal) return null;

    const fields = {
      membre: [
        { name: 'nom', label: 'Nom complet', type: 'text', required: true, icon: User },
        { name: 'telephone', label: 'Téléphone', type: 'tel', required: true, icon: Phone },
        { name: 'email', label: 'Email', type: 'email', icon: Mail },
        { name: 'adresse', label: 'Adresse', type: 'text', icon: MapPin },
        { name: 'profession', label: 'Profession', type: 'text', icon: Building },
        { name: 'cotisation', label: 'Cotisation mensuelle (FCFA)', type: 'number', required: true, icon: DollarSign },
        { name: 'statut', label: 'Statut', type: 'select', options: ['actif', 'inactif'], required: true },
        { name: 'dateInscription', label: "Date d'inscription", type: 'date', required: true, icon: Calendar }
      ],
      dette: [
        { name: 'membreId', label: 'Membre', type: 'select', options: membres.map(m => ({ value: m.id, label: m.nom })), required: true },
        { name: 'montant', label: 'Montant emprunté (FCFA)', type: 'number', required: true, icon: CircleDollarSign },
        { name: 'dateEmprunt', label: "Date d'emprunt", type: 'date', required: true, icon: Calendar },
        { name: 'dateEcheance', label: "Date d'échéance", type: 'date', required: true, icon: Clock },
        { name: 'tauxInteret', label: "Taux d'intérêt (%)", type: 'number', required: true, icon: Percent },
        { name: 'garantie', label: 'Type de garantie', type: 'select', options: ['Salaire', 'Commerce', 'Titre foncier', 'Véhicule', 'Autre'], required: true },
        { name: 'statut', label: 'Statut', type: 'select', options: ['en_cours', 'remboursé', 'en_retard'], required: true }
      ],
      remboursement: [
        { name: 'detteId', label: 'Dette', type: 'select', options: dettes.filter(d => d.statut !== 'remboursé').map(d => ({ value: d.id, label: `${d.membre} - ${d.montantRestant.toLocaleString()}FCFA restant` })), required: true },
        { name: 'montant', label: 'Montant remboursé (FCFA)', type: 'number', required: true, icon: DollarSign },
        { name: 'dateRemboursement', label: 'Date de remboursement', type: 'date', required: true, icon: Calendar },
        { name: 'methode', label: 'Méthode de paiement', type: 'select', options: ['especes', 'mobile_money', 'virement', 'cheque'], required: true },
        { name: 'note', label: 'Note', type: 'textarea' }
      ],
      cotisation: [
        { name: 'membreId', label: 'Membre', type: 'select', options: membres.map(m => ({ value: m.id, label: m.nom })), required: true },
        { name: 'montant', label: 'Montant (FCFA)', type: 'number', required: true, icon: DollarSign },
        { name: 'periode', label: 'Période (AAAA-MM)', type: 'month', required: true, icon: Calendar },
        { name: 'dateVersement', label: 'Date de versement', type: 'date', icon: Calendar },
        { name: 'methode', label: 'Méthode de paiement', type: 'select', options: ['especes', 'mobile_money', 'virement', 'cheque'] },
        { name: 'statut', label: 'Statut', type: 'select', options: ['payé', 'en_attente', 'en_retard'], required: true }
      ]
    };

    const currentFields = fields[modalType] || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {editingItem ? '✏️ Modifier' : '➕ Ajouter'} {modalType === 'membre' ? 'un membre' : modalType === 'dette' ? 'une dette' : modalType === 'remboursement' ? 'un remboursement' : 'une cotisations'}
                </h2>
                <p className="text-green-100 text-sm">Remplissez tous les champs obligatoires (*)</p>
              </div>
              <button onClick={() => setShowModal(false)} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentFields.map(field => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    {field.icon && <field.icon size={16} className="text-gray-500" />}
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      value={formData[field.name] || ''}
                      onChange={(e) => {
                        const value = field.name === 'membreId' || field.name === 'detteId' ? parseInt(e.target.value) : e.target.value;
                        const newFormData = { ...formData, [field.name]: value };
                        if (field.name === 'membreId' && modalType !== 'dette') {
                          const membre = membres.find(m => m.id === value);
                          if (membre) {
                            newFormData.membre = membre.nom;
                            if (modalType === 'cotisation') newFormData.montant = membre.cotisation;
                          }
                        }
                        if (field.name === 'detteId') {
                          const dette = dettes.find(d => d.id === value);
                          if (dette) newFormData.membre = dette.membre;
                        }
                        if (field.name === 'membreId' && modalType === 'dette') {
                          const membre = membres.find(m => m.id === value);
                          if (membre) newFormData.membre = membre.nom;
                        }
                        setFormData(newFormData);
                      }}
                      required={field.required}
                    >
                      <option value="">Sélectionner...</option>
                      {Array.isArray(field.options) ? 
                        field.options.map(opt => 
                          typeof opt === 'object' ? 
                            <option key={opt.value} value={opt.value}>{opt.label}</option> :
                            <option key={opt} value={opt}>{opt}</option>
                        ) : null
                      }
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      rows="3"
                      placeholder="Saisissez une note (optionnel)"
                    />
                  ) : (
                    <input
                      type={field.type}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 font-semibold shadow-lg transform hover:scale-105 transition"
              >
                <Check size={20} />
                Enregistrer
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2 font-semibold transition"
              >
                <X size={20} />
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <BarChart3 className="text-green-600" />
            Tableau de Bord Analytique
          </h2>
          <p className="text-gray-600">Vue d'ensemble complète de votre tontine • Mise à jour en temps réel</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select 
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 font-medium"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <button
            onClick={() => handleExport('PDF')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg transform hover:scale-105 transition"
          >
            <Download size={18} />
            Export PDF
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 flex items-center gap-2 font-medium shadow-lg transform hover:scale-105 transition"
          >
            <FileText size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <Wallet size={28} />
            </div>
            <div className="text-right">
              <ArrowUpRight className="text-green-200" size={24} />
            </div>
          </div>
          <p className="text-green-100 text-sm font-medium mb-1">💰 Caisse Totale</p>
          <p className="text-4xl font-bold mb-2">{stats.caisse.toLocaleString()}</p>
          <p className="text-xs text-green-100 mb-3">FCFA disponible</p>
          <div className="pt-3 border-t border-green-400 border-opacity-30">
            <div className="flex justify-between text-xs">
              <span>Intérêts gagnés</span>
              <span className="font-bold">+{stats.interetsGagnes.toLocaleString()}FCFA</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <Users size={28} />
            </div>
            <Activity className="text-blue-200" size={24} />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">👥 Membres Actifs</p>
          <p className="text-4xl font-bold mb-2">{stats.membresActifs}<span className="text-2xl">/{stats.totalMembres}</span></p>
          <p className="text-xs text-blue-100 mb-3">Taux d'activité: {((stats.membresActifs/stats.totalMembres)*100).toFixed(0)}%</p>
          <div className="pt-3 border-t border-blue-400 border-opacity-30">
            <div className="flex justify-between text-xs">
              <span>Scoring moyen</span>
              <span className="font-bold">{stats.scoringMoyen}/100</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <TrendingDown size={28} />
            </div>
            {stats.dettesEnRetard > 0 ? <AlertCircle className="text-red-200 animate-pulse" size={24} /> : <CheckCircle className="text-green-200" size={24} />}
          </div>
          <p className="text-orange-100 text-sm font-medium mb-1">💳 Dettes en Cours</p>
          <p className="text-4xl font-bold mb-2">{stats.totalRestant.toLocaleString()}</p>
          <p className="text-xs text-orange-100 mb-3">FCFA à recouvrer</p>
          <div className="pt-3 border-t border-orange-400 border-opacity-30">
            <div className="flex justify-between text-xs">
              <span>Dettes en retard</span>
              <span className="font-bold text-red-200">{stats.dettesEnRetard}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <TrendingUp size={28} />
            </div>
            <BarChart3 className="text-purple-200" size={24} />
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">📈 Performance</p>
          <p className="text-4xl font-bold mb-2">{stats.tauxRemboursement}%</p>
          <p className="text-xs text-purple-100 mb-3">Taux de remboursement</p>
          <div className="pt-3 border-t border-purple-400 border-opacity-30">
            <div className="flex justify-between text-xs">
              <span>Remboursé</span>
              <span className="font-bold">{stats.totalRemboursements.toLocaleString()}FCFA</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-green-300 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Calculator className="text-green-600" size={24} />
            </div>
            <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">Stable</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Ratio d'endettement</p>
          <p className="text-3xl font-bold text-gray-800">{stats.ratioEndettement}%</p>
          <p className="text-xs text-gray-500 mt-2">Ratio Dette/Caisse</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-300 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <CircleDollarSign className="text-blue-600" size={24} />
            </div>
            <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Moyen</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Dette moyenne</p>
          <p className="text-3xl font-bold text-gray-800">{stats.moyenneDette.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">FCFA par prêt</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-purple-300 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Target className="text-purple-600" size={24} />
            </div>
            <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Objectif</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Cotisation moyenne</p>
          <p className="text-3xl font-bold text-gray-800">{stats.moyenneCotisation.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">FCFA par membre</p>
        </div>
      </div>

      {/* Alertes et notifications */}
      {stats.dettesEnRetard > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-5 rounded-xl shadow-md animate-pulse">
          <div className="flex items-start gap-4">
            <div className="bg-red-500 p-3 rounded-xl">
              <AlertTriangle className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 text-lg mb-2">⚠️ Attention - Action Urgente Requise</h3>
              <p className="text-red-700 mb-3"><strong>{stats.dettesEnRetard}</strong> dette(s) en retard nécessite(nt) un suivi immédiat pour éviter des pertes financières.</p>
              <div className="flex gap-3">
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2">
                  <Send size={16} />
                  Envoyer rappels
                </button>
                <button className="bg-white text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition font-medium text-sm border border-red-300">
                  Voir détails
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <Clock className="text-orange-500" />
              Dettes Récentes
            </h3>
            <button onClick={() => setActiveTab('dettes')} className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
              Voir tout
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {dettes.slice(0, 5).map(dette => (
              <div key={dette.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition cursor-pointer group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{dette.membre}</p>
                    {dette.statut === 'en_retard' && <AlertCircle size={16} className="text-red-500" />}
                  </div>
                  <p className="text-sm text-gray-600">{dette.montant.toLocaleString()}FCFA • Reste: <span className="font-semibold text-orange-600">{dette.montantRestant.toLocaleString()}FCFA</span></p>
                  <p className="text-xs text-gray-500 mt-1">📅 Échéance: {dette.dateEcheance} • {dette.garantie}</p>
                </div>
                <div className="ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    dette.statut === 'remboursé' ? 'bg-green-100 text-green-700' :
                    dette.statut === 'en_retard' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {dette.statut.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <CreditCard className="text-green-500" />
              Remboursements Récents
            </h3>
            <button onClick={() => setActiveTab('remboursements')} className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
              Voir tout
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {remboursements.slice(0, 5).map(remb => (
              <div key={remb.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{remb.membre}</p>
                    {remb.valide && <CheckCircle size={16} className="text-green-500" />}
                  </div>
                  <p className="text-sm text-gray-600">📅 {remb.dateRemboursement} • {remb.methode.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500 mt-1">📝 {remb.note} • Reçu: {remb.recu}</p>
                </div>
                <span className="text-green-600 font-bold text-lg whitespace-nowrap ml-4">+{remb.montant.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance des membres */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <Award className="text-purple-500" />
              Classement des Membres par Performance
            </h3>
            <p className="text-sm text-gray-600 mt-1">Basé sur le scoring et le taux de remboursement</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition font-medium">
            <Filter size={16} />
            Filtrer
          </button>
        </div>
        <div className="space-y-4">
          {membres.sort((a, b) => b.scoring - a.scoring).map((membre, index) => {
            const membresRemb = remboursements.filter(r => r.membreId === membre.id).reduce((sum, r) => sum + r.montant, 0);
            const membresDettes = dettes.filter(d => d.membreId === membre.id).reduce((sum, d) => sum + d.montant, 0);
            const taux = membresDettes > 0 ? (membresRemb / membresDettes * 100).toFixed(1) : 0;
            
            return (
              <div key={membre.id} className="space-y-2 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`}</div>
                    <div className="text-3xl">{membre.avatar}</div>
                    <div>
                      <p className="font-semibold text-gray-800">{membre.nom}</p>
                      <p className="text-xs text-gray-600">{membre.profession}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm text-gray-600">Scoring</p>
                        <p className="text-2xl font-bold text-purple-600">{membre.scoring}/100</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Taux remb.</p>
                        <p className="text-2xl font-bold text-green-600">{taux}%</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      membre.scoring >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      membre.scoring >= 80 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                      membre.scoring >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${membre.scoring}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>💰 Cotisations: {membre.cotisation.toLocaleString()}FCFA/mois</span>
                  <span>📊 Remboursé: {membresRemb.toLocaleString()} / {membresDettes.toLocaleString()}FCFA</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <History className="text-blue-500" />
            Historique des Réunions
          </h3>
          <div className="space-y-3">
            {reunions.map(reunion => (
              <div key={reunion.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">📅 {reunion.date}</p>
                    <p className="text-sm text-gray-600">{reunion.type} • {reunion.participants} participants</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">Validée</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">{reunion.compteRendu}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bell className="text-orange-500" />
            Notifications Récentes
          </h3>
          <div className="space-y-3">
            {notifications.slice(0, 5).map(notif => (
              <div key={notif.id} className={`p-4 rounded-xl border-l-4 ${
                notif.type === 'warning' ? 'bg-red-50 border-red-500' :
                notif.type === 'success' ? 'bg-green-50 border-green-500' :
                'bg-blue-50 border-blue-500'
              } ${!notif.lu ? 'ring-2 ring-opacity-50' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-gray-800">{notif.titre}</p>
                  {!notif.lu && <span className="bg-red-500 w-2 h-2 rounded-full"></span>}
                </div>
                <p className="text-sm text-gray-600">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-2">🕐 {notif.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReglement = () => (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center border-b-2 border-gray-200 pb-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-2xl">
              <BookOpen className="text-green-600" size={40} />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">{reglement.titre}</h1>
          </div>
          <p className="text-gray-600 font-medium">Adopté le {reglement.dateCreation} • Version {reglement.version}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Shield size={16} />
              Document Officiel
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
              <FileText size={16} />
              {reglement.articles.length} Articles
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-8 border border-green-200">
          <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            <Settings size={20} />
            Paramètres de la Tontine
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-gray-600">Nom de la tontine</p>
              <p className="font-bold text-gray-800">{parametres.nomTontine}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-gray-600">Taux d'intérêt par défaut</p>
              <p className="font-bold text-gray-800">{parametres.tauxInteretDefaut}%</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-gray-600">Durée max. remboursement</p>
              <p className="font-bold text-gray-800">{parametres.dureeRemboursementMax} mois</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-gray-600">Plafond d'emprunt</p>
              <p className="font-bold text-gray-800">{parametres.plafondEmprunt}x les cotisations</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-gray-600">Frais d'adhésion</p>
              <p className="font-bold text-gray-800">{parametres.fraisAdhesion.toLocaleString()} {parametres.devise}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-gray-600">Réunions mensuelles</p>
              <p className="font-bold text-gray-800">{parametres.joursReunion}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {reglement.articles.map((article) => (
            <div key={article.numero} className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border-l-4 border-green-500 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-700 font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  {article.numero}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Article {article.numero} - {article.titre}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-justify">
                    {article.contenu}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Edit2 className="text-green-600" />
            Signatures des Responsables
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reglement.signatures.map((sig, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-green-300 transition">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="text-green-600" size={28} />
                </div>
                <p className="text-sm text-gray-600 mb-2">{sig.role}</p>
                <p className="font-bold text-gray-800 mb-2">{sig.nom}</p>
                <p className="text-xs text-gray-500">Signé le {sig.date}</p>
                <div className="mt-4 border-t-2 border-gray-400 w-32 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => handleExport('PDF')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 font-semibold shadow-lg transform hover:scale-105 transition"
          >
            <Download size={20} />
            Télécharger PDF
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 flex items-center gap-2 font-semibold shadow-lg transform hover:scale-105 transition"
          >
            <FileText size={20} />
            Imprimer
          </button>
          <button
            onClick={() => handleExport('Word')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 font-semibold shadow-lg transform hover:scale-105 transition"
          >
            <FileText size={20} />
            Export Word
          </button>
        </div>
      </div>
    </div>
  );

  const renderMembres = () => (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-green-600" />
            Gestion des Membres
          </h2>
          <p className="text-gray-600 mt-1">{membres.length} membres • {stats.membresActifs} actifs • Scoring moyen: {stats.scoringMoyen}/100</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => openModal('membre')}
              className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 flex items-center gap-2 font-medium shadow-lg transform hover:scale-105 transition"
            >
              <Plus size={20} />
              Nouveau membre
            </button>
          )}
          <button
            onClick={() => handleExport('Excel')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg"
          >
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Membre</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Profession</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Cotisation</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Scoring</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {membres.filter(m => m.nom.toLowerCase().includes(searchTerm.toLowerCase())).map(membre => (
                <tr key={membre.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{membre.avatar}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{membre.nom}</p>
                        <p className="text-xs text-gray-500">Depuis {membre.dateInscription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {membre.telephone}
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {membre.email}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{membre.profession}</p>
                    <p className="text-xs text-gray-500">{membre.adresse}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-semibold text-gray-900">{membre.cotisation.toLocaleString()}FCFA</p>
                    <p className="text-xs text-gray-500">par mois</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full ${getScoringColor(membre.scoring)}`}
                          style={{ width: `${membre.scoring}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{membre.scoring}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(membre.statut)}`}>
                      {membre.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => isAdmin && openModal('membre', membre)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                        title={isAdmin ? "Modifier" : "Voir détails"}
                      >
                        {isAdmin ? <Edit2 size={18} /> : <Eye size={18} />}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete('membre', membre.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDettes = () => (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingDown className="text-orange-600" />
            Gestion des Dettes
          </h2>
          <p className="text-gray-600 mt-1">{dettes.length} prêts • {stats.dettesEnRetard} en retard • Total: {stats.totalDettes.toLocaleString()}FCFA</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => openModal('dette')}
              className="bg-orange-600 text-white px-6 py-2 rounded-xl hover:bg-orange-700 flex items-center gap-2 font-medium shadow-lg transform hover:scale-105 transition"
            >
              <Plus size={20} />
              Nouveau prêt
            </button>
          )}
          <button
            onClick={() => handleExport('Excel')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg"
          >
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Membre</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Montant</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Restant</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Échéance</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Garantie</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dettes.filter(d => d.membre.toLowerCase().includes(searchTerm.toLowerCase()) || filterStatus === 'all' || d.statut === filterStatus).map(dette => (
                <tr key={dette.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-gray-900">{dette.membre}</p>
                      <p className="text-xs text-gray-500">Emprunt: {dette.dateEmprunt}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-semibold text-gray-900">{dette.montant.toLocaleString()}FCFA</p>
                    <p className="text-xs text-gray-500">Taux: {dette.tauxInteret}%</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-semibold text-orange-600">{dette.montantRestant.toLocaleString()}FCFA</p>
                    <p className="text-xs text-gray-500">{dette.moisRestants} mois restants</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{dette.dateEcheance}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{dette.garantie}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(dette.statut)}`}>
                      {dette.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => isAdmin && openModal('dette', dette)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                        title={isAdmin ? "Modifier" : "Voir détails"}
                      >
                        {isAdmin ? <Edit2 size={18} /> : <Eye size={18} />}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete('dette', dette.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRemboursements = () => (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="text-green-600" />
            Gestion des Remboursements
          </h2>
          <p className="text-gray-600 mt-1">{remboursements.length} remboursements • Total: {stats.totalRemboursements.toLocaleString()}FCFA</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => openModal('remboursement')}
              className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 flex items-center gap-2 font-medium shadow-lg transform hover:scale-105 transition"
            >
              <Plus size={20} />
              Nouveau remboursement
            </button>
          )}
          <button
            onClick={() => handleExport('Excel')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg"
          >
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Membre</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Montant</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Méthode</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Reçu</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {remboursements.filter(r => r.membre.toLowerCase().includes(searchTerm.toLowerCase())).map(remb => (
                <tr key={remb.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-semibold text-gray-900">{remb.membre}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-semibold text-green-600">+{remb.montant.toLocaleString()}FCFA</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{remb.dateRemboursement}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{remb.methode.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 font-mono">{remb.recu}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {remb.valide ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                        <CheckCircle size={14} /> Validé
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => openModal('remboursement', remb)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete('remboursement', remb.id)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCotisations = () => (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="text-green-600" />
            Gestion des Cotisations
          </h2>
          <p className="text-gray-600 mt-1">{cotisations.length} cotisations • Total: {stats.totalCotisations.toLocaleString()}FCFA</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => openModal('cotisation')}
              className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 flex items-center gap-2 font-medium shadow-lg transform hover:scale-105 transition"
            >
              <Plus size={20} />
              Nouvelle cotisation
            </button>
          )}
          <button
            onClick={() => handleExport('Excel')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg"
          >
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Membre</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Montant</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Période</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Méthode</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Reçu</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cotisations.filter(c => c.membre.toLowerCase().includes(searchTerm.toLowerCase())).map(cotisation => (
                <tr key={cotisation.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-semibold text-gray-900">{cotisation.membre}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-semibold text-gray-900">{cotisation.montant.toLocaleString()}FCFA</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{cotisation.periode}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{cotisation.dateVersement}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{cotisation.methode.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 font-mono">{cotisation.recu}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(cotisation.statut)}`}>
                      {cotisation.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => openModal('cotisation', cotisation)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete('cotisation', cotisations.id)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderParametres = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <Settings className="text-green-600" />
          Paramètres de la Tontine
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wallet size={20} className="text-green-600" />
              Informations Générales
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Nom de la tontine</p>
                <p className="font-bold text-gray-800">{parametres.nomTontine}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Devise</p>
                <p className="font-bold text-gray-800">{parametres.devise}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Frais d'adhésion</p>
                <p className="font-bold text-gray-800">{parametres.fraisAdhesion.toLocaleString()} {parametres.devise}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Paramètres de Prêt
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Taux d'intérêt par défaut</p>
                <p className="font-bold text-gray-800">{parametres.tauxInteretDefaut}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pénalité de retard</p>
                <p className="font-bold text-gray-800">{parametres.tauxPenaliteRetard}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Durée max. remboursement</p>
                <p className="font-bold text-gray-800">{parametres.dureeRemboursementMax} mois</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Plafond d'emprunt</p>
                <p className="font-bold text-gray-800">{parametres.plafondEmprunt}x les cotisations</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-600" />
              Réunions
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Jour de réunion</p>
                <p className="font-bold text-gray-800">{parametres.joursReunion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Heure</p>
                <p className="font-bold text-gray-800">{parametres.heureReunion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lieu</p>
                <p className="font-bold text-gray-800">{parametres.lieuReunion}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Phone size={20} className="text-orange-600" />
              Contact
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-bold text-gray-800">{parametres.telephone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-bold text-gray-800">{parametres.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => handleExport('PDF')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 font-semibold shadow-lg transform hover:scale-105 transition"
          >
            <Download size={20} />
            Exporter les paramètres
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {renderModal()}
      
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-gradient-to-b from-green-800 via-green-700 to-emerald-800 text-white transition-all duration-300 overflow-hidden shadow-2xl`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <Wallet className="text-green-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MBE PIA</h1>
              <p className="text-xs text-green-100">v2.0</p>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 mb-6 border border-white border-opacity-30">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">{currentUser.avatar}</div>
              {isAdmin ? <Shield size={16} /> : <Lock size={16} />}
              <p className="text-xs font-semibold">{isAdmin ? 'ADMINISTRATEUR' : 'UTILISATEUR'}</p>
            </div>
            <p className="text-sm font-bold">{currentUser.nom}</p>
            <p className="text-xs text-green-100 mt-1">Connecté</p>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
              { id: 'membres', icon: Users, label: 'Membres' },
              { id: 'dettes', icon: TrendingDown, label: 'Dettes' },
              { id: 'remboursements', icon: CreditCard, label: 'Remboursements' },
              { id: 'cotisations', icon: DollarSign, label: 'Cotisations' },
              { id: 'reglement', icon: BookOpen, label: 'Règlement' },
              { id: 'parametres', icon: Settings, label: 'Paramètres' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                  activeTab === item.id 
                    ? 'bg-white text-green-700 shadow-lg' 
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium hover:bg-red-500 hover:bg-opacity-30 mt-6 border-t border-white border-opacity-20 pt-6"
            >
              <LogOut size={20} />
              Déconnexion
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white shadow-md border-b border-gray-200 p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
                {isAdmin ? <Shield className="text-green-600" size={18} /> : <Lock className="text-gray-600" size={18} />}
                <span className="text-sm font-semibold text-gray-700">
                  {isAdmin ? '🛡️ Mode Administrateur' : '🔒 Mode Lecture Seule'}
                </span>
              </div>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition">
                <Bell size={24} />
                {stats.notificationsNonLues > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {stats.notificationsNonLues}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'membres' && renderMembres()}
          {activeTab === 'reglement' && renderReglement()}
          {activeTab === 'dettes' && renderDettes()}
          {activeTab === 'remboursements' && renderRemboursements()}
          {activeTab === 'cotisations' && renderCotisations()}
          {activeTab === 'parametres' && renderParametres()}
        </div>
      </div>
    </div>
  );
};

export default TontineApp;
