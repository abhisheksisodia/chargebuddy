// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ddwhbspwfkianjyvtxxy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd2hic3B3ZmtpYW5qeXZ0eHh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzOTczNjIsImV4cCI6MjA1MDk3MzM2Mn0.9gddd_XiQaOBEr7LRonswAIKxGmQE3gjFOnWYZcr_R4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);