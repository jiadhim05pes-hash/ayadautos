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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      ai_chat_leads: {
        Row: {
          budget_kes: number | null
          created_at: string
          email: string | null
          escalated_to_human: boolean
          finance_interest: boolean
          id: string
          interested_vehicle: string | null
          language: string | null
          name: string | null
          phone: string | null
          preferred_viewing_date: string | null
          qualified: boolean
          session_id: string | null
          status: Database["public"]["Enums"]["lead_status"]
          trade_in_interest: boolean
          transcript: Json
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          budget_kes?: number | null
          created_at?: string
          email?: string | null
          escalated_to_human?: boolean
          finance_interest?: boolean
          id?: string
          interested_vehicle?: string | null
          language?: string | null
          name?: string | null
          phone?: string | null
          preferred_viewing_date?: string | null
          qualified?: boolean
          session_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          trade_in_interest?: boolean
          transcript?: Json
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          budget_kes?: number | null
          created_at?: string
          email?: string | null
          escalated_to_human?: boolean
          finance_interest?: boolean
          id?: string
          interested_vehicle?: string | null
          language?: string | null
          name?: string | null
          phone?: string | null
          preferred_viewing_date?: string | null
          qualified?: boolean
          session_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          trade_in_interest?: boolean
          transcript?: Json
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          messages: Json
          session_id: string
          updated_at: string
        }
        Insert: {
          messages?: Json
          session_id: string
          updated_at?: string
        }
        Update: {
          messages?: Json
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"]
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string | null
        }
        Relationships: []
      }
      finance_requests: {
        Row: {
          created_at: string
          deposit: number | null
          email: string | null
          id: string
          monthly_income: number | null
          name: string
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["lead_status"]
          term_months: number | null
          vehicle_id: string | null
          vehicle_name: string | null
          vehicle_price: number | null
        }
        Insert: {
          created_at?: string
          deposit?: number | null
          email?: string | null
          id?: string
          monthly_income?: number | null
          name: string
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["lead_status"]
          term_months?: number | null
          vehicle_id?: string | null
          vehicle_name?: string | null
          vehicle_price?: number | null
        }
        Update: {
          created_at?: string
          deposit?: number | null
          email?: string | null
          id?: string
          monthly_income?: number | null
          name?: string
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["lead_status"]
          term_months?: number | null
          vehicle_id?: string | null
          vehicle_name?: string | null
          vehicle_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_requests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_config: {
        Row: {
          active: boolean
          address: string | null
          brand_name: string
          created_at: string
          currency: string | null
          email: string | null
          id: string
          key: string
          logo_url: string | null
          phone: string | null
          primary_color: string | null
          seo_description: string | null
          seo_title: string | null
          tagline: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          brand_name?: string
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          key?: string
          logo_url?: string | null
          phone?: string | null
          primary_color?: string | null
          seo_description?: string | null
          seo_title?: string | null
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          brand_name?: string
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          key?: string
          logo_url?: string | null
          phone?: string | null
          primary_color?: string | null
          seo_description?: string | null
          seo_title?: string | null
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      test_drive_requests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          preferred_date: string | null
          status: Database["public"]["Enums"]["lead_status"]
          vehicle_id: string | null
          vehicle_name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          preferred_date?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          vehicle_id?: string | null
          vehicle_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          preferred_date?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          vehicle_id?: string | null
          vehicle_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_drive_requests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_in_requests: {
        Row: {
          condition: string | null
          created_at: string
          email: string | null
          estimated_value_kes: number | null
          id: string
          make: string
          mileage_km: number | null
          model: string
          name: string
          notes: string | null
          phone: string
          photos: Json
          status: Database["public"]["Enums"]["lead_status"]
          year: number | null
        }
        Insert: {
          condition?: string | null
          created_at?: string
          email?: string | null
          estimated_value_kes?: number | null
          id?: string
          make: string
          mileage_km?: number | null
          model: string
          name: string
          notes?: string | null
          phone: string
          photos?: Json
          status?: Database["public"]["Enums"]["lead_status"]
          year?: number | null
        }
        Update: {
          condition?: string | null
          created_at?: string
          email?: string | null
          estimated_value_kes?: number | null
          id?: string
          make?: string
          mileage_km?: number | null
          model?: string
          name?: string
          notes?: string | null
          phone?: string
          photos?: Json
          status?: Database["public"]["Enums"]["lead_status"]
          year?: number | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      vehicle_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          sort_order: number
          url: string
          vehicle_id: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          url: string
          vehicle_id: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          url?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          engine: string | null
          exterior_color: string | null
          featured: boolean
          features: Json
          fuel: Database["public"]["Enums"]["fuel_type"]
          id: string
          interior_color: string | null
          interior_material: string | null
          make: string
          mileage_km: number
          model: string
          name: string
          price_kes: number
          primary_image: string | null
          registration: Database["public"]["Enums"]["registration_type"]
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["vehicle_status"]
          transmission: Database["public"]["Enums"]["transmission_type"]
          updated_at: string
          year: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          engine?: string | null
          exterior_color?: string | null
          featured?: boolean
          features?: Json
          fuel: Database["public"]["Enums"]["fuel_type"]
          id?: string
          interior_color?: string | null
          interior_material?: string | null
          make: string
          mileage_km?: number
          model: string
          name: string
          price_kes: number
          primary_image?: string | null
          registration?: Database["public"]["Enums"]["registration_type"]
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["vehicle_status"]
          transmission: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
          year: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          engine?: string | null
          exterior_color?: string | null
          featured?: boolean
          features?: Json
          fuel?: Database["public"]["Enums"]["fuel_type"]
          id?: string
          interior_color?: string | null
          interior_material?: string | null
          make?: string
          mileage_km?: number
          model?: string
          name?: string
          price_kes?: number
          primary_image?: string | null
          registration?: Database["public"]["Enums"]["registration_type"]
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["vehicle_status"]
          transmission?: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff_or_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "user" | "super_admin"
      fuel_type: "Petrol" | "Diesel" | "Hybrid" | "Electric"
      lead_status:
        | "new"
        | "in_progress"
        | "contacted"
        | "won"
        | "lost"
        | "archived"
      registration_type: "Fresh Import" | "New Registration" | "Locally Used"
      transmission_type: "Automatic" | "Manual"
      vehicle_status: "available" | "reserved" | "sold" | "draft"
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
      app_role: ["admin", "staff", "user", "super_admin"],
      fuel_type: ["Petrol", "Diesel", "Hybrid", "Electric"],
      lead_status: [
        "new",
        "in_progress",
        "contacted",
        "won",
        "lost",
        "archived",
      ],
      registration_type: ["Fresh Import", "New Registration", "Locally Used"],
      transmission_type: ["Automatic", "Manual"],
      vehicle_status: ["available", "reserved", "sold", "draft"],
    },
  },
} as const
