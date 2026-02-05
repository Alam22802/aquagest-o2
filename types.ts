
export interface User {
  id: string;
  name: string;
  username: string; // Novo campo para login
  phone: string;
  email: string;
  password: string;
  isMaster?: boolean;
  canEdit: boolean;
}

export interface Line {
  id: string;
  name: string;
  userId?: string; // Quem cadastrou
}

export interface Batch {
  id: string;
  name: string;
  settlementDate: string;
  initialQuantity: number;
  initialUnitWeight: number; // em gramas
  userId?: string; // Quem cadastrou
}

export type CageStatus = 'Disponível' | 'Ocupada' | 'Manutenção' | 'Limpeza';

export interface Cage {
  id: string;
  lineId?: string;
  name: string;
  dimensions: {
    length: number;
    width: number;
    depth: number;
  };
  stockingCapacity: number;
  status: CageStatus;
  
  // Rastreabilidade
  userId?: string; // Quem cadastrou ou atualizou por último
  
  // Campos de manutenção
  maintenanceStartDate?: string;
  maintenanceEndDate?: string;

  // Campos vinculados ao ciclo de alojamento
  batchId?: string;
  initialFishCount?: number;
  settlementDate?: string;
  harvestDate?: string;
}

export interface FeedType {
  id: string;
  name: string; 
  totalStock: number;
  maxCapacity: number;
  minStockPercentage: number;
  userId?: string; // Quem cadastrou
}

export interface FeedingLog {
  id: string;
  cageId: string;
  feedTypeId: string;
  amount: number;
  timestamp: string;
  userId: string; // Quem realizou o trato
}

export interface MortalityLog {
  id: string;
  cageId: string;
  count: number;
  date: string;
  userId: string; // Quem registrou a perda
}

export interface BiometryLog {
  id: string;
  cageId: string;
  averageWeight: number;
  date: string;
  userId: string; // Quem realizou a biometria
}

export interface WaterLog {
  id: string;
  date: string;
  time: string;
  temperature: number;
  ph: number;
  oxygen: number;
  transparency: number;
  userId: string; // Quem mediu
}

export interface AppState {
  users: User[];
  lines: Line[];
  batches: Batch[];
  cages: Cage[];
  feedTypes: FeedType[];
  feedingLogs: FeedingLog[];
  mortalityLogs: MortalityLog[];
  biometryLogs: BiometryLog[];
  waterLogs: WaterLog[];
  lastSync?: string;
}
