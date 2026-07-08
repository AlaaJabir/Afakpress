export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row<T> = T;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Row<{ id: string; name?: string | null; email?: string | null; role?: string | null; avatar?: string | null }>;
        Insert: { id?: string; name?: string | null; email?: string | null; role?: string | null; avatar?: string | null };
        Update: { id?: string; name?: string | null; email?: string | null; role?: string | null; avatar?: string | null };
      };
      admin_users: {
        Row: Row<{ id: string; user_id: string | null; email: string; role: "super_admin" | "admin" | "editor" | "journalist"; status: string; created_at: string | null }>;
        Insert: { id?: string; user_id?: string | null; email: string; role?: "super_admin" | "admin" | "editor" | "journalist"; status?: string; created_at?: string | null };
        Update: { id?: string; user_id?: string | null; email?: string; role?: "super_admin" | "admin" | "editor" | "journalist"; status?: string; created_at?: string | null };
      };
      categories: {
        Row: Row<{ id: string; name: string; slug: string; description: string | null; parent_id: string | null; order_index: number | null; is_active: boolean | null }>;
        Insert: { id?: string; name: string; slug: string; description?: string | null; parent_id?: string | null; order_index?: number | null; is_active?: boolean | null };
        Update: { id?: string; name?: string; slug?: string; description?: string | null; parent_id?: string | null; order_index?: number | null; is_active?: boolean | null };
      };
      regions: {
        Row: Row<{ id: string; name: string; slug: string }>;
        Insert: { id?: string; name: string; slug: string };
        Update: { id?: string; name?: string; slug?: string };
      };
      provinces: {
        Row: Row<{ id: string; region_id: string; name: string; slug: string }>;
        Insert: { id?: string; region_id: string; name: string; slug: string };
        Update: { id?: string; region_id?: string; name?: string; slug?: string };
      };
      communes: {
        Row: Row<{ id: string; province_id: string; name: string; slug: string }>;
        Insert: { id?: string; province_id: string; name: string; slug: string };
        Update: { id?: string; province_id?: string; name?: string; slug?: string };
      };
      articles: {
        Row: Row<{
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string | null;
          featured_image: string | null;
          category_id: string | null;
          author_id: string | null;
          status: string | null;
          is_featured: boolean | null;
          allow_comments: boolean | null;
          views: number | null;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          published_at: string | null;
          created_at?: string | null;
        }>;
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string | null;
          featured_image?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          status?: string | null;
          is_featured?: boolean | null;
          allow_comments?: boolean | null;
          views?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string | null;
          featured_image?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          status?: string | null;
          is_featured?: boolean | null;
          allow_comments?: boolean | null;
          views?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          published_at?: string | null;
        };
      };
      media: {
        Row: Row<{ id: string; name?: string | null; url: string; type?: string | null; folder?: string | null; alt?: string | null; caption?: string | null; copyright?: string | null; optimized?: boolean | null }>;
        Insert: { id?: string; name?: string | null; url: string; type?: string | null; folder?: string | null; alt?: string | null; caption?: string | null; copyright?: string | null; optimized?: boolean | null };
        Update: { id?: string; name?: string | null; url?: string; type?: string | null; folder?: string | null; alt?: string | null; caption?: string | null; copyright?: string | null; optimized?: boolean | null };
      };
      menus: {
        Row: Row<{ id: string; title: string; slug: string; parent_id: string | null; level: number | null; order_index: number | null; is_active: boolean | null; show_header: boolean | null; show_footer: boolean | null }>;
        Insert: { id?: string; title: string; slug: string; parent_id?: string | null; level?: number | null; order_index?: number | null; is_active?: boolean | null; show_header?: boolean | null; show_footer?: boolean | null };
        Update: { id?: string; title?: string; slug?: string; parent_id?: string | null; level?: number | null; order_index?: number | null; is_active?: boolean | null; show_header?: boolean | null; show_footer?: boolean | null };
      };
      tags: { Row: Row<{ id: string; name: string; slug: string }>; Insert: { id?: string; name: string; slug: string }; Update: { id?: string; name?: string; slug?: string } };
      article_tags: { Row: Row<{ article_id: string; tag_id: string }>; Insert: { article_id: string; tag_id: string }; Update: { article_id?: string; tag_id?: string } };
      comments: { Row: Row<{ id: string; article_id?: string | null; author?: string | null; email?: string | null; content: string; status?: string | null }>; Insert: { id?: string; article_id?: string | null; author?: string | null; email?: string | null; content: string; status?: string | null }; Update: { id?: string; article_id?: string | null; author?: string | null; email?: string | null; content?: string; status?: string | null } };
      settings: { Row: Row<{ id: string; key?: string | null; value?: Json | null }>; Insert: { id?: string; key?: string | null; value?: Json | null }; Update: { id?: string; key?: string | null; value?: Json | null } };
      pages: { Row: Row<{ id: string; title: string; slug: string; content?: string | null; seo_title?: string | null; seo_description?: string | null; status?: string | null }>; Insert: { id?: string; title: string; slug: string; content?: string | null; seo_title?: string | null; seo_description?: string | null; status?: string | null }; Update: { id?: string; title?: string; slug?: string; content?: string | null; seo_title?: string | null; seo_description?: string | null; status?: string | null } };
      breaking_news: { Row: Row<{ id: string; title: string; article_id?: string | null; url?: string | null; is_active?: boolean | null; order_index?: number | null; created_at?: string | null }>; Insert: { id?: string; title: string; article_id?: string | null; url?: string | null; is_active?: boolean | null; order_index?: number | null }; Update: { id?: string; title?: string; article_id?: string | null; url?: string | null; is_active?: boolean | null; order_index?: number | null } };
    };
  };
};
