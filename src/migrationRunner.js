// ONE-TIME MIGRATION: Update contracts with correct firstInstalmentDate, totalInstalments, and totalCapital
// so progress bars show correctly based on original contract start dates.
// DELETE THIS FILE AFTER RUNNING.

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './services/firebaseConfig.js';

const MIGRATION_DATA = [
  { contractNumber: "316838", term: 36, originalStartDate: "2023-03-22", originalTotalCapital: 0 },
  { contractNumber: "316942", term: 36, originalStartDate: "2023-03-29", originalTotalCapital: 0 },
  { contractNumber: "317367", term: 36, originalStartDate: "2023-04-25", originalTotalCapital: 48263.04 },
  { contractNumber: "317726", term: 36, originalStartDate: "2023-04-27", originalTotalCapital: 19967.4 },
  { contractNumber: "317908", term: 36, originalStartDate: "2023-05-12", originalTotalCapital: 19967.4 },
  { contractNumber: "318247", term: 36, originalStartDate: "2023-05-16", originalTotalCapital: 75652.2 },
  { contractNumber: "318281", term: 36, originalStartDate: "2023-05-19", originalTotalCapital: 77225.4 },
  { contractNumber: "318307", term: 36, originalStartDate: "2023-05-22", originalTotalCapital: 57000.24 },
  { contractNumber: "319114", term: 36, originalStartDate: "2023-07-12", originalTotalCapital: 68044.68 },
  { contractNumber: "320170", term: 36, originalStartDate: "2023-07-17", originalTotalCapital: 34438.32 },
  { contractNumber: "321444", term: 36, originalStartDate: "2023-08-30", originalTotalCapital: 24457.68 },
  { contractNumber: "322257", term: 36, originalStartDate: "2023-09-27", originalTotalCapital: 230850.0 },
  { contractNumber: "322258", term: 36, originalStartDate: "2023-10-04", originalTotalCapital: 153905.76 },
  { contractNumber: "322497", term: 36, originalStartDate: "2023-10-16", originalTotalCapital: 98809.2 },
  { contractNumber: "323399", term: 36, originalStartDate: "2023-11-21", originalTotalCapital: 23037.48 },
  { contractNumber: "326021", term: 36, originalStartDate: "2024-03-11", originalTotalCapital: 161744.04 },
  { contractNumber: "326234", term: 36, originalStartDate: "2024-03-15", originalTotalCapital: 49973.76 },
  { contractNumber: "326284", term: 36, originalStartDate: "2024-01-22", originalTotalCapital: 37429.92 },
  { contractNumber: "326293", term: 36, originalStartDate: "2024-03-11", originalTotalCapital: 15912.36 },
  { contractNumber: "327087", term: 36, originalStartDate: "2024-04-08", originalTotalCapital: 109725.12 },
  { contractNumber: "327469", term: 36, originalStartDate: "2024-04-11", originalTotalCapital: 130245.12 },
  { contractNumber: "327702", term: 48, originalStartDate: "2024-06-07", originalTotalCapital: 192332.16 },
  { contractNumber: "328490", term: 48, originalStartDate: "2024-06-05", originalTotalCapital: 106851.36 },
  { contractNumber: "329502", term: 48, originalStartDate: "2024-06-18", originalTotalCapital: 40018.56 },
  { contractNumber: "329736", term: 48, originalStartDate: "2024-06-21", originalTotalCapital: 196653.12 },
  { contractNumber: "329951", term: 48, originalStartDate: "2024-07-15", originalTotalCapital: 197590.56 },
  { contractNumber: "330236", term: 48, originalStartDate: "2024-08-16", originalTotalCapital: 118560.48 },
  { contractNumber: "331805", term: 48, originalStartDate: "2024-09-06", originalTotalCapital: 37406.4 },
  { contractNumber: "332242", term: 48, originalStartDate: "2024-09-27", originalTotalCapital: 36600.0 },
  { contractNumber: "332552", term: 48, originalStartDate: "2024-10-03", originalTotalCapital: 51285.6 },
  { contractNumber: "333252", term: 48, originalStartDate: "2024-11-08", originalTotalCapital: 67620.96 },
  { contractNumber: "333705", term: 48, originalStartDate: "2024-12-04", originalTotalCapital: 84630.72 },
  { contractNumber: "333708", term: 48, originalStartDate: "2024-11-12", originalTotalCapital: 67620.96 },
  { contractNumber: "334568", term: 48, originalStartDate: "2024-12-13", originalTotalCapital: 120996.96 },
  { contractNumber: "334706", term: 48, originalStartDate: "2024-12-18", originalTotalCapital: 70281.12 },
  { contractNumber: "334905", term: 48, originalStartDate: "2024-12-31", originalTotalCapital: 87376.32 },
  { contractNumber: "334977", term: 48, originalStartDate: "2025-01-14", originalTotalCapital: 88326.24 },
  { contractNumber: "335443", term: 48, originalStartDate: "2025-02-05", originalTotalCapital: 91893.6 },
  { contractNumber: "335745", term: 48, originalStartDate: "2025-02-20", originalTotalCapital: 83410.08 },
  { contractNumber: "336332", term: 48, originalStartDate: "2025-03-17", originalTotalCapital: 104262.72 },
  { contractNumber: "337130", term: 48, originalStartDate: "2025-04-14", originalTotalCapital: 95237.28 },
  { contractNumber: "337379", term: 48, originalStartDate: "2025-04-03", originalTotalCapital: 81462.72 },
  { contractNumber: "338647", term: 48, originalStartDate: "2025-05-14", originalTotalCapital: 76189.92 },
  { contractNumber: "339008", term: 36, originalStartDate: "2025-05-08", originalTotalCapital: 39899.88 },
  { contractNumber: "339480", term: 48, originalStartDate: "2025-06-12", originalTotalCapital: 71060.16 },
  { contractNumber: "340386", term: 48, originalStartDate: "2025-07-15", originalTotalCapital: 55381.92 },
  { contractNumber: "341136", term: 48, originalStartDate: "2025-08-21", originalTotalCapital: 77405.76 },
  { contractNumber: "341472", term: 48, originalStartDate: "2025-09-11", originalTotalCapital: 52073.28 },
  { contractNumber: "343477", term: 48, originalStartDate: "2025-10-03", originalTotalCapital: 68955.84 },
  { contractNumber: "343479", term: 48, originalStartDate: "2025-10-14", originalTotalCapital: 70095.84 },
  { contractNumber: "343480", term: 48, originalStartDate: "2025-11-13", originalTotalCapital: 68385.6 },
  { contractNumber: "343680", term: 18, originalStartDate: "2025-09-26", originalTotalCapital: 14385.06 },
  { contractNumber: "343793", term: 24, originalStartDate: "2025-10-01", originalTotalCapital: 27589.44 },
  { contractNumber: "343847", term: 48, originalStartDate: "2025-10-14", originalTotalCapital: 23614.56 },
  { contractNumber: "344036", term: 24, originalStartDate: "2025-10-15", originalTotalCapital: 22578.96 },
  { contractNumber: "344141", term: 24, originalStartDate: "2025-10-22", originalTotalCapital: 8764.08 },
  { contractNumber: "344531", term: 24, originalStartDate: "2025-10-30", originalTotalCapital: 15580.08 },
  { contractNumber: "344914", term: 24, originalStartDate: "2025-11-04", originalTotalCapital: 5589.84 },
  { contractNumber: "345225", term: 48, originalStartDate: "2025-11-14", originalTotalCapital: 71107.68 },
  { contractNumber: "345360", term: 24, originalStartDate: "2025-11-18", originalTotalCapital: 7364.64 },
  { contractNumber: "345428", term: 48, originalStartDate: "2025-12-11", originalTotalCapital: 23365.44 },
  { contractNumber: "347002", term: 48, originalStartDate: "2026-01-27", originalTotalCapital: 73740.0 },
  { contractNumber: "348009", term: 48, originalStartDate: "2026-02-17", originalTotalCapital: 88740.0 },
  { contractNumber: "348231", term: 48, originalStartDate: "2026-03-02", originalTotalCapital: 14255.52 },
];

