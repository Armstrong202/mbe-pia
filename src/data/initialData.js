// Initial mock data for the TontineApp
// This data is used when Supabase is not configured

export const initialUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', nom: 'Administrateur Principal', avatar: '👨‍💼' },
  { id: 2, username: 'user1', password: 'user123', role: 'user', nom: 'Jean Kamga', avatar: '👤' },
  { id: 3, username: 'user2', password: 'user123', role: 'user', nom: 'Marie Fotso', avatar: '👩' },
  { id: 4, username: 'chinang', password: '1512203', role: 'user', nom: 'Chinang Pariss', avatar: '👩' }
]

export const initialParametres = {
  nomTontine: 'TONTINE SOLIDARITÉ',
  devise: 'FCFA',
  tauxInteretDefaut: 5,
  tauxPenaliteRetard: 2,
  dureeRemboursementMax: 12,
  plafondEmprunt: 5,
  seuilGarantie: 300000,
  fraisAdhesion: 10000,
  joursReunion: 'Premier dimanche du mois',
  heureReunion: '14:00',
  lieuReunion: 'Siège social - Douala',
  telephone: '+237 6 88 50 67 46',
  email: 'fotofranckzephyin@gmail.com'
}

export const initialReglement = {
  titre: 'RÈGLEMENT INTÉRIEUR DE LA TONTINE',
  dateCreation: '01 Janvier 2025',
  version: '2.0',
  articles: [
    {
      numero: 1,
      titre: 'OBJET ET BUT',
      contenu: 'La tontine a pour objet de favoriser l\'entraide financière entre ses membres par la constitution d\'une caisse commune alimentée par des cotisations régulières. Elle vise à permettre aux membres de bénéficier de prêts à taux préférentiels pour leurs projets personnels ou professionnels.'
    },
    {
      numero: 2,
      titre: 'ADHÉSION ET COTISATIONS',
      contenu: 'L\'adhésion est ouverte à toute personne majeure après validation du comité. Chaque membre s\'engage à verser une cotisations mensuelle dont le montant est fixé lors de l\'adhésion. Le non-paiement de trois cotisations consécutives entraîne la suspension temporaire des droits du membre.'
    },
    {
      numero: 3,
      titre: 'EMPRUNTS ET GARANTIES',
      contenu: 'Tout membre à jour de ses cotisations peut solliciter un emprunt. Le montant maximum est plafonné à 5 fois le total de ses cotisations versées. Un taux d\'intérêt de 5% est appliqué sur tous les emprunts. Une garantie est exigée pour tout emprunt supérieur à 300,000 FCFA.'
    },
    {
      numero: 4,
      titre: 'REMBOURSEMENTS',
      contenu: 'La durée maximale de remboursement est fixée à 12 mois. Les remboursements s\'effectuent par mensualités égales. Tout retard de paiement entraîne une pénalité de 2% par mois de retard.'
    },
    {
      numero: 5,
      titre: 'GESTION ET ADMINISTRATION',
      contenu: 'La tontine est gérée par un comité élu pour un mandat de 2 ans. Les décisions importantes sont prises en assemblée générale à la majorité simple.'
    },
    {
      numero: 6,
      titre: 'DISCIPLINE ET SANCTIONS',
      contenu: 'Tout manquement grave aux règles peut entraîner l\'exclusion du membre après délibération du comité.'
    },
    {
      numero: 7,
      titre: 'DISSOLUTION',
      contenu: 'La dissolution ne peut être décidée qu\'en assemblée générale extraordinaire avec une majorité des 2/3.'
    },
    {
      numero: 8,
      titre: 'CONFIDENTIALITÉ',
      contenu: 'Tous les membres s\'engagent à respecter la confidentialité des informations.'
    }
  ],
  signatures: [
    { role: 'Le Président', nom: 'M. TALLA Joseph', date: '01/01/2025' },
    { role: 'Le Trésorier', nom: 'Mme FOTSO Marie', date: '01/01/2025' },
    { role: 'Le Secrétaire', nom: 'M. KAMGA Jean', date: '01/01/2025' }
  ]
}

