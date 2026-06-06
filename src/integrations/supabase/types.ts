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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          amount: number
          bank_id: number | null
          category: string
          created_at: string | null
          creditcards_id: number | null
          data_conta: string | null
          description: string
          due_date: string
          id: number
          parcela: string | null
          payment_source: string | null
          payment_source_id: number | null
          payment_source_name: string | null
          recorrente_id: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bank_id?: number | null
          category: string
          created_at?: string | null
          creditcards_id?: number | null
          data_conta?: string | null
          description: string
          due_date: string
          id?: number
          parcela?: string | null
          payment_source?: string | null
          payment_source_id?: number | null
          payment_source_name?: string | null
          recorrente_id?: string | null
          status: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bank_id?: number | null
          category?: string
          created_at?: string | null
          creditcards_id?: number | null
          data_conta?: string | null
          description?: string
          due_date?: string
          id?: number
          parcela?: string | null
          payment_source?: string | null
          payment_source_id?: number | null
          payment_source_name?: string | null
          recorrente_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_bank"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
        ]
      }
      banks: {
        Row: {
          account_number: string
          account_type: string | null
          agency: string
          balance: number | null
          color: string | null
          created_at: string | null
          id: number
          name: string
          nickname: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number: string
          account_type?: string | null
          agency: string
          balance?: number | null
          color?: string | null
          created_at?: string | null
          id?: number
          name: string
          nickname?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          account_type?: string | null
          agency?: string
          balance?: number | null
          color?: string | null
          created_at?: string | null
          id?: number
          name?: string
          nickname?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      card_accounts: {
        Row: {
          amount: number
          card_id: number
          category_id: number
          created_at: string | null
          data_conta: string | null
          description: string
          due_date: string
          id: number
          payment_source: string | null
          payment_source_id: number | null
          payment_source_name: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          card_id: number
          category_id: number
          created_at?: string | null
          data_conta?: string | null
          description: string
          due_date: string
          id?: number
          payment_source?: string | null
          payment_source_id?: number | null
          payment_source_name?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: number
          category_id?: number
          created_at?: string | null
          data_conta?: string | null
          description?: string
          due_date?: string
          id?: number
          payment_source?: string | null
          payment_source_id?: number | null
          payment_source_name?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_accounts_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "creditcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_accounts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string | null
          id: number
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: number
          name: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: number
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      creditcards: {
        Row: {
          bank_name: string | null
          card_brand: string | null
          card_name: string
          card_number: string
          color: string | null
          created_at: string | null
          credit_limit: number | null
          current_value: number | null
          due_date: string | null
          expiry_date: string
          holder_name: string
          id: number
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bank_name?: string | null
          card_brand?: string | null
          card_name: string
          card_number: string
          color?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_value?: number | null
          due_date?: string | null
          expiry_date: string
          holder_name: string
          id?: number
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bank_name?: string | null
          card_brand?: string | null
          card_name?: string
          card_number?: string
          color?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_value?: number | null
          due_date?: string | null
          expiry_date?: string
          holder_name?: string
          id?: number
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          bank_id: number
          created_at: string | null
          deposit_date: string
          description: string | null
          id: number
          origin_bank: string | null
          receipt_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bank_id: number
          created_at?: string | null
          deposit_date: string
          description?: string | null
          id?: number
          origin_bank?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bank_id?: number
          created_at?: string | null
          deposit_date?: string
          description?: string | null
          id?: number
          origin_bank?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
        ]
      }
      investimentos_vencidos: {
        Row: {
          created_at: string | null
          current_value: number
          id: number
          institution_id: number
          invested_amount: number
          investor_name: string | null
          maturity_date: string | null
          moved_at: string | null
          name: string
          purchase_date: string
          type_id: number
          updated_at: string | null
          user_id: string
          yield_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number
          id?: number
          institution_id: number
          invested_amount?: number
          investor_name?: string | null
          maturity_date?: string | null
          moved_at?: string | null
          name: string
          purchase_date: string
          type_id: number
          updated_at?: string | null
          user_id: string
          yield_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          current_value?: number
          id?: number
          institution_id?: number
          invested_amount?: number
          investor_name?: string | null
          maturity_date?: string | null
          moved_at?: string | null
          name?: string
          purchase_date?: string
          type_id?: number
          updated_at?: string | null
          user_id?: string
          yield_percentage?: number | null
        }
        Relationships: []
      }
      investment_institutions: {
        Row: {
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investment_types: {
        Row: {
          category: string
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          created_at: string | null
          current_value: number
          id: number
          institution_id: number
          invested_amount: number
          investor_name: string | null
          maturity_date: string | null
          name: string
          purchase_date: string
          type_id: number
          updated_at: string | null
          user_id: string
          yield_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number
          id?: number
          institution_id: number
          invested_amount?: number
          investor_name?: string | null
          maturity_date?: string | null
          name: string
          purchase_date: string
          type_id: number
          updated_at?: string | null
          user_id: string
          yield_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          current_value?: number
          id?: number
          institution_id?: number
          invested_amount?: number
          investor_name?: string | null
          maturity_date?: string | null
          name?: string
          purchase_date?: string
          type_id?: number
          updated_at?: string | null
          user_id?: string
          yield_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "investment_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "investment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_upgrade_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_access_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_usage_control: {
        Row: {
          created_at: string
          id: string
          is_premium: boolean
          is_trial_active: boolean
          trial_days_limit: number
          trial_end_date: string
          trial_start_date: string
          updated_at: string
          upgrade_request_date: string | null
          upgrade_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_premium?: boolean
          is_trial_active?: boolean
          trial_days_limit?: number
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          upgrade_request_date?: string | null
          upgrade_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_premium?: boolean
          is_trial_active?: boolean
          trial_days_limit?: number
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          upgrade_request_date?: string | null
          upgrade_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_trial_status: {
        Args: { user_uuid: string }
        Returns: {
          days_remaining: number
          is_premium: boolean
          is_trial_active: boolean
          trial_end_date: string
        }[]
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      get_all_users_with_trial_info: {
        Args: never
        Returns: {
          created_at: string
          days_remaining: number
          email: string
          is_premium: boolean
          is_trial_active: boolean
          trial_end_date: string
          trial_start_date: string
          user_id: string
        }[]
      }
      get_pending_upgrade_requests: {
        Args: never
        Returns: {
          id: string
          notes: string
          requested_at: string
          status: string
          user_email: string
          user_id: string
        }[]
      }
      get_users_for_admin_review: {
        Args: never
        Returns: {
          created_at: string
          days_remaining: number
          email: string
          is_premium: boolean
          is_trial_active: boolean
          needs_attention: boolean
          trial_end_date: string
          trial_start_date: string
          upgrade_request_date: string
          upgrade_status: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_expired_investments: {
        Args: { target_user_id: string }
        Returns: number
      }
      process_upgrade_request: {
        Args: { admin_notes?: string; new_status: string; request_id: string }
        Returns: boolean
      }
      process_user_upgrade: {
        Args: {
          make_premium?: boolean
          new_status: string
          target_user_id: string
        }
        Returns: boolean
      }
      request_premium_upgrade: { Args: never; Returns: boolean }
      update_user_status: {
        Args: {
          extend_trial_days?: number
          is_premium: boolean
          is_trial_active: boolean
          target_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
