/*
  # Initial Schema Setup

  1. Tables
    - `admins`: Admin user management
    - `properties`: Property listings
    - `import_jobs`: Track CSV/Excel import jobs

  2. Security
    - RLS policies for admin access
    - Secure defaults for sensitive fields
    - Automated timestamps
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fullname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_superadmin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  area NUMERIC NOT NULL,
  mortgage_option BOOLEAN DEFAULT false,
  initial_deposit NUMERIC,
  land_mark TEXT,
  discount NUMERIC DEFAULT 0,
  land_statue TEXT,
  amenities TEXT[] DEFAULT '{}',
  gallery TEXT[] DEFAULT '{}',
  thumbnail TEXT,
  full_image TEXT,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Import jobs table
CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  failed_rows JSONB DEFAULT '[]',
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can read own data"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Superadmins can read all admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND is_superadmin = true
  ));

CREATE POLICY "Properties visible to authenticated admins"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Approved admins can create properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND is_approved = true
  ));

CREATE POLICY "Admins can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_import_jobs_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();