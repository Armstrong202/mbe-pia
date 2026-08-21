import React, { useState, useEffect } from 'react';
import { supabase } from './supabase/client';

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // États membres
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Champs du formulaire membre (alignés sur votre schéma SQL)
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [profession, setProfession] = useState('');
  const [cotisationMensuelle, setCotisationMensuelle] = useState('');
  const [statut, setStatut] = useState('actif');

  // Formulaire de connexion
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 1. Session & Récupération du Rôle
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUserRole(session.user);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkUserRole(session.user);
      } else {
        setCurrentUserRole(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (user) => {
    // Recherche de l'utilisateur par user_id ou par email
    const { data, error } = await supabase
      .from('membres')
      .select('statut, user_id')
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .single();

    if (!error && data) {
      // Définition du rôle selon la colonne 'statut' (ex: 'Administrateur' ou 'actif')
      setCurrentUserRole(data.statut || 'actif');
    } else {
      setCurrentUserRole('Membre');
    }
  };

  // 2. Chargement des données
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
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(`Impossible de charger les membres : ${error.message}`);
    } else {
      setMembres(data || []);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) setAuthError(error.message);
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 3. Ajout d'un membre avec les colonnes exactes de la BD
  const handleAddMembre = async (e) => {
    e.preventDefault();
    if (currentUserRole !== 'Administrateur' && currentUserRole !== 'admin') {
      alert("Seul un administrateur peut ajouter un membre.");
      return;
    }
    if (!nom.trim()) return;

    setErrorMessage('');
    setSubmitting(true);

    const nouveauMembre = {
      nom,
      email: email.trim() || null,
      telephone: telephone.trim() || null,
      profession: profession.trim() || null,
      cotisation_mensuelle: cotisationMensuelle ? parseFloat(cotisationMensuelle) : 0,
      statut: statut || 'actif'
    };

    const { data, error } = await supabase
      .from('membres')
      .insert([nouveauMembre])
      .select();

    if (error) {
      setErrorMessage(`Erreur Supabase : ${error.message}`);
    } else if (data && data.length > 0) {
      setMembres((prev) => [data[0], ...prev]);
      // Réinitialisation du formulaire
      setNom('');
      setEmail('');
      setTelephone('');
      setProfession('');
      setCotisationMensuelle('');
      setStatut('actif');
    }
    setSubmitting(false);
  };

  if (authLoading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#64748b', marginTop: '16px' }}>Chargement de MBE-PIA...</p>
      </div>
    );
  }

  // ECRAN DE CONNEXION
  if (!session) {
    return (
      <div style={styles.authWrapper}>
        <div style={styles.authCard}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={styles.logoBadge}>MBE</div>
            <h1 style={styles.authTitle}>MBE-PIA</h1>
            <p style={styles.authSubtitle}>Gestion Professionnelle de Tontine</p>
          </div>

          {authError && <div style={styles.errorBanner}>⚠️ {authError}</div>}

          <form onSubmit={handleLogin} style={styles.formGrid}>
            <div>
              <label style={styles.label}>Adresse e-mail</label>
              <input
                type="email"
                placeholder="nom@exemple.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{ ...styles.primaryBtn, opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD APPRÈS CONNEXION
  const isAdmin = currentUserRole === 'Administrateur' || currentUserRole === 'admin';

  return (
    <div style={styles.dashboardWrapper}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.logoBadgeSmall}>MBE</div>
            <div>
              <h1 style={styles.headerTitle}>MBE-PIA</h1>
              <p style={styles.headerSubtitle}>Gestion de Tontine</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={styles.userInfo}>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>{session.user.email}</span>
              <span style={isAdmin ? styles.adminRoleBadge : styles.memberRoleBadge}>
                {currentUserRole || 'Membre'}
              </span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main style={styles.mainContainer}>
        {errorMessage && <div style={styles.errorBanner}>⚠️ {errorMessage}</div>}

        {/* FORMULAIRE ADMIN */}
        {isAdmin ? (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Inscrire un membre</h2>
                <p style={styles.cardSubtitle}>Saisissez les informations de l'adhérent</p>
              </div>
              <span style={styles.adminTag}>Accès Administrateur</span>
            </div>

            <form onSubmit={handleAddMembre} style={styles.formGridLarge}>
              <div style={{ flex: '1 1 220px' }}>
                <label style={styles.label}>Nom complet *</label>
                <input
                  type="text"
                  placeholder="ex: Kouam Franck"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={styles.label}>Téléphone</label>
                <input
                  type="tel"
                  placeholder="ex: 699000000"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ flex: '1 1 220px' }}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ flex: '1 1 180px' }}>
                <label style={styles.label}>Profession</label>
                <input
                  type="text"
                  placeholder="ex: Commerçant"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ flex: '1 1 180px' }}>
                <label style={styles.label}>Cotisation Mensuelle (FCFA)</label>
                <input
                  type="number"
                  placeholder="ex: 25000"
                  value={cotisationMensuelle}
                  onChange={(e) => setCotisationMensuelle(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ flex: '1 1 150px' }}>
                <label style={styles.label}>Statut / Rôle</label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value)}
                  style={styles.input}
                >
                  <option value="actif">Actif (Membre)</option>
                  <option value="Administrateur">Administrateur</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>

              <div style={{ flex: '1 1 100%', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ ...styles.primaryBtn, width: '100%', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Enregistrement...' : '+ Enregistrer le membre'}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <div style={styles.infoBanner}>
            💡 Vous êtes connecté en tant que <strong>Membre</strong>. Seuls les Administrateurs peuvent enregistrer de nouveaux adhérents.
          </div>
        )}

        {/* LISTE DES MEMBRES */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Répertoire des Membres</h2>
              <p style={styles.cardSubtitle}>{membres.length} membres enregistrés</p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Chargement des données...
            </div>
          ) : membres.length === 0 ? (
            <div style={styles.emptyState}>Aucun membre trouvé dans la base de données.</div>
          ) : (
            <div style={styles.listGrid}>
              {membres.map((m) => (
                <div key={m.id} style={styles.memberCard}>
                  <div style={styles.avatar}>
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.nom} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    ) : (
                      m.nom ? m.nom.charAt(0).toUpperCase() : 'M'
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>
                      {m.nom}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {m.telephone && <span>📱 {m.telephone}</span>}
                      {m.email && <span>✉️ {m.email}</span>}
                      {m.profession && <span>💼 {m.profession}</span>}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={m.statut === 'Administrateur' || m.statut === 'admin' ? styles.adminBadge : styles.memberBadge}>
                      {m.statut || 'actif'}
                    </span>
                    {m.cotisation_mensuelle > 0 && (
                      <small style={{ color: '#059669', fontWeight: '600', fontSize: '12px' }}>
                        {m.cotisation_mensuelle.toLocaleString()} FCFA / mois
                      </small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// STYLES D'INTERFACE
const styles = {
  centerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%' },
  authWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif' },
  authCard: { width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' },
  logoBadge: { width: '48px', height: '48px', backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' },
  authTitle: { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
  authSubtitle: { fontSize: '13px', color: '#64748b', margin: 0 },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGridLarge: { display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  primaryBtn: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  dashboardWrapper: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' },
  header: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' },
  headerContent: { maxWidth: '1000px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoBadgeSmall: { width: '36px', height: '36px', backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' },
  headerTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
  headerSubtitle: { fontSize: '12px', color: '#64748b', margin: 0 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' },
  adminRoleBadge: { backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  memberRoleBadge: { backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  logoutBtn: { backgroundColor: 'transparent', border: '1px solid #cbd5e1', color: '#64748b', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  mainContainer: { maxWidth: '1000px', margin: '32px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 },
  cardSubtitle: { fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' },
  adminTag: { backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' },
  infoBanner: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '14px 18px', borderRadius: '8px', fontSize: '14px', color: '#334155' },
  errorBanner: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  listGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  memberCard: { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f1f5f9', backgroundColor: '#fafafa' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' },
  adminBadge: { backgroundColor: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px' },
  memberBadge: { backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px' },
  emptyState: { textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '14px' }
};