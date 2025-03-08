export interface Transaction {
    id: number;
    amount: number;
    type: string;
    category: string;
    date: string;
    description?: string;
    userId: number;
    image?: string | null;
  }