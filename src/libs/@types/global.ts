import express, {NextFunction} from "express";

export type UserRole = "doctor" | "patient" | "admin"

export interface AppRequest extends express.Request {
    user?: {
        id: string;
        token: string;
        role: UserRole;
        complete: boolean;
    }
}

export type Controller = (req: AppRequest, res: express.Response, next: NextFunction) => void;

export class AppError extends Error {
    type: "Auth" | "App" = "App"
    status: number = 500;

    constructor(message: string, status: number = 500) {
        super(message);
        this.status = status;
        this.log()
    };

    private log() {
        console.log(`${this.type} Error: ${this.message}\n${new Date().toISOString()}`);
    }
}

export class AuthError extends AppError {
    type: "Auth" = "Auth"
}

