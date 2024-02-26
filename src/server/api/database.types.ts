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
      AddressBook: {
        Row: {
          address: string
          chain_id: number
          name: string | null
        }
        Insert: {
          address: string
          chain_id: number
          name?: string | null
        }
        Update: {
          address?: string
          chain_id?: number
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AddressBook_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "CrossChainControllers"
            referencedColumns: ["chain_id"]
          }
        ]
      }
      CrossChainControllers: {
        Row: {
          address: string
          chain_id: number
          chain_name_alias: string | null
          created_block: number
          last_scanned_block: number | null
          rpc_block_limit: number
          rpc_urls: string[] | null
        }
        Insert: {
          address?: string
          chain_id: number
          chain_name_alias?: string | null
          created_block?: number
          last_scanned_block?: number | null
          rpc_block_limit?: number
          rpc_urls?: string[] | null
        }
        Update: {
          address?: string
          chain_id?: number
          chain_name_alias?: string | null
          created_block?: number
          last_scanned_block?: number | null
          rpc_block_limit?: number
          rpc_urls?: string[] | null
        }
        Relationships: []
      }
      EnvelopeDeliveryAttempted: {
        Row: {
          block_number: number | null
          chain_id: number | null
          envelope_id: string | null
          is_delivered: boolean
          log_index: number
          timestamp: string | null
          transaction_hash: string
        }
        Insert: {
          block_number?: number | null
          chain_id?: number | null
          envelope_id?: string | null
          is_delivered?: boolean
          log_index: number
          timestamp?: string | null
          transaction_hash: string
        }
        Update: {
          block_number?: number | null
          chain_id?: number | null
          envelope_id?: string | null
          is_delivered?: boolean
          log_index?: number
          timestamp?: string | null
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "EnvelopeDeliveryAttempted_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "CrossChainControllers"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "EnvelopeDeliveryAttempted_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "Envelopes"
            referencedColumns: ["id"]
          }
        ]
      }
      EnvelopeRegistered: {
        Row: {
          block_number: number | null
          chain_id: number | null
          envelope_id: string | null
          log_index: number
          timestamp: string | null
          transaction_hash: string
        }
        Insert: {
          block_number?: number | null
          chain_id?: number | null
          envelope_id?: string | null
          log_index: number
          timestamp?: string | null
          transaction_hash: string
        }
        Update: {
          block_number?: number | null
          chain_id?: number | null
          envelope_id?: string | null
          log_index?: number
          timestamp?: string | null
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "EnvelopeRegistered_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "CrossChainControllers"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "EnvelopeRegistered_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "Envelopes"
            referencedColumns: ["id"]
          }
        ]
      }
      Envelopes: {
        Row: {
          created_at: string
          destination: string | null
          destination_chain_id: number | null
          id: string
          message: string | null
          nonce: number | null
          origin: string | null
          origin_chain_id: number | null
          registered_at: string | null
        }
        Insert: {
          created_at?: string
          destination?: string | null
          destination_chain_id?: number | null
          id: string
          message?: string | null
          nonce?: number | null
          origin?: string | null
          origin_chain_id?: number | null
          registered_at?: string | null
        }
        Update: {
          created_at?: string
          destination?: string | null
          destination_chain_id?: number | null
          id?: string
          message?: string | null
          nonce?: number | null
          origin?: string | null
          origin_chain_id?: number | null
          registered_at?: string | null
        }
        Relationships: []
      }
      Notifications: {
        Row: {
          created_at: string
          envelope_id: string
          transaction_id: string
        }
        Insert: {
          created_at?: string
          envelope_id: string
          transaction_id: string
        }
        Update: {
          created_at?: string
          envelope_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Notifications_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "Envelopes"
            referencedColumns: ["id"]
          }
        ]
      }
      Retries: {
        Row: {
          chain_id: number
          from_block: number
          to_block: number
        }
        Insert: {
          chain_id: number
          from_block: number
          to_block: number
        }
        Update: {
          chain_id?: number
          from_block?: number
          to_block?: number
        }
        Relationships: [
          {
            foreignKeyName: "Retries_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "CrossChainControllers"
            referencedColumns: ["chain_id"]
          }
        ]
      }
      TransactionForwardingAttempted: {
        Row: {
          adapter_successful: boolean | null
          block_number: number | null
          bridge_adapter: string | null
          chain_id: number | null
          destination_bridge_adapter: string | null
          destination_chain_id: number | null
          encoded_transaction: string | null
          envelope_id: string | null
          log_index: number
          return_data: string | null
          timestamp: string | null
          transaction_hash: string
          transaction_id: string | null
        }
        Insert: {
          adapter_successful?: boolean | null
          block_number?: number | null
          bridge_adapter?: string | null
          chain_id?: number | null
          destination_bridge_adapter?: string | null
          destination_chain_id?: number | null
          encoded_transaction?: string | null
          envelope_id?: string | null
          log_index: number
          return_data?: string | null
          timestamp?: string | null
          transaction_hash: string
          transaction_id?: string | null
        }
        Update: {
          adapter_successful?: boolean | null
          block_number?: number | null
          bridge_adapter?: string | null
          chain_id?: number | null
          destination_bridge_adapter?: string | null
          destination_chain_id?: number | null
          encoded_transaction?: string | null
          envelope_id?: string | null
          log_index?: number
          return_data?: string | null
          timestamp?: string | null
          transaction_hash?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "TransactionForwardingAttempted_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "CrossChainControllers"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "TransactionForwardingAttempted_destination_chain_id_fkey"
            columns: ["destination_chain_id"]
            isOneToOne: false
            referencedRelation: "CrossChainControllers"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "TransactionForwardingAttempted_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "Envelopes"
            referencedColumns: ["id"]
          }
        ]
      }
      TransactionReceived: {
        Row: {
          block_number: number
          bridge_adapter: string | null
          chain_id: number | null
          confirmations: number | null
          encoded_envelope: string | null
          envelope_id: string
          log_index: number
          nonce: number | null
          origin_chain_id: number | null
          timestamp: string | null
          transaction_hash: string
          transaction_id: string | null
        }
        Insert: {
          block_number: number
          bridge_adapter?: string | null
          chain_id?: number | null
          confirmations?: number | null
          encoded_envelope?: string | null
          envelope_id: string
          log_index: number
          nonce?: number | null
          origin_chain_id?: number | null
          timestamp?: string | null
          transaction_hash: string
          transaction_id?: string | null
        }
        Update: {
          block_number?: number
          bridge_adapter?: string | null
          chain_id?: number | null
          confirmations?: number | null
          encoded_envelope?: string | null
          envelope_id?: string
          log_index?: number
          nonce?: number | null
          origin_chain_id?: number | null
          timestamp?: string | null
          transaction_hash?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "TransactionReceived_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "CrossChainControllers"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "TransactionReceived_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "Envelopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TransactionReceived_origin_chain_id_fkey"
            columns: ["origin_chain_id"]
            isOneToOne: false
            referencedRelation: "CrossChainControllers"
            referencedColumns: ["chain_id"]
          }
        ]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
