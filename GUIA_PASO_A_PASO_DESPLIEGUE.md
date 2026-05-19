# 🏁 Guía Paso a Paso: Despliegue en la Nube

Esta guía te llevará de la mano para que tu aplicación sea accesible desde cualquier parte del mundo.

---

## 🛠 Fase 1: La Base de Datos (Supabase)

Como Google Cloud Run es "volátil", necesitamos una base de datos que siempre esté encendida.

1.  **Crea tu cuenta**: Ve a [Supabase.com](https://supabase.com) y regístrate (es gratis).
2.  **Nuevo Proyecto**: Dale a "New Project", elige un nombre (ej: `quiz-master-db`) y una contraseña fuerte. **Guarda esa contraseña**.
3.  **Espera a que se cree**: Tardará un par de minutos.
4.  **Consigue la URL de conexión**:
    -   Ve a **Project Settings** (el icono de la rueda abajo a la izquierda).
    -   Entra en **Database**.
    -   Busca la sección "Connection String" y selecciona **URI**.
    -   Copia esa URL. Tendrá un aspecto parecido a este:
        `postgresql://postgres:[TU_CONTRASEÑA]@db.xxxxxxxxxxx.supabase.co:5432/postgres`
    -   **IMPORTANTE**: Sustituye `[TU_CONTRASEÑA]` por la que pusiste al crear el proyecto.

---

## ☁️ Fase 2: El Cerebro (Google Cloud Run)

Aquí es donde vivirá tu código Python.

1.  **Instala el SDK**: Si no lo tienes, descarga [Google Cloud SDK](https://cloud.google.com/sdk/docs/install?hl=es-419).
2.  **Login**: Abre una terminal y escribe:
    ```bash
    gcloud auth login
    ```
3.  **Despliegue mágico**: Sitúate en la carpeta raíz del proyecto y ejecuta este comando (cambiando la URL por la tuya de Supabase):
    ```bash
    gcloud run deploy quiz-master-backend \
      --source . \
      --platform managed \
      --region europe-west1 \
      --allow-unauthenticated \
      --env-vars DATABASE_URL="TU_URL_DE_SUPABASE_AQUÍ"
    ```
4.  **Acepta todo**: Si te pide crear un repositorio de Artifact Registry, dile que **sí** (y).
5.  **Copia la URL**: Al final verás algo como `Service [quiz-master-backend] revision [xxx] has been deployed and is serving 100% of traffic. Service URL: https://quiz-master-backend-xxxxx.a.run.app`. **Copia esa URL**.

   ```
   > [!IMPORTANT]
   > La contraseña ahora se configura **únicamente en el backend** (`APP_PASSWORD`) para mayor seguridad.
   ```

---

## 💻 Fase 3: La Web (Firebase Hosting)

Aquí es donde los usuarios entrarán a jugar.

1.  **Configura el entorno**: Ve a la carpeta `frontend/`.
2.  **Crea el archivo .env**:
    ```bash
    cp .env.example .env
    ```
3.  **Edita el .env**: Abre el archivo `.env` recién creado y pega la URL que copiaste de Google Cloud en `VITE_API_URL`.
4.  **Prepara la web**:
    ```bash
    npm install
    npm run build
    ```
    (Esto creará una carpeta llamada `dist`).
5.  **Firebase Login y Setup**:
    ```bash
    npm install -g firebase-tools
    firebase login
    firebase init hosting
    ```
    -   Selecciona tu proyecto de Firebase (o crea uno).
    -   ¿Directorio público? Escribe **`dist`**.
    -   ¿Configurar como SPA? **Sí** (y).
    -   ¿Sobreescribir index.html? **No** (n).
6.  **¡Al aire!**:
    ```bash
    firebase deploy
    ```

---

## 🎉 ¡Listo!
Verás una URL de Firebase (ej: `https://tu-proyecto.web.app`). ¡Entra y pruébalo desde tu móvil o cualquier PC!
