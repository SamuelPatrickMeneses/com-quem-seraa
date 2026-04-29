#!/bin/sh

# Upsert superuser se as variáveis estiverem definidas
if [ -n "$PB_SUPERUSER_EMAIL" ] && [ -n "$PB_SUPERUSER_PASSWORD" ]; then

    echo "Configurando superusuário PocketBase..."
    
    pocketbase superuser upsert "$PB_SUPERUSER_EMAIL" "$PB_SUPERUSER_PASSWORD" \
    --dir /app/pb_data \
    --hooksDir /app/pb_hooks \
    --migrationsDir /app/pb_migrations \
    --publicDir /app/pb_public

fi
# Inicia o servidor PocketBase
echo "Iniciando PocketBase..."

pocketbase serve \
  --http=0.0.0.0:8090 \
  --dir /app/pb_data \
  --hooksDir /app/pb_hooks \
  --migrationsDir /app/pb_migrations \
  --publicDir /app/pb_public
