-- Update order_items table to use UUID for product_id to match products table
ALTER TABLE public.order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.order_items 
ALTER COLUMN product_id TYPE UUID USING product_id::text::uuid;

-- Note: Since we're changing the data type, existing data might be incompatible
-- This will work for new orders going forward