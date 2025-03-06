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
    description?: string | { content: string; [key: string]: any };
    status?: string;
    location: string | string[];
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
    website?: string;
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
    content: Record<string, any>;
    image: string;
    created_at: string;
    properties?: any[];
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

export type KYCForm = {
  id: string;
  full_name: string;
  contact_number: string;
  email: string;
  developer_name: string;
  registration_number: string;
  office_address: string;
  website: string;
  portfolio_name: string;
  location: string;
  portfolio_type: string;
  project_timeline: string;
  completion_date: string;
  land_size: string;
  survey_number: string;
  current_land_use: string;
  zoning_info: string;
  topography_details: string;
  infrastructure: string;
  encumbrances: string;
  documentation: string;
  document_type: string;
  additional_info: string;
  consent: boolean;
  signature: string;
  signature_name: string;
  documents_url: string[];
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
};
