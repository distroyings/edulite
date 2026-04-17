# EduLite — Supabase Email Templates

> Go to **Supabase Dashboard → Authentication → Email Templates** and paste each template below.
> All templates use table-based layout for maximum email client compatibility.

---

## 1. Confirm Signup (OTP)

**Subject:** `{{ .Token }} é o teu código de verificação — EduLite`

**Body (HTML):**
```html
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduLite — Verificação</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <!-- Outer Wrapper -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 16px;" role="presentation">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);" role="presentation">

          <!-- Accent Bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#10b981 0%,#059669 50%,#047857 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding:36px 40px 28px;">
              <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1;">
                <span style="color:#111827;">Edu</span><span style="color:#10b981;">Lite</span>
              </div>
            </td>
          </tr>


          <!-- Content -->
          <tr>
            <td align="center" style="padding:0 40px 12px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">Bem-vindo ao EduLite!</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                Confirma o teu email para começar.  Introduz o código abaixo na página de registo.
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <table border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td align="center" style="background-color:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:18px 36px;">
                    <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;color:#059669;letter-spacing:6px;display:block;">{{ .Token }}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry Note -->
          <tr>
            <td align="center" style="padding:0 40px 36px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
                Este código expira em <strong style="color:#6b7280;">1 hora</strong>.<br>
                Se não criaste conta no EduLite, ignora este email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 40px;background-color:#f9fafb;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; 2026 EduLite — Plataforma Educativa Digital</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
```

---

## 2. Magic Link / Admin OTP Login

**Subject:** `{{ .Token }} — Código de Acesso — EduLite`

**Body (HTML):**
```html
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduLite — Código de Acesso</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 16px;" role="presentation">
    <tr>
      <td align="center">

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);" role="presentation">

          <!-- Accent Bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#8b5cf6 0%,#7c3aed 50%,#6d28d9 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:36px 40px 28px;">
              <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1;">
                <span style="color:#111827;">Edu</span><span style="color:#8b5cf6;">Lite</span>
              </div>
            </td>
          </tr>



          <!-- Content -->
          <tr>
            <td align="center" style="padding:0 40px 12px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">Código de Acesso</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                Utiliza o código abaixo para aceder ao EduLite. Não o partilhes com ninguém.
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <table border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td align="center" style="background-color:#f5f3ff;border:2px solid #ddd6fe;border-radius:12px;padding:18px 36px;">
                    <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;color:#7c3aed;letter-spacing:6px;display:block;">{{ .Token }}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry Note -->
          <tr>
            <td align="center" style="padding:0 40px 36px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
                Este código expira em <strong style="color:#6b7280;">5 minutos</strong>.<br>
                Se não solicitaste este código, ignora este email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 40px;background-color:#f9fafb;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; 2026 EduLite — Plataforma Educativa Digital</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
```

---

## 3. Reset Password

**Subject:** `Repor Palavra-Passe — EduLite`

**Body (HTML):**
```html
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduLite — Repor Palavra-Passe</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 16px;" role="presentation">
    <tr>
      <td align="center">

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);" role="presentation">

          <!-- Accent Bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#f59e0b 0%,#d97706 50%,#b45309 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:36px 40px 28px;">
              <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1;">
                <span style="color:#111827;">Edu</span><span style="color:#f59e0b;">Lite</span>
              </div>
            </td>
          </tr>



          <!-- Content -->
          <tr>
            <td align="center" style="padding:0 40px 12px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">Repor Palavra-Passe</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                Recebemos um pedido para repor a tua palavra-passe. Introduz o código abaixo para continuar.
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <table border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td align="center" style="background-color:#fffbeb;border:2px solid #fde68a;border-radius:12px;padding:18px 36px;">
                    <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;color:#d97706;letter-spacing:6px;display:block;">{{ .Token }}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td align="center" style="padding:0 40px 36px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
                Este código expira em <strong style="color:#6b7280;">1 hora</strong>.<br>
                Se não solicitaste esta alteração, ignora este email.<br>
                A tua palavra-passe atual permanece inalterada.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 40px;background-color:#f9fafb;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; 2026 EduLite — Plataforma Educativa Digital</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
```

---

## 4. Change Email Address

**Subject:** `Confirmar Novo Email — EduLite`

**Body (HTML):**
```html
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduLite — Confirmar Email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 16px;" role="presentation">
    <tr>
      <td align="center">

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);" role="presentation">

          <!-- Accent Bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#3b82f6 0%,#2563eb 50%,#1d4ed8 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:36px 40px 28px;">
              <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1;">
                <span style="color:#111827;">Edu</span><span style="color:#3b82f6;">Lite</span>
              </div>
            </td>
          </tr>



          <!-- Content -->
          <tr>
            <td align="center" style="padding:0 40px 12px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">Confirmar Novo Email</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                Recebemos um pedido para alterar o email da tua conta. Introduz o código abaixo para confirmar.
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <table border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td align="center" style="background-color:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:18px 36px;">
                    <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;color:#2563eb;letter-spacing:6px;display:block;">{{ .Token }}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td align="center" style="padding:0 40px 36px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
                Este código expira em <strong style="color:#6b7280;">1 hora</strong>.<br>
                Se não fizeste esta alteração, contacta-nos imediatamente.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 40px;background-color:#f9fafb;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; 2026 EduLite — Plataforma Educativa Digital</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
```

---

## Color Reference

| Template          | Accent Color | Badge BG   | Accent Bar Gradient              |
|-------------------|-------------|------------|----------------------------------|
| Confirm Signup    | `#10b981`   | `#ecfdf5`  | Emerald/Green                    |
| Magic Link / OTP  | `#8b5cf6`   | `#f5f3ff`  | Violet/Purple                    |
| Reset Password    | `#f59e0b`   | `#fffbeb`  | Amber/Orange                     |
| Change Email      | `#3b82f6`   | `#eff6ff`  | Blue                             |

## Notes

- All templates use **table-based layout** for maximum email client compatibility (Gmail, Outlook, Apple Mail, etc.)
- **Light background** (`#f4f4f5`) with **white card** (`#ffffff`) ensures text is always visible, regardless of client dark mode settings
- Text uses **high-contrast colors** (`#111827` for headings, `#4b5563` for body) — never invisible
- Each template type has a **unique accent color** for instant visual distinction
- All 4 templates use `{{ .Token }}` (OTP code) — no URL-based confirmation links
- No external image dependencies — fully self-contained HTML
