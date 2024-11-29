# SignAI
## Rompiendo barreras comunicacionales con tecnología inclusiva
En Chile, cerca de 800 mil personas son sordas o mudas, enfrentando diariamente una brecha comunicacional debido a la falta de recursos inclusivos en instituciones. SignAI es un proyecto que transforma esta realidad, ofreciendo soluciones tecnológicas avanzadas para derribar barreras y promover la inclusión.

&nbsp;

-------

&nbsp;

## 🚀 Descripción del Proyecto
SignAI es un servicio intérprete de Lengua de Señas Chilena (LSCh) que utiliza Inteligencia Artificial para facilitar la comunicación entre personas sordas, mudas y oyentes. Con un enfoque práctico e innovador, integra herramientas que permiten procesar videos, audios y texto para ofrecer una comunicación inclusiva y efectiva.

### Cómo funciona SignAI
El sistema se divide en tres módulos principales:
1. **Diccionario Digital de Lengua de Señas Chilena**: Un diccionario completamente digitalizado, accesible y práctico, basado en material previamente disponible solo en libros y PDFs.
2. **Intérprete de Voz a Señas**: Procesa audios, los transcribe y los convierte en señas utilizando una base de datos de imágenes.
3. **Intérprete de Señas a Texto**: Una red neuronal detecta señas en imágenes y videos, facilitando la comunicación bidireccional.

&nbsp;

---

&nbsp;

## 💡 Casos de Uso
- Interpretación de videos o audios a lengua de señas y viceversa.
- Interpretación en tiempo real de lengua de señas y viceversa.
- Aplicaciones educativas para aprender lengua de señas al estilo de Duolingo.
- Diccionario de Lengua de Señas Chilena (LSCh) virtual accesible en cualquier dispositivo.
- Asistencia en consultas médicas, promoviendo la privacidad al no depender de intérpretes humanos.
- Herramienta de aprendizaje inclusiva para escuelas y universidades.
- Servicio de interpretación integrado para plataformas de atención al cliente.

&nbsp;

---

&nbsp;

## 🏆 Logros Destacados
- **Primer lugar** en la categoría "***Impacto Social***" y **segundo lugar** en la categoría "***Proyecto del Año***" en la DemoDay 2024, compitiendo a nivel nacional en Santiago contra más de 20 proyectos.
- Presentación en Preview DemoDay, destacando por su **innovación** y **relevancia social**.

&nbsp;

---

&nbsp;

## 🛠 Tecnologías Utilizadas
### Diccionario de Lengua de Señas Chilena Virtual
- Astro, React, TailwindCSS
### Developer Portal
- Astro, Firebase, MongoDB, TailwindCSS, TypeScript, HTML
### API (servicio principal)
- FastAPI, Python, Tensorflow, Keras, Firebase, MongoDB, FFMPEG, Websockets, Modelo VOSK
### Red Neuronal Convolucional
- Keras, Tensorflow, Pillow, Numpy, Pandas, CUDA, Cudnn
### Aplicaciones de Prueba de Integración
- Móvil: Ionic, Angular, Typescript, TailwindCSS
- Web: Angular, Typescript, TailwindCSS
- Web en Tiempo Real: Astro, Typescript, React, TailwindCSS, WebSockets
### Diseño y Control de Versiones
- Figma, Git, GitHub

&nbsp;

---

&nbsp;

## ⚙️ Instalación y Uso
### Requisitos previos
- Python 3.9 o superior
- Node.js 16 o superior
- MongoDB
- Firebase configurado ([Obtenener archivo](https://console.firebase.google.com/))

> [!CAUTION]
> El **Developer Portal**, **Aplicación en Tiempo Real** y **Diccionario Digital LCSh** dependen en su totalidad de la **API**, la **Base de Datos** (MongoDB, [click para obtener backup](https://github.com/Alwexis/SignAI/blob/main/Fase%202/Evidencias%20Proyecto/Backup_Diccionario.json)) y de las [credenciales de firebase](https://console.firebase.google.com/).

&nbsp;

### Instalación del API
1. Clona el repositorio:
```bash
git clone https://github.com/Alwexis/SignAI.git
```

2. Instala las dependencias del servidor API:
```bash
cd API
pip install -r requirements.txt
```

3. Configura las variables de entorno en .env para Firebase y MongoDB.

4. Ejecuta el servidor API:
```bash
uvicorn main:app --reload
```

&nbsp;

### Instalación del Developer Portal
1. Navega a la carpeta del portal:
```bash
cd DeveloperPortal
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

&nbsp;

### Instalación de la App en Tiempo Real
1. Navega a la carpeta de la aplicación:
```bash
cd AppRealtime
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

&nbsp;

## 📊 Métricas y Resultados del Modelo de Deep Learning
- Precisión en entrenamiento: **91%**
- Precisión en validación: **79%**
- Precisión en casos reales: **70%** (*fotos y videos recopilados por el equipo*).

Las imágenes usadas para pruebas reales se encuentran en la carpeta:
[Imagenes Testing CNN Casos Reales](https://github.com/Alwexis/SignAI/tree/main/Fase%202/Evidencias%20Proyecto/Imagenes%20Testing%20CNN%20Casos%20Reales).

El gráfico de métricas del modelo (ver imagen adjunta) y el código de pruebas está disponible en el notebook ubicado en la carpeta [Fase 2/Evidencias Proyecto/Arquitecturas CNN/Test_Arquitectura_16.ipynb](https://github.com/Alwexis/SignAI/blob/main/Fase%202/Evidencias%20Proyecto/Arquitecturas%20CNN/Test_Arquitectura_16.ipynb).

&nbsp;

## 👥 Equipo
### Ariel Silva [@Alwexis](https://github.com/Alwexis)
- **Rol**: Líder de equipo
- **Correo**: ar.silva@duocuc.cl | arielsilvar.dev@gmail.com
- **Portafolio**: [www.alwexis.me](https://www.alwexis.me/)
- **LinkedIn**: [Ariel Silva](https://www.linkedin.com/in/arielsilvar/)
- **Twitter**: [@Alwexisss](https://x.com/Alwexisss)
### Jenniffer Coñuel [@jeconuel](https://github.com/jeconuel)
- **Rol**: Desarrolladora y apoyo en documentación
- **Correo**: je.conuel@duocuc.cl
- **LinkedIn**: Jenniffer Coñuel
### Mattías González [@Mattiasgonzalez](https://github.com/Mattiasgonzalez)
- **Rol**: Desarrollador
- **Correo**: matt.gonzalez@duocuc.cl
- **LinkedIn**: [Mattías González](https://www.linkedin.com/in/mattias-alonzo-gonzalez-loyola-819895220/)
