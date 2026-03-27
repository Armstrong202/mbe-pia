// CSV Export utilities
import { formatCurrency, formatDate } from './helpers.js';

export const generateCSV = (data, headers) => {
  const headerRow = headers.join(';');
  const rows = data.map(row => 
    headers.map(field => {
      let value = row[field] ?? '';
      if (typeof value === 'number') value = formatCurrency(value);
      if (value instanceof Date) value = formatDate(value);
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(';')
  ).join('\\n');
  return headerRow + '\\n' + rows;
};

export const exportToCSV = (filename, csvContent) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportMembres = (membres) => {
  const headers = ['nom', 'telephone', 'email', 'profession', 'cotisation', 'statut', 'dateInscription', 'scoring'];
  const csv = generateCSV(membres, headers);
  exportToCSV('membres.csv', csv);
};

export const exportDettes = (dettes) => {
  const headers = ['membre', 'montant', 'montantRestant', 'dateEcheance', 'tauxInteret', 'garantie', 'statut'];
  const csv = generateCSV(dettes, headers);
  exportToCSV('dettes.csv', csv);
};

export const exportRemboursements = (remboursements) => {
  const headers = ['membre', 'montant', 'dateRemboursement', 'methode', 'recu', 'valide'];
  const csv = generateCSV(remboursements, headers);
  exportToCSV('remboursements.csv', csv);
};

export const exportCotisations = (cotisations) => {
  const headers = ['membre', 'montant', 'periode', 'dateVersement', 'statut', 'recu'];
  const csv = generateCSV(cotisations, headers);
  exportToCSV('cotisations.csv', csv);
};
