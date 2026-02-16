#!/bin/bash
# Test création client direct (nécessite être authentifié)

# IMPORTANT : Remplacer YOUR_AUTH_TOKEN par le token Supabase
# Obtenir via : console navigateur → Application → Cookies → sb-*-auth-token

curl -X POST https://devis-artisan-vocal-f2sf.vercel.app/api/test/create-client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "nom": "Thomas",
    "prenom": "Alain",
    "telephone": "0645454545",
    "ville": "Versailles",
    "adresse": "rue du terroir",
    "code_postal": "78000"
  }' | jq '.'

echo ""
echo "Si erreur 401 : remplacer YOUR_AUTH_TOKEN par votre token Supabase"
echo "Token disponible dans : DevTools → Application → Cookies → sb-*-auth-token"
