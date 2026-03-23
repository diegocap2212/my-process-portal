export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      reports: {
        Row: {
          acoes: string
          cone: boolean | null
          cone_text: string
          created_at: string
          date: string
          id: string
          images: Json
          o_que: string
          parado: boolean | null
          parado_text: string
          pdti: boolean | null
          pdti_text: string
          problemas: string
          sm: string
          squad: string
          wip_epic: boolean | null
          wip_epic_text: string
          wip_us: boolean | null
          wip_us_text: string
        }
        Insert: {
          acoes?: string
          cone?: boolean | null
          cone_text?: string
          created_at?: string
          date: string
          id?: string
          images?: Json
          o_que?: string
          parado?: boolean | null
          parado_text?: string
          pdti?: boolean | null
          pdti_text?: string
          problemas?: string
          sm: string
          squad: string
          wip_epic?: boolean | null
          wip_epic_text?: string
          wip_us?: boolean | null
          wip_us_text?: string
        }
        Update: {
          acoes?: string
          cone?: boolean | null
          cone_text?: string
          created_at?: string
          date?: string
          id?: string
          images?: Json
          o_que?: string
          parado?: boolean | null
          parado_text?: string
          pdti?: boolean | null
          pdti_text?: string
          problemas?: string
          sm?: string
          squad?: string
          wip_epic?: boolean | null
          wip_epic_text?: string
          wip_us?: boolean | null
          wip_us_text?: string
        }
        Relationships: []
      }
      squad_data_overrides: {
        Row: {
          created_at: string
          field: string
          id: string
          sm: string
          squad: string
          value: number
          week: string
        }
        Insert: {
          created_at?: string
          field: string
          id?: string
          sm: string
          squad: string
          value: number
          week: string
        }
        Update: {
          created_at?: string
          field?: string
          id?: string
          sm?: string
          squad?: string
          value?: number
          week?: string
        }
        Relationships: []
      }
      squad_reports: {
        Row: {
          created_at: string
          id: string
          notes: string
          q1: string
          q2: string
          q3: string
          q4: string
          sm: string
          squad: string
          week: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string
          q1?: string
          q2?: string
          q3?: string
          q4?: string
          sm: string
          squad: string
          week: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string
          q1?: string
          q2?: string
          q3?: string
          q4?: string
          sm?: string
          squad?: string
          week?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          created_at: string
          id: string
          q1: string
          q2: string
          q3: string
          q4: string
          sm: string
          week: string
        }
        Insert: {
          created_at?: string
          id?: string
          q1?: string
          q2?: string
          q3?: string
          q4?: string
          sm: string
          week: string
        }
        Update: {
          created_at?: string
          id?: string
          q1?: string
          q2?: string
          q3?: string
          q4?: string
          sm?: string
          week?: string
        }
        Relationships: []
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
