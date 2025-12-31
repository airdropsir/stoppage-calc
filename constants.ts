
import { AppSettings, MonthRecord } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  productionPerHour: 625,
  pricePerUnit: 2388900,
  contractorSharePercent: 63.34,
  wageSplitPercent: 63.34,
  defaultChainStopPercent: 100,
  defaultPartStopPercent: 100
};

// Year 1: Ordibehesht 1403 to Esfand 1403 + Farvardin 1404
const YEAR_1_MONTHS = [
  "اردیبهشت ۱۴۰۳", "خرداد ۱۴۰۳", "تیر ۱۴۰۳", "مرداد ۱۴۰۳", "شهریور ۱۴۰۳", "مهر ۱۴۰۳",
  "آبان ۱۴۰۳", "آذر ۱۴۰۳", "دی ۱۴۰۳", "بهمن ۱۴۰۳", "اسفند ۱۴۰۳", "فروردین ۱۴۰۴"
];

// Year 2: Ordibehesht 1404 to Azar 1404
const YEAR_2_MONTHS = [
  "اردیبهشت ۱۴۰۴", "خرداد ۱۴۰۴", "تیر ۱۴۰۴", "مرداد ۱۴۰۴", "شهریور ۱۴۰۴", "مهر ۱۴۰۴",
  "آبان ۱۴۰۴", "آذر ۱۴۰۴"
];

const createRecord = (id: number, name: string, yearGroup: number): MonthRecord => ({
  id,
  name,
  yearGroup,
  chainStopMinutes: 0,
  partStopMinutes: 0,
  producedTonnage: 0, // Default 0
  chainStopPercent: 100,
  partStopPercent: 100,
  industryIndex: 1.0,
  wageIndex: 1.0
});

export const INITIAL_DATA: MonthRecord[] = [
  ...YEAR_1_MONTHS.map((name, index) => createRecord(index, name, 1403)),
  ...YEAR_2_MONTHS.map((name, index) => createRecord(index + 12, name, 1404))
];
