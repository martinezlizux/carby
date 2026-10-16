# ✨ Carby: Contador de Carbohidratos con IA Inteligente

> **Carby** es una aplicación web progresiva (PWA) diseñada para simplificar radicalmente la gestión nutricional para personas con diabetes o atletas, utilizando Inteligencia Artificial para eliminar la carga del registro manual de alimentos.

---

## 🚀 El Desafío (El Origen)
Todo nació de una necesidad real en el día a día: la convivencia con un familiar que tiene diabetes tipo 1. Contar la ingesta de los carbohidratos diarios es una necesidad vital para la correcta administración de insulina, pero el proceso suele ser tedioso, propenso a errores, y consiste en buscar infinitamente en bases de datos pesando cada ingrediente en casa.

El objetivo de este proyecto fue crear una experiencia **"frictionless"** donde el usuario pudiera registrar su comida en segundos usando voz, fotos o lenguaje natural. Identifiqué que existía una oportunidad enorme para agilizar y mejorar esta experiencia médica sumando la empatía del diseño con el poder computacional de la Inteligencia Artificial.

---

## 🎨 El Proceso de Diseño y UX

### 1. Dirección de Arte y DesignOps
Quería alejarme totalmente de las aplicaciones médicas aburridas o de aspecto clínico para lograr un producto interactivo minimalista y moderno.
- **Inspiración y UI:** Utilicé [Mobbin](https://mobbin.com/) para estudiar flujos de interacciones top tier del mercado y creé un Moodboard colaborativo en Figma para delinear la identidad.
- **Automatización de Tokens (Scripting):** No quería quedarme estancada traduciendo colores de diseño a código. Llevé el *DesignOps* al siguiente nivel desarrollando un script de Node.js (`parse_tokens.cjs`) que extrae dinámicamente los *design tokens* generados por la IA en Figma y los compila directamente en variables CSS modulares (`src/index.css`). Esto aceleró profundamente el salto sistemático del canvas visual a código productivo.

### 2. La Personalidad: "Carby"
Quería que el impacto de primera impresión fuera empático. Concebí a "Carby", un pequeño monstruo ilustrado que funciona como asistente o compañero en tu jornada.
- Desarrollé exploración de personajes (Google Whisk, Weaby) y finalmente utilicé refinamiento de *prompts* iterativos en **ChatGPT (DALL-E)** para generar al personaje en consistencia 3D y con diferentes emociones modulares.

### 3. Iteraciones de UX: El Onboarding (Wizard)
El primer desafío arquitectónico fue recabar la data crítica médica (edad, peso, y lista de medicamentos base) cuidando la carga cognitiva del usuario recién llegado.
- **V1 (Prototipado rápido):** Diseñé un flujo de ingreso "full step". Prototipé la versión en código el primer día y validé la viabilidad con usuarios limitados reales.
- **V2 (El Pivot Ágil):** Tras observar y cronometrar la alta fricción de llenado y caída de registros, iteré rápidamente. Reduje el modelo y lo marqué "Opcional". Esto infló brutalmente la métrica de *Time to value*, brindando a los pacientes la opción de explorar la UI de inmediato y perfeccionar sus medidas desde Settings luego.

---

## 🌟 Desarrollo e Ingeniería de Alto Nivel

Implementé una modalidad contemporánea descrita como **"Vibecoding"**, iterando a alta velocidad entre el entorno de diseño y la codificación de componentes usando LLMs como agentes de "Pair Programming" (Anthropic/Gemini) más la extensión Figma Console MCP para traspaso de especificaciones visuales. 

### 1. Entrada Multimodal & Carby AI Vision
El aspecto angular de retención es la comodidad de registro a través de inputs múltiples:
- **Web Speech (Voz):** El usuario graba su pedido y el engine naturaliza: *"Comí dos tacos y medio y soda normal"*.
- **Texto:** Registro por teclado en entorno chat simplificado.
- **Visión Artificial Transparente:** La captura fotográfica elimina el clásico "toma una foto y aprueba". En la interfaz, construí sobre React un componente (`ScanAR.jsx`) dotado que extrae un un fotograma (*frame*) del feed de video del celular mediante un canvas `<canvas>` cada tres segundos. Con esto, comprime la imagen a calidad imperceptible (0.85 JPEG) optimizando el ancho de banda, logrando analizar tu plato de comida en tiempo real sin accionar obturadores y bajando la latencia dramáticamente.

### 2. Arquitectura de Backend (Redundancia Fallback)
Estructuralmente programé el esquema en formato seguro **"Serverless"**:
1. **Edge Functions en Supabase:** Toda la carga de enrutamiento y uso de API keys de LLM operan aisladas en infra backend de bajo coste (`analyze-food` origin), imposibilitando cualquier extracción en ambiente cliente (XSS).
2. **Sistema de Redundancia de IA (Fallback Algorítmico):** Para garantizar *uptime clínico 24/7*, programé un switch de redundancia. Todo frame lo lee un componente primario de **Anthropic (Claude 3.5 Sonnet)** elegido por su altísima dedución visual de raciones. No obstante, si se corta el servicio o se acaban créditos en tiempo real, conecté un fallback en serie a un host ultra-veloz de **Groq (Llama 4)** que entrega estimaciones instantáneas para mantener vivo el ecosistema bajo cualquier circunstancia.

### 3. Gamificación y Localización Bilingüe
- Cursos y Recompensas (Badges) para premiar constancias de registros a largo plazo.
- Motor localizable (i18n) conectando bases de datos que permiten responder y analizar en Español o Inglés sin problemas de cruces culturales / nombres de platos.

---

## 📈 Impacto y Resultados

Carby expone y demuestra cómo el cruce entre metodologías de UI y DesignOps junto con infraestructura Serverless e Inteligencia Artificial Generativa pueden rediseñar herramientas clínicas clásicamente tediosas para convertirlas en plataformas profundamente elásticas.

A través de la *Carby Vision AI*, logramos disminuir el proceso y estrés logístico del paciente en sus ingestas. Un registro exacto de variables nutricionales pasaba de ocupar habitualmente entre **~3 - 5 min manuales**, a ser calculado y archivado de fondo en **menos de 15 segundos**, optimizando por miles un proceso cotidiano a lo largo del año.

---

> **Design Ops & Desarrollo General:** Liz Martinez  
> **Estatus:** MVP PWA en entorno Beta Estructural
> **Diseño Colaborativo:** [Board y Flujos en Figma](https://www.figma.com/design/Lf8oGsSSQnJAUozmNOuZIP/Carby-App?node-id=66-1077)
