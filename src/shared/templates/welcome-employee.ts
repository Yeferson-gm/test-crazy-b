export const welcomeEmployeeTemplate = (data: {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: string;
	storeName?: string;
}) => {
	return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Crazy Shop</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">¡Bienvenido a Crazy Shop!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-top: 0;">
                Hola <strong>${data.firstName} ${data.lastName}</strong>,
              </p>

              <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                Se ha creado una cuenta para ti en el sistema POS Crazy Shop con el rol de <strong>${getRoleLabel(data.role)}</strong>${data.storeName ? ` en la tienda <strong>${data.storeName}</strong>` : ""}.
              </p>

              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="color: #667eea; margin-top: 0; margin-bottom: 15px; font-size: 18px;">
                  Tus credenciales de acceso:
                </h3>
                <p style="margin: 10px 0; font-size: 15px; color: #555;">
                  <strong>Email:</strong> ${data.email}
                </p>
                <p style="margin: 10px 0; font-size: 15px; color: #555;">
                  <strong>Contraseña temporal:</strong> <code style="background-color: #e9ecef; padding: 4px 8px; border-radius: 3px; font-size: 14px;">${data.password}</code>
                </p>
              </div>

              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
                </p>
              </div>

              <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al administrador del sistema.
              </p>

              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 0;">
                Saludos,<br>
                <strong>El equipo de Crazy Shop</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #6c757d;">
                Este es un correo automático, por favor no responder.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">
                &copy; ${new Date().getFullYear()} Crazy Shop POS. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

function getRoleLabel(role: string): string {
	const roles: Record<string, string> = {
		admin: "Administrador",
		manager: "Gerente",
		cashier: "Cajero",
	};
	return roles[role] || role;
}
