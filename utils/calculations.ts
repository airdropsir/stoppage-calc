import { MonthRecord, AppSettings, CalculationResult } from '../types';

export const calculateRow = (record: MonthRecord, settings: AppSettings) => {
  // --- Step 1: Raw Tonnage (Tab 1 Logic) ---
  // Formula: (Minutes / 60) * ProductionPerHour
  const chainHours = record.chainStopMinutes / 60;
  const partHours = record.partStopMinutes / 60;

  const rawChainTonnage = chainHours * settings.productionPerHour;
  const rawPartTonnage = partHours * settings.productionPerHour;
  const totalRawTonnage = rawChainTonnage + rawPartTonnage;

  // --- Step 2: Contractor Share (Tab 2 Logic) ---
  // Formula: RawTonnage * ImpactPercent * ContractorSharePercent
  
  // Apply Impact Percentages (chainStopPercent / partStopPercent)
  const effectiveChainTonnage = rawChainTonnage * (record.chainStopPercent / 100);
  const effectivePartTonnage = rawPartTonnage * (record.partStopPercent / 100);
  
  const totalEffectiveTonnage = effectiveChainTonnage + effectivePartTonnage;

  // Apply Contractor Share Coefficient
  const finalContractorTonnage = totalEffectiveTonnage * (settings.contractorSharePercent / 100);

  // Calculate Split Contractor Tonnage for Chart
  const contractorChainTonnage = effectiveChainTonnage * (settings.contractorSharePercent / 100);
  const contractorPartTonnage = effectivePartTonnage * (settings.contractorSharePercent / 100);

  // Calculate Rial
  const baseRialAmount = finalContractorTonnage * settings.pricePerUnit;

  // --- Step 3: Adjustment (Tab 3 Logic) ---
  const wagePortion = baseRialAmount * (settings.wageSplitPercent / 100);
  const industryPortion = baseRialAmount - wagePortion;

  // UPDATED LOGIC:
  // The user inputs a percentage (e.g. 5).
  // We calculate 5% of the portion.
  // This calculated amount is the ADJUSTMENT AMOUNT (which is then ADDED to the base).
  const wageAdjustmentAmount = wagePortion * (record.wageIndex / 100);
  const industryAdjustmentAmount = industryPortion * (record.industryIndex / 100);

  const totalAdjustmentAmount = wageAdjustmentAmount + industryAdjustmentAmount;
  
  // Final Amount = Base + Adjustment
  const totalAdjustedAmount = baseRialAmount + totalAdjustmentAmount;

  return {
    rawChainTonnage,
    rawPartTonnage,
    totalRawTonnage,
    effectiveChainTonnage,
    effectivePartTonnage,
    totalEffectiveTonnage,
    finalContractorTonnage,
    contractorChainTonnage,
    contractorPartTonnage,
    baseRialAmount,
    wagePortion,
    industryPortion,
    // Store the ADJUSTMENT AMOUNT in these fields for the UI columns "Tadil Sanat" / "Tadil Dastmozd"
    wageAdjusted: wageAdjustmentAmount, 
    industryAdjusted: industryAdjustmentAmount,
    totalAdjustedAmount,
    adjustmentDelta: totalAdjustmentAmount, // The delta is the full adjustment amount being added
    effectiveStopHours: (chainHours * (record.chainStopPercent/100)) + (partHours * (record.partStopPercent/100))
  };
};

export const calculateGrandTotals = (data: MonthRecord[], settings: AppSettings) => {
  return data.reduce((acc, row) => {
    const res = calculateRow(row, settings);
    return {
      totalRawTonnage: acc.totalRawTonnage + res.totalRawTonnage,
      totalFinalContractorTonnage: acc.totalFinalContractorTonnage + res.finalContractorTonnage,
      totalBaseRial: acc.totalBaseRial + res.baseRialAmount,
      totalAdjustedRial: acc.totalAdjustedRial + res.totalAdjustedAmount
    };
  }, { totalRawTonnage: 0, totalFinalContractorTonnage: 0, totalBaseRial: 0, totalAdjustedRial: 0 });
};

export const formatRial = (value: number) => {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const formatNumber = (value: number, decimals = 2) => {
  return value.toLocaleString('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: decimals 
  });
};