-- Mettre à jour les emails des centres existants depuis auth.users
UPDATE public.centers c
SET email = u.email
FROM auth.users u
WHERE c.owner_id = u.id
AND (c.email IS NULL OR c.email = '');