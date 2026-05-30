export type ContactPerson = {
    id: string;
    name: string | null;
    role: string | null;
    email: string | null;
    phone: string | null;
    isPrimary: boolean | null;
    };

export type ContactPersonCreateDto = {
    name: string | null;
    role: string | null;
    email: string | null;
    phone: string | null;
    isPrimary: boolean | null;
    };