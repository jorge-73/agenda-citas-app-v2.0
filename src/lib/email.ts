const RESEND_API = "https://api.resend.com/emails";
const APP_NAME = "CitasMed";
const FROM_EMAIL = process.env.EMAIL_FROM || "CitasMed <onboarding@resend.dev>";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendResendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.SMTP_PASSWORD;
  if (!apiKey) {
    console.error("SMTP_PASSWORD (Resend API key) not configured");
    return;
  }
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const safeLink = escapeHtml(resetLink);
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f4f4f8; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${APP_NAME}</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0;">Recuperación de contraseña</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hola,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>${APP_NAME}</strong>.
            Si no realizaste esta solicitud, puedes ignorar este correo.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${safeLink}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
            Este enlace expirará en 1 hora. Si el botón no funciona, copia y pega la siguiente URL en tu navegador:
          </p>
          <p style="color: #6b7280; font-size: 14px; word-break: break-all; background: #f9fafb; padding: 12px; border-radius: 8px;">
            ${safeLink}
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
            Este es un mensaje automático, por favor no respondas a este correo. &copy; ${new Date().getFullYear()} ${APP_NAME}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendResendEmail(email, "Recuperación de contraseña - CitasMed", html);
}

export async function sendBookingConfirmationEmail(data: {
  to: string;
  patientName: string;
  patientLastname: string;
  specialistName: string;
  specialty: string;
  date: string;
  time: string;
  reason?: string;
}) {
  const safePatientName = escapeHtml(data.patientName);
  const safePatientLastname = escapeHtml(data.patientLastname);
  const safeSpecialistName = escapeHtml(data.specialistName);
  const safeSpecialty = escapeHtml(data.specialty);
  const safeReason = data.reason ? escapeHtml(data.reason) : undefined;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f4f4f8; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${APP_NAME}</h1>
          <p style="color: #a7f3d0; margin: 8px 0 0;">Cita agendada exitosamente</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            Hola <strong>${safePatientName} ${safePatientLastname}</strong>,
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            Tu cita ha sido agendada exitosamente. Aquí están los detalles:
          </p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Especialista</td><td style="padding: 8px 0; color: #374151; font-weight: 600; text-align: right;">${safeSpecialistName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Especialidad</td><td style="padding: 8px 0; color: #374151; font-weight: 600; text-align: right;">${safeSpecialty}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha</td><td style="padding: 8px 0; color: #374151; font-weight: 600; text-align: right;">${data.date}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Hora</td><td style="padding: 8px 0; color: #374151; font-weight: 600; text-align: right;">${data.time}</td></tr>
              ${safeReason ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Motivo</td><td style="padding: 8px 0; color: #374151; font-weight: 600; text-align: right;">${safeReason}</td></tr>` : ""}
            </table>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
            Si necesitas cancelar o reagendar tu cita, por favor contáctanos con al menos 24 horas de anticipación.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendResendEmail(data.to, "Confirmación de cita - CitasMed", html);
}

export async function sendAppointmentStatusEmail(data: {
  to: string;
  patientName: string;
  specialistName: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}) {
  const statusColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
    CONFIRMED: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", label: "Confirmada" },
    CANCELLED: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", label: "Cancelada" },
    COMPLETED: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", label: "Completada" },
    ABSENT: { bg: "#f5f5f4", border: "#d6d3d1", text: "#44403c", label: "Inasistencia" },
  };
  const statusStyle = statusColors[data.status] || { bg: "#fefce8", border: "#fef08a", text: "#854d0e", label: data.status };

  const safePatientName = escapeHtml(data.patientName);
  const safeSpecialistName = escapeHtml(data.specialistName);
  const safeSpecialty = escapeHtml(data.specialty);
  const safeStatusLabel = escapeHtml(statusStyle.label);

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f4f4f8; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${APP_NAME}</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0;">Actualización de estado de cita</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            Hola <strong>${safePatientName}</strong>,
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            El estado de tu cita ha sido actualizado:
          </p>
          <div style="background: ${statusStyle.bg}; border: 1px solid ${statusStyle.border}; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <div style="text-align: center; margin-bottom: 16px;">
              <span style="display: inline-block; background: ${statusStyle.bg}; color: ${statusStyle.text}; padding: 6px 16px; border-radius: 999px; font-size: 14px; font-weight: 600; border: 1px solid ${statusStyle.border};">
                ${safeStatusLabel}
              </span>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Especialista</td><td style="padding: 8px 0; color: #374151; font-weight: 600; text-align: right;">${safeSpecialistName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Especialidad</td><td style="padding: 8px 0; color: #374151; font-weight: 600; text-align: right;">${safeSpecialty}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha</td><td style="padding: 8px 0; color: #374151; font-weight: 600; text-align: right;">${data.date}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Hora</td><td style="padding: 8px 0; color: #374151; font-weight: 600; text-align: right;">${data.time}</td></tr>
            </table>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendResendEmail(data.to, `Cita ${statusStyle.label.toLowerCase()} - CitasMed`, html);
}
