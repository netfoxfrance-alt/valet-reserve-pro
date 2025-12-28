-- Ajouter un seul champ JSONB pour toutes les personnalisations
ALTER TABLE public.centers 
ADD COLUMN IF NOT EXISTS customization jsonb DEFAULT '{
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#1e293b",
    "accent": "#10b981"
  },
  "texts": {
    "tagline": "",
    "cta_button": "Réserver maintenant"
  },
  "layout": {
    "show_hours": true,
    "show_address": true,
    "show_phone": true,
    "dark_mode": false
  },
  "cover_url": null
}'::jsonb;