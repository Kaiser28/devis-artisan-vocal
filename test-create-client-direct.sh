#!/bin/bash
echo "⚠️  Ce test nécessite un token d'authentification Supabase"
echo "Récupérez-le depuis DevTools → Application → Cookies → sb-*-auth-token"
echo ""
read -p "Entrez le token (ou Enter pour skip) : " TOKEN

if [ -z "$TOKEN" ]; then
  echo "❌ Token requis pour tester"
  exit 1
fi

echo ""
echo "🧪 Test endpoint /api/test/create-client..."
curl -X POST https://devis-artisan-vocal-f2sf.vercel.app/api/test/create-client \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "TestBug",
    "prenom": "Client",
    "telephone": "0699999999",
    "ville": "Paris"
  }' \
  -w "\n\n📊 HTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
