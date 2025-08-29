export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
}

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  summary: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  mediaUrls?: string[];
  tags?: string[];
}

export interface Contact {
  id?: string;
  label: string;
  value: string;
  type: 'whatsapp' | 'telegram' | 'email' | 'phone' | 'other';
  isActive: boolean;
}

export interface SupportMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  status: 'new' | 'read' | 'replied';
}