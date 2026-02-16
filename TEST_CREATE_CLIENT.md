# Test création client via chat IA

## Problème constaté

**Conversation** :
```
User: "créer devis peinture 50m² pour Dupont Alain"
Agent: "Client Alain Dupont n'existe pas. Infos supplémentaires ?"
User: "06 30 30 30 30 Guyancourt 3 rue Jacques Duclos 78280"
Agent: "Erreur technique création client"
```

**Agent IA appelle `create_client`** mais échec silencieux.

## Diagnostic

### 1. Vérifier appel exact OpenAI

**Endpoint test créé** : `/api/test/create-client`

**Requête curl** :
```bash
curl -X POST https://devis-artisan-vocal-f2sf.vercel.app/api/test/create-client \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "nom": "Dupont",
    "prenom": "Alain",
    "telephone": "0630303030",
    "ville": "Guyancourt",
    "adresse": "3 rue Jacques Duclos",
    "code_postal": "78280"
  }'
```

**Réponse attendue** :
- ✅ 200 : `{"success": true, "client": {...}}`
- ❌ 400 : `{"success": false, "error": "...", "supabase_error": {...}}`

### 2. Vérifier logs fonction `create_client`

**Cas d'échec possibles** :
1. **Validation** : `email` ET `telephone` absents → agent ne les envoie pas ?
2. **Contrainte unique** : email dupliqué (erreur 23505)
3. **RLS** : politique Row Level Security bloque insertion
4. **Colonne manquante** : table `clients` n'a pas `nom`/`prenom` ?

### 3. Vérifier structure BDD

**Requête SQL Supabase** :
```sql
-- Vérifier colonnes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;

-- Vérifier RLS
SELECT * FROM pg_policies WHERE tablename = 'clients';

-- Vérifier contraintes
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'clients';
```

### 4. Améliorer logs backend

**Dans `/api/chat/route.ts` case 'create_client'** (ligne 211) :

```typescript
case 'create_client': {
  const { nom, prenom, email, telephone, ville, adresse, code_postal, siret, notes } = args
  
  // LOG AJOUTÉ
  console.log('🔧 create_client appelé:', JSON.stringify({
    nom, prenom, email, telephone, ville
  }, null, 2))
  
  if (!email && !telephone) {
    console.error('❌ Validation : email ET telephone absents')
    return {
      success: false,
      error: 'Email ou téléphone obligatoire pour créer un client'
    }
  }
  
  console.log('✅ Validation OK, insertion Supabase...')
  
  const { data: client, error: insertError } = await supabase
    .from('clients')
    .insert({...})
  
  if (insertError) {
    // LOG AJOUTÉ
    console.error('❌ Erreur Supabase:', {
      code: insertError.code,
      message: insertError.message,
      details: insertError.details
    })
    
    if (insertError.code === '23505') {
      return {
        success: false,
        error: `Un client avec l'email ${email} existe déjà`
      }
    }
    throw insertError
  }
  
  console.log('✅ Client créé:', client.id)
  return {...}
}
```

## Solution temporaire

**Créer client manuellement** :
1. Aller `/clients/nouveau`
2. Remplir formulaire
3. Revenir chat : "créer devis peinture 50m² pour Dupont"

## Prochaines actions

1. ✅ Endpoint test créé `/api/test/create-client`
2. ⏳ Ajouter logs détaillés dans `/api/chat/route.ts`
3. ⏳ Tester avec curl direct (voir ci-dessus)
4. ⏳ Vérifier logs Vercel après test chat
5. ⏳ Vérifier structure table `clients` Supabase
