declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        name?: string;
        role: 'admin' | 'host' | 'customer';
        verifiedEmail: boolean;
      };
    }
  }
}

export {};
