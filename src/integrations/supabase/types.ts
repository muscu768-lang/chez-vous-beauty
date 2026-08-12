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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string | null
          created_at: string
          id: string
          is_default: boolean
          label: string
          line1: string
          postal_code: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label: string
          line1: string
          postal_code?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          line1?: string
          postal_code?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string | null
          created_at: string
          esthetician_id: string
          esthetician_name: string
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          price_cents: number
          scheduled_at: string
          service_id: string
          service_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          esthetician_id: string
          esthetician_name: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          price_cents: number
          scheduled_at: string
          service_id: string
          service_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          esthetician_id?: string
          esthetician_name?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          price_cents?: number
          scheduled_at?: string
          service_id?: string
          service_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_esthetician_id_fkey"
            columns: ["esthetician_id"]
            isOneToOne: false
            referencedRelation: "estheticians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      estheticians: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          categories: string[]
          city: string
          cover_url: string | null
          created_at: string
          google_place_url: string | null
          headline: string | null
          id: string
          is_published: boolean
          lat: number | null
          lng: number | null
          name: string
          owner_id: string | null
          rating: number
          reviews_count: number
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          categories?: string[]
          city: string
          cover_url?: string | null
          created_at?: string
          google_place_url?: string | null
          headline?: string | null
          id?: string
          is_published?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          owner_id?: string | null
          rating?: number
          reviews_count?: number
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          categories?: string[]
          city?: string
          cover_url?: string | null
          created_at?: string
          google_place_url?: string | null
          headline?: string | null
          id?: string
          is_published?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          owner_id?: string | null
          rating?: number
          reviews_count?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          esthetician_id: string
          id: string
          sender: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          esthetician_id: string
          id?: string
          sender: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          esthetician_id?: string
          id?: string
          sender?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_esthetician_id_fkey"
            columns: ["esthetician_id"]
            isOneToOne: false
            referencedRelation: "estheticians"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_default: boolean
          label: string
          last4: string | null
          provider: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_default?: boolean
          label: string
          last4?: string | null
          provider: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_default?: boolean
          label?: string
          last4?: string | null
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          caption: string | null
          esthetician_id: string
          id: string
          image_url: string
          position: number
        }
        Insert: {
          caption?: string | null
          esthetician_id: string
          id?: string
          image_url: string
          position?: number
        }
        Update: {
          caption?: string | null
          esthetician_id?: string
          id?: string
          image_url?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_esthetician_id_fkey"
            columns: ["esthetician_id"]
            isOneToOne: false
            referencedRelation: "estheticians"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          comment: string | null
          created_at: string
          esthetician_id: string
          id: string
          rating: number
          source: string
          source_url: string | null
          user_id: string | null
        }
        Insert: {
          author_name: string
          comment?: string | null
          created_at?: string
          esthetician_id: string
          id?: string
          rating: number
          source?: string
          source_url?: string | null
          user_id?: string | null
        }
        Update: {
          author_name?: string
          comment?: string | null
          created_at?: string
          esthetician_id?: string
          id?: string
          rating?: number
          source?: string
          source_url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_esthetician_id_fkey"
            columns: ["esthetician_id"]
            isOneToOne: false
            referencedRelation: "estheticians"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          description: string | null
          duration_min: number
          esthetician_id: string
          id: string
          name: string
          price_cents: number
        }
        Insert: {
          category: string
          description?: string | null
          duration_min?: number
          esthetician_id: string
          id?: string
          name: string
          price_cents: number
        }
        Update: {
          category?: string
          description?: string | null
          duration_min?: number
          esthetician_id?: string
          id?: string
          name?: string
          price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_esthetician_id_fkey"
            columns: ["esthetician_id"]
            isOneToOne: false
            referencedRelation: "estheticians"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      owns_esthetician: { Args: { _esthetician_id: string }; Returns: boolean }
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
