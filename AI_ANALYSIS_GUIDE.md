# Guía de Implementación: Análisis de Alimentos con IA (Carby AI)

Esta guía documenta cómo funciona el sistema de escaneo y análisis nutricional de alimentos en Carby, integrando visión por computadora de última generación.

## 🚀 Arquitectura General

El sistema se divide en tres capas principales para garantizar velocidad y privacidad de las API Keys:

1.  **Captura (Frontend):** `ScanAR.jsx` utiliza la cámara del dispositivo para captar "frames" de video.
2.  **Orquestación (Lib):** `ai.js` convierte las imágenes a base64 y realiza la llamada segura a Supabase.
3.  **Análisis (Backend):** Una Edge Function de Supabase (`analyze-food`) procesa la imagen usando modelos de IA de Anthropic y Groq.

---

## 📸 Componentes Técnicos

### 1. Captura de Imagen (`ScanAR.jsx`)
*   Usa un componente de video de HTML5.
*   Extrae un frame cada 3 segundos (configurable) dibujando el video en un `canvas`.
*   Convierte el canvas a `image/jpeg` con calidad 0.85 para balancear detalle y peso de subida.

### 2. Puente de Comunicación (`src/lib/ai.js`)
*   Envía la imagen a la función `analyze-food` de Supabase.
*   Incluye el idioma del usuario para que la IA responda en el idioma correcto.
*   Gestiona el manejo de errores detallado, extrayendo el cuerpo del error de la función para diagnóstico rápido en consola.

### 3. Función de IA en el Borde (`supabase/functions/analyze-food/index.ts`)
Esta función es el "cerebro" y utiliza una arquitectura de redundancia (fallback):

*   **Proveedor Primario: Anthropic (Claude 3.5)**
    *   **Visión:** `claude-3-5-sonnet-20241022` (Excelente precisión para porciones).
    *   **Texto:** `claude-3-5-haiku-20241022` (Rápido y económico para correcciones manuales).
*   **Proveedor de Respaldo: Groq (Llama 4)**
    *   **Modelo Multimodal:** `meta-llama/Llama-4-Scout-17B-16E-Instruct`.
    *   Se activa automáticamente si Anthropic falla o se queda sin créditos.
    *   **Aviso:** Groq es extremadamente rápido, lo que reduce la latencia del escaneo.

---

## 🔑 Gestión de Secretos y API Keys

Las llaves de API **NUNCA** deben estar en el código del frontend. Se gestionan mediante los secretos de Supabase:

### Configurar llaves
Para actualizar o añadir llaves de Anthropic o Groq, usa la terminal:

```bash
# Para Anthropic
npx supabase secrets set ANTHROPIC_API_KEY=tu_clave_aqui --project-ref ujlrmnrwnjirhybvciko

# Para Groq
npx supabase secrets set GROQ_API_KEY=tu_clave_aqui --project-ref ujlrmnrwnjirhybvciko
```

---

## 🛠️ Diagnóstico de Errores (Troubleshooting)

Si el análisis devuelve un error **500**, revisa la consola del navegador. La función `analyze-food` está programada para devolver un objeto de diagnóstico:

*   **`anthropic: true/false`**: Indica si el backend detecta la API Key.
*   **`groq: true/false`**: Indica si el backend detecta la API Key de Groq.
*   **`groqModels`**: Una lista de los modelos disponibles actualmente en Groq (útil si un modelo es retirado/decommissioned).

### Errores Comunes
1.  **"Anthropic credits exhausted"**: Debes recargar saldo en `console.anthropic.com`.
2.  **"Model decommissioned"**: Ocurre cuando Groq retira un modelo "preview". Debes actualizar el ID del modelo en `supabase/functions/analyze-food/index.ts`.
3.  **401 Unauthorized**: La función se desplegó sin el flag `--no-verify-jwt` o la API Key es incorrecta.

---

## 🔄 Despliegue de Cambios

Cada vez que modifiques la lógica de la IA en la carpeta `supabase/`, debes redesplegar:

```bash
npx supabase functions deploy analyze-food --project-ref ujlrmnrwnjirhybvciko --no-verify-jwt
```
