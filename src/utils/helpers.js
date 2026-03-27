// Utility helper functions

export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

export const formatCurrency = (amount, devise = 'FCFA') => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + devise
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const options = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

export const calculateInterest = (principal, rate, months) => {
  return (principal * rate * months) / 100
}

export const calculateMonthlyPayment = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) return principal / months
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1)
  return Math.round(payment)
}

export const getStatusColor = (status) => {
  const colors = {
    'actif': 'bg-green-100 text-green-700',
    'inactif': 'bg-gray-100 text-gray-700',
    'en_cours': 'bg-yellow-100 text-yellow-700',
    'remboursé': 'bg-green-100 text-green-700',
    'en_retard': 'bg-red-100 text-red-700',
    'payé': 'bg-green-100 text-green-700',
    'en_attente': 'bg-yellow-100 text-yellow-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export const getScoringColor = (score) => {
  if (score >= 90) return 'bg-green-500'
  if (score >= 80) return 'bg-blue-500'
  if (score >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

export const getScoringGradient = (score) => {
  if (score >= 90) return 'from-green-500 to-emerald-500'
  if (score >= 80) return 'from-blue-500 to-indigo-500'
  if (score >= 70) return 'from-yellow-500 to-orange-500'
  return 'from-red-500 to-pink-500'
}

export const calculateStats = (dettes, remboursements, cotisations, membres, notifications) => {
  const totalDettes = dettes.reduce((sum, d) => sum + d.montant, 0)
  const totalRemboursements = remboursements.reduce((sum, r) => sum + r.montant, 0)
  const totalRestant = dettes.reduce((sum, d) => sum + d.montantRestant, 0)
  const totalCotisations = cotisations.filter(c => c.statut === 'payé').reduce((sum, c) => sum + c.montant, 0)
  const tauxRemboursement = totalDettes > 0 ? ((totalRemboursements / totalDettes) * 100).toFixed(1) : 0
  const membresActifs = membres.filter(m => m.statut === 'actif').length
  const dettesEnRetard = dettes.filter(d => d.statut === 'en_retard').length
  const dettesEnCours = dettes.filter(d => d.statut === 'en_cours').length
  const caisse = totalCotisations + totalRemboursements - totalDettes
  const interetsGagnes = dettes.reduce((sum, d) => sum + ((d.montant - d.montantRestant) * d.tauxInteret / 100), 0)
  const moyenneCotisation = totalCotisations / membresActifs
  const moyenneDette = totalDettes / dettes.length
  const liquidite = caisse - totalRestant
  const ratioEndettement = totalRestant / caisse * 100
  const scoringMoyen = membres.reduce((sum, m) => sum + m.scoring, 0) / membres.length

  return {
    totalDettes,
    totalRemboursements,
    totalRestant,
    totalCotisations,
    tauxRemboursement,
    membresActifs,
    dettesEnRetard,
    dettesEnCours,
    caisse,
    interetsGagnes,
    moyenneCotisation,
    moyenneDette,
    liquidite,
    ratioEndettement: ratioEndettement.toFixed(1),
    scoringMoyen: scoringMoyen.toFixed(0),
    totalMembres: membres.length,
    notificationsNonLues: notifications.filter(n => !n.lu).length
  }
}
