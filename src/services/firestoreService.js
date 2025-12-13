import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { calculateContractMetrics } from './calculationService.js';

const CONTRACTS_COLLECTION = 'contracts';

export const getAllContracts = async () => {
  try {
    const contractsRef = collection(db, CONTRACTS_COLLECTION);
    const q = query(contractsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const contracts = [];
    snapshot.forEach((doc) => {
      contracts.push({
        id: doc.id,
        ...doc.data(),
        firstInstalmentDate: doc.data().firstInstalmentDate?.toDate?.()?.toISOString() || doc.data().firstInstalmentDate,
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      });
    });
    
    return contracts;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw new Error('Failed to fetch contracts: ' + error.message);
  }
};

export const getContractById = async (contractId) => {
  try {
    const docRef = doc(db, CONTRACTS_COLLECTION, contractId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        firstInstalmentDate: docSnap.data().firstInstalmentDate?.toDate?.()?.toISOString() || docSnap.data().firstInstalmentDate,
        createdAt: docSnap.data().createdAt?.toDate?.() || new Date()
      };
    }
    
    throw new Error('Contract not found');
  } catch (error) {
    console.error('Error fetching contract:', error);
    throw error;
  }
};

export const searchByContractNumber = async (contractNumber) => {
  try {
    const contractsRef = collection(db, CONTRACTS_COLLECTION);
    const q = query(contractsRef, where('contractNumber', '==', contractNumber.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      firstInstalmentDate: doc.data().firstInstalmentDate?.toDate?.()?.toISOString() || doc.data().firstInstalmentDate,
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    };
  } catch (error) {
    console.error('Error searching by contract number:', error);
    throw error;
  }
};

export const searchByRegistration = async (registration) => {
  try {
    const contracts = await getAllContracts();
    const regUpper = registration.toUpperCase();
    
    for (const contract of contracts) {
      const vehicle = contract.vehicles?.find(v => 
        v.registration.toUpperCase() === regUpper
      );
      
      if (vehicle) {
        const metrics = calculateContractMetrics(contract);
        
        return {
          vehicle,
          contract,
          metrics: {
            ...metrics,
            vehicleCapitalOutstanding: metrics.perVehicleRate * metrics.monthsRemaining,
            vehicleMonthlyCapital: metrics.perVehicleRate
          }
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error searching by registration:', error);
    throw error;
  }
};

export const addContract = async (contractData) => {
  try {
    const perVehicleRate = contractData.totalCapital / contractData.totalInstalments / contractData.originalVehicleCount;
    
    // Handle interest based on type
    let monthlyInterest;
    if (contractData.interestType === 'variable') {
      // For variable interest, calculate based on first month (will vary each month)
      const annualRate = contractData.interestRateAnnual || (contractData.baseRate + contractData.margin);
      const dailyRate = annualRate / 100 / 365;
      monthlyInterest = contractData.totalCapital * dailyRate * 30; // Approximate first month
      contractData.totalInterest = 0; // Will be calculated dynamically
    } else {
      // Fixed interest
      monthlyInterest = contractData.totalInterest / contractData.totalInstalments;
    }
    
    // Check if contract has ended (all instalments in the past)
    const startDate = new Date(contractData.firstInstalmentDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + contractData.totalInstalments);
    const today = new Date();
    
    const contractHasEnded = endDate < today;
    
    // If contract ended, mark all vehicles as settled
    const vehiclesWithStatus = contractData.vehicles.map(v => ({
      registration: v.registration.toUpperCase(),
      make: v.make,
      model: v.model,
      status: contractHasEnded ? 'settled' : 'active',
      settledDate: contractHasEnded ? endDate.toISOString() : null,
      settledAtMonth: contractHasEnded ? contractData.totalInstalments : null
    }));
    
    const newContract = {
      ...contractData,
      contractNumber: contractData.contractNumber.toUpperCase(),
      status: contractHasEnded ? 'settled' : 'active',
      activeVehiclesCount: contractHasEnded ? 0 : contractData.originalVehicleCount,
      monthlyCapitalInstalment: contractData.totalCapital / contractData.totalInstalments,
      currentMonthlyCapital: contractHasEnded ? 0 : perVehicleRate * contractData.originalVehicleCount,
      perVehicleCapitalRate: perVehicleRate,
      monthlyInterest,
      createdAt: Timestamp.now(),
      vehicles: vehiclesWithStatus
    };
    
    const docRef = await addDoc(collection(db, CONTRACTS_COLLECTION), newContract);
    return docRef.id;
  } catch (error) {
    console.error('Error adding contract:', error);
    throw new Error('Failed to add contract: ' + error.message);
  }
};

export const updateContract = async (contractId, updates) => {
  try {
    const docRef = doc(db, CONTRACTS_COLLECTION, contractId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating contract:', error);
    throw new Error('Failed to update contract');
  }
};

export const settleVehicle = async (contractId, registration, settlementDate = new Date()) => {
  try {
    const contract = await getContractById(contractId);
    
    const updatedVehicles = contract.vehicles.map(v => {
      if (v.registration.toUpperCase() === registration.toUpperCase() && v.status === 'active') {
        const monthsElapsed = Math.floor(
          (settlementDate - new Date(contract.firstInstalmentDate)) / (30.44 * 24 * 60 * 60 * 1000)
        );
        
        return {
          ...v,
          status: 'settled',
          settledDate: settlementDate.toISOString(),
          settledAtMonth: monthsElapsed
        };
      }
      return v;
    });
    
    const activeCount = updatedVehicles.filter(v => v.status === 'active').length;
    const currentMonthlyCapital = contract.perVehicleCapitalRate * activeCount;
    
    await updateContract(contractId, {
      vehicles: updatedVehicles,
      activeVehiclesCount: activeCount,
      currentMonthlyCapital,
      status: activeCount === 0 ? 'settled' : 'active'
    });
  } catch (error) {
    console.error('Error settling vehicle:', error);
    throw new Error('Failed to settle vehicle');
  }
};

export const deleteContract = async (contractId) => {
  try {
    await deleteDoc(doc(db, CONTRACTS_COLLECTION, contractId));
  } catch (error) {
    console.error('Error deleting contract:', error);
    throw new Error('Failed to delete contract');
  }
};

export const getContractsByStatus = async (status) => {
  try {
    const contractsRef = collection(db, CONTRACTS_COLLECTION);
    const q = query(contractsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const contracts = [];
    snapshot.forEach((doc) => {
      contracts.push({
        id: doc.id,
        ...doc.data(),
        firstInstalmentDate: doc.data().firstInstalmentDate?.toDate?.()?.toISOString() || doc.data().firstInstalmentDate,
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      });
    });
    
    return contracts;
  } catch (error) {
    console.error('Error fetching contracts by status:', error);
    throw error;
  }
};