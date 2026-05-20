# 📚 OpoTest Auxiliar - Documentación del Proyecto

**OpoTest Auxiliar** (anteriormente *Quiz Master PDF*) es una plataforma web completa diseñada para opositores (específicamente Auxiliar Administrativo). Permite transformar documentos PDF de exámenes en simulacros interactivos, guardando el progreso y las estadísticas del usuario de forma privada y segura.

---

## 🛠️ Stack Tecnológico (Arquitectura)
El proyecto sigue una arquitectura moderna dividida en dos partes principales, preparadas para despliegue en la nube mediante **Docker** y **Nginx**.

### Frontend (Interfaz de Usuario)
*   **Framework:** React 18 con Vite (para un rendimiento extremadamente rápido).
*   **Estilos:** TailwindCSS (diseño responsivo, modo oscuro tipo "glassmorphism", moderno y limpio).
*   **Animaciones:** Framer Motion (transiciones fluidas de páginas y elementos interactivos).
*   **Iconos:** Lucide React.
*   **Conexión HTTP:** Axios.

### Backend (Motor y Base de Datos)
*   **Framework:** FastAPI (Python) - Extremadamente rápido y moderno para crear APIs.
*   **Base de Datos:** SQLite gestionado a través de SQLAlchemy (ORM) con relaciones en cascada.
*   **Procesamiento de PDF:** Librería `pypdf` combinada con un complejo motor de Expresiones Regulares (Regex) personalizado.
*   **Contenedorización:** Docker y Docker Compose listos para producción.

---

## ✨ Funcionalidades Principales

### 1. Extractor Inteligente de PDFs (Parser)
*   **Lectura Completa:** Capaz de escanear documentos largos para encontrar el bloque principal de preguntas y la tabla final de respuestas correctas.
*   **Motor Regex Flexible:** Detecta preguntas independientemente del formato de numeración (`1.`, `1.-`, `1)`, `• 1.`, etc.) tolerando errores tipográficos o de espaciado en el PDF original.
*   **Extracción de Explicaciones:** Si la tabla de respuestas del PDF incluye texto explicativo del porqué de la respuesta, el sistema lo recorta, lo limpia y lo vincula a la pregunta correspondiente en la base de datos.

### 2. Gestión de Asignaturas y Temas
*   **Carpetas por Asignatura:** Los usuarios pueden crear bloques temáticos (ej: "La Constitución Española", "Derecho Administrativo") para mantener el orden.
*   **Subida de Exámenes (Temas):** Cada PDF subido genera automáticamente un nuevo "Examen" vinculado a la asignatura elegida, tomando el nombre del archivo PDF original.
*   **Seguridad:** La subida y eliminación de exámenes/asignaturas está protegida por una contraseña de administrador (`admin123` por defecto) para evitar modificaciones accidentales o no autorizadas.

### 3. Motor de Exámenes Interactivo
*   **Interfaz Dinámica:** Las preguntas se presentan una a una o en formato lista, con tarjetas interactivas ("Glass cards").
*   **Feedback Inmediato:** Al hacer clic en una opción, el sistema revela instantáneamente si es correcta (verde) o incorrecta (roja).
*   **Caja de Explicaciones:** Tras responder, si el PDF original contenía una explicación detallada de esa pregunta (ej: "Según el artículo 11.2..."), se muestra automáticamente en un recuadro destacado debajo de la pregunta.

### 4. Dashboard (Panel Principal)
*   **Tarjetas Inteligentes:** Cada examen se muestra en una tarjeta dentro de su asignatura.
*   **Estadísticas en Tiempo Real:** La tarjeta de cada examen refleja el estado actual del usuario sin necesidad de entrar:
    *   Muestra "Sin empezar" si nunca se ha hecho.
    *   Muestra la cantidad de **Intentos** realizados.
    *   Muestra la **Nota del último intento** con un código de colores (Verde > 80%, Naranja > 50%, Rojo < 50%).
*   **Borrado en Cascada:** Al eliminar una asignatura o un examen, un sistema de confirmación de seguridad previene errores. Si se borra, se eliminan permanentemente todos los historiales y notas asociados para no dejar archivos basura en el servidor.

### 5. Mi Progreso (Evolución y Estadísticas)
*   **Cálculo de Medias Globales:** Calcula la nota media combinada de todos los exámenes realizados en la historia del usuario.
*   **Agrupación por Asignatura:** La interfaz condensa cientos de intentos individuales agrupándolos por bloque temático.
*   **Historial Detallado:** Por cada asignatura muestra:
    *   Nota media agregada (con su respectiva barra de progreso visual de color).
    *   Total de exámenes/intentos realizados en ese bloque.
    *   Fecha y hora de la última vez que se practicó esa asignatura.

---

## 🚀 Despliegue (Deploy)
*   Preparado 100% para la nube (VPS, Google Cloud, AWS).
*   Incluye scripts de auto-configuración y `Dockerfile`.
*   El backend funciona en un entorno aislado (`localhost:8000`) mientras un servidor **Nginx** actúa como *Proxy Inverso* protegiendo la base de datos y sirviendo los archivos del frontend por el puerto estándar 80.
*   Repositorio integrado con sistema de ignorado (`.gitignore`) para asegurar que la base de datos de producción y las notas del opositor nunca se filtren al código público de GitHub.
