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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      business_listings: {
        Row: {
          address: string
          area: string
          category: string
          city: string
          created_at: string
          description: string
          featured: boolean
          hours: string
          id: string
          map_url: string
          name: string
          payment_method: string
          phone: string
          price_etb: number
          ref_number: string
          status: string
          tier: string
        }
        Insert: {
          address?: string
          area?: string
          category?: string
          city?: string
          created_at?: string
          description?: string
          featured?: boolean
          hours?: string
          id: string
          map_url?: string
          name: string
          payment_method?: string
          phone: string
          price_etb?: number
          ref_number?: string
          status?: string
          tier?: string
        }
        Update: {
          address?: string
          area?: string
          category?: string
          city?: string
          created_at?: string
          description?: string
          featured?: boolean
          hours?: string
          id?: string
          map_url?: string
          name?: string
          payment_method?: string
          phone?: string
          price_etb?: number
          ref_number?: string
          status?: string
          tier?: string
        }
        Relationships: []
      }
      catalog_items: {
        Row: {
          action: string
          category: string
          created_at: string
          file_path: string
          id: string
          link_url: string
          payload: Json
          updated_at: string
        }
        Insert: {
          action?: string
          category?: string
          created_at?: string
          file_path?: string
          id: string
          link_url?: string
          payload?: Json
          updated_at?: string
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          file_path?: string
          id?: string
          link_url?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          author_name: string
          author_region: string
          author_role: string
          created_at: string
          helpful_count: number
          id: string
          member_code: string
          message: string
          optional_phone: string | null
          room: string
          user_id: string | null
          verified_buyer: boolean
        }
        Insert: {
          author_name: string
          author_region?: string
          author_role?: string
          created_at?: string
          helpful_count?: number
          id: string
          member_code: string
          message: string
          optional_phone?: string | null
          room?: string
          user_id?: string | null
          verified_buyer?: boolean
        }
        Update: {
          author_name?: string
          author_region?: string
          author_role?: string
          created_at?: string
          helpful_count?: number
          id?: string
          member_code?: string
          message?: string
          optional_phone?: string | null
          room?: string
          user_id?: string | null
          verified_buyer?: boolean
        }
        Relationships: []
      }
      expediter_requests: {
        Row: {
          created_at: string
          id: string
          owner_reply: string | null
          payload: Json
          quote_etb: number | null
          status: string
          tracking_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          owner_reply?: string | null
          payload: Json
          quote_etb?: number | null
          status?: string
          tracking_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_reply?: string | null
          payload?: Json
          quote_etb?: number | null
          status?: string
          tracking_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_listings: {
        Row: {
          created_at: string
          id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          id: string
          payload: Json
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
        }
        Relationships: []
      }
      legal_consultations: {
        Row: {
          created_at: string
          id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          id: string
          payload: Json
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          downloads_count: number
          email: string | null
          full_name: string
          helpful_chats_count: number
          id: string
          joined_at: string
          last_login_bonus_at: string | null
          legacy_member_id: string | null
          member_code: string
          member_role: string
          phone: string | null
          points: number
          purchases_count: number
          referrals_count: number
          region: string
          share_phone: boolean
          updated_at: string
          verified_buyer: boolean
        }
        Insert: {
          downloads_count?: number
          email?: string | null
          full_name?: string
          helpful_chats_count?: number
          id: string
          joined_at?: string
          last_login_bonus_at?: string | null
          legacy_member_id?: string | null
          member_code: string
          member_role?: string
          phone?: string | null
          points?: number
          purchases_count?: number
          referrals_count?: number
          region?: string
          share_phone?: boolean
          updated_at?: string
          verified_buyer?: boolean
        }
        Update: {
          downloads_count?: number
          email?: string | null
          full_name?: string
          helpful_chats_count?: number
          id?: string
          joined_at?: string
          last_login_bonus_at?: string | null
          legacy_member_id?: string | null
          member_code?: string
          member_role?: string
          phone?: string | null
          points?: number
          purchases_count?: number
          referrals_count?: number
          region?: string
          share_phone?: boolean
          updated_at?: string
          verified_buyer?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      worker_profiles: {
        Row: {
          created_at: string
          id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          id: string
          payload: Json
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_login_bonus: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
