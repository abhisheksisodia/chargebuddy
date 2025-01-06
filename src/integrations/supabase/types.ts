export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      charging_locations: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string
          peak_rate: number | null
          off_peak_rate: number | null
          super_off_peak_rate: number | null
          summer_rate: number | null
          winter_rate: number | null
          notes: string | null
          is_default: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          peak_rate?: number | null
          off_peak_rate?: number | null
          super_off_peak_rate?: number | null
          summer_rate?: number | null
          winter_rate?: number | null
          notes?: string | null
          is_default?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string
          peak_rate?: number | null
          off_peak_rate?: number | null
          super_off_peak_rate?: number | null
          summer_rate?: number | null
          winter_rate?: number | null
          notes?: string | null
          is_default?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      charging_sessions: ChargingSessionsTable
      profiles: ProfilesTable
      trips: TripsTable
      vehicles: VehiclesTable
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

interface ChargingSessionsTable {
  Row: {
    id: string
    user_id: string
    date: string
    location: string
    energy_added: number
    cost: number
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    date: string
    location: string
    energy_added: number
    cost: number
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    date?: string
    location?: string
    energy_added?: number
    cost?: number
    created_at?: string
    updated_at?: string
  }
}

interface ProfilesTable {
  Row: {
    id: string
    email: string | null
    full_name: string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id: string
    email?: string | null
    full_name?: string | null
    avatar_url?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    email?: string | null
    full_name?: string | null
    avatar_url?: string | null
    created_at?: string
    updated_at?: string
  }
}

interface TripsTable {
  Row: {
    id: string
    user_id: string
    start_location: string
    end_location: string
    date: string
    distance: number
    energy_used: number
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    start_location: string
    end_location: string
    date: string
    distance: number
    energy_used: number
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    start_location?: string
    end_location?: string
    date?: string
    distance?: number
    energy_used?: number
    created_at?: string
    updated_at?: string
  }
}

interface VehiclesTable {
  Row: {
    id: string
    user_id: string
    make: string
    model: string
    year: number
    battery_capacity: number
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    make: string
    model: string
    year: number
    battery_capacity: number
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    make?: string
    model?: string
    year?: number
    battery_capacity?: number
    created_at?: string
    updated_at?: string
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]