


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."current_eleve_id"() RETURNS "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT id FROM eleves WHERE supabase_user_id = auth.uid();
$$;


ALTER FUNCTION "public"."current_eleve_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_etablissement_id"() RETURNS "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT id FROM etablissements WHERE supabase_user_id = auth.uid();
$$;


ALTER FUNCTION "public"."current_etablissement_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_professeur_id"() RETURNS "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT id FROM professeurs WHERE supabase_user_id = auth.uid();
$$;


ALTER FUNCTION "public"."current_professeur_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."visible_classmate_ids"() RETURNS TABLE("eleve_id" "uuid")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT DISTINCT es2.eleve_id
  FROM eleve_sessions es2
  WHERE es2.session_id IN (
    SELECT es.session_id FROM eleve_sessions es
    WHERE es.eleve_id = public.current_eleve_id()
  );
$$;


ALTER FUNCTION "public"."visible_classmate_ids"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."autodidacte_cours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "autodidacte_id" "uuid" NOT NULL,
    "titre" "text" NOT NULL,
    "description" "text",
    "contenu_texte" "text",
    "langue" "text" DEFAULT 'francais'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "autodidacte_cours_langue_check" CHECK (("langue" = ANY (ARRAY['francais'::"text", 'anglais'::"text", 'espagnol'::"text", 'allemand'::"text"])))
);


ALTER TABLE "public"."autodidacte_cours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."autodidacte_cours_fichiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cours_id" "uuid" NOT NULL,
    "fichier_url" "text" NOT NULL,
    "nom_fichier" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."autodidacte_cours_fichiers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."autodidacte_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cours_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "question" "text" NOT NULL,
    "propositions" "jsonb",
    "bonne_reponse" "text",
    "bonnes_reponses" "jsonb",
    "explication" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "autodidacte_questions_type_check" CHECK (("type" = ANY (ARRAY['qcm'::"text", 'multi'::"text", 'ouverte'::"text"])))
);


ALTER TABLE "public"."autodidacte_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."autodidacte_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "autodidacte_id" "uuid" NOT NULL,
    "cours_id" "uuid" NOT NULL,
    "questions_tentees" integer DEFAULT 0 NOT NULL,
    "reponses_correctes" integer DEFAULT 0 NOT NULL,
    "derniere_tentative" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."autodidacte_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."autodidactes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supabase_user_id" "uuid" NOT NULL,
    "nom" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."autodidactes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "titre" "text" NOT NULL,
    "description" "text",
    "contenu_texte" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "questions_validees" boolean DEFAULT false,
    "position_ordre" integer DEFAULT 0
);


ALTER TABLE "public"."cours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cours_fichiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cours_id" "uuid" NOT NULL,
    "fichier_url" "text" NOT NULL,
    "nom_fichier" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cours_fichiers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eleve_cours_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eleve_id" "uuid" NOT NULL,
    "cours_id" "uuid" NOT NULL,
    "questions_tentees" integer DEFAULT 0 NOT NULL,
    "reponses_correctes" integer DEFAULT 0 NOT NULL,
    "derniere_tentative" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."eleve_cours_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eleve_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eleve_id" "uuid" NOT NULL,
    "session_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."eleve_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eleves" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supabase_user_id" "uuid" NOT NULL,
    "nom" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "photo_url" "text"
);


ALTER TABLE "public"."eleves" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."etablissements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supabase_user_id" "uuid" NOT NULL,
    "nom" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."etablissements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitation_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "etablissement_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "invited_email" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used_at" timestamp with time zone,
    "used_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "chatbots_alloues" integer DEFAULT 0
);


ALTER TABLE "public"."invitation_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "source" "text" DEFAULT 'blog'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professeurs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supabase_user_id" "uuid" NOT NULL,
    "nom" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "etablissement_id" "uuid",
    "chatbots_disponibles" integer DEFAULT 0
);


