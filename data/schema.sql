alter table if exists product
  add column if not exists is_certified_pre_owned boolean default false,
  add column if not exists battery_health integer,
  add column if not exists grading_data text;
