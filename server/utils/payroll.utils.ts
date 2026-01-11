
/**
 * Indonesian Payroll Utilities
 * - PPh 21 (TER - Tarif Efektif Rata-rata)
 * - BPJS Ketenagakerjaan & Kesehatan
 */

export interface TaxConfig {
    ptkp: {
        [key: string]: number;
    };
    ter: {
        [key: string]: { limit: number; rate: number }[];
    };
}

export const INDONESIAN_TAX: TaxConfig = {
    // PTKP 2024
    ptkp: {
        'TK/0': 54000000,
        'TK/1': 58500000,
        'TK/2': 63000000,
        'TK/3': 67500000,
        'K/0': 58500000,
        'K/1': 63000000,
        'K/2': 67500000,
        'K/3': 72000000,
    },
    // Tarif Efektif Rata-Rata (Simplified for Monthly - Kategori A, B, C)
    // Source: PP 58 Tahun 2023
    ter: {
        'A': [ // TK/0, TK/1, K/0
            { limit: 5400000, rate: 0.00 },
            { limit: 5650000, rate: 0.0025 },
            { limit: 5950000, rate: 0.005 },
            { limit: 6300000, rate: 0.0075 },
            { limit: 6750000, rate: 0.01 },
            { limit: 7500000, rate: 0.015 },
            { limit: 8550000, rate: 0.02 },
            { limit: 9650000, rate: 0.0225 },
            { limit: 10050000, rate: 0.025 },
            { limit: 10350000, rate: 0.03 },
            { limit: 10700000, rate: 0.035 },
            { limit: 11050000, rate: 0.04 },
            { limit: 11600000, rate: 0.05 },
            { limit: 12500000, rate: 0.06 },
            { limit: 13750000, rate: 0.07 },
            { limit: 15100000, rate: 0.08 },
            { limit: 16950000, rate: 0.09 },
            { limit: 19750000, rate: 0.10 },
            { limit: 24150000, rate: 0.11 },
            { limit: 26450000, rate: 0.12 },
            { limit: 28000000, rate: 0.13 },
            { limit: 30050000, rate: 0.14 },
            { limit: 32400000, rate: 0.15 },
            { limit: 35400000, rate: 0.16 },
            { limit: 39100000, rate: 0.17 },
            { limit: 43850000, rate: 0.18 },
            { limit: 47800000, rate: 0.19 },
            { limit: 51400000, rate: 0.20 },
            { limit: 56300000, rate: 0.21 },
            { limit: 62200000, rate: 0.22 },
            { limit: 68600000, rate: 0.23 },
            { limit: 77500000, rate: 0.24 },
            { limit: 89000000, rate: 0.25 },
        ]
        // Note: For simplicity, I'm just implementing Category A layers initially. 
        // In a full implementation we would add Category B and C.
    }
};

/**
 * Determine TER Category based on Marital Status
 */
export function getTerCategory(status: string): 'A' | 'B' | 'C' {
    const s = status.toUpperCase().trim();
    if (['TK/0', 'TK/1', 'K/0'].includes(s)) return 'A';
    if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(s)) return 'B';
    if (['K/3'].includes(s)) return 'C';
    return 'A'; // Default
}

/**
 * Calculate PPh 21 (Bulanan) using TER
 */
export function calculatePPh21(grossIncome: number, status: string = 'TK/0'): number {
    const layers = INDONESIAN_TAX.ter['A']; // Simplified to A for now as per array above

    // Find rate
    let rate = 0;
    for (const layer of layers) {
        if (grossIncome <= layer.limit) {
            rate = layer.rate;
            break;
        }
    }
    // If above max limit defined in array, take last one (simplified)
    if (grossIncome > layers[layers.length - 1].limit) {
        rate = 0.34; // Max progressive rate roughly
    }

    return Math.floor(grossIncome * rate);
}

/**
 * Calculate BPJS
 * - JHT (Jaminan Hari Tua): 2% Employee
 * - JP (Jaminan Pensiun): 1% Employee (Max Cap ~Rp 10.xxx.xxx)
 * - JKK & JKM usually paid by employer, ignored for deduction
 */
export function calculateBPJS(gajiPokok: number): { bpjsKesehatan: number; bpjsKetenagakerjaan: number; total: number } {
    // BPJS Ketenagakerjaan (Employee Share)
    const jht = gajiPokok * 0.02;
    const jpLimit = 10042300; // 2024 Cap
    const jpBase = Math.min(gajiPokok, jpLimit);
    const jp = jpBase * 0.01;

    // BPJS Kesehatan (Employee Share)
    // 1% Employee, 4% Employer. Cap at Rp 12.000.000
    const healthLimit = 12000000;
    const healthBase = Math.min(gajiPokok, healthLimit);
    const health = healthBase * 0.01;

    return {
        bpjsKesehatan: health,
        bpjsKetenagakerjaan: jht + jp,
        total: health + jht + jp
    };
}