ALTER TABLE "public"."professeurs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cours_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "question" "text" NOT NULL,
    "propositions" "jsonb",
    "bonne_reponse" "text",
    "explication" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "bonnes_reponses" "text"[],
    "position_ordre" integer DEFAULT 0,
    CONSTRAINT "questions_type_check" CHECK (("type" = ANY (ARRAY['qcm'::"text", 'ouverte'::"text"])))
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions_cours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cours_id" "uuid" NOT NULL,
    "eleve_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "reponse" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "repondu_at" timestamp with time zone
);


ALTER TABLE "public"."questions_cours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professeur_id" "uuid" NOT NULL,
    "nom" "text" NOT NULL,
    "code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "langue" "text" DEFAULT 'fr'::"text"
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suggestion_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "suggestion_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."suggestion_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suggestions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_email" "text",
    "user_name" "text",
    "category" "text" NOT NULL,
    "titre" "text" NOT NULL,
    "contenu" "text" NOT NULL,
    "likes_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "suggestions_category_check" CHECK (("category" = ANY (ARRAY['professeur'::"text", 'eleve'::"text", 'etablissement'::"text", 'autonome'::"text"])))
);


ALTER TABLE "public"."suggestions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."autodidacte_cours_fichiers"
    ADD CONSTRAINT "autodidacte_cours_fichiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autodidacte_cours"
    ADD CONSTRAINT "autodidacte_cours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autodidacte_questions"
    ADD CONSTRAINT "autodidacte_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autodidacte_stats"
    ADD CONSTRAINT "autodidacte_stats_autodidacte_id_cours_id_key" UNIQUE ("autodidacte_id", "cours_id");



ALTER TABLE ONLY "public"."autodidacte_stats"
    ADD CONSTRAINT "autodidacte_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autodidactes"
    ADD CONSTRAINT "autodidactes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autodidactes"
    ADD CONSTRAINT "autodidactes_supabase_user_id_key" UNIQUE ("supabase_user_id");



ALTER TABLE ONLY "public"."cours_fichiers"
    ADD CONSTRAINT "cours_fichiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cours"
    ADD CONSTRAINT "cours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."eleve_cours_stats"
    ADD CONSTRAINT "eleve_cours_stats_eleve_id_cours_id_key" UNIQUE ("eleve_id", "cours_id");



ALTER TABLE ONLY "public"."eleve_cours_stats"
    ADD CONSTRAINT "eleve_cours_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."eleve_sessions"
    ADD CONSTRAINT "eleve_sessions_eleve_id_session_id_key" UNIQUE ("eleve_id", "session_id");



ALTER TABLE ONLY "public"."eleve_sessions"
    ADD CONSTRAINT "eleve_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."eleves"
    ADD CONSTRAINT "eleves_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."eleves"
    ADD CONSTRAINT "eleves_supabase_user_id_key" UNIQUE ("supabase_user_id");



ALTER TABLE ONLY "public"."etablissements"
    ADD CONSTRAINT "etablissements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."etablissements"
    ADD CONSTRAINT "etablissements_supabase_user_id_key" UNIQUE ("supabase_user_id");



ALTER TABLE ONLY "public"."invitation_tokens"
    ADD CONSTRAINT "invitation_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitation_tokens"
    ADD CONSTRAINT "invitation_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professeurs"
    ADD CONSTRAINT "professeurs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professeurs"
    ADD CONSTRAINT "professeurs_supabase_user_id_key" UNIQUE ("supabase_user_id");



ALTER TABLE ONLY "public"."questions_cours"
    ADD CONSTRAINT "questions_cours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suggestion_likes"
    ADD CONSTRAINT "suggestion_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suggestion_likes"
    ADD CONSTRAINT "suggestion_likes_suggestion_id_user_id_key" UNIQUE ("suggestion_id", "user_id");



ALTER TABLE ONLY "public"."suggestions"
    ADD CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_autodidacte_cours_autodidacte_id" ON "public"."autodidacte_cours" USING "btree" ("autodidacte_id");



CREATE INDEX "idx_autodidacte_cours_fichiers_cours_id" ON "public"."autodidacte_cours_fichiers" USING "btree" ("cours_id");



