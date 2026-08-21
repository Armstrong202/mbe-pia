import React, { useState, useEffect } from 'react';
// Importation du client Supabase depuis votre fichier existant
import { supabase } from './utils/supabase/client';

export default function App() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Champs du formulaire
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  // 1. CHARGEMENT INITIAL : Récupération des données au rafraîchissement
  useEffect(() => {
    fetchMembres();
  }, []);

  const fetchMembres = async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('membres')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Erreur de chargement Supabase:", error);
      setErrorMessage(`Impossible de charger les membres : ${error.message}`);
    } else {
      setMembres(data || []);
    }
    setLoading(false);
  };

  // 2. AJOUT D'UN MEMBRE : Envoi direct vers Supabase
  const handleAddMembre = async (e) => {
    e.preventDefault();
    if (!nom.trim()) return;

    setErrorMessage('');

    // Données envoyées à Supabase
    const nouveauMembre = {
      nom: nom,
      email: email,
      role: role || 'Membre'
    };

    // Insertion en base de données
    const { data, error } = await supabase
      .from('membres')
      .insert([nouveauMembre])
      .select();

    // Gestion d'erreur (si RLS bloqué ou colonne manquante)
    if (error) {
      console.error("Erreur d'insertion Supabase:", error);
      setErrorMessage(`ÉCHEC SUPABASE : ${error.message}`);
      alert(`Erreur Supabase : ${error.message}`);
      return; // Bloque la mise à jour si Supabase a refusé l'enregistrement
    }

    // Mise à jour de l'affichage seulement en cas de succès Supabase
    if (data && data.length > 0) {
      setMembres((prevMembres) => [data[0], ...prevMembres]);
      setNom('');
      setEmail('');
      setRole('');
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Gestion des Membres</h1>

      {/* Message d'erreur visible si Supabase échoue */}
      {errorMessage && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
          <strong>Erreur :</strong> {errorMessage}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <form onSubmit={handleAddMembre} style={{ display: 'grid', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Nom complet *"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Rôle (ex: Administrateur, Membre...)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{ padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Ajouter le membre
        </button>
      </form>

      {/* Liste des membres enregistrés */}
      <h2>Liste des membres ({membres.length})</h2>

      {loading ? (
        <p>Chargement des membres depuis Supabase...</p>
      ) : membres.length === 0 ? (
        <p style={{ color: '#666' }}>Aucun membre dans la base de données.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {membres.map((m) => (
            <div
              key={m.id}
              style={{
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9fafb'
              }}
            >
              <div>
                <strong style={{ fontSize: '1.05em' }}>{m.nom}</strong>
                {m.email && <span style={{ color: '#6b7280', fontSize: '0.9em', marginLeft: '10px' }}>({m.email})</span>}
              </div>
              <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em' }}>
                {m.role || 'Membre'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}