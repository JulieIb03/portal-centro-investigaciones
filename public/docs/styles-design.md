# Estilos y Diseño

Este proyecto cuenta con una guía de estilos definida, orientada a mantener consistencia visual en todas las pantallas y componentes del **Portal del Centro de Investigaciones**.  
El diseño parte de los lineamientos institucionales de la **Universidad Militar Nueva Granada (UMNG)**, tanto en colores como en tipografía, para garantizar una identidad coherente.

---

## 📘 Fuentes y Tipografía

- Se utiliza la fuente **Poppins**, importada desde Google Fonts.
- Su elección se basó en su legibilidad y versatilidad, manteniendo un estilo moderno y profesional.
- Se emplea como tipografía base para todo el sistema (`body`, títulos, tablas, botones, etc.).

```css
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap");

body {
  font-family: "Poppins", sans-serif;
}
```

---

## 🎨 Paleta de Colores

Los colores principales del sistema se definen en :root dentro de Default.css para facilitar su reutilización y mantener consistencia:

| Variable | Hex | Uso principal |
|----------|-----|---------------|
| `--color-primario` | `#0b3c4d` | Encabezados, títulos, botones principales |
| `--color-secundario` | `#f5af00` | Botones secundarios, resaltados |
| `--color-fondo` | `#f3f4f7` | Fondo general del sistema |
| `--color-input-bg` | `#f3f6fa` | Fondos de inputs y textareas |
| `--color-texto-principal` | `#5b5b5b` | Texto general |
| `--color-focus` | `#ffb703` | Resaltados de foco |
| `--color-pendiente` | `#f23030` | Estado Pendiente |
| `--color-correccion` | `#f9b233` | Estado En corrección |
| `--color-aprobado` | `#4caf50` | Estado Aprobado |

Estos colores reflejan la identidad institucional de la UMNG.

---

## 📐 Jerarquía Tipográfica

- **Títulos (h1, h2, h3):** color primario (--color-primario) y peso 600.
- **Texto normal:** color --color-texto-principal.
- **Tablas:** tipografía clara, con encabezados destacados en gris.

``` css
h1, h2, h3 {
  color: var(--color-primario);
  font-weight: 600;
}
```

---

## 🖼 Componentes de Interfaz
🔘 Botones

- **Botones principales (button)** → Fondo secundario con hover invertido (azul oscuro + blanco).
- **Botones auxiliares (.btnAzul, .btnAzul2)** → Colores invertidos y con bordes definidos.

```css
button {
  background-color: var(--color-secundario);
  color: var(--color-primario);
  border-radius: 0.375rem;
}

button:hover {
  background-color: var(--color-primario);
  color: white;
}
```

---

## 📊 Tablas

- Bordes colapsados, encabezados en gris claro (#e9ecef).
- Texto alineado a la izquierda.

```css
table {
  width: 100%;
  border-collapse: collapse;
}
```

---

## 🟢 Estados

Se definen clases específicas para los estados de postulaciones:

- **.Pendiente** → Rojo (--color-pendiente)
- **.En-corrección** → Amarillo (--color-correccion)
- **.Aprobado** → Verde (--color-aprobado)

---

## 📂 Organización de Estilos

- **src/styles/Default.css** → Archivo principal de configuración global (tipografías, colores, reset básico).
- **Archivos específicos por pantalla/componente** → Cada pantalla importante tiene su propio .css, lo que mejora la modularidad y evita sobrecarga en un único archivo.

Estructura:

```
src/
 ├── styles/
 |    ├── components/
 │    ├── Default.css
 │    ├── Dashboard.css
 ```

---

## ✅ Buenas Prácticas

1. **Usar variables CSS (:root) siempre que sea posible** → Facilita cambios globales de color o estilo.

2. **Modularizar** → Cada pantalla tiene su propio archivo de estilos.

3. **Consistencia en los nombres de clases** → CamelCase o kebab-case uniforme.

3. **Evitar estilos en línea** → Siempre centralizar en archivos .css.

4. Mantener los estados de botones y elementos interactivos visibles (hover, disabled, focus).

---

## 📐 Wireframes y Prototipo

El diseño original del sistema se basó en:

- Diagramas UML (clases y casos de uso).
- Wireframes iniciales para flujos de usuario.
- Prototipo en Figma con componentes definidos:

👉 <a href="https://www.figma.com/design/3ecwFSpUpp3CUMxkCNwr6n/Portal-CDI?node-id=32-141&t=gOs0rkQ1ZKZwmMF3-1" target="_blank" rel="noopener noreferrer">Figma - Portal CDI</a>

Estos recursos fueron la base para la implementación en código.

---
