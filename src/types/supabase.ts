export type UserProfile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    preferred_currency: string;
    theme: string;
    language: string;
    email_notifications: boolean;
    push_notifications: boolean;
    monthly_budget: number | null;
    last_login: string | null;
    login_count: number;
    created_at: string;
    updated_at: string;
}

export type Database = {
    public: {
        Tables: {
            user_profiles: {
                Row: UserProfile;
                Insert: Partial<UserProfile>;
                Update: Partial<UserProfile>;
            };
            transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    description: string;
                    amount: number;
                    type: 'income' | 'expense';
                    category: string;
                    date: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<UserProfile, 'id'>>;
            };
            financial_goals: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    target_amount: number;
                    current_amount: number;
                    color: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<UserProfile, 'id'>>;
            };
        };
    };
}; 