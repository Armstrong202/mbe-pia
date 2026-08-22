import React, { useState, useEffect } from 'react';
import { supabase } from './supabase/client';

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Données
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Formulaire Membre / Accès
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telephone, setTelephone] = useState('');
  const [profession, setProfession] = useState('');
  const [cotisationMensuelle, setCotisationMensuelle] = useState('');
  const [statut, setStatut] = useState('actif');

  // Connexion
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 1. Initialisation Session & Droits
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user) => {
    const { data, error } = await supabase
      .from('membres')
      .select('*')
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!error && data) {
      setCurrentUser(data);
    } else {
      setCurrentUser({
        email: user.email,
        statut: 'Membre',
        nom: user.user_metadata?.nom || 'Adhérent'
      });
    }
  };

  // 2. Chargement du répertoire tontine
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
      setErrorMessage(`Impossible de charger les données : ${error.message}`);
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

  // 3. Inscription membre + Génération accès Auth par Super Admin / Admin
  const handleAddMembreAndCreateAccess = async (e) => {
    e.preventDefault();
    const isAdmin = currentUser?.statut === 'Administrateur' || currentUser?.statut === 'admin' || currentUser?.statut === 'super_admin';

    if (!isAdmin) {
      alert("Seul un Administrateur peut inscrire un membre.");
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { nom: nom, role: statut }
        }
      });

      if (authError) throw new Error(`Erreur Auth : ${authError.message}`);

      const createdUserId = authData.user ? authData.user.id : null;

      const nouveauMembre = {
        user_id: createdUserId,
        nom,
        email: email.trim(),
        telephone: telephone.trim() || null,
        profession: profession.trim() || null,
        cotisation_mensuelle: cotisationMensuelle ? parseFloat(cotisationMensuelle) : 0,
        statut: statut || 'actif'
      };

      const { data, error: dbError } = await supabase
        .from('membres')
        .insert([nouveauMembre])
        .select();

      if (dbError) throw new Error(`Erreur Base de données : ${dbError.message}`);

      if (data && data.length > 0) {
        setMembres((prev) => [data[0], ...prev]);
        setSuccessMessage(`Membre "${nom}" créé avec succès ! Identifiants d'accès activés.`);
        setNom('');
        setEmail('');
        setPassword('');
        setTelephone('');
        setProfession('');
        setCotisationMensuelle('');
        setStatut('actif');
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculs Dashboard
  const totalCotisationsMensuelles = membres.reduce((sum, m) => sum + (Number(m.cotisation_mensuelle) || 0), 0);
  const userRole = currentUser?.statut || 'Membre';
  const isAdmin = userRole === 'Administrateur' || userRole === 'admin' || userRole === 'super_admin';

  if (authLoading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#64748b', marginTop: '16px' }}>Chargement de MBE-PIA SaaS...</p>
      </div>
    );
  }

  // --- ECRAN 1 : CONNEXION OAUTH / EMAIL ---
  if (!session) {
    return (
      <div style={styles.authWrapper}>
        <div style={styles.authCard}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={styles.logoBadge}>MBE</div>
            <h1 style={styles.authTitle}>MBE-PIA</h1>
            <p style={styles.authSubtitle}>SaaS de Gestion Professionnelle de Tontine</p>
          </div>

          {authError && <div style={styles.errorBanner}>⚠️ {authError}</div>}

          <form onSubmit={handleLogin} style={styles.formGrid}>
            <div>
              <label style={styles.label}>Adresse e-mail</label>
              <input
                type="email"
                placeholder="ex: admin@tontine.com"
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
              {submitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>
            Les accès sont attribués par le Super Admin de la tontine.
          </p>
        </div>
      </div>
    );
  }

  // --- ECRAN 2 : PLATEFORME MBE-PIA ---
  return (
    <div style={styles.dashboardWrapper}>
      {/* HEADER PRINCIPAL */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.logoBadgeSmall}>MBE</div>
            <div>
              <h1 style={styles.headerTitle}>MBE-PIA Tontine</h1>
              <p style={styles.headerSubtitle}>
                {isAdmin ? 'Administration & Pilotage' : 'Espace Membre'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={styles.userInfo}>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>
                {currentUser?.nom || session.user.email}
              </span>
              <span style={isAdmin ? styles.adminRoleBadge : styles.memberRoleBadge}>
                {userRole}
              </span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* NAVIGATION SECONDAIRE */}
      <div style={styles.navBar}>
        <div style={styles.navContent}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={activeTab === 'dashboard' ? styles.navTabActive : styles.navTab}
          >
            📊 Tableau de Bord
          </button>
          <button
            onClick={() => setActiveTab('membres')}
            style={activeTab === 'membres' ? styles.navTabActive : styles.navTab}
          >
            👥 Membres ({membres.length})
          </button>
          <button
            onClick={() => setActiveTab('cotisations')}
            style={activeTab === 'cotisations' ? styles.navTabActive : styles.navTab}
          >
            💰 Cotisations & Prêts
          </button>
        </div>
      </div>

      <main style={styles.mainContainer}>
        {errorMessage && <div style={styles.errorBanner}>⚠️ {errorMessage}</div>}
        {successMessage && <div style={styles.successBanner}>✅ {successMessage}</div>}

        {/* TAB 1: DASHBOARD / METRIQUES */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Membres Inscrits</span>
                <span style={styles.statValue}>{membres.length}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Cotisations Prévisionnelles</span>
                <span style={styles.statValue}>{totalCotisationsMensuelles.toLocaleString()} FCFA</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Groupes de Tontine</span>
                <span style={styles.statValue}>1 Actif</span>
              </div>
            </div>

            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Profil de l'Utilisateur Connecté</h2>
              <div style={styles.profileGrid}>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Nom</span>
                  <span style={styles.profileValue}>{currentUser?.nom || 'N/A'}</span>
                </div>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Identifiant / Email</span>
                  <span style={styles.profileValue}>{session.user.email}</span>
                </div>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Statut d'Accès</span>
                  <span style={styles.profileValue}>{userRole}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: MEMBRES & CREATION D'ACCES */}
        {activeTab === 'membres' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {isAdmin && (
              <section style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Inscrire un Membre & Attribuer ses Accès</h2>
                    <p style={styles.cardSubtitle}>Créer le profil adhérent et générer ses identifiants de connexion</p>
                  </div>
                  <span style={styles.adminTag}>Gestion Admin</span>
                </div>

                <form onSubmit={handleAddMembreAndCreateAccess} style={styles.formGridLarge}>
                  <div style={{ flex: '1 1 220px' }}>
                    <label style={styles.label}>Nom complet *</label>
                    <input
                      type="text"
                      placeholder="ex: Marie Fotso"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                      style={styles.input}
                    />
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                    <label style={styles.label}>Email d'accès *</label>
                    <input
                      type="email"
                      placeholder="email@tontine.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={styles.input}
                    />
                  </div>

                  <div style={{ flex: '1 1 180px' }}>
                    <label style={styles.label}>Mot de passe provisoire *</label>
                    <input
                      type="password"
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={styles.input}
                    />
                  </div>

                  <div style={{ flex: '1 1 180px' }}>
                    <label style={styles.label}>Téléphone</label>
                    <input
                      type="tel"
                      placeholder="6XXXXXXXX"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
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
                      placeholder="25000"
                      value={cotisationMensuelle}
                      onChange={(e) => setCotisationMensuelle(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={{ flex: '1 1 150px' }}>
                    <label style={styles.label}>Rôle</label>
                    <select
                      value={statut}
                      onChange={(e) => setStatut(e.target.value)}
                      style={styles.input}
                    >
                      <option value="actif">Membre Actif</option>
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
                      {submitting ? 'Création en cours...' : '+ Inscrire et envoyer les accès'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* REPERTOIRE */}
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Répertoire Général des Membres</h2>
                  <p style={styles.cardSubtitle}>{membres.length} adhérents enregistrés</p>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Chargement...
                </div>
              ) : membres.length === 0 ? (
                <div style={styles.emptyState}>Aucun membre dans la tontine.</div>
              ) : (
                <div style={styles.listGrid}>
                  {membres.map((m) => (
                    <div key={m.id} style={styles.memberCard}>
                      <div style={styles.avatar}>
                        {m.nom ? m.nom.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>
                          {m.nom}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {m.telephone && <span>📱 {m.telephone}</span>}
                          {m.email && <span>✉️ {m.email}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={m.statut === 'Administrateur' || m.statut === 'admin' ? styles.adminBadge : styles.memberBadge}>
                          {m.statut || 'actif'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 3: COTISATIONS & PRETS */}
        {activeTab === 'cotisations' && (
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Suivi des Cotisations & Intérêts de Prêts</h2>
            <p style={styles.cardSubtitle}>Espace de suivi financier et d'échéancier</p>
            <div style={styles.emptyState}>
              Les modules Stripe / Mobile Money et calcul automatique d'intérêts sont prêts à recevoir les transactions.
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  centerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' },
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
  navBar: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' },
  navContent: { maxWidth: '1000px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '24px' },
  navTab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '12px 4px', fontSize: '14px', color: '#64748b', cursor: 'pointer', fontWeight: '500' },
  navTabActive: { background: 'none', border: 'none', borderBottom: '2px solid #2563eb', padding: '12px 4px', fontSize: '14px', color: '#2563eb', cursor: 'pointer', fontWeight: '600' },
  mainContainer: { maxWidth: '1000px', margin: '24px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  statCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' },
  statLabel: { fontSize: '13px', color: '#64748b', fontWeight: '500' },
  statValue: { fontSize: '20px', fontWeight: '700', color: '#0f172a' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 },
  cardSubtitle: { fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' },
  adminTag: { backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' },
  errorBanner: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  successBanner: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' },
  profileItem: { backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  profileLabel: { display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' },
  profileValue: { fontSize: '14px', fontWeight: '600', color: '#0f172a' },
  listGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  memberCard: { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f1f5f9', backgroundColor: '#fafafa' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' },
  adminBadge: { backgroundColor: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px' },
  memberBadge: { backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px' },
  emptyState: { textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '14px' }
};