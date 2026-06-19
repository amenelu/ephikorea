pragma foreign_keys = on;

create table if not exists settings (
  key text primary key,
  value text not null
);

create table if not exists sales_channels (
  id text primary key,
  name text not null,
  description text,
  is_disabled integer not null default 0,
  created_at text not null default (datetime('now'))
);

create table if not exists products (
  id text primary key,
  title text not null,
  subtitle text,
  description text,
  handle text not null unique,
  thumbnail text,
  status text not null default 'published',
  brand_name text,
  model_name text,
  color text,
  storage text,
  imei text,
  grading_data text,
  battery_health integer,
  is_certified_pre_owned integer not null default 1,
  metadata_json text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  deleted_at text
);

create table if not exists product_variants (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  title text not null default 'Default',
  inventory_quantity integer not null default 0,
  price_amount integer not null default 0,
  currency_code text not null default 'usd',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  deleted_at text
);

create table if not exists customers (
  id text primary key,
  email text not null unique,
  first_name text,
  last_name text,
  phone text,
  metadata_json text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  deleted_at text
);

create table if not exists addresses (
  id text primary key,
  customer_id text references customers(id) on delete set null,
  first_name text,
  last_name text,
  address_1 text not null,
  address_2 text,
  city text not null,
  province text,
  postal_code text,
  phone text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists orders (
  id text primary key,
  display_id integer not null,
  customer_id text references customers(id) on delete set null,
  email text not null,
  shipping_address_id text references addresses(id) on delete set null,
  status text not null default 'pending',
  payment_status text not null default 'awaiting',
  fulfillment_status text not null default 'not_fulfilled',
  total_amount integer not null default 0,
  currency_code text not null default 'usd',
  metadata_json text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists order_items (
  id text primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id text references products(id) on delete set null,
  variant_id text references product_variants(id) on delete set null,
  title text not null,
  description text,
  thumbnail text,
  unit_price integer not null,
  quantity integer not null,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_products_created_at on products(created_at);
create index if not exists idx_products_deleted_at on products(deleted_at);
create index if not exists idx_variants_product_id on product_variants(product_id);
create index if not exists idx_orders_customer_id on orders(customer_id);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_order_items_order_id on order_items(order_id);
