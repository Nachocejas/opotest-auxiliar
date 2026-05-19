# Quiz Master PDF - Guía del Proyecto

Este proyecto es una aplicación web full-stack para convertir archivos PDF de cuestionarios en exámenes interactivos.

## 📂 Ubicación del Proyecto

Tu proyecto se encuentra en:
`/Users/ricardodavila/.gemini/antigravity/scratch/quiz-master-pdf`

### Estructura de Carpetas:
- **`backend/`**: Servidor FastAPI (Python).
  - `main.py`: Endpoints de la API.
  - `parser.py`: Lógica de extracción de PDF (el "cerebro").
  - `database.py`: Configuración de la base de datos SQL.
  - `data/`: Contiene el archivo de la base de datos.
- **`frontend/`**: Aplicación de interfaz (React + Vite).
  - `src/components/`: Componentes visuales (Cuestionario, Subida, Dashboard).
  - `src/App.jsx`: Lógica principal del frontend.

---

## 🚀 Cómo Iniciar el Proyecto

Para que la aplicación funcione, ambos servidores (Backend y Frontend) deben estar encendidos.

### 1. Iniciar el Backend (Servidor de Datos)
Abre una terminal y ejecuta:
```bash
cd /Users/ricardodavila/.gemini/antigravity/scratch/quiz-master-pdf
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Acceso API**: Puedes ver la documentación técnica en `http://localhost:8000/docs`

### 2. Iniciar el Frontend (Interfaz Visual)
Abre **otra** terminal y ejecuta:
```bash
cd /Users/ricardodavila/.gemini/antigravity/scratch/quiz-master-pdf/frontend
npm run dev -- --port 5173
```
- **Abrir Aplicación**: Una vez iniciado, ve a `http://localhost:5173` en tu navegador.

---

## 🗄️ Acceso a la Base de Datos

La base de datos es **SQLite**, lo que significa que es un archivo local.
- **Ubicación del archivo**: `/Users/ricardodavila/.gemini/antigravity/scratch/quiz-master-pdf/data/quiz.db`

### Cómo ver los datos:
1. Puedes usar una extensión de VS Code llamada **"SQLite Viewer"**.
2. O usar una herramienta externa como **DB Browser for SQLite**.
3. Contiene dos tablas principales: `topics` (los temas) y `questions` (las preguntas extraídas).

---

## 🛠️ Uso de la Aplicación

1. **Subida**: Puedes arrastrar varios PDFs a la vez. El sistema mostrará un check verde cuando termine de procesar cada uno.
2. **Examen**: Al seleccionar un tema, entrarás en el modo interactivo.
3. **Borrado**: En el dashboard principal, cada tema tiene un botón de "Papelera" para eliminarlo por completo (esto también borra sus preguntas de la base de datos).

---

## ☁️ Despliegue en la Nube (Google Cloud + Firebase)

He preparado el proyecto para que puedas subirlo fácilmente. Sigue estos pasos:

### 1. Base de Datos (Supabase)
1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. En la configuración del proyecto, busca la **Connection String** (URI) de PostgreSQL.
3. Copia esa URL. La usarás como variable de entorno `DATABASE_URL` en Cloud Run.

### 2. Backend (Google Cloud Run)
1. Instala el Google Cloud SDK si no lo tienes.
2. Desde la carpeta raíz del proyecto, ejecuta:
   ```bash
   gcloud run deploy quiz-master-backend --source . --env-vars DATABASE_URL="tu_url_de_supabase"
   ```
3. Al terminar, te dará una URL (ej: `https://quiz-backend-xxx.a.run.app`). **Cópiala**.

### 3. Frontend (Firebase Hosting)
1. En la carpeta `frontend/`, crea un archivo `.env` (basándote en `.env.example`).
2. Pega la URL de tu backend en `VITE_API_URL`.
3. Compila el proyecto: `npm run build`.
4. Despliega a Firebase: `firebase deploy`.

---

## 📌 Requisitos Previos
Asegúrate de tener instalado:
- **Python 3.9+**
- **Node.js 18+**
- Librerías necesarias (instalables con `pip install -r backend/requirements.txt` y `npm install` en frontend).
