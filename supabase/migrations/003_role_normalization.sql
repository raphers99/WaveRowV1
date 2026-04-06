-- Migration 003: Normalize role column to lowercase and add check constraint.
-- DB default was 'STUDENT' (uppercase); app expects 'student' | 'subletter' | 'landlord'.

-- Lowercase any existing uppercase values
update profiles set role = lower(role) where role != lower(role);

-- Set a safe default
alter table profiles alter column role set default 'student';

-- Add check constraint so future inserts/updates can only use lowercase values
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('student', 'subletter', 'landlord'));
