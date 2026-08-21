import React, { useState, useEffect } from 'react';
import { supabase } from './supabase/client';

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // États pour la gestion des membres
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Champs du formulaire d'ajout
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Membre');

  // Champs du formulaire de connexion
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 1. GESTION DE LA SESSION & RÔLE UTILISATEUR
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUserRole(session.user.email);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkUserRole(session.user.email);
      } else {
        setCurrentUserRole(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Vérifier si l'utilisateur connecté est Administrateur
  const checkUserRole = async (userEmail) => {
    const { data, error } = await supabase
      .from('membres')
      .select('role')
      .eq('email', userEmail)
      .single();

    if (!error && data) {
      setCurrentUserRole(data.role);
    } else {
      setCurrentUserRole('Membre'); // Rôle par défaut si non trouvé
    }
  };

  // 2. CHARGEMENT DES MEMBRES
  useEffect(() => {
    if (session) {
      fetchMembres();
    }
  }, [session]);

  const fetchMembres = async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('membres')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      setErrorMessage(`Impossible de charger les membres : ${error.message}`);
    } else {
      setMembres(data || []);
    }
    setLoading(false);
  };

  // HANDLERS AUTHENTIFICATION
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // AJOUT D'UN MEMBRE (Réservé à l'Administrateur)
  const handleAddMembre = async (e) => {
    e.preventDefault();
    if (currentUserRole !== 'Administrateur') {
      alert("Action non autorisée : Vous devez être Administrateur pour ajouter un membre.");
      return;
    }

    if (!nom.trim()) return;
    setErrorMessage('');

    const nouveauMembre = { nom, email, role: role || 'Membre' };

    const { data, error } = await supabase
      .from('membres')
      .insert([nouveauMembre])
      .select();

    if (error) {
      setErrorMessage(`ÉCHEC SUPABASE : ${error.message}`);
      return;
    }

    if (data && data.length > 0) {
      setMembres((prev) => [data[0], ...prev]);
      setNom('');
      setEmail('');
      setRole('Membre');
    }
  };

  if (authLoading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Vérification de la session...</div>;
  }

  // ECRAN DE LOGIN
  if (!session) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <h2>Connexion</h2>
        {authError && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '15px' }}>
            {authError}
          </div>
        )}
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '12px' }}>
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  // DASHBOARD
  const isAdmin = currentUserRole === 'Administrateur';

  return (
    <div style={{ maxWidth: '650px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Gestion des Membres</h1>
          <small style={{ color: '#6b7280' }}>Connecté en tant que : <strong>{session.user.email}</strong> ({currentUserRole || 'Chargement...'})</small>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>

      {errorMessage && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
          <strong>Erreur :</strong> {errorMessage}
        </div>
      )}

      {/* FORMULAIRE RESERVÉ AUX ADMINISTRATEURS */}
      {isAdmin ? (
        <form onSubmit={handleAddMembre} style={{ display: 'grid', gap: '10px', marginBottom: '30px', padding: '15px', border: '1px solid #bfdbfe', borderRadius: '6px', backgroundColor: '#eff6ff' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>Nouveau membre (Accès Admin)</h3>
          <input type="text" placeholder="Nom complet *" value={nom} onChange={(e) => setNom(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <input type="email" placeholder="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="Membre">Membre</option>
            <option value="Administrateur">Administrateur</option>
          </select>
          <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Ajouter le membre
          </button>
        </form>
      ) : (
        <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '30px', color: '#4b5563' }}>
          <em>Seuls les utilisateurs avec le rôle <strong>Administrateur</strong> peuvent ajouter de nouveaux membres.</em>
        </div>
      )}

      <h2>Liste des membres ({membres.length})</h2>

      {loading ? (
        <p>Chargement des membres depuis Supabase...</p>
      ) : membres.length === 0 ? (
        <p style={{ color: '#666' }}>Aucun membre dans la base de données.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {membres.map((m) => (
            <div key={m.id} style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
              <div>
                <strong style={{ fontSize: '1.05em' }}>{m.nom}</strong>
                {m.email && <span style={{ color: '#6b7280', fontSize: '0.9em', marginLeft: '10px' }}>({m.email})</span>}
              </div>
              <span style={{ backgroundColor: m.role === 'Administrateur' ? '#fef3c7' : '#e0e7ff', color: m.role === 'Administrateur' ? '#92400e' : '#3730a3', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em', fontWeight: '500' }}>
                {m.role || 'Membre'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}