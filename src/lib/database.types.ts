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
      delivery_cities: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      hero_videos: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          location: string
          maker_name: string
          order_index: number
          thumbnail_url: string
          title: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          location: string
          maker_name: string
          order_index?: number
          thumbnail_url: string
          title: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          location?: string
          maker_name?: string
          order_index?: number
          thumbnail_url?: string
          title?: string
          video_url?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          city: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          instant_delivery_eligible: boolean
          name: string
          price: number
          seller_id: string
          status: 'pending' | 'approved' | 'rejected'
          tags: string[]
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          city: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          instant_delivery_eligible?: boolean
          name: string
          price: number
          seller_id: string
          status?: 'pending' | 'approved' | 'rejected'
          tags?: string[]
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          city?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          instant_delivery_eligible?: boolean
          name?: string
          price?: number
          seller_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          tags?: string[]
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          is_verified: boolean
          name: string
          role: 'buyer' | 'seller' | 'admin'
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id: string
          is_verified?: boolean
          name: string
          role?: 'buyer' | 'seller' | 'admin'
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          name?: string
          role?: 'buyer' | 'seller' | 'admin'
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      themes: {
        Row: {
          colors: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          colors: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          colors?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
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
      product_status: 'pending' | 'approved' | 'rejected'
      user_role: 'buyer' | 'seller' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}