CREATE INDEX "idx_autodidacte_questions_cours_id" ON "public"."autodidacte_questions" USING "btree" ("cours_id");



CREATE INDEX "idx_autodidacte_stats_autodidacte_id" ON "public"."autodidacte_stats" USING "btree" ("autodidacte_id");



CREATE INDEX "idx_autodidacte_stats_cours_id" ON "public"."autodidacte_stats" USING "btree" ("cours_id");



CREATE INDEX "idx_autodidactes_supabase_user_id" ON "public"."autodidactes" USING "btree" ("supabase_user_id");



CREATE INDEX "idx_cours_fichiers_cours_id" ON "public"."cours_fichiers" USING "btree" ("cours_id");



CREATE INDEX "idx_cours_position_ordre" ON "public"."cours" USING "btree" ("session_id", "position_ordre");



CREATE INDEX "idx_cours_session_id" ON "public"."cours" USING "btree" ("session_id");



CREATE INDEX "idx_eleve_cours_stats_cours_id" ON "public"."eleve_cours_stats" USING "btree" ("cours_id");



CREATE INDEX "idx_eleve_cours_stats_eleve_id" ON "public"."eleve_cours_stats" USING "btree" ("eleve_id");



CREATE INDEX "idx_eleve_sessions_eleve_id" ON "public"."eleve_sessions" USING "btree" ("eleve_id");



CREATE INDEX "idx_eleve_sessions_session_id" ON "public"."eleve_sessions" USING "btree" ("session_id");



CREATE INDEX "idx_eleves_supabase_user_id" ON "public"."eleves" USING "btree" ("supabase_user_id");



CREATE INDEX "idx_etablissements_supabase_user_id" ON "public"."etablissements" USING "btree" ("supabase_user_id");



CREATE INDEX "idx_invitation_tokens_etablissement_id" ON "public"."invitation_tokens" USING "btree" ("etablissement_id");



CREATE INDEX "idx_invitation_tokens_token" ON "public"."invitation_tokens" USING "btree" ("token");



CREATE INDEX "idx_newsletter_email" ON "public"."newsletter_subscribers" USING "btree" ("email");



CREATE INDEX "idx_professeurs_etablissement_id" ON "public"."professeurs" USING "btree" ("etablissement_id");



CREATE INDEX "idx_professeurs_supabase_user_id" ON "public"."professeurs" USING "btree" ("supabase_user_id");



CREATE INDEX "idx_questions_cours_cours_id" ON "public"."questions_cours" USING "btree" ("cours_id");



CREATE INDEX "idx_questions_cours_eleve_id" ON "public"."questions_cours" USING "btree" ("eleve_id");



CREATE INDEX "idx_questions_cours_id" ON "public"."questions" USING "btree" ("cours_id");



CREATE INDEX "idx_questions_position_ordre" ON "public"."questions" USING "btree" ("cours_id", "position_ordre");



CREATE INDEX "idx_sessions_code" ON "public"."sessions" USING "btree" ("code");



CREATE INDEX "idx_sessions_professeur_id" ON "public"."sessions" USING "btree" ("professeur_id");



CREATE INDEX "idx_suggestion_likes_suggestion_id" ON "public"."suggestion_likes" USING "btree" ("suggestion_id");



CREATE INDEX "idx_suggestions_category" ON "public"."suggestions" USING "btree" ("category");



CREATE INDEX "idx_suggestions_created_at" ON "public"."suggestions" USING "btree" ("created_at" DESC);



