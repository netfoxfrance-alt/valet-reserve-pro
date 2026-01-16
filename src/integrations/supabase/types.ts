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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          center_id: string
          client_email: string
          client_name: string
          client_phone: string
          created_at: string | null
          id: string
          notes: string | null
          pack_id: string | null
          status: string | null
          updated_at: string | null
          vehicle_type: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          center_id: string
          client_email: string
          client_name: string
          client_phone: string
          created_at?: string | null
          id?: string
          notes?: string | null
          pack_id?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_type: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          center_id?: string
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          pack_id?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "public_centers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          center_id: string
          created_at: string | null
          day_of_week: number
          enabled: boolean | null
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          center_id: string
          created_at?: string | null
          day_of_week: number
          enabled?: boolean | null
          end_time: string
          id?: string
          start_time: string
        }
        Update: {
          center_id?: string
          created_at?: string | null
          day_of_week?: number
          enabled?: boolean | null
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "public_centers_view"
            referencedColumns: ["id"]
          },
        ]
      }
      centers: {
        Row: {
          address: string | null
          ai_enabled: boolean | null
          created_at: string | null
          customization: Json | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          address?: string | null
          ai_enabled?: boolean | null
          created_at?: string | null
          customization?: Json | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          address?: string | null
          ai_enabled?: boolean | null
          created_at?: string | null
          customization?: Json | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          center_id: string
          client_name: string
          client_phone: string
          created_at: string
          id: string
          message: string | null
          status: string
        }
        Insert: {
          center_id: string
          client_name: string
          client_phone: string
          created_at?: string
          id?: string
          message?: string | null
          status?: string
        }
        Update: {
          center_id?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          id?: string
          message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "public_centers_view"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_requests: {
        Row: {
          center_id: string | null
          center_name: string
          contact_email: string
          created_at: string | null
          id: string
          message: string
          request_type: string
          status: string | null
        }
        Insert: {
          center_id?: string | null
          center_name: string
          contact_email: string
          created_at?: string | null
          id?: string
          message: string
          request_type: string
          status?: string | null
        }
        Update: {
          center_id?: string | null
          center_name?: string
          contact_email?: string
          created_at?: string | null
          id?: string
          message?: string
          request_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_requests_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_requests_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "public_centers_view"
            referencedColumns: ["id"]
          },
        ]
      }
      packs: {
        Row: {
          active: boolean | null
          center_id: string
          created_at: string | null
          description: string | null
          duration: string | null
          features: string[] | null
          id: string
          image_url: string | null
          name: string
          price: number
          price_variants: Json | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          center_id: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          price_variants?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          center_id?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          price_variants?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packs_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packs_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "public_centers_view"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      admin_centers_view: {
        Row: {
          Abo: Database["public"]["Enums"]["subscription_plan"] | null
          Business: string | null
          Email: string | null
          "Fin Abo": string | null
          id: string | null
          Inscription: string | null
          Lien: string | null
          owner_id: string | null
          RDV: number | null
          "Stripe ID": string | null
          Tel: string | null
        }
        Relationships: []
      }
      public_centers_view: {
        Row: {
          address: string | null
          ai_enabled: boolean | null
          created_at: string | null
          customization: Json | null
          id: string | null
          logo_url: string | null
          name: string | null
          phone: string | null
          slug: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          address?: string | null
          ai_enabled?: boolean | null
          created_at?: string | null
          customization?: Json | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          slug?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          address?: string | null
          ai_enabled?: boolean | null
          created_at?: string | null
          customization?: Json | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          slug?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_admin_centers_data: {
        Args: never
        Returns: {
          Abo: Database["public"]["Enums"]["subscription_plan"]
          Business: string
          Email: string
          "Fin Abo": string
          id: string
          Inscription: string
          Lien: string
          owner_id: string
          RDV: number
          "Stripe ID": string
          Tel: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "owner"
      subscription_plan: "free" | "pro" | "trial" | "expired" | "past_due"
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
      app_role: ["admin", "owner"],
      subscription_plan: ["free", "pro", "trial", "expired", "past_due"],
    },
  },
} as const
