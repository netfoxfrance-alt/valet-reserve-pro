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
          client_address: string | null
          client_email: string
          client_id: string | null
          client_name: string
          client_phone: string
          created_at: string | null
          custom_price: number | null
          custom_service_id: string | null
          duration_minutes: number | null
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
          client_address?: string | null
          client_email: string
          client_id?: string | null
          client_name: string
          client_phone: string
          created_at?: string | null
          custom_price?: number | null
          custom_service_id?: string | null
          duration_minutes?: number | null
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
          client_address?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string
          client_phone?: string
          created_at?: string | null
          custom_price?: number | null
          custom_service_id?: string | null
          duration_minutes?: number | null
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
            referencedRelation: "admin_centers_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_custom_service_id_fkey"
            columns: ["custom_service_id"]
            isOneToOne: false
            referencedRelation: "custom_services"
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
            referencedRelation: "admin_centers_view"
            referencedColumns: ["id"]
          },
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
      blocked_periods: {
        Row: {
          center_id: string
          created_at: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
        }
        Insert: {
          center_id: string
          created_at?: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
        }
        Update: {
          center_id?: string
          created_at?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_periods_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "admin_centers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_periods_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_periods_center_id_fkey"
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
          ical_token: string | null
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
          ical_token?: string | null
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
          ical_token?: string | null
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
      clients: {
        Row: {
          address: string | null
          center_id: string
          created_at: string
          default_service_id: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          center_id: string
          created_at?: string
          default_service_id?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          center_id?: string
          created_at?: string
          default_service_id?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "admin_centers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "public_centers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_default_service_id_fkey"
            columns: ["default_service_id"]
            isOneToOne: false
            referencedRelation: "custom_services"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          center_id: string
          client_address: string | null
          client_email: string | null
          client_name: string
          client_phone: string
          contacted_at: string | null
          created_at: string
          id: string
          message: string | null
          status: string
        }
        Insert: {
          center_id: string
          client_address?: string | null
          client_email?: string | null
          client_name: string
          client_phone: string
          contacted_at?: string | null
          created_at?: string
          id?: string
          message?: string | null
          status?: string
        }
        Update: {
          center_id?: string
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string
          contacted_at?: string | null
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
            referencedRelation: "admin_centers_view"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "admin_centers_view"
            referencedColumns: ["id"]
          },
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
      custom_services: {
        Row: {
          active: boolean
          center_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          center_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          center_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_services_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "admin_centers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_services_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_services_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "public_centers_view"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          sort_order: number
          subtotal: number
          total: number
          unit_price: number
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          sort_order?: number
          subtotal?: number
          total?: number
          unit_price: number
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          sort_order?: number
          subtotal?: number
          total?: number
          unit_price?: number
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          center_id: string
          client_address: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          client_phone: string | null
          converted_from_quote_id: string | null
          created_at: string
          due_date: string | null
          id: string
          include_in_stats: boolean
          issue_date: string
          notes: string | null
          number: string
          status: string
          subtotal: number
          terms: string | null
          total: number
          total_vat: number
          type: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          center_id: string
          client_address?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          converted_from_quote_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          include_in_stats?: boolean
          issue_date?: string
          notes?: string | null
          number: string
          status?: string
          subtotal?: number
          terms?: string | null
          total?: number
          total_vat?: number
          type: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          center_id?: string
          client_address?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          converted_from_quote_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          include_in_stats?: boolean
          issue_date?: string
          notes?: string | null
          number?: string
          status?: string
          subtotal?: number
          terms?: string | null
          total?: number
          total_vat?: number
          type?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "admin_centers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "public_centers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_converted_from_quote_id_fkey"
            columns: ["converted_from_quote_id"]
            isOneToOne: false
            referencedRelation: "invoices"
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
            referencedRelation: "admin_centers_view"
            referencedColumns: ["id"]
          },
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
      vat_rates: {
        Row: {
          center_id: string
          created_at: string
          id: string
          is_default: boolean | null
          label: string
          rate: number
        }
        Insert: {
          center_id: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          label: string
          rate: number
        }
        Update: {
          center_id?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "vat_rates_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "admin_centers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vat_rates_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vat_rates_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "public_centers_view"
            referencedColumns: ["id"]
          },
        ]
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
        Insert: {
          Abo?: Database["public"]["Enums"]["subscription_plan"] | null
          Business?: string | null
          Email?: string | null
          "Fin Abo"?: string | null
          id?: string | null
          Inscription?: string | null
          Lien?: string | null
          owner_id?: string | null
          RDV?: never
          "Stripe ID"?: string | null
          Tel?: string | null
        }
        Update: {
          Abo?: Database["public"]["Enums"]["subscription_plan"] | null
          Business?: string | null
          Email?: string | null
          "Fin Abo"?: string | null
          id?: string | null
          Inscription?: string | null
          Lien?: string | null
          owner_id?: string | null
          RDV?: never
          "Stripe ID"?: string | null
          Tel?: string | null
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
      normalize_phone: { Args: { phone: string }; Returns: string }
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
