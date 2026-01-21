-- Ajouter la colonne adresse aux rendez-vous
ALTER TABLE public.appointments 
ADD COLUMN client_address TEXT;

-- Ajouter le buffer de déplacement aux centers (dans customization JSON existant)
-- On va stocker dans customization.settings.appointment_buffer (en minutes)