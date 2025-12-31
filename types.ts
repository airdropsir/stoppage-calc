
export interface MonthRecord {
  id: number;
  name: string;
  yearGroup: number; // New field to identify the fiscal year (1403 or 1404)
  // Inputs - Stoppages (Minutes)
  chainStopMinutes: number;
  partStopMinutes: number;
  
  // New Input - Produced Tonnage
  producedTonnage: number;
  
  // Inputs - Percentages (0-100)
  chainStopPercent: number;
  partStopPercent: number;

  // Inputs - Adjustments (Coefficients)
  industryIndex: number; // e.g., 1.05
  wageIndex: number;    // e.g., 1.10
}

export interface AppSettings {
  productionPerHour: number;
  pricePerUnit: number; // Rials
  contractorSharePercent: number; // 63.34%
  wageSplitPercent: number; // 63.34% for adjustment split
  
  // New Defaults
  defaultChainStopPercent: number;
  defaultPartStopPercent: number;
}

export interface CalculationResult {
  totalStopHours: number;
  effectiveStopHours: number;
  tonnageLost: number;
  contractorTonnage: number;
  baseRialAmount: number; // Before adjustment
  
  // Adjustment Breakdown
  wagePortion: number;
  industryPortion: number;
  wageAdjusted: number;
  industryAdjusted: number;
  totalAdjustedAmount: number;
  adjustmentDelta: number; // The extra amount due to adjustment
}
