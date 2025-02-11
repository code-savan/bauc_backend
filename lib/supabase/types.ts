export type Admin = {
  id: string;
  fullname: string;
  email: string;
  is_approved: boolean;
  is_superadmin: boolean;
  created_at: string;
  updated_at: string;

};

export type Property = {
    id: string;
    title: string;
    slug?: string;
    description?: Record<string, any>;
    status?: string;
    location: string;
    type: string;
    property_type?: string;
    area?: number;
    mortgage_option?: boolean;
    initial_deposit?: string;
    land_mark?: string | null;
    discount?: string;
    land_status?: string | null;
    amenities?: string[];
    completion_date?: string;
    gallery?: string[];
    thumbnail?: string | null;
    full_image?: string | null;
    price_range?: string;
    payment_term?: string;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    developer_id?: string;
  };

  export type Event = {
    id: string;
    title: string;
    slug?: string;
    loaction?: string;
    description?: Record<string, any>;
    gallery?: string[];
    banner_image?: string | null;
    event_video?: string | null;
    hosted_by?: string;
    created_at?: string;
    updated_at?: string;
  };

export type Developer = {
    id: string;
    title: string;
    body: Record<string, any>;
    image: string;
    created_at: string;
    properties: string[];
}
export type Blog = {
    id: string;
    title: string;
    author: string;
    slug?: string;
    image: string;
    body: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  };

export type ImportJob = {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_rows: number;
  processed_rows: number;
  failed_rows: Array<{
    row: number;
    error: string;
  }>;
  created_by: string;
  created_at: string;
  updated_at: string;
};
