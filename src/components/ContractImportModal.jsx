// File: src/components/ContractImportModal.jsx
// Historic Contract Import System - PRODUCTION READY

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import { addContract } from '../services/firestoreService.js';

const ContractImportModal = ({ isOpen, onClose, onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importStatus, setImportStatus] = useState('idle'); // idle, validating, importing, complete
  const [importResults, setImportResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  // Handle file drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file input
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process uploaded file
  const handleFile = async (file) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setFile(file);
    setImportStatus('validating');

    // Read and parse file
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      await parseCSV(text);
    };
    reader.readAsText(file);
  };

  // Parse CSV and group by contract number
  const parseCSV = async (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      setValidationErrors(['File is empty or has no data rows']);
      setImportStatus('idle');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = [
      'contract number',
      'total capital',
      'interest type',
      'total instalments',
      'first instalment date'
    ];

    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      setValidationErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
      setImportStatus('idle');
      return;
    }

    // Parse data rows and group by contract number
    const contractsMap = new Map();
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.join('') === '') continue; // Skip empty rows
      
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const contractNumber = row['contract number']?.toUpperCase() || '';
      if (!contractNumber) {
        errors.push(`Row ${i + 1}: Contract number is required`);
        continue;
      }

      // Get or create contract in map
      if (!contractsMap.has(contractNumber)) {
        const validation = validateContractRow(row, i + 1, true);
        if (validation.errors.length > 0) {
          errors.push(...validation.errors);
          continue;
        }
        contractsMap.set(contractNumber, validation.contract);
      }

      // Add vehicle to contract
      const contract = contractsMap.get(contractNumber);
      const vehicleValidation = validateVehicleRow(row, i + 1);
      if (vehicleValidation.errors.length > 0) {
        errors.push(...vehicleValidation.errors);
      } else {
        contract.vehicles.push(vehicleValidation.vehicle);
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setImportStatus('idle');
      return;
    }

    const contracts = Array.from(contractsMap.values());
    
    // CHECK FOR DUPLICATES AGAINST EXISTING CONTRACTS IN FIRESTORE
    try {
      const { getAllContracts } = await import('../services/firestoreService.js');
      const existingContracts = await getAllContracts();
      const existingNumbers = new Set(existingContracts.map(c => c.contractNumber.toUpperCase()));
      
      const duplicates = contracts.filter(c => existingNumbers.has(c.contractNumber));
      
      if (duplicates.length > 0) {
        setValidationErrors([
          `❌ DUPLICATE CONTRACT NUMBERS FOUND!`,
          `The following contract numbers ALREADY EXIST in your system:`,
          ...duplicates.map(c => `  • ${c.contractNumber}`),
          ``,
          `Please remove these from your CSV or use different contract numbers.`
        ]);
        setImportStatus('idle');
        return;
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      setValidationErrors(['Failed to check for duplicate contracts. Please try again.']);
      setImportStatus('idle');
      return;
    }

    setParsedData(contracts);
    setValidationErrors([]);
    setImportStatus('validated');
  };

  // Convert ISO date back to UK format for display
  const formatDateUK = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Convert UK date format to ISO (YYYY-MM-DD)
  const convertUKDateToISO = (dateStr) => {
    if (!dateStr) return '';
    
    // Already in ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // UK format with slashes (DD/MM/YYYY)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    
    // UK format with dashes (DD-MM-YYYY)
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    }
    
    return '';
  };

  // Validate contract-level data
  const validateContractRow = (row, rowNum, isNewContract) => {
    const errors = [];
    
    // Convert UK date to ISO
    const rawDate = row['first instalment date'] || '';
    const isoDate = convertUKDateToISO(rawDate);
    
    const contract = {
      contractNumber: row['contract number']?.toUpperCase() || '',
      totalCapital: parseFloat(row['total capital']) || 0,
      interestType: row['interest type']?.toLowerCase() || 'fixed',
      totalInstalments: parseInt(row['total instalments']) || 0,
      firstInstalmentDate: isoDate,
      vehicles: []
    };

    // Validate required fields
    if (!contract.contractNumber) {
      errors.push(`Row ${rowNum}: Contract number is required`);
    }
    if (contract.totalCapital <= 0) {
      errors.push(`Row ${rowNum}: Total capital must be greater than 0`);
    }
    if (!['fixed', 'variable'].includes(contract.interestType)) {
      errors.push(`Row ${rowNum}: Interest type must be 'fixed' or 'variable'`);
    }
    if (contract.totalInstalments <= 0) {
      errors.push(`Row ${rowNum}: Total instalments must be greater than 0`);
    }
    if (!rawDate) {
      errors.push(`Row ${rowNum}: First instalment date is required`);
    }

    // Validate date format
    if (rawDate && !isoDate) {
      errors.push(`Row ${rowNum}: First instalment date must be in UK format DD/MM/YYYY or DD-MM-YYYY (e.g., 15/01/2023)`);
    }

    // Interest type specific validation
    if (contract.interestType === 'fixed') {
      contract.totalInterest = parseFloat(row['total interest']) || 0;
      if (contract.totalInterest < 0) {
        errors.push(`Row ${rowNum}: Total interest cannot be negative for fixed interest`);
      }
    } else {
      contract.baseRate = parseFloat(row['base rate']) || 0;
      contract.margin = parseFloat(row['margin']) || 0;
      if (contract.baseRate < 0 || contract.margin < 0) {
        errors.push(`Row ${rowNum}: Base rate and margin must be non-negative for variable interest`);
      }
      contract.interestRateAnnual = contract.baseRate + contract.margin;
    }

    return { errors, contract };
  };

  // Validate vehicle data
  const validateVehicleRow = (row, rowNum) => {
    const errors = [];
    
    // Convert UK settled date to ISO if present
    const rawSettledDate = row['settled date'] || '';
    const isoSettledDate = rawSettledDate ? convertUKDateToISO(rawSettledDate) : null;
    
    const vehicle = {
      registration: row['vehicle registration']?.toUpperCase() || '',
      make: row['vehicle make'] || '',
      model: row['vehicle model'] || '',
      status: (row['vehicle status']?.toLowerCase() === 'settled') ? 'settled' : 'active',
      settledDate: isoSettledDate
    };

    if (!vehicle.registration) {
      errors.push(`Row ${rowNum}: Vehicle registration is required`);
    }
    if (!vehicle.make) {
      errors.push(`Row ${rowNum}: Vehicle make is required`);
    }
    if (!vehicle.model) {
      errors.push(`Row ${rowNum}: Vehicle model is required`);
    }
    
    // Validate settled date format if provided
    if (rawSettledDate && !isoSettledDate) {
      errors.push(`Row ${rowNum}: Settled date must be in UK format DD/MM/YYYY or DD-MM-YYYY (e.g., 30/11/2024)`);
    }

    return { errors, vehicle };
  };

  // Import all contracts to Firestore
  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) return;

    setImportStatus('importing');
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < parsedData.length; i++) {
      const contract = parsedData[i];
      
      try {
        // Build contract data in the format your system expects
        const contractData = buildContractData(contract);
        
        // ACTUAL FIRESTORE IMPORT
        await addContract(contractData);
        
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${contract.contractNumber}: ${error.message}`);
        console.error('Import error:', error);
      }
    }

    setImportResults(results);
    setImportStatus('complete');
  };

  // Build contract data matching your Firestore schema
  const buildContractData = (contract) => {
    // Calculate per-vehicle rate
    const perVehicleRate = contract.totalCapital / contract.totalInstalments / contract.vehicles.length;
    
    // Calculate active vehicle count
    const activeCount = contract.vehicles.filter(v => v.status === 'active').length;
    
    // Base contract data
    const contractData = {
      contractNumber: contract.contractNumber,
      totalCapital: contract.totalCapital,
      interestType: contract.interestType,
      totalInstalments: contract.totalInstalments,
      firstInstalmentDate: contract.firstInstalmentDate,
      originalVehicleCount: contract.vehicles.length,
      activeVehiclesCount: activeCount,
      perVehicleCapitalRate: perVehicleRate,
      monthlyCapitalInstalment: contract.totalCapital / contract.totalInstalments,
      currentMonthlyCapital: perVehicleRate * activeCount,
      vehicles: contract.vehicles,
      status: activeCount === 0 ? 'settled' : 'active'
    };

    // Add interest fields based on type
    if (contract.interestType === 'fixed') {
      contractData.totalInterest = contract.totalInterest;
      contractData.monthlyInterest = contract.totalInterest / contract.totalInstalments;
    } else {
      contractData.baseRate = contract.baseRate;
      contractData.margin = contract.margin;
      contractData.interestRateAnnual = contract.interestRateAnnual;
      // Variable interest calculated dynamically
      const dailyRate = (contract.interestRateAnnual / 100) / 365;
      contractData.monthlyInterest = contract.totalCapital * dailyRate * 30; // Approximate first month
    }

    return contractData;
  };

  // Download CSV template
  const downloadTemplate = () => {
    const template = `Contract Number,Total Capital,Interest Type,Total Interest,Base Rate,Margin,Total Instalments,First Instalment Date,Vehicle Registration,Vehicle Make,Vehicle Model,Vehicle Status,Settled Date
EXAMPLE001,50000,fixed,5000,,,48,15/01/2023,AB12CDE,Ford,Transit,active,
EXAMPLE002,75000,variable,,5.25,3.50,60,01/06/2022,XY34ZAB,Mercedes,Sprinter,settled,30/11/2024
EXAMPLE002,75000,variable,,5.25,3.50,60,01/06/2022,CD56EFG,Mercedes,Vito,active,
MULTI001,100000,fixed,10000,,,36,01/01/2024,AA11BBB,Ford,Transit,active,
MULTI001,100000,fixed,10000,,,36,01/01/2024,CC22DDD,Ford,Ranger,active,
MULTI001,100000,fixed,10000,,,36,01/01/2024,EE33FFF,Ford,Focus,settled,15/11/2024`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contract_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Reset import state
  const resetImport = () => {
    setFile(null);
    setParsedData(null);
    setValidationErrors([]);
    setImportStatus('idle');
    setImportResults(null);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Import Historic Contracts</h2>
            <p style={styles.subtitle}>Upload CSV file to bulk import contracts and vehicles</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Download Template Button */}
          <button onClick={downloadTemplate} style={styles.templateButton}>
            <Download size={18} />
            Download CSV Template
          </button>

          {/* Upload Area */}
          {importStatus === 'idle' && (
            <div
              style={{
                ...styles.dropzone,
                ...(dragActive ? styles.dropzoneActive : {})
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={48} color="#64748b" />
              <h3 style={styles.dropzoneTitle}>Drop CSV file here</h3>
              <p style={styles.dropzoneSubtitle}>or click to browse</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                style={styles.fileInput}
              />
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div style={styles.errorBox}>
              <div style={styles.errorHeader}>
                <AlertCircle size={20} />
                <span>
                  {validationErrors[0].includes('DUPLICATE') 
                    ? 'Duplicate Contracts Detected' 
                    : `Validation Errors (${validationErrors.length})`}
                </span>
              </div>
              <div style={styles.errorList}>
                {validationErrors.slice(0, 30).map((error, i) => (
                  <div key={i} style={styles.errorItem}>{error}</div>
                ))}
                {validationErrors.length > 30 && (
                  <div style={styles.errorItem}>... and {validationErrors.length - 30} more errors</div>
                )}
              </div>
              <button onClick={resetImport} style={styles.resetButton}>
                Upload Different File
              </button>
            </div>
          )}

          {/* Preview */}
          {importStatus === 'validated' && parsedData && (
            <div style={styles.preview}>
              <div style={styles.previewHeader}>
                <CheckCircle size={20} color="#059669" />
                <span>Ready to Import: {parsedData.length} contracts ({parsedData.reduce((sum, c) => sum + c.vehicles.length, 0)} vehicles)</span>
              </div>

              <div style={styles.previewTable}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Contract</th>
                      <th style={styles.th}>Capital</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Instalments</th>
                      <th style={styles.th}>Vehicles</th>
                      <th style={styles.th}>Start Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((contract, i) => (
                      <tr key={i} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.contractNumber}>{contract.contractNumber}</div>
                          <div style={styles.vehicleList}>
                            {contract.vehicles.map(v => v.registration).join(', ')}
                          </div>
                        </td>
                        <td style={styles.td}>£{contract.totalCapital.toLocaleString()}</td>
                        <td style={styles.td}>
                          <span style={contract.interestType === 'fixed' ? styles.badgeFixed : styles.badgeVariable}>
                            {contract.interestType}
                          </span>
                        </td>
                        <td style={styles.td}>{contract.totalInstalments}</td>
                        <td style={styles.td}>
                          {contract.vehicles.length} ({contract.vehicles.filter(v => v.status === 'active').length} active)
                        </td>
                        <td style={styles.td}>{formatDateUK(contract.firstInstalmentDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div style={styles.tableFooter}>
                    ... and {parsedData.length - 10} more contracts
                  </div>
                )}
              </div>

              <div style={styles.actions}>
                <button onClick={resetImport} style={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleImport} style={styles.importButton}>
                  Import {parsedData.length} Contracts
                </button>
              </div>
            </div>
          )}

          {/* Importing Progress */}
          {importStatus === 'importing' && (
            <div style={styles.progressBox}>
              <div style={styles.spinner}></div>
              <h3 style={styles.progressTitle}>Importing Contracts...</h3>
              <p style={styles.progressSubtitle}>This may take a moment. Do not close this window.</p>
            </div>
          )}

          {/* Import Complete */}
          {importStatus === 'complete' && importResults && (
            <div style={styles.resultsBox}>
              <CheckCircle size={48} color="#059669" />
              <h3 style={styles.resultsTitle}>Import Complete!</h3>
              <div style={styles.resultsStats}>
                <div style={styles.resultStat}>
                  <span style={styles.resultStatNumber}>{importResults.successful}</span>
                  <span style={styles.resultStatLabel}>Successful</span>
                </div>
                {importResults.failed > 0 && (
                  <div style={styles.resultStat}>
                    <span style={{...styles.resultStatNumber, color: '#DC2626'}}>{importResults.failed}</span>
                    <span style={styles.resultStatLabel}>Failed</span>
                  </div>
                )}
              </div>

              {importResults.errors.length > 0 && (
                <div style={styles.errorListFinal}>
                  <div style={styles.errorHeaderFinal}>Failed Imports:</div>
                  {importResults.errors.map((error, i) => (
                    <div key={i} style={styles.errorItem}>{error}</div>
                  ))}
                </div>
              )}

              <button onClick={() => {
                resetImport();
                if (onImportComplete) onImportComplete();
              }} style={styles.doneButton}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px',
    borderBottom: '2px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: 10
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b'
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background 0.2s',
    color: '#64748b'
  },
  content: {
    padding: '24px'
  },
  templateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
    transition: 'transform 0.2s'
  },
  dropzone: {
    border: '3px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '60px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s',
    background: '#f8fafc'
  },
  dropzoneActive: {
    borderColor: '#3b82f6',
    background: '#eff6ff'
  },
  dropzoneTitle: {
    margin: '16px 0 8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b'
  },
  dropzoneSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b'
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer'
  },
  errorBox: {
    background: '#fef2f2',
    border: '2px solid #fca5a5',
    borderRadius: '12px',
    padding: '20px'
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: '12px'
  },
  errorList: {
    maxHeight: '300px',
    overflow: 'auto',
    marginBottom: '16px',
    background: 'white',
    borderRadius: '8px',
    padding: '12px'
  },
  errorItem: {
    fontSize: '13px',
    color: '#7f1d1d',
    padding: '6px 0',
    borderBottom: '1px solid #fecaca'
  },
  resetButton: {
    padding: '10px 18px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  preview: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '20px'
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#065f46',
    marginBottom: '16px'
  },
  previewTable: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    background: '#f1f5f9',
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase'
  },
  tr: {
    borderBottom: '1px solid #e2e8f0'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#1e293b'
  },
  contractNumber: {
    fontWeight: '600',
    marginBottom: '4px'
  },
  vehicleList: {
    fontSize: '12px',
    color: '#64748b'
  },
  badgeFixed: {
    padding: '4px 10px',
    background: '#dbeafe',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  badgeVariable: {
    padding: '4px 10px',
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  tableFooter: {
    padding: '12px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b',
    background: '#f8fafc'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '12px 24px',
    background: '#e2e8f0',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  importButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  progressBox: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  progressTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b'
  },
  progressSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b'
  },
  resultsBox: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  resultsTitle: {
    margin: '16px 0 24px',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b'
  },
  resultsStats: {
    display: 'flex',
    gap: '40px',
    justifyContent: 'center',
    marginBottom: '24px'
  },
  resultStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  resultStatNumber: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#059669'
  },
  resultStatLabel: {
    fontSize: '14px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  errorListFinal: {
    background: '#fef2f2',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
    maxHeight: '200px',
    overflow: 'auto'
  },
  errorHeaderFinal: {
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: '8px'
  },
  doneButton: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px'
  }
};

// Add CSS animation for spinner
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.querySelector('style[data-import-spinner]')) {
    styleSheet.setAttribute('data-import-spinner', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default ContractImportModal;