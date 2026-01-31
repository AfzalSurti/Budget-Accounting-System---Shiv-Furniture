export declare const register: (payload: {
    email: string;
    password: string;
    role?: "ADMIN" | "PORTAL";
    contactId?: string | null;
}) => Promise<{
    user: {
        id: string;
        createdAt: Date;
        email: string;
        passwordHash: string;
        role: import("../generated/prisma/index.js").$Enums.UserRole;
        contactId: string | null;
        isActive: boolean;
        tokenVersion: number;
        updatedAt: Date;
    };
    token: string;
}>;
export declare const login: (email: string, password: string) => Promise<{
    user: {
        id: string;
        createdAt: Date;
        email: string;
        passwordHash: string;
        role: import("../generated/prisma/index.js").$Enums.UserRole;
        contactId: string | null;
        isActive: boolean;
        tokenVersion: number;
        updatedAt: Date;
    };
    token: string;
}>;
export declare const logout: (userId: string) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map