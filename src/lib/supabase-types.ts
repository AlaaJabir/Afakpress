export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row<T> = T;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Row<{ id: string; name: string | null; slug: string | null; email: string | null; role: string | null; avatar: string | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; name?: string | null; slug?: string | null; email?: string | null; role?: string | null; avatar?: string | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; name?: string | null; slug?: string | null; email?: string | null; role?: string | null; avatar?: string | null; created_at?: string | null; updated_at?: string | null };
      };
      admin_users: {
        Row: Row<{ id: string; user_id: string | null; email: string | null; role: "super_admin" | "admin" | "editor" | "journalist"; status: "active" | "disabled"; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; user_id?: string | null; email?: string | null; role?: "super_admin" | "admin" | "editor" | "journalist"; status?: "active" | "disabled"; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string | null; email?: string | null; role?: "super_admin" | "admin" | "editor" | "journalist"; status?: "active" | "disabled"; created_at?: string | null; updated_at?: string | null };
      };
      categories: {
        Row: Row<{ id: string; name: string | null; slug: string | null; description: string | null; parent_id: string | null; order_index: number | null; is_active: boolean | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; name?: string | null; slug?: string | null; description?: string | null; parent_id?: string | null; order_index?: number | null; is_active?: boolean | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; name?: string | null; slug?: string | null; description?: string | null; parent_id?: string | null; order_index?: number | null; is_active?: boolean | null; created_at?: string | null; updated_at?: string | null };
      };
      regions: {
        Row: Row<{ id: string; name: string | null; slug: string | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; name?: string | null; slug?: string | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; name?: string | null; slug?: string | null; created_at?: string | null; updated_at?: string | null };
      };
      provinces: {
        Row: Row<{ id: string; region_id: string | null; name: string | null; slug: string | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; region_id?: string | null; name?: string | null; slug?: string | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; region_id?: string | null; name?: string | null; slug?: string | null; created_at?: string | null; updated_at?: string | null };
      };
      communes: {
        Row: Row<{ id: string; province_id: string | null; name: string | null; slug: string | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; province_id?: string | null; name?: string | null; slug?: string | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; province_id?: string | null; name?: string | null; slug?: string | null; created_at?: string | null; updated_at?: string | null };
      };
      media: {
        Row: Row<{ id: string; name: string | null; url: string | null; type: string | null; folder: string | null; alt: string | null; caption: string | null; copyright: string | null; optimized: boolean | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; name?: string | null; url?: string | null; type?: string | null; folder?: string | null; alt?: string | null; caption?: string | null; copyright?: string | null; optimized?: boolean | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; name?: string | null; url?: string | null; type?: string | null; folder?: string | null; alt?: string | null; caption?: string | null; copyright?: string | null; optimized?: boolean | null; created_at?: string | null; updated_at?: string | null };
      };
      articles: {
        Row: Row<{
          id: string;
          title: string | null;
          slug: string | null;
          excerpt: string | null;
          content: string | null;
          featured_image: string | null;
          category_id: string | null;
          author_id: string | null;
          region_id: string | null;
          province_id: string | null;
          commune_id: string | null;
          status: "draft" | "pending_review" | "scheduled" | "published" | null;
          is_featured: boolean | null;
          allow_comments: boolean | null;
          views: number | null;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          published_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        }>;
        Insert: {
          id?: string;
          title?: string | null;
          slug?: string | null;
          excerpt?: string | null;
          content?: string | null;
          featured_image?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          region_id?: string | null;
          province_id?: string | null;
          commune_id?: string | null;
          status?: "draft" | "pending_review" | "scheduled" | "published" | null;
          is_featured?: boolean | null;
          allow_comments?: boolean | null;
          views?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          published_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          slug?: string | null;
          excerpt?: string | null;
          content?: string | null;
          featured_image?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          region_id?: string | null;
          province_id?: string | null;
          commune_id?: string | null;
          status?: "draft" | "pending_review" | "scheduled" | "published" | null;
          is_featured?: boolean | null;
          allow_comments?: boolean | null;
          views?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          published_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      menus: {
        Row: Row<{ id: string; title: string | null; slug: string | null; parent_id: string | null; level: number | null; order_index: number | null; is_active: boolean | null; show_header: boolean | null; show_footer: boolean | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; title?: string | null; slug?: string | null; parent_id?: string | null; level?: number | null; order_index?: number | null; is_active?: boolean | null; show_header?: boolean | null; show_footer?: boolean | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; title?: string | null; slug?: string | null; parent_id?: string | null; level?: number | null; order_index?: number | null; is_active?: boolean | null; show_header?: boolean | null; show_footer?: boolean | null; created_at?: string | null; updated_at?: string | null };
      };
      pages: {
        Row: Row<{ id: string; title: string | null; slug: string | null; content: string | null; seo_title: string | null; seo_description: string | null; status: "draft" | "published" | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; title?: string | null; slug?: string | null; content?: string | null; seo_title?: string | null; seo_description?: string | null; status?: "draft" | "published" | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; title?: string | null; slug?: string | null; content?: string | null; seo_title?: string | null; seo_description?: string | null; status?: "draft" | "published" | null; created_at?: string | null; updated_at?: string | null };
      };
      tags: {
        Row: Row<{ id: string; name: string | null; slug: string | null; created_at: string | null }>;
        Insert: { id?: string; name?: string | null; slug?: string | null; created_at?: string | null };
        Update: { id?: string; name?: string | null; slug?: string | null; created_at?: string | null };
      };
      article_tags: {
        Row: Row<{ article_id: string; tag_id: string }>;
        Insert: { article_id: string; tag_id: string };
        Update: { article_id?: string; tag_id?: string };
      };
      comments: {
        Row: Row<{ id: string; article_id: string | null; author: string | null; email: string | null; content: string | null; status: "pending" | "approved" | "rejected" | "spam" | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; article_id?: string | null; author?: string | null; email?: string | null; content?: string | null; status?: "pending" | "approved" | "rejected" | "spam" | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; article_id?: string | null; author?: string | null; email?: string | null; content?: string | null; status?: "pending" | "approved" | "rejected" | "spam" | null; created_at?: string | null; updated_at?: string | null };
      };
      breaking_news: {
        Row: Row<{ id: string; title: string | null; article_id: string | null; url: string | null; is_active: boolean | null; order_index: number | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; title?: string | null; article_id?: string | null; url?: string | null; is_active?: boolean | null; order_index?: number | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; title?: string | null; article_id?: string | null; url?: string | null; is_active?: boolean | null; order_index?: number | null; created_at?: string | null; updated_at?: string | null };
      };
      settings: {
        Row: Row<{ id: string; key: string | null; value: Json | null; created_at: string | null; updated_at: string | null }>;
        Insert: { id?: string; key?: string | null; value?: Json | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; key?: string | null; value?: Json | null; created_at?: string | null; updated_at?: string | null };
      };
    };
  };
};
