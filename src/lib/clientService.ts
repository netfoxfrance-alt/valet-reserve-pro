import { supabase } from '@/integrations/supabase/client';

/**
 * Normalise un numéro de téléphone (supprime espaces, tirets, points)
 * Doit correspondre à la fonction SQL normalize_phone()
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Trouve ou crée un client par téléphone (anti-doublon)
 * Utilise le téléphone normalisé pour la recherche
 * En cas de conflit (race condition), récupère le client existant
 */
export async function findOrCreateClient(params: {
  center_id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  source: 'booking' | 'manual' | 'contact_request';
}): Promise<{ clientId: string | null; error: string | null; isNew: boolean }> {
  const { center_id, name, phone, email, address, source } = params;
  
  if (!phone || phone.trim() === '') {
    return { clientId: null, error: null, isNew: false };
  }
  
  const normalizedPhone = normalizePhone(phone);
  
  try {
    // 1. Chercher un client existant par téléphone
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id, email, address')
      .eq('center_id', center_id)
      .eq('phone', phone)
      .maybeSingle();
    
    if (existingClient) {
      // Client trouvé - mettre à jour les infos manquantes si besoin
      const updates: Record<string, string> = {};
      if (!existingClient.email && email) updates.email = email;
      if (!existingClient.address && address) updates.address = address;
      
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('clients')
          .update(updates)
          .eq('id', existingClient.id);
      }
      
      return { clientId: existingClient.id, error: null, isNew: false };
    }
    
    // 2. Créer un nouveau client
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert({
        center_id,
        name,
        phone,
        email: email || null,
        address: address || null,
        source: source === 'contact_request' ? 'booking' : source, // contact_request → booking pour le champ source
      })
      .select('id')
      .single();
    
    if (newClient) {
      return { clientId: newClient.id, error: null, isNew: true };
    }
    
    // 3. En cas d'erreur de conflit (race condition), re-chercher
    if (insertError?.code === '23505') { // Unique violation
      const { data: raceClient } = await supabase
        .from('clients')
        .select('id')
        .eq('center_id', center_id)
        .eq('phone', phone)
        .maybeSingle();
      
      if (raceClient) {
        return { clientId: raceClient.id, error: null, isNew: false };
      }
    }
    
    console.error('[findOrCreateClient] Error:', insertError);
    return { clientId: null, error: insertError?.message || 'Erreur création client', isNew: false };
    
  } catch (error) {
    console.error('[findOrCreateClient] Exception:', error);
    return { clientId: null, error: 'Erreur inattendue', isNew: false };
  }
}
