# SignAI

Tablero de Trello: https://trello.com/b/tmm23lo6/signai

> [!IMPORTANT]
> Es importante considerar que cada una de los artefactos están desarrollados en distintos lenguajes de programación y frameworks. Por ende, recomendamos revisar abajo la documentación de cómo iniciar un artefacto en su apartado específico.

## ¿Qué es SignAI?
SignAI es un **proyecto de innovación** que consta de un **servicio interprete de Lengua de Señas Chileno** (LSCh) cuyo objetivo es **brindar la base** de una herramienta capáz de **romper la barrera comunicacional que existe entre una persona oyente y persona sorda o muda**. Haciendo uso de tecnologías punteras, cómo lo es la **Inteligencia Artificial** y con un enfoque práctico; SignAI es tan sencillo de integrar cómo hacer una petición al servidor del servicio.

## Artefactos
SignAI cuenta con los siguientes artefactos, cada uno escrito en distintos lenguajes de programación, o haciendo uso de diferentes herramientas y frameworks.

### Modelo de Deep Learning:
[![Jupyter Notebooks](https://img.shields.io/badge/Jupyter%20Notebooks-27272a)
](https://github.com/Alwexis/SignAI/tree/main/Fase%202/Evidencias%20Proyecto/Arquitecturas%20CNN)    [![Modelo Entrenado](https://img.shields.io/badge/Modelo%20Entrenado-27272a)](https://github.com/Alwexis/SignAI/blob/main/Fase%202/Evidencias%20Proyecto/API/models/SignAI_Model.h5)     [![Imágenes Testing](https://img.shields.io/badge/Imágenes%20Testing-27272a)](https://github.com/Alwexis/SignAI/tree/main/Fase%202/Evidencias%20Proyecto/Imagenes%20Testing%20CNN%20Casos%20Reales)     [![Dataset 200x200](https://img.shields.io/badge/Dataset%20200x200-27272a)](https://www.mediafire.com/file/o8cu4u222zgagwf/ASL_Alph_Redim.zip/file)

### API
[![Código Fuente](https://img.shields.io/badge/C%C3%B3digo%20Fuente-27272a)](https://github.com/Alwexis/SignAI/tree/main/Fase%202/Evidencias%20Proyecto/API)

> [!TIP]
> Para inicializar el artefacto de la API, por favor instala los paquetes de pip requeridos específicados en `requirements.txt`, una vez lo hayas hecho, inicializa el servidor utilizando `python -m fastapi dev api.py`

### Developer Portal
[![Developer Portal](https://img.shields.io/badge/Código%20Fuente-27272a)](https://github.com/Alwexis/SignAI/tree/main/Fase%202/Evidencias%20Proyecto/Developer%20Portal)

> [!TIP]
> Para inicializar el artefacto del Developer Portal, antes debe estar iniciado la **API**. Si está iniciada el artefacto de la API, por favor instala los paquetes requeridos utilizando `npm install` dentro de la carpeta del artefacto, una vez lo hayas hecho, inicializa el developer portal utilizando `npm run dev`

> [!CAUTION]
> El Developer Portal además de depender de la **API**, también depende de **credenciales de Firebase**. Para replicar ésto, por favor genera un proyecto y obten las tuyas en [Firebase](https://console.firebase.google.com/)

### Ejemplo de Integración - App en Tiempo Real
[![Código Fuente](https://img.shields.io/badge/Código%20Fuente-27272a)](https://github.com/Alwexis/SignAI/tree/main/Fase%202/Evidencias%20Proyecto/App%20Tiempo%20Real)

> [!TIP]
> Para inicializar el artefacto del Developer Portal, antes debe estar iniciado la **API**. Si está iniciada el artefacto de la API, por favor instala los paquetes requeridos utilizando `npm install` dentro de la carpeta del artefacto, una vez lo hayas hecho, inicializa el developer portal utilizando `npm run dev`

> [!CAUTION]
> El ejemplo de integración depende de la **API** y también necesita una **APIKey** en el **Header** `x-api-key`, para fines de testing y prácticos habilitamos una global llamada `__bypass__`, pronto estará en **desuso**