export const initialMembres = [
  { id: 1, nom: 'Jean Kamga', telephone: '+237 699887766', email: 'j.kamga@email.cm', adresse: 'Akwa, Douala', profession: 'Commerçant', cotisation: 50000, statut: 'actif', dateInscription: '2025-01-01', avatar: '👨‍💼', scoring: 95 },
  { id: 2, nom: 'Marie Fotso', telephone: '+237 677889900', email: 'm.fotso@email.cm', adresse: 'Bonanjo, Douala', profession: 'Entrepreneur',cotisation: 50000, statut: 'actif', dateInscription: '2025-01-01', avatar: '👩‍💼', scoring: 98 },
  { id: 3, nom: 'Paul Nkomo', telephone: '+237 655443322', email: 'p.nkomo@email.cm', adresse: 'Bonapriso, Douala', profession: 'Fonctionnaire',cotisation: 50000, statut: 'actif', dateInscription: '2025-01-05', avatar: '👨', scoring: 88 },
  { id: 4, nom: 'Sophie Mballa', telephone: '+237 688990011', email: 's.mballa@email.cm', adresse: 'Deido, Douala', profession: 'Enseignante',cotisation: 50000, statut: 'actif', dateInscription: '2025-01-01', avatar: '👩', scoring: 92 },
  { id: 5, nom: 'Eric Njoya', telephone: '+237 622334455', email: 'e.njoya@email.cm', adresse: 'Bali, Douala', profession: 'Informaticien',cotisation: 75000, statut: 'actif', dateInscription: '2025-01-10', avatar: '👨‍💻', scoring: 90 },
  { id: 6, nom: 'Grace Ewane', telephone: '+237 699112233', email: 'g.ewane@email.cm', adresse: 'Logpom, Douala', profession: 'Infirmière',cotisation: 50000, statut: 'actif', dateInscription: '2025-01-12', avatar: '👩‍⚕️', scoring: 85 }
]

export const initialDettes = [
  { id: 1, membreId: 1, membre: 'Jean Kamga', montant: 500000, montantRestant: 350000, dateEmprunt: '2026-01-10', dateEcheance: '2026-07-10', statut: 'en_cours', tauxInteret: 5, garantie: 'Salaire', montantMensuel: 83333, moisRestants: 4 },
  { id: 2, membreId: 2, membre: 'Marie Fotso', montant: 300000, montantRestant: 0, dateEmprunt: '2026-01-05', dateEcheance: '2026-04-05', statut: 'remboursé', tauxInteret: 5, garantie: 'Commerce', montantMensuel: 100000, moisRestants: 0 },
  { id: 3, membreId: 3, membre: 'Paul Nkomo', montant: 750000, montantRestant: 600000, dateEmprunt: '2026-01-15', dateEcheance: '2026-09-15', statut: 'en_cours', tauxInteret: 5, garantie: 'Titre foncier', montantMensuel: 93750, moisRestants: 6 },
  { id: 4, membreId: 1, membre: 'Jean Kamga', montant: 200000, montantRestant: 200000, dateEmprunt: '2025-12-20', dateEcheance: '2026-01-20', statut: 'en_retard', tauxInteret: 8, garantie: 'Salaire', montantMensuel: 100000, moisRestants: 2 },
  { id: 5, membreId: 5, membre: 'Eric Njoya', montant: 400000, montantRestant: 280000, dateEmprunt: '2026-01-12', dateEcheance: '2026-06-12', statut: 'en_cours', tauxInteret: 5, garantie: 'Véhicule', montantMensuel: 80000, moisRestants: 3 },
  { id: 6, membreId: 6, membre: 'Grace Ewane', montant: 250000, montantRestant: 200000, dateEmprunt: '2026-01-18', dateEcheance: '2026-05-18', statut: 'en_cours', tauxInteret: 5, garantie: 'Salaire', montantMensuel: 62500, moisRestants: 3 }
]

