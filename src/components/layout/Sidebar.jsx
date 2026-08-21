import React from 'react';
import { 
  BarChart3, Users, TrendingDown, CreditCard, DollarSign, BookOpen, 
  Settings, LogOut, Wallet, Shield, Lock, X
} from 'lucide-react';

const Sidebar = ({ currentUser, activeTab, setActiveTab, handleLogout, showSidebar, setShowSidebar }) => {
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
    { id: 'membres', icon: Users, label: 'Membres' },
    { id: 'dettes', icon: TrendingDown, label: 'Dettes' },
    { id: 'remboursements', icon: CreditCard, label: 'Remboursements' },
    { id: 'cotisations', icon: DollarSign, label: 'Cotisations' },
    { id: 'reglement', icon: BookOpen, label: 'Règlement' },
    { id: 'parametres', icon: Settings, label: 'Paramètres' }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    // Ferme le menu sur mobile lors de la sélection d'un onglet
    if (setShowSidebar && window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  return (
    <>
      {/* Overlay sombre pour mobile lorsque la sidebar est ouverte */}
      {showSidebar && (
        <div 
          onClick={() => setShowSidebar && setShowSidebar(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Conteneur de la Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 w-64 border-r border-slate-800 transition-transform duration-300 ease-in-out shrink-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-5 justify-between">
          <div>
            {/* Header & Logo */}
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-900/30">
                  <Wallet size={22} />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white leading-tight">TontineApp</h1>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                    Fotso Franck Dev
                  </p>
                </div>
              </div>

              {/* Bouton fermeture pour mobile */}
              {setShowSidebar && (
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Carte Profil Utilisateur */}
            <div className="bg-slate-800/80 rounded-xl p-3.5 mb-6 border border-slate-700/60 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg leading-none">{currentUser?.avatar || '👤'}</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isAdmin 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isAdmin ? <Shield size={12} /> : <Lock size={12} />}
                  {isAdmin ? 'ADMIN' : 'MEMBRE'}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-100 truncate">
                {currentUser?.nom || 'Utilisateur'}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-400 font-medium">Session active</span>
              </div>
            </div>

            {/* Navigation principale */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20' 
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bouton de Déconnexion */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;