ALTER TABLE ONLY "public"."autodidacte_cours"
    ADD CONSTRAINT "autodidacte_cours_autodidacte_id_fkey" FOREIGN KEY ("autodidacte_id") REFERENCES "public"."autodidactes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."autodidacte_cours_fichiers"
    ADD CONSTRAINT "autodidacte_cours_fichiers_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "public"."autodidacte_cours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."autodidacte_questions"
    ADD CONSTRAINT "autodidacte_questions_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "public"."autodidacte_cours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."autodidacte_stats"
    ADD CONSTRAINT "autodidacte_stats_autodidacte_id_fkey" FOREIGN KEY ("autodidacte_id") REFERENCES "public"."autodidactes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."autodidacte_stats"
    ADD CONSTRAINT "autodidacte_stats_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "public"."autodidacte_cours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cours_fichiers"
    ADD CONSTRAINT "cours_fichiers_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "public"."cours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cours"
    ADD CONSTRAINT "cours_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eleve_cours_stats"
    ADD CONSTRAINT "eleve_cours_stats_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "public"."cours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eleve_cours_stats"
    ADD CONSTRAINT "eleve_cours_stats_eleve_id_fkey" FOREIGN KEY ("eleve_id") REFERENCES "public"."eleves"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eleve_sessions"
    ADD CONSTRAINT "eleve_sessions_eleve_id_fkey" FOREIGN KEY ("eleve_id") REFERENCES "public"."eleves"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eleve_sessions"
    ADD CONSTRAINT "eleve_sessions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitation_tokens"
    ADD CONSTRAINT "invitation_tokens_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "public"."etablissements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitation_tokens"
    ADD CONSTRAINT "invitation_tokens_used_by_fkey" FOREIGN KEY ("used_by") REFERENCES "public"."professeurs"("id");



ALTER TABLE ONLY "public"."professeurs"
    ADD CONSTRAINT "professeurs_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "public"."etablissements"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."questions_cours"
    ADD CONSTRAINT "questions_cours_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "public"."cours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions_cours"
    ADD CONSTRAINT "questions_cours_eleve_id_fkey" FOREIGN KEY ("eleve_id") REFERENCES "public"."eleves"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "public"."cours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_professeur_id_fkey" FOREIGN KEY ("professeur_id") REFERENCES "public"."professeurs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."suggestion_likes"
    ADD CONSTRAINT "suggestion_likes_suggestion_id_fkey" FOREIGN KEY ("suggestion_id") REFERENCES "public"."suggestions"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can read suggestion_likes" ON "public"."suggestion_likes" FOR SELECT USING (true);



CREATE POLICY "Anyone can read suggestions" ON "public"."suggestions" FOR SELECT USING (true);



CREATE POLICY "Authenticated can lookup valid tokens" ON "public"."invitation_tokens" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND ("used_at" IS NULL) AND ("expires_at" > "now"())));



