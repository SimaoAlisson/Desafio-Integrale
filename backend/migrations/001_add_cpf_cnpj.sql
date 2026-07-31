-- Migration: adiciona coluna opcional cpf_cnpj em leads existentes.
-- Segura e aditiva: não altera nem apaga dados atuais.
-- Execute no SQL Editor do Supabase se o banco já estiver criado sem essa coluna.
-- Instalações novas podem usar apenas backend/schema.sql (já inclui o campo).

alter table leads add column if not exists cpf_cnpj text;

comment on column leads.cpf_cnpj is 'CPF (11) ou CNPJ (14) opcional, armazenado apenas com dígitos';
