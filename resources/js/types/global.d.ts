import type { Auth } from '@/types/auth';
import type { Organization } from '@/types/organization';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            organizations?: Organization[];
            currentOrganization?: Organization | null;
            flash?: {
                success?: string | null;
                error?: string | null;
            };
            [key: string]: unknown;
        };
    }
}