CREATE POLICY "Authenticated users can create suggestions" ON "public"."suggestions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can find sessions by code" ON "public"."sessions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Autodidacts can delete files in own courses" ON "public"."autodidacte_cours_fichiers" FOR DELETE USING (("cours_id" IN ( SELECT "c"."id"
   FROM ("public"."autodidacte_cours" "c"
     JOIN "public"."autodidactes" "a" ON (("c"."autodidacte_id" = "a"."id")))
  WHERE ("a"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can delete own courses" ON "public"."autodidacte_cours" FOR DELETE USING (("autodidacte_id" IN ( SELECT "autodidactes"."id"
   FROM "public"."autodidactes"
  WHERE ("autodidactes"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can delete questions in own courses" ON "public"."autodidacte_questions" FOR DELETE USING (("cours_id" IN ( SELECT "c"."id"
   FROM ("public"."autodidacte_cours" "c"
     JOIN "public"."autodidactes" "a" ON (("c"."autodidacte_id" = "a"."id")))
  WHERE ("a"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can insert files in own courses" ON "public"."autodidacte_cours_fichiers" FOR INSERT WITH CHECK (("cours_id" IN ( SELECT "c"."id"
   FROM ("public"."autodidacte_cours" "c"
     JOIN "public"."autodidactes" "a" ON (("c"."autodidacte_id" = "a"."id")))
  WHERE ("a"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can insert own courses" ON "public"."autodidacte_cours" FOR INSERT WITH CHECK (("autodidacte_id" IN ( SELECT "autodidactes"."id"
   FROM "public"."autodidactes"
  WHERE ("autodidactes"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can insert own stats" ON "public"."autodidacte_stats" FOR INSERT WITH CHECK (("autodidacte_id" IN ( SELECT "autodidactes"."id"
   FROM "public"."autodidactes"
  WHERE ("autodidactes"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can insert questions in own courses" ON "public"."autodidacte_questions" FOR INSERT WITH CHECK (("cours_id" IN ( SELECT "c"."id"
   FROM ("public"."autodidacte_cours" "c"
     JOIN "public"."autodidactes" "a" ON (("c"."autodidacte_id" = "a"."id")))
  WHERE ("a"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can update own courses" ON "public"."autodidacte_cours" FOR UPDATE USING (("autodidacte_id" IN ( SELECT "autodidactes"."id"
   FROM "public"."autodidactes"
  WHERE ("autodidactes"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can update own stats" ON "public"."autodidacte_stats" FOR UPDATE USING (("autodidacte_id" IN ( SELECT "autodidactes"."id"
   FROM "public"."autodidactes"
  WHERE ("autodidactes"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can view files in own courses" ON "public"."autodidacte_cours_fichiers" FOR SELECT USING (("cours_id" IN ( SELECT "c"."id"
   FROM ("public"."autodidacte_cours" "c"
     JOIN "public"."autodidactes" "a" ON (("c"."autodidacte_id" = "a"."id")))
  WHERE ("a"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can view own courses" ON "public"."autodidacte_cours" FOR SELECT USING (("autodidacte_id" IN ( SELECT "autodidactes"."id"
   FROM "public"."autodidactes"
  WHERE ("autodidactes"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can view own stats" ON "public"."autodidacte_stats" FOR SELECT USING (("autodidacte_id" IN ( SELECT "autodidactes"."id"
   FROM "public"."autodidactes"
  WHERE ("autodidactes"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Autodidacts can view questions in own courses" ON "public"."autodidacte_questions" FOR SELECT USING (("cours_id" IN ( SELECT "c"."id"
   FROM ("public"."autodidacte_cours" "c"
     JOIN "public"."autodidactes" "a" ON (("c"."autodidacte_id" = "a"."id")))
  WHERE ("a"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Etablissements can delete own tokens" ON "public"."invitation_tokens" FOR DELETE USING (("etablissement_id" = "public"."current_etablissement_id"()));



CREATE POLICY "Etablissements can insert tokens" ON "public"."invitation_tokens" FOR INSERT WITH CHECK (("etablissement_id" = "public"."current_etablissement_id"()));



CREATE POLICY "Etablissements can update own tokens" ON "public"."invitation_tokens" FOR UPDATE USING (("etablissement_id" = "public"."current_etablissement_id"()));



CREATE POLICY "Etablissements can view own professors" ON "public"."professeurs" FOR SELECT USING (("etablissement_id" = "public"."current_etablissement_id"()));



CREATE POLICY "Etablissements can view own tokens" ON "public"."invitation_tokens" FOR SELECT USING (("etablissement_id" = "public"."current_etablissement_id"()));



CREATE POLICY "Etablissements can view professor courses" ON "public"."cours" FOR SELECT USING (("session_id" IN ( SELECT "s"."id"
   FROM ("public"."sessions" "s"
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."etablissement_id" = "public"."current_etablissement_id"()))));



CREATE POLICY "Etablissements can view professor sessions" ON "public"."sessions" FOR SELECT USING (("professeur_id" IN ( SELECT "professeurs"."id"
   FROM "public"."professeurs"
  WHERE ("professeurs"."etablissement_id" = "public"."current_etablissement_id"()))));



CREATE POLICY "Etablissements can view session memberships" ON "public"."eleve_sessions" FOR SELECT USING (("session_id" IN ( SELECT "s"."id"
   FROM ("public"."sessions" "s"
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."etablissement_id" = "public"."current_etablissement_id"()))));



CREATE POLICY "Etablissements can view students" ON "public"."eleves" FOR SELECT USING (("id" IN ( SELECT "es"."eleve_id"
   FROM (("public"."eleve_sessions" "es"
     JOIN "public"."sessions" "s" ON (("es"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."etablissement_id" = "public"."current_etablissement_id"()))));



CREATE POLICY "Professors can delete courses in own sessions" ON "public"."cours" FOR DELETE USING (("session_id" IN ( SELECT "s"."id"
   FROM ("public"."sessions" "s"
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can delete files in own courses" ON "public"."cours_fichiers" FOR DELETE USING (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can delete own sessions" ON "public"."sessions" FOR DELETE USING (("professeur_id" IN ( SELECT "professeurs"."id"
   FROM "public"."professeurs"
  WHERE ("professeurs"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can delete questions for their courses" ON "public"."questions_cours" FOR DELETE USING (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can delete questions in own courses" ON "public"."questions" FOR DELETE USING (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can insert courses in own sessions" ON "public"."cours" FOR INSERT WITH CHECK (("session_id" IN ( SELECT "s"."id"
   FROM ("public"."sessions" "s"
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can insert files in own courses" ON "public"."cours_fichiers" FOR INSERT WITH CHECK (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can insert own sessions" ON "public"."sessions" FOR INSERT WITH CHECK (("professeur_id" IN ( SELECT "professeurs"."id"
   FROM "public"."professeurs"
  WHERE ("professeurs"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can insert questions in own courses" ON "public"."questions" FOR INSERT WITH CHECK (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can update courses in own sessions" ON "public"."cours" FOR UPDATE USING (("session_id" IN ( SELECT "s"."id"
   FROM ("public"."sessions" "s"
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can update own sessions" ON "public"."sessions" FOR UPDATE USING (("professeur_id" IN ( SELECT "professeurs"."id"
   FROM "public"."professeurs"
  WHERE ("professeurs"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can update questions for their courses" ON "public"."questions_cours" FOR UPDATE USING (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can update questions in own courses" ON "public"."questions" FOR UPDATE USING (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can view course stats" ON "public"."eleve_cours_stats" FOR SELECT USING (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can view courses in own sessions" ON "public"."cours" FOR SELECT USING (("session_id" IN ( SELECT "s"."id"
   FROM ("public"."sessions" "s"
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can view files in own courses" ON "public"."cours_fichiers" FOR SELECT USING (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can view own sessions" ON "public"."sessions" FOR SELECT USING (("professeur_id" IN ( SELECT "professeurs"."id"
   FROM "public"."professeurs"
  WHERE ("professeurs"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can view questions for their courses" ON "public"."questions_cours" FOR SELECT USING (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can view questions in own courses" ON "public"."questions" FOR SELECT USING (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."sessions" "s" ON (("c"."session_id" = "s"."id")))
     JOIN "public"."professeurs" "p" ON (("s"."professeur_id" = "p"."id")))
  WHERE ("p"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Professors can view session memberships" ON "public"."eleve_sessions" FOR SELECT USING (("session_id" IN ( SELECT "sessions"."id"
   FROM "public"."sessions"
  WHERE ("sessions"."professeur_id" = "public"."current_professeur_id"()))));



CREATE POLICY "Professors can view students in own sessions" ON "public"."eleves" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."eleve_sessions" "es"
     JOIN "public"."sessions" "s" ON (("es"."session_id" = "s"."id")))
  WHERE (("es"."eleve_id" = "eleves"."id") AND ("s"."professeur_id" = "public"."current_professeur_id"())))));



CREATE POLICY "Students can insert own profile" ON "public"."eleves" FOR INSERT WITH CHECK (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Students can insert own questions" ON "public"."questions_cours" FOR INSERT WITH CHECK (("eleve_id" IN ( SELECT "eleves"."id"
   FROM "public"."eleves"
  WHERE ("eleves"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can insert own stats" ON "public"."eleve_cours_stats" FOR INSERT WITH CHECK (("eleve_id" = "public"."current_eleve_id"()));



CREATE POLICY "Students can join sessions" ON "public"."eleve_sessions" FOR INSERT WITH CHECK (("eleve_id" = "public"."current_eleve_id"()));



CREATE POLICY "Students can leave sessions" ON "public"."eleve_sessions" FOR DELETE USING (("eleve_id" = "public"."current_eleve_id"()));



CREATE POLICY "Students can update own profile" ON "public"."eleves" FOR UPDATE USING (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Students can update own stats" ON "public"."eleve_cours_stats" FOR UPDATE USING (("eleve_id" = "public"."current_eleve_id"()));



CREATE POLICY "Students can view classmates" ON "public"."eleves" FOR SELECT USING (("id" IN ( SELECT "visible_classmate_ids"."eleve_id"
   FROM "public"."visible_classmate_ids"() "visible_classmate_ids"("eleve_id"))));



CREATE POLICY "Students can view classmates stats for rankings" ON "public"."eleve_cours_stats" FOR SELECT USING (("cours_id" IN ( SELECT "c"."id"
   FROM ("public"."cours" "c"
     JOIN "public"."eleve_sessions" "es" ON (("c"."session_id" = "es"."session_id")))
  WHERE ("es"."eleve_id" = "public"."current_eleve_id"()))));



CREATE POLICY "Students can view courses in joined sessions" ON "public"."cours" FOR SELECT USING (("session_id" IN ( SELECT "eleve_sessions"."session_id"
   FROM "public"."eleve_sessions"
  WHERE ("eleve_sessions"."eleve_id" = "public"."current_eleve_id"()))));



CREATE POLICY "Students can view own profile" ON "public"."eleves" FOR SELECT USING (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Students can view own session memberships" ON "public"."eleve_sessions" FOR SELECT USING (("eleve_id" = "public"."current_eleve_id"()));



CREATE POLICY "Students can view own stats" ON "public"."eleve_cours_stats" FOR SELECT USING (("eleve_id" = "public"."current_eleve_id"()));



CREATE POLICY "Students can view questions in courses they joined" ON "public"."questions_cours" FOR SELECT USING (("cours_id" IN ( SELECT "c"."id"
   FROM (("public"."cours" "c"
     JOIN "public"."eleve_sessions" "es" ON (("c"."session_id" = "es"."session_id")))
     JOIN "public"."eleves" "e" ON (("es"."eleve_id" = "e"."id")))
  WHERE ("e"."supabase_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can view questions in joined sessions" ON "public"."questions" FOR SELECT USING (("cours_id" IN ( SELECT "c"."id"
   FROM ("public"."cours" "c"
     JOIN "public"."eleve_sessions" "es" ON (("c"."session_id" = "es"."session_id")))
  WHERE ("es"."eleve_id" = "public"."current_eleve_id"()))));



CREATE POLICY "Users can insert own autodidacte profile" ON "public"."autodidactes" FOR INSERT WITH CHECK (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Users can insert own etablissement profile" ON "public"."etablissements" FOR INSERT WITH CHECK (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Users can insert own professor profile" ON "public"."professeurs" FOR INSERT WITH CHECK (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Users can manage their own likes" ON "public"."suggestion_likes" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own autodidacte profile" ON "public"."autodidactes" FOR UPDATE USING (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Users can update own etablissement profile" ON "public"."etablissements" FOR UPDATE USING (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Users can update own professor profile" ON "public"."professeurs" FOR UPDATE USING (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Users can view own autodidacte profile" ON "public"."autodidactes" FOR SELECT USING (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Users can view own etablissement profile" ON "public"."etablissements" FOR SELECT USING (("auth"."uid"() = "supabase_user_id"));



CREATE POLICY "Users can view own professor profile" ON "public"."professeurs" FOR SELECT USING (("auth"."uid"() = "supabase_user_id"));



ALTER TABLE "public"."autodidacte_cours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."autodidacte_cours_fichiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."autodidacte_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."autodidacte_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."autodidactes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cours_fichiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."eleve_cours_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."eleve_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."eleves" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."etablissements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invitation_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professeurs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questions_cours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suggestion_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suggestions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."current_eleve_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_eleve_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_eleve_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_etablissement_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_etablissement_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_etablissement_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_professeur_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_professeur_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_professeur_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."visible_classmate_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."visible_classmate_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."visible_classmate_ids"() TO "service_role";


















GRANT ALL ON TABLE "public"."autodidacte_cours" TO "anon";
GRANT ALL ON TABLE "public"."autodidacte_cours" TO "authenticated";
GRANT ALL ON TABLE "public"."autodidacte_cours" TO "service_role";



GRANT ALL ON TABLE "public"."autodidacte_cours_fichiers" TO "anon";
GRANT ALL ON TABLE "public"."autodidacte_cours_fichiers" TO "authenticated";
GRANT ALL ON TABLE "public"."autodidacte_cours_fichiers" TO "service_role";



GRANT ALL ON TABLE "public"."autodidacte_questions" TO "anon";
GRANT ALL ON TABLE "public"."autodidacte_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."autodidacte_questions" TO "service_role";



GRANT ALL ON TABLE "public"."autodidacte_stats" TO "anon";
GRANT ALL ON TABLE "public"."autodidacte_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."autodidacte_stats" TO "service_role";



GRANT ALL ON TABLE "public"."autodidactes" TO "anon";
GRANT ALL ON TABLE "public"."autodidactes" TO "authenticated";
GRANT ALL ON TABLE "public"."autodidactes" TO "service_role";



GRANT ALL ON TABLE "public"."cours" TO "anon";
GRANT ALL ON TABLE "public"."cours" TO "authenticated";
GRANT ALL ON TABLE "public"."cours" TO "service_role";



GRANT ALL ON TABLE "public"."cours_fichiers" TO "anon";
GRANT ALL ON TABLE "public"."cours_fichiers" TO "authenticated";
GRANT ALL ON TABLE "public"."cours_fichiers" TO "service_role";



GRANT ALL ON TABLE "public"."eleve_cours_stats" TO "anon";
GRANT ALL ON TABLE "public"."eleve_cours_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."eleve_cours_stats" TO "service_role";



GRANT ALL ON TABLE "public"."eleve_sessions" TO "anon";
GRANT ALL ON TABLE "public"."eleve_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."eleve_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."eleves" TO "anon";
GRANT ALL ON TABLE "public"."eleves" TO "authenticated";
GRANT ALL ON TABLE "public"."eleves" TO "service_role";



GRANT ALL ON TABLE "public"."etablissements" TO "anon";
GRANT ALL ON TABLE "public"."etablissements" TO "authenticated";
GRANT ALL ON TABLE "public"."etablissements" TO "service_role";



GRANT ALL ON TABLE "public"."invitation_tokens" TO "anon";
GRANT ALL ON TABLE "public"."invitation_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."invitation_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "service_role";



GRANT ALL ON TABLE "public"."professeurs" TO "anon";
GRANT ALL ON TABLE "public"."professeurs" TO "authenticated";
GRANT ALL ON TABLE "public"."professeurs" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON TABLE "public"."questions_cours" TO "anon";
GRANT ALL ON TABLE "public"."questions_cours" TO "authenticated";
GRANT ALL ON TABLE "public"."questions_cours" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."suggestion_likes" TO "anon";
GRANT ALL ON TABLE "public"."suggestion_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."suggestion_likes" TO "service_role";



GRANT ALL ON TABLE "public"."suggestions" TO "anon";
GRANT ALL ON TABLE "public"."suggestions" TO "authenticated";
GRANT ALL ON TABLE "public"."suggestions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


  create policy "Professors can delete PDFs o7qhin_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'cours-pdf'::text));



  create policy "Professors can read PDFs o7qhin_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'cours-pdf'::text));



  create policy "Professors can upload PDFs o7qhin_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'cours-pdf'::text));



  create policy "Public read access for profile photos yndkpx_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profile-photos'::text));



  create policy "Users can update their own photos yndkpx_0"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'profile-photos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload their own photos yndkpx_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'profile-photos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



