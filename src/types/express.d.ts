declare namespace Express {
  export interface Request {
    user?: {
      // userId: number; // Old line
      id: string; // New line
      role: string;
    };
  }
}
