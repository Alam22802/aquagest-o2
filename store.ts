
import { AppState, User } from './types';
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'aquagestao_v1';
const SUPABASE_CONFIG_KEY = 'aquagestao_supabase_config';
const SESSION_KEY = 'aquagestao_session';

const initialMaster: User = {
  id: 'master-001',
  name: 'Administrador Mestre',
  username: 'admin', // Usuário padrão
  phone: '00000000000',
  email: 'mestre@fazenda.com',
  password: 'admin',
  isMaster: true,
  canEdit: true
};

const initialState: AppState = {
  users: [initialMaster],
  lines: [],
  batches: [],
  cages: [],
  feedTypes: [],
  feedingLogs: [],
  mortalityLogs: [],
  biometryLogs: [],
  waterLogs: [],
};

export const getSupabaseConfig = () => {
  const config = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (!config) return null;
  try {
    return JSON.parse(config);
  } catch {
    return null;
  }
};

export const getSupabase = () => {
  const config = getSupabaseConfig();
  if (!config || !config.url || !config.key) return null;
  try {
    return createClient(config.url, config.key);
  } catch (err) {
    return null;
  }
};

export const saveSession = (user: User | null) => {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
};

export const getSession = (): User | null => {
  const saved = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (!saved) return null;
  try { return JSON.parse(saved); } catch { return null; }
};

export const loadState = async (): Promise<AppState> => {
  const localData = localStorage.getItem(STORAGE_KEY);
  let state = initialState;

  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      state = { 
        ...initialState, 
        ...parsed,
        batches: parsed.batches || [],
        waterLogs: parsed.waterLogs || [],
        users: (parsed.users || [initialMaster]).map((u: any) => ({
          ...u,
          username: u.username || u.name.split(' ')[0].toLowerCase() // Fallback para versões antigas
        })),
        feedTypes: (parsed.feedTypes || initialState.feedTypes).map((ft: any) => ({
          ...ft,
          maxCapacity: ft.maxCapacity || 1000,
          minStockPercentage: ft.minStockPercentage || 20
        }))
      };
    } catch (e) {}
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('farm_data')
        .select('state')
        .eq('id', 'singleton')
        .maybeSingle();
      
      if (data?.state) {
        state = { ...initialState, ...data.state };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (err) {
      console.warn('Operando em modo local.');
    }
  }

  return state;
};

export const saveState = async (state: AppState): Promise<void> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from('farm_data')
        .upsert({ 
          id: 'singleton', 
          state, 
          last_sync: new Date().toISOString() 
        }, { onConflict: 'id' });
    } catch (err) {
      console.error('Erro ao salvar na nuvem:', err);
    }
  }
};

export const exportData = (state: AppState) => {
  const dataStr = JSON.stringify(state, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', `backup_piscicultura_${new Date().toISOString().split('T')[0]}.json`);
  linkElement.click();
};