export const runMigration = async () => {
  console.log('🚀 Starting progress bar migration...');
  const results = { updated: 0, skipped: 0, notFound: 0, errors: [] };

  // Get all contracts from Firestore
  const contractsRef = collection(db, 'contracts');
  const snapshot = await getDocs(contractsRef);

  // Build a map of Firestore docs by contract number
  const firestoreMap = new Map();
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const cn = data.contractNumber?.toUpperCase();
    if (cn) firestoreMap.set(cn, { id: docSnap.id, data });
  });

  console.log(`📊 Found ${firestoreMap.size} contracts in Firestore`);

  for (const migration of MIGRATION_DATA) {
    const cn = migration.contractNumber.toUpperCase();
    const match = firestoreMap.get(cn);

    if (!match) {
      console.warn(`⚠️ ${cn}: Not found in Firestore`);
      results.notFound++;
      continue;
    }

    const existingData = match.data;
    const vehicleCount = existingData.originalVehicleCount || existingData.vehicles?.length || 1;

    // Recalculate derived values based on new totalCapital and totalInstalments
    const newMonthlyCapitalInstalment = migration.originalTotalCapital / migration.term;
    const newPerVehicleRate = newMonthlyCapitalInstalment / vehicleCount;
    const activeCount = existingData.activeVehiclesCount || vehicleCount;
    const newCurrentMonthlyCapital = newPerVehicleRate * activeCount;

    const updates = {
      firstInstalmentDate: migration.originalStartDate,
      totalInstalments: migration.term,
      totalCapital: migration.originalTotalCapital,
      monthlyCapitalInstalment: newMonthlyCapitalInstalment,
      perVehicleCapitalRate: newPerVehicleRate,
      currentMonthlyCapital: newCurrentMonthlyCapital,
    };

    try {
      const docRef = doc(db, 'contracts', match.id);
      await updateDoc(docRef, updates);
      console.log(`✅ ${cn}: Updated | start=${migration.originalStartDate} term=${migration.term} totalCap=${migration.originalTotalCapital} monthly=${newMonthlyCapitalInstalment.toFixed(2)} perVehicle=${newPerVehicleRate.toFixed(2)}`);
      results.updated++;
    } catch (err) {
      console.error(`❌ ${cn}: ${err.message}`);
      results.errors.push(`${cn}: ${err.message}`);
    }
  }

  console.log(`\n🏁 Migration complete: ${results.updated} updated, ${results.notFound} not found, ${results.skipped} skipped, ${results.errors.length} errors`);
  return results;
};

// Make it available on window so you can run it from the console
if (typeof window !== 'undefined') {
  window.runProgressMigration = runMigration;
}
