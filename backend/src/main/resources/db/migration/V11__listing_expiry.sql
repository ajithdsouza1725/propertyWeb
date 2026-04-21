-- Listing auto-expiry: approved listings expire after 90 days.
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Backfill: set expiry for currently approved listings to 90 days from now.
UPDATE properties SET expires_at = now() + interval '90 days'
  WHERE approval_status = 'approved' AND expires_at IS NULL;

-- Allow 'expired' in listing_status check constraint.
ALTER TABLE properties
  DROP CONSTRAINT IF EXISTS properties_listing_status_check;
ALTER TABLE properties
  ADD CONSTRAINT properties_listing_status_check
  CHECK (listing_status IN ('active', 'sold', 'rented', 'inactive', 'expired'));
