alter table public.processo_executando add if not exists criado_em timestamp not null default current_timestamp;