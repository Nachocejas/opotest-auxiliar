# 🖥️ Guía de Despliegue en VPS (Ubuntu/Debian)

Desplegar en un VPS es genial porque tienes persistencia real y total control. Aquí tienes los pasos para dejarlo profesional.

---

## 1. Preparar el Servidor
Entra en tu VPS por SSH y asegúrate de tener lo básico:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose nginx python3-pip
```

---

## 2. Subir el Código
Puedes usar Git o simplemente subir la carpeta de tu proyecto al servidor (ej: en `/var/www/quiz-master`).

---

## 3. Desplegar el Backend (Con Docker)
He creado un archivo `docker-compose.yml` para que sea un solo comando:
```bash
cd /var/www/quiz-master
docker-compose up -d
```
*Esto levantará el backend en el puerto `8000` y mantendrá tus datos a salvo en la carpeta `data/`.*

---

## 4. Desplegar el Frontend
En tu ordenador local:
1. Pon la IP de tu VPS en el archivo `.env` del frontend (`VITE_API_URL=http://tu-ip:8000`).
2. Ejecuta `npm run build`.
3. Sube la carpeta `dist/` resultante a tu servidor (ej: `/var/www/quiz-master/frontend/dist`).

---

## 5. Nginx como "Portero" (El paso clave)
Configura Nginx para que sirva la web y redirija la API. Crea un archivo en `/etc/nginx/sites-available/quiz-master`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com; # O la IP de tu VPS

    # Frontend
    location / {
        root /var/www/quiz-master/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /upload { proxy_pass http://localhost:8000; }
    location /topics { proxy_pass http://localhost:8000; }
    location /questions { proxy_pass http://localhost:8000; }
}
```
Luego actívalo:
```bash
sudo ln -s /etc/nginx/sites-available/quiz-master /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. Asegurar con HTTPS (Opcional pero recomendado)
```bash
sudo apt install snapd
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```

---

## 💡 Ventaja de este método:
Al usar un VPS, **no necesitas Supabase**. Como el backend está mapeado a una carpeta real del disco (`./backend/data`), tus exámenes se guardarán en el archivo `quiz.db` del servidor y no se borrarán nunca, aunque apagues el contenedor.
