# Autenticación 

Este proyecto utiliza **Firebase Authentication** para el manejo de usuarios, sesiones y control de acceso.  
El método habilitado es:

- **Correo electrónico / contraseña** → ✅ habilitado.

Además, todos los usuarios registrados en el sistema también se guardan en la colección `usuarios` de Firestore para extender su información (rol, nombre, fecha de registro, etc.).

---

## 🚀 Flujo general de autenticación

1. Un usuario se registra o inicia sesión con su correo y contraseña.
2. Firebase Authentication valida las credenciales y devuelve un objeto `userAuth`.
3. El proyecto consulta Firestore → colección `usuarios` para complementar la información (ejemplo: rol, nombre).
4. El usuario queda disponible en el contexto global de React (`AuthProvider`).
5. Con esta información se controla:
   - Si el usuario está logueado o no.
   - Qué vistas puede acceder.
   - Qué permisos tiene (según su rol: `docente`, `revisor`, etc.).

---

## 📂 Archivos principales de autenticación

### 1. AuthProvider.jsx

Este archivo define un **Contexto de Autenticación** para React.  
Sirve para que en cualquier parte de la aplicación se pueda acceder al usuario actual sin necesidad de repetir lógica.

- Escucha los cambios de sesión con `onAuthStateChanged`.
- Si hay un usuario logueado:
  - Obtiene la información adicional desde Firestore (`usuarios/{uid}`).
  - Combina los datos de Firebase Authentication (`uid`, `email`) con los datos de Firestore (`nombre`, `rol`, etc.).
- Si no hay usuario logueado:
  - Establece `user = null`.
- Expone dos valores a toda la aplicación:
  - `user`: el usuario autenticado con su información.
  - `loading`: estado de carga inicial mientras Firebase valida la sesión.

👉 Hook personalizado:
```jsx
export function useAuth() { ... }
```

Permite acceder al contexto en cualquier componente:

```jsx
const { user, loading } = useAuth();
```

### 2. Logout.jsx

Este componente se encarga de cerrar sesión:

- Llama a signOut(auth) para finalizar la sesión de Firebase.
- Al cerrar sesión, redirige automáticamente al usuario hacia / (la pantalla de login).
- Si ocurre un error en el cierre, lo muestra en consola.

👉 Uso típico:

```jsx
<Route path="/logout" element={<Logout />} />
```

### 3. ProtectedRoute.jsx

Este componente protege las rutas que **solo deben ser accesibles para usuarios autenticados.**

- Usa el contexto (useAuth) para verificar:

    -- loading: si Firebase aún valida la sesión, muestra Cargando....
    -- user: si no existe, redirige al login (/).
    -- Si existe, permite acceder al contenido con <Outlet />.

👉 Ejemplo de uso en App.jsx:

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/perfil" element={<Perfil />} />
</Route>
```

---

## 🔐 Usuarios en Firebase Authentication

- Los usuarios se registran con **correo y contraseña.**
- Firebase Authentication gestiona el login, logout, recuperación de sesión y validación.
- Los usuarios autenticados se ven reflejados en la consola de Firebase → Authentication.

## 👥 Relación con Firestore

Además del registro en Authentication, cada usuario tiene un documento en la colección usuarios dentro de Firestore.
Allí se almacenan datos adicionales, por ejemplo:

```json
{
  "correo": "julie@docente.com",
  "fechaRegistro": "2025-06-19T17:19:51-05:00",
  "nombre": "Julie Docente",
  "rol": "docente"
}
```

Esto permite diferenciar roles (docente, revisor, admin) y controlar accesos mediante las **reglas de seguridad de Firestore.** descritas en la sección anterior.