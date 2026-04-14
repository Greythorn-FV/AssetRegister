// File: src/components/ContractImportModal.jsx
// Historic Contract Import System - PRODUCTION READY
// Updated: Added Net Price, Gross Price, and Opening Balance columns

import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { addContract } from '../services/firestoreService.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';

const ContractImportModal = ({ isOpen, onClose, onImportComplete }) => {
  const isMobile = useIsMobile();
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importStatus, setImportStatus] = useState('idle');
  const [importResults, setImportResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMobile]);

  const styles = getStyles(isMobile);

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

  // Process uploaded file - supports CSV and XLSX/XLS
  const handleFile = async (uploadedFile) => {
    console.log('📁 File upload:', uploadedFile.name, 'Type:', uploadedFile.type, 'Size:', uploadedFile.size);
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const isExcel = uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls');
    const isCsv = uploadedFile.name.endsWith('.csv');

    if (!validTypes.includes(uploadedFile.type) && !isCsv && !isExcel) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setFile(uploadedFile);
    setImportStatus('validating');

    if (isExcel) {
      // Read Excel file as ArrayBuffer and convert to CSV using SheetJS
      console.log('📊 Reading as Excel file...');
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          console.log('📊 Sheets found:', workbook.SheetNames);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvText = XLSX.utils.sheet_to_csv(firstSheet);
          console.log('📊 CSV first 500 chars:', csvText.substring(0, 500));
          await parseCSV(csvText);
        } catch (err) {
          console.error('📊 Excel parse error:', err);
          setValidationErrors(['Failed to parse Excel file: ' + err.message]);
          setImportStatus('idle');
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    } else {
      // Read CSV as text
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        await parseCSV(text);
      };
      reader.readAsText(uploadedFile);
    }
  };

  // Convert UK date format to ISO (YYYY-MM-DD)
  const convertUKDateToISO = (dateStr) => {
    if (!dateStr) return '';
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    }
    
    return '';
  };

  // Convert ISO date back to UK format for display
  const formatDateUK = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Validate contract-level data
  const validateContractRow = (row, rowNum, isNewContract) => {
    const errors = [];
    
    const rawDate = row['first instalment date'] || '';
    const isoDate = convertUKDateToISO(rawDate);
    
    // 🔥 DEBUG: Log what we're reading
    console.log(`Row ${rowNum} - Contract: ${row['contract number']}, Raw Total Capital: "${row['total capital']}", Opening Balance: "${row['opening balance']}", Parsed: ${parseFloat(row['total capital'])}`);
    
    const contract = {
      contractNumber: row['contract number']?.toUpperCase() || '',
      totalCapital: parseFloat(row['total capital']) || 0,
      openingBalance: parseFloat(row['opening balance']) || null, // NEW: Opening balance for interest calculations
      interestType: row['interest type']?.toLowerCase() || 'fixed',
      totalInstalments: parseInt(row['total instalments']) || 0,
      firstInstalmentDate: isoDate,
      vehicles: []
    };

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
    if (rawDate && !isoDate) {
      errors.push(`Row ${rowNum}: First instalment date must be in UK format DD/MM/YYYY or DD-MM-YYYY (e.g., 15/01/2023)`);
    }

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

  // Validate vehicle data - NOW INCLUDES NET PRICE AND GROSS PRICE
  const validateVehicleRow = (row, rowNum) => {
    const errors = [];
    
    const rawSettledDate = row['settled date'] || '';
    const isoSettledDate = rawSettledDate ? convertUKDateToISO(rawSettledDate) : null;
    
    // Parse net and gross prices
    const netPrice = parseFloat(row['net price']) || 0;
    const grossPrice = parseFloat(row['gross price']) || 0;
    
    const vehicle = {
      registration: row['vehicle registration']?.toUpperCase() || '',
      make: row['vehicle make'] || '',
      model: row['vehicle model'] || '',
      netPrice: netPrice,
      grossPrice: grossPrice,
      status: (row['vehicle status']?.toLowerCase() === 'settled') ? 'settled' : 'active'
    };

    // Add settled date if vehicle is settled
    if (vehicle.status === 'settled' && isoSettledDate) {
      vehicle.settledDate = isoSettledDate;
    }

    // Validate required fields
    if (!vehicle.registration) {
      errors.push(`Row ${rowNum}: Vehicle registration is required`);
    }
    if (!vehicle.make) {
      errors.push(`Row ${rowNum}: Vehicle make is required`);
    }
    if (!vehicle.model) {
      errors.push(`Row ${rowNum}: Vehicle model is required`);
    }

    // Validate prices (optional but must be non-negative if provided)
    if (netPrice < 0) {
      errors.push(`Row ${rowNum}: Net price cannot be negative`);
    }
    if (grossPrice < 0) {
      errors.push(`Row ${rowNum}: Gross price cannot be negative`);
    }

    return { errors, vehicle };
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

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      setValidationErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
      setImportStatus('idle');
      return;
    }

    const contractsMap = new Map();
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.join('') === '') continue;
      
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const contractNumber = row['contract number']?.toUpperCase() || '';
      if (!contractNumber) {
        errors.push(`Row ${i + 1}: Contract number is required`);
        continue;
      }

      // 🔥 FIX: Only process contract data on FIRST occurrence
      if (!contractsMap.has(contractNumber)) {
        const validation = validateContractRow(row, i + 1, true);
        if (validation.errors.length > 0) {
          errors.push(...validation.errors);
          continue;
        }
        console.log('✅ Created contract:', contractNumber, 'with Total Capital:', validation.contract.totalCapital, 'Opening Balance:', validation.contract.openingBalance);
        contractsMap.set(contractNumber, validation.contract);
      }

      // Add vehicle to the existing contract
      const contract = contractsMap.get(contractNumber);
      const vehicleValidation = validateVehicleRow(row, i + 1);
      if (vehicleValidation.errors.length > 0) {
        errors.push(...vehicleValidation.errors);
      } else {
        contract.vehicles.push(vehicleValidation.vehicle);
        console.log('✅ Added vehicle:', vehicleValidation.vehicle.registration, 'to contract:', contractNumber);
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setImportStatus('idle');
      return;
    }

    const contracts = Array.from(contractsMap.values());
    
    // Log final contract data
    contracts.forEach(c => {
      console.log('📊 Final Contract:', c.contractNumber, 'Total Capital:', c.totalCapital, 'Opening Balance:', c.openingBalance, 'Vehicles:', c.vehicles.length);
    });
    
    // Check for duplicates
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

  // Build contract data for Firestore
  const buildContractData = (contract) => {
    const activeVehicles = contract.vehicles.filter(v => v.status === 'active');
    const perVehicleRate = contract.totalCapital / contract.totalInstalments / contract.vehicles.length;

    const contractData = {
      contractNumber: contract.contractNumber,
      totalCapital: contract.totalCapital,
      interestType: contract.interestType,
      totalInstalments: contract.totalInstalments,
      firstInstalmentDate: contract.firstInstalmentDate,
      originalVehicleCount: contract.vehicles.length,
      activeVehiclesCount: activeVehicles.length,
      vehicles: contract.vehicles,
      perVehicleCapitalRate: perVehicleRate,
      monthlyCapitalInstalment: contract.totalCapital / contract.totalInstalments,
      currentMonthlyCapital: perVehicleRate * activeVehicles.length,
      status: activeVehicles.length === 0 ? 'settled' : 'active'
    };

    // Add opening balance if provided (for historic imports with current liability)
    if (contract.openingBalance) {
      contractData.openingBalance = contract.openingBalance;
    }

    if (contract.interestType === 'fixed') {
      contractData.totalInterest = contract.totalInterest;
      contractData.monthlyInterest = contract.totalInterest / contract.totalInstalments;
    } else {
      contractData.baseRate = contract.baseRate;
      contractData.margin = contract.margin;
      contractData.interestRateAnnual = contract.interestRateAnnual;
      const dailyRate = (contract.interestRateAnnual / 100) / 365;
      contractData.monthlyInterest = contract.totalCapital * dailyRate * 30;
    }

    return contractData;
  };

  // Import contracts to Firestore
  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) return;

    setImportStatus('importing');
    const results = { success: 0, failed: 0, errors: [] };

    for (const contract of parsedData) {
      try {
        const contractData = buildContractData(contract);
        await addContract(contractData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${contract.contractNumber}: ${error.message}`);
      }
    }

    setImportResults(results);
    setImportStatus('complete');

    if (results.success > 0 && onImportComplete) {
      onImportComplete();
    }
  };

  // Download CSV template - UPDATED WITH OPENING BALANCE FOR HISTORIC IMPORTS
  const downloadTemplate = () => {
    const template = `Contract Number,Total Capital,Opening Balance,Interest Type,Total Interest,Base Rate,Margin,Total Instalments,First Instalment Date,Vehicle Registration,Vehicle Make,Vehicle Model,Vehicle Status,Settled Date,Net Price,Gross Price
EXAMPLE001,50000,,fixed,5000,,,48,15/01/2023,AB12CDE,Ford,Transit,active,,25000,30000
EXAMPLE002,75000,72500,variable,,5.25,3.50,60,01/06/2022,XY34ZAB,Mercedes,Sprinter,settled,30/11/2024,35000,42000
EXAMPLE002,75000,,variable,,5.25,3.50,60,01/06/2022,CD56EFG,Mercedes,Vito,active,,28000,33600
MULTI001,100000,95000,fixed,10000,,,36,01/01/2024,AA11BBB,Ford,Transit,active,,32000,38400
MULTI001,100000,,fixed,10000,,,36,01/01/2024,CC22DDD,Ford,Ranger,active,,28000,33600
MULTI001,100000,,fixed,10000,,,36,01/01/2024,EE33FFF,Ford,Focus,settled,15/11/2024,18000,21600`;

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
                        <td style={styles.td}>{contract.vehicles.length}</td>
                        <td style={styles.td}>{formatDateUK(contract.firstInstalmentDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {parsedData.length > 10 && (
                    <tfoot>
                      <tr>
                        <td colSpan="6" style={styles.tableFooter}>
                          ... and {parsedData.length - 10} more contracts
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
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

          {/* Importing */}
          {importStatus === 'importing' && (
            <div style={styles.importingBox}>
              <div style={styles.spinner}></div>
              <p>Importing contracts...</p>
            </div>
          )}

          {/* Complete */}
          {importStatus === 'complete' && importResults && (
            <div style={styles.completeBox}>
              <CheckCircle size={48} color="#059669" />
              <h3 style={styles.completeTitle}>Import Complete!</h3>
              <p style={styles.completeStats}>
                Successfully imported {importResults.success} contracts
                {importResults.failed > 0 && ` (${importResults.failed} failed)`}
              </p>
              {importResults.errors.length > 0 && (
                <div style={styles.importErrors}>
                  {importResults.errors.map((err, i) => (
                    <div key={i} style={styles.importError}>{err}</div>
                  ))}
                </div>
              )}
              <button onClick={onClose} style={styles.doneButton}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getStyles = (m) => ({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: m ? 'stretch' : 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    background: colors.surface,
    borderRadius: m ? 0 : radius.xl,
    width: m ? '100%' : '90%',
    maxWidth: m ? 'none' : '800px',
    maxHeight: m ? '100vh' : '90vh',
    height: m ? '100vh' : undefined,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: m ? 'none' : shadows.xl
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: m ? '16px' : '24px',
    borderBottom: `1px solid ${colors.border}`,
    background: gradients.primary
  },
  title: {
    fontSize: m ? fonts.size['2xl'] : fonts.size['2xl'],
    fontWeight: fonts.weight.bold,
    color: colors.textOnDark,
    margin: 0
  },
  subtitle: {
    fontSize: fonts.size.base,
    color: colors.textOnDarkMuted,
    margin: '4px 0 0 0'
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.12)',
    border: 'none',
    color: colors.textOnDark,
    cursor: 'pointer',
    padding: '8px',
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    padding: m ? '16px' : '24px',
    overflowY: 'auto'
  },
  templateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: gradients.primary,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    marginBottom: '20px'
  },
  dropzone: {
    border: `2px dashed ${colors.borderDark}`,
    borderRadius: radius.lg,
    padding: '48px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    background: colors.background
  },
  dropzoneActive: {
    borderColor: colors.primary,
    background: colors.surfaceHover
  },
  dropzoneTitle: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.semibold,
    color: colors.textPrimary,
    margin: '16px 0 8px 0'
  },
  dropzoneSubtitle: {
    fontSize: fonts.size.base,
    color: colors.textSecondary
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
    background: colors.errorLight,
    borderRadius: radius.lg,
    padding: '20px',
    border: `1px solid ${colors.errorBorder}`
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.errorText,
    marginBottom: '12px'
  },
  errorList: {
    maxHeight: '200px',
    overflowY: 'auto',
    marginBottom: '16px'
  },
  errorItem: {
    fontSize: fonts.size.sm,
    color: colors.error,
    padding: '6px 0',
    borderBottom: `1px solid ${colors.errorBorder}`
  },
  resetButton: {
    padding: '10px 18px',
    background: colors.error,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer'
  },
  preview: {
    background: colors.background,
    borderRadius: radius.lg,
    padding: '20px'
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.successText,
    marginBottom: '16px'
  },
  previewTable: {
    background: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    background: colors.borderLight,
    padding: '12px',
    textAlign: 'left',
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase'
  },
  tr: {
    borderBottom: `1px solid ${colors.border}`
  },
  td: {
    padding: '12px',
    fontSize: fonts.size.base,
    color: colors.textPrimary
  },
  contractNumber: {
    fontWeight: fonts.weight.semibold,
    marginBottom: '4px'
  },
  vehicleList: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary
  },
  badgeFixed: {
    padding: '4px 10px',
    background: colors.infoLight,
    color: colors.info,
    borderRadius: radius.sm,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold
  },
  badgeVariable: {
    padding: '4px 10px',
    background: colors.warningLight,
    color: colors.warningText,
    borderRadius: radius.sm,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold
  },
  tableFooter: {
    padding: '12px',
    textAlign: 'center',
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    background: colors.background
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '12px 24px',
    background: colors.background,
    color: colors.textSecondary,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer'
  },
  importButton: {
    padding: '12px 24px',
    background: gradients.success,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer'
  },
  importingBox: {
    textAlign: 'center',
    padding: '48px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: `4px solid ${colors.border}`,
    borderTop: `4px solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  },
  completeBox: {
    textAlign: 'center',
    padding: '48px'
  },
  completeTitle: {
    fontSize: fonts.size['2xl'],
    fontWeight: fonts.weight.bold,
    color: colors.successText,
    margin: '16px 0 8px'
  },
  completeStats: {
    fontSize: fonts.size.base,
    color: colors.textSecondary,
    marginBottom: '24px'
  },
  importErrors: {
    background: colors.errorLight,
    borderRadius: radius.md,
    padding: '12px',
    marginBottom: '24px',
    textAlign: 'left'
  },
  importError: {
    fontSize: fonts.size.sm,
    color: colors.error,
    padding: '4px 0'
  },
  doneButton: {
    padding: '12px 32px',
    background: gradients.success,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer'
  }
});

export default ContractImportModal;