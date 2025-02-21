
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jbukjobmomhawctjdqaf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWtqb2Jtb21oYXdjdGpkcWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNDcyNzcsImV4cCI6MjA1NTcyMzI3N30.u8rXIdoGSesTl_gGjso6riWkXrBk2KF4AlwiPyoscfI";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWtqb2Jtb21oYXdjdGpkcWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE0NzI3NywiZXhwIjoyMDU1NzIzMjc3fQ.YjQ0SN6_YJ6qwYFvN6VWoJ_vvQN_YsBrc3edcngD08s";

// Client para operações regulares (com chave anon/public)
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Client com service role para operações administrativas
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
