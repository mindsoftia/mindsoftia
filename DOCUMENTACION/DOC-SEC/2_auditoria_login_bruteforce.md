# Auditoría de Seguridad y Mitigación: Brute Force en Login

**Fecha:** 1 de Julio de 2026  
**Componente Auditado:** `src/store/authStore.js` (Módulo de Autenticación React)  
**Nivel de Riesgo Previo:** Medio/Alto (Vulnerabilidad a ataques de Fuerza Bruta y Credential Stuffing)  
**Estado Actual:** Asegurado (Rate Limiting en Frontend)

---

## 1. Vulnerabilidades Identificadas (Assessment)

Durante la revisión del ciclo de inicio de sesión (`signInWithPassword` de Supabase):
1. **Ausencia de Rate Limiting (Client-Side):**
   - *Riesgo:* Aunque Supabase tiene bloqueos de seguridad en el backend, el frontend (React) permitía enviar ilimitadas solicitudes de inicio de sesión sin ningún tipo de enfriamiento (cooldown).
   - *Impacto:* Un atacante o bot podría saturar la cuota de la API de Supabase o intentar adivinar contraseñas masivamente (Fuerza Bruta / Credential Stuffing), degradando el rendimiento o comprometiendo cuentas.

---

## 2. Mitigaciones Implementadas (Capa Frontend - Zustand)

El store global de autenticación (`authStore.js`) fue modificado para rastrear y penalizar intentos fallidos de manera autónoma.

### A. Tracking de Intentos y Lockout
Se introdujeron dos nuevas variables en el estado global (persistidas en `localStorage`):
- `loginAttempts`: Contador entero que incrementa por cada error 401/403.
- `lockoutUntil`: Timestamp (milisegundos) que define el fin del castigo.

### B. Bloqueo Matemático (Cooldown)
Al inicio de la función `login`, se inyectó una barrera matemática que evalúa el tiempo de bloqueo:
```javascript
if (lockoutUntil && Date.now() < lockoutUntil) {
    const segundosRestantes = Math.ceil((lockoutUntil - Date.now()) / 1000);
    // Bloquear petición y mostrar mensaje al usuario
}
```

### C. Penalización Escalable (3 Strikes)
- Si el usuario se equivoca **3 veces consecutivas**, la aplicación impone un castigo de **60 segundos** (`Date.now() + 60000`), rechazando silenciosamente los intentos adicionales sin contactar al servidor.
- Si el usuario se autentica exitosamente antes de llegar al límite, los contadores se resetean a `0` y `null`.

---

## 3. Próximos Pasos en Ciberseguridad (Recomendaciones)

Para fortalecer esta mitigación a futuro:
1. **ReCaptcha / Turnstile:** Implementar un validador de humanos (ej. Cloudflare Turnstile) si los intentos fallidos provienen de la misma IP.
2. **Alertas a SuperAdmin:** Si una empresa sufre ataques de fuerza bruta, enviar un log pasivo a una tabla de auditoría para que el SuperAdmin pueda solicitar un cambio de contraseña forzoso al usuario.
