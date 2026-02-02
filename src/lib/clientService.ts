import { supabase } from '@/integrations/supabase/client';

/**
 * Normalise un numéro de téléphone (supprime espaces, tirets, points)
 * Doit correspondre à la fonction SQL normalize_phone()
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Normalise un email (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Trouve ou crée un client par téléphone OU email (anti-doublon)
 * Priorité: téléphone > email
 * En cas de conflit (race condition), récupère le client existant
 * 
 * Optimisé pour des millions d'opérations/jour:
 * - Utilise les index existants (normalized phone, email)
 * - Gère les race conditions avec retry automatique
 * - Met à jour les infos manquantes sans créer de doublon
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
  
  const hasPhone = phone && phone.trim() !== '';
  const hasEmail = email && email.trim() !== '';
  
  // Si ni téléphone ni email, impossible de dédupliquer
  if (!hasPhone && !hasEmail) {
    return { clientId: null, error: 'Téléphone ou email requis', isNew: false };
  }
  
  const normalizedPhone = hasPhone ? normalizePhone(phone) : '';
  const normalizedEmail = hasEmail ? normalizeEmail(email!) : '';
  
  try {
    // ========================================
    // ÉTAPE 1: Recherche de client existant
    // ========================================
    
    let existingClient: { id: string; phone: string | null; email: string | null; address: string | null } | null = null;
    
    // 1a. Chercher par téléphone normalisé (priorité)
    if (hasPhone) {
      // Requête SQL avec téléphone normalisé via la fonction SQL
      const { data } = await supabase
        .rpc('find_client_by_normalized_phone', {
          p_center_id: center_id,
          p_normalized_phone: normalizedPhone
        });
      
      if (data && data.length > 0) {
        existingClient = data[0];
      }
    }
    
    // 1b. Si pas trouvé par téléphone, chercher par email
    if (!existingClient && hasEmail) {
      const { data } = await supabase
        .from('clients')
        .select('id, phone, email, address')
        .eq('center_id', center_id)
        .ilike('email', normalizedEmail)
        .maybeSingle();
      
      if (data) {
        existingClient = data;
      }
    }
    
    // ========================================
    // ÉTAPE 2: Client trouvé - Mise à jour
    // ========================================
    if (existingClient) {
      const updates: Record<string, string> = {};
      
      // Enrichir avec les infos manquantes
      if (!existingClient.email && hasEmail) updates.email = normalizedEmail;
      if (!existingClient.phone && hasPhone) updates.phone = phone;
      if (!existingClient.address && address) updates.address = address;
      
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('clients')
          .update(updates)
          .eq('id', existingClient.id);
      }
      
      return { clientId: existingClient.id, error: null, isNew: false };
    }
    
    // ========================================
    // ÉTAPE 3: Créer un nouveau client
    // ========================================
    const insertData = {
      center_id,
      name: name.trim(),
      phone: hasPhone ? phone : null,
      email: hasEmail ? normalizedEmail : null,
      address: address?.trim() || null,
      source: source === 'contact_request' ? 'booking' : source,
    };
    
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert(insertData)
      .select('id')
      .single();
    
    if (newClient) {
      return { clientId: newClient.id, error: null, isNew: true };
    }
    
    // ========================================
    // ÉTAPE 4: Gestion race condition
    // ========================================
    if (insertError?.code === '23505') { // Unique violation
      // Re-chercher le client qui a été créé entre-temps
      if (hasPhone) {
        const { data: raceClient } = await supabase
          .rpc('find_client_by_normalized_phone', {
            p_center_id: center_id,
            p_normalized_phone: normalizedPhone
          });
        
        if (raceClient && raceClient.length > 0) {
          return { clientId: raceClient[0].id, error: null, isNew: false };
        }
      }
      
      if (hasEmail) {
        const { data: raceClient } = await supabase
          .from('clients')
          .select('id')
          .eq('center_id', center_id)
          .ilike('email', normalizedEmail)
          .maybeSingle();
        
        if (raceClient) {
          return { clientId: raceClient.id, error: null, isNew: false };
        }
      }
    }
    
    console.error('[findOrCreateClient] Insert error:', insertError);
    return { clientId: null, error: insertError?.message || 'Erreur création client', isNew: false };
    
  } catch (error) {
    console.error('[findOrCreateClient] Exception:', error);
    return { clientId: null, error: 'Erreur inattendue', isNew: false };
  }
}
