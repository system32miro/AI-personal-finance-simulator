-- Configuração inicial das tabelas
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    ip_address inet NOT NULL,
    attempt_count integer DEFAULT 0,
    last_attempt timestamp with time zone DEFAULT timezone('utc'::text, now()),
    is_blocked boolean DEFAULT false,
    blocked_until timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid NOT NULL PRIMARY KEY,
    first_name text,
    last_name text,
    avatar_url text,
    preferred_currency text DEFAULT 'EUR'::text NOT NULL,
    theme text DEFAULT 'light'::text NOT NULL,
    language text DEFAULT 'pt'::text NOT NULL,
    email_notifications boolean DEFAULT true NOT NULL,
    push_notifications boolean DEFAULT true NOT NULL,
    monthly_budget numeric,
    last_login timestamp with time zone,
    login_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.financial_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    target_amount numeric NOT NULL,
    current_amount numeric DEFAULT 0,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    description text NOT NULL,
    amount numeric NOT NULL,
    type text NOT NULL,
    category text NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Funções
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER AS $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $$
begin
  delete from public.auth_rate_limits
  where last_attempt < timezone('utc'::text, now()) - interval '24 hours'
    and not is_blocked;
  
  update public.auth_rate_limits
  set is_blocked = false,
      blocked_until = null,
      attempt_count = 0
  where blocked_until < timezone('utc'::text, now());
end;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER AS $$
begin
    perform pg_sleep(0.1);
    
    insert into public.user_profiles (
        id,
        first_name,
        last_name
    )
    values (
        new.id,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name'
    )
    on conflict (id) do update
    set first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name;
    return new;
exception
    when others then
        raise log 'Erro ao criar perfil de utilizador: %', SQLERRM;
        return new;
end;
$$;

-- Políticas de Segurança (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para transactions
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
ON public.transactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
ON public.transactions FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para financial_goals
CREATE POLICY "Users can view their own goals" 
ON public.financial_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
ON public.financial_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.financial_goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.financial_goals FOR DELETE 
USING (auth.uid() = user_id);

-- Política para user_profiles
CREATE POLICY "Enable all operations" 
ON public.user_profiles 
FOR ALL 
USING (true) 
WITH CHECK (true); 