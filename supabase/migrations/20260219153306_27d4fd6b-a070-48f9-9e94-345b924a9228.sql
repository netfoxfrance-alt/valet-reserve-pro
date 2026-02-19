
CREATE OR REPLACE VIEW public.public_centers_view AS
SELECT id,
    slug,
    name,
    address,
    phone,
    logo_url,
    welcome_message,
    customization,
    ai_enabled,
    subscription_plan,
    latitude,
    longitude,
    intervention_radius_km,
    created_at,
    updated_at,
    quote_form_message
FROM centers c;
