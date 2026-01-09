export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          name: string;
          image_url: string;
          category_id: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          image_url: string;
          category_id?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          image_url?: string;
          category_id?: string | null;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Character = Database["public"]["Tables"]["characters"]["Row"];

export type CharacterWithCategory = Character & {
  category: Category | null;
};
