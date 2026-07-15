create table if not exists finance_expenses (
  id text primary key,
  expense_date text not null,
  category text not null,
  amount integer not null default 0,
  currency_code text not null default 'usd',
  note text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  deleted_at text
);

create index if not exists idx_finance_expenses_date on finance_expenses(expense_date);
create index if not exists idx_finance_expenses_deleted_at on finance_expenses(deleted_at);
