import React from 'react';
import { 
  BarChart3, Users, TrendingDown, CreditCard, DollarSign, BookOpen, 
  Settings, LogOut, Wallet, Shield, Lock 
} from 'lucide-react';

const Sidebar = ({ currentUser, activeTab, setActiveTab, handleLogout, showSidebar }) => {
  const isAdmin = currentUser?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
    { id: 'membres', icon: Users, label: 'Membres' },
    { id: 'dettes', icon: TrendingDown, label: 'Dettes' },
    { id: 'remboursements', icon: CreditCard, label: 'Remboursements' },
    { id: 'cotisations', icon: DollarSign, label: 'Cotisations' },
    { id: 'reglement', icon: BookOpen, label: 'Règlement' },
    { id: 'parametres', icon: Settings, label: 'Paramètres' }
  ];

  return (
    <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-gradient-to-b from-green-800 via-green-700 to-emerald-800 text-white transition-all duration-300 overflow-hidden shadow-2xl`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <Wallet className="text-green-600" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">TontineApp</h1>
            <p className="text-xs text-green-100">Pro Edition v2.0</p>
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
          {menuItems.map(item => (
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
  );
};

export default Sidebar;
