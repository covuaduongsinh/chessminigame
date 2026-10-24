// Sinh từ Supabase (generate_typescript_types) cho project duongsinh-chess — đừng sửa tay.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GameRow = {
  black_id: string;
  created_at: string;
  created_by: string;
  fen: string;
  group_id: string;
  id: string;
  initial_fen: string;
  ply: number;
  result: string | null;
  status: Database['public']['Enums']['game_status'];
  updated_at: string;
  white_id: string;
};

type GroupRow = {
  created_at: string;
  id: string;
  join_code: string;
  kind: Database['public']['Enums']['group_kind'];
  name: string;
  owner_id: string;
};

type ProfileRow = {
  avatar: string;
  created_at: string;
  id: string;
  nickname: string;
  role: Database['public']['Enums']['user_role'];
  updated_at: string;
};

type ProgressRow = {
  attempts: number;
  best_moves: number | null;
  best_stars: number;
  completed_at: string | null;
  item_id: string;
  updated_at: string;
  user_id: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      custom_games: {
        Row: {
          created_at: string;
          def: Json;
          group_id: string | null;
          id: string;
          owner_id: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          def: Json;
          group_id?: string | null;
          id?: string;
          owner_id: string;
          title: string;
        };
        Update: {
          created_at?: string;
          def?: Json;
          group_id?: string | null;
          id?: string;
          owner_id?: string;
          title?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          created_at: string;
          created_by: string;
          due_at: string | null;
          group_id: string;
          id: string;
          item_ids: string[];
          title: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          due_at?: string | null;
          group_id: string;
          id?: string;
          item_ids: string[];
          title: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          due_at?: string | null;
          group_id?: string;
          id?: string;
          item_ids?: string[];
          title?: string;
        };
        Relationships: [];
      };
      games: {
        Row: GameRow;
        Insert: Partial<GameRow> &
          Pick<GameRow, 'black_id' | 'created_by' | 'group_id' | 'white_id'>;
        Update: Partial<GameRow>;
        Relationships: [];
      };
      group_members: {
        Row: {
          group_id: string;
          joined_at: string;
          role: Database['public']['Enums']['member_role'];
          user_id: string;
        };
        Insert: {
          group_id: string;
          joined_at?: string;
          role?: Database['public']['Enums']['member_role'];
          user_id: string;
        };
        Update: {
          group_id?: string;
          joined_at?: string;
          role?: Database['public']['Enums']['member_role'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      groups: {
        Row: GroupRow;
        Insert: Partial<GroupRow> & Pick<GroupRow, 'join_code' | 'name' | 'owner_id'>;
        Update: Partial<GroupRow>;
        Relationships: [];
      };
      moves: {
        Row: {
          created_at: string;
          fen_after: string;
          game_id: string;
          played_by: string;
          ply: number;
          san: string;
          uci: string;
        };
        Insert: {
          created_at?: string;
          fen_after: string;
          game_id: string;
          played_by: string;
          ply: number;
          san: string;
          uci: string;
        };
        Update: {
          created_at?: string;
          fen_after?: string;
          game_id?: string;
          played_by?: string;
          ply?: number;
          san?: string;
          uci?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, 'id' | 'nickname'>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      progress: {
        Row: ProgressRow;
        Insert: Partial<ProgressRow> & Pick<ProgressRow, 'item_id' | 'user_id'>;
        Update: Partial<ProgressRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_game: {
        Args: { p_group: string; p_my_color?: string; p_opponent: string };
        Returns: GameRow;
      };
      create_group: {
        Args: { p_kind?: Database['public']['Enums']['group_kind']; p_name: string };
        Returns: GroupRow;
      };
      ensure_profile: {
        Args: { p_avatar?: string; p_nickname: string };
        Returns: ProfileRow;
      };
      group_progress: {
        Args: { p_group: string };
        Returns: {
          attempts: number;
          avatar: string;
          best_moves: number;
          best_stars: number;
          item_id: string;
          nickname: string;
          updated_at: string;
          user_id: string;
        }[];
      };
      join_group: {
        Args: { p_code: string };
        Returns: GroupRow;
      };
      play_move: {
        Args: {
          p_fen_after: string;
          p_game: string;
          p_ply: number;
          p_result?: string;
          p_san: string;
          p_uci: string;
        };
        Returns: GameRow;
      };
      delete_my_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      resign_game: {
        Args: { p_game: string };
        Returns: GameRow;
      };
      respond_game: {
        Args: { p_accept: boolean; p_game: string };
        Returns: GameRow;
      };
      set_member_role: {
        Args: {
          p_group: string;
          p_role: Database['public']['Enums']['member_role'];
          p_user: string;
        };
        Returns: undefined;
      };
      sync_progress: {
        Args: { p_items: Json };
        Returns: ProgressRow[];
      };
      update_profile: {
        Args: {
          p_avatar?: string;
          p_nickname?: string;
          p_role?: Database['public']['Enums']['user_role'];
        };
        Returns: ProfileRow;
      };
    };
    Enums: {
      game_status: 'waiting' | 'active' | 'finished' | 'aborted';
      group_kind: 'club' | 'class' | 'family';
      member_role: 'owner' | 'coach' | 'member';
      user_role: 'kid' | 'coach' | 'parent';
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
