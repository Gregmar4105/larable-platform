export type Organization = {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    plan: string;
    description?: string | null;
    users_count?: number;
    created_at: string;
    updated_at: string;
};