export const initialRemboursements = [
  { id: 1, detteId: 1, membreId: 1, membre: 'Jean Kamga', montant: 150000, dateRemboursement: '2026-01-15', methode: 'mobile_money', note: 'Premier versement', recu: 'REC001', valide: true },
  { id: 2, detteId: 2, membreId: 2, membre: 'Marie Fotso', montant: 300000, dateRemboursement: '2026-01-18', methode: 'virement', note: 'Remboursement complet', recu: 'REC002', valide: true },
  { id: 3, detteId: 3, membreId: 3, membre: 'Paul Nkomo', montant: 150000, dateRemboursement: '2026-01-20', methode: 'especes', note: 'Acompte', recu: 'REC003', valide: true },
  { id: 4, detteId: 5, membreId: 5, membre: 'Eric Njoya', montant: 120000, dateRemboursement: '2026-01-19', methode: 'mobile_money', note: 'Paiement partiel', recu: 'REC004', valide: true },
  { id: 5, detteId: 6, membreId: 6, membre: 'Grace Ewane', montant: 50000, dateRemboursement: '2026-01-21', methode: 'mobile_money', note: 'Premier versement', recu: 'REC005', valide: true }
]

export const initialCotisations = [
  { id: 1, membreId: 1, membre: 'Jean Kamga', montant: 50000, periode: '2026-01', dateVersement: '2026-01-05', statut: 'payé', methode: 'mobile_money', recu: 'COT001' },
  { id: 2, membreId: 2, membre: 'Marie Fotso', montant: 50000, periode: '2026-01', dateVersement: '2026-01-06', statut: 'payé', methode: 'virement', recu: 'COT002' },
  { id: 3, membreId: 3, membre: 'Paul Nkomo', montant: 50000, periode: '2026-01', dateVersement: '2026-01-07', statut: 'payé', methode: 'especes', recu: 'COT003' },
  { id: 4, membreId: 4, membre: 'Sophie Mballa', montant: 50000, periode: '2026-01', dateVersement: '2026-01-08', statut: 'payé', methode: 'mobile_money', recu: 'COT004' },
  { id: 5, membreId: 5, membre: 'Eric Njoya', montant: 75000, periode: '2026-01', dateVersement: '2026-01-10', statut: 'payé', methode: 'virement', recu: 'COT005' },
  { id: 6, membreId: 6, membre: 'Grace Ewane', montant: 50000, periode: '2026-01', dateVersement: '2026-01-12', statut: 'payé', methode: 'mobile_money', recu: 'COT006' }
]

export const initialReunions = [
  { id: 1, date: '2026-01-05', type: 'Mensuelle', participants: 6, decisions: ['Approbation de 2 nouveaux prêts', 'Élection du nouveau trésorier'], compteRendu: 'Réunion réussie avec quorum atteint' },
  { id: 2, date: '2025-12-01', type: 'Mensuelle', participants: 5, decisions: ['Modification du règlement intérieur', 'Planning des réunions 2026'], compteRendu: 'Discussions sur amélioration processus' },
  { id: 3, date: '2025-11-03', type: 'Extraordinaire', participants: 6, decisions: ['Augmentation plafond emprunts', 'Nouveau système de scoring'], compteRendu: 'Vote à l\'unanimité' }
]

export const initialNotifications = [
  { id: 1, type: 'warning', titre: 'Dette en retard', message: 'Jean Kamga - 200,000 FCFA échue', date: '2026-01-21', lu: false, priorite: 'haute' },
  { id: 2, type: 'success', titre: 'Remboursement reçu', message: 'Eric Njoya - 120,000 FCFA', date: '2026-01-21', lu: false, priorite: 'normale' },
  { id: 3, type: 'info', titre: 'Réunion mensuelle', message: 'Prochaine réunion le 05/02/2026', date: '2026-01-20', lu: true, priorite: 'normale' },
  { id: 4, type: 'success', titre: 'Dette remboursée', message: 'Marie Fotso a terminé son remboursement', date: '2026-01-18', lu: true, priorite: 'normale' },
  { id: 5, type: 'warning', titre: 'Cotisation en attente', message: '2 membres n\'ont pas payé leur cotisation', date: '2026-01-15', lu: false, priorite: 'moyenne' }
]
