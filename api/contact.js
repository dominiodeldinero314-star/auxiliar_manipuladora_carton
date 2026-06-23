export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(302, { Location: '/contacto.html' });
    return res.end();
  }

  const { nombre, empresa, email, telefono, tipo_embalaje, mensaje } = req.body || {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nombre || !mensaje || !emailRegex.test(email || '')) {
    res.writeHead(302, { Location: '/contacto.html?contacto=error#formulario' });
    return res.end();
  }

  // TODO: sustituir por el email real de la empresa una vez confirmado por el cliente.
  const destinatario = process.env.CONTACT_TO_EMAIL || 'info@auxiliarmanipuladoradelcarton.com';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // TODO: cambiar a un remitente del dominio verificado en Resend cuando esté disponible.
        from: 'Web Auxiliar Manipuladora del Cartón <onboarding@resend.dev>',
        to: destinatario,
        reply_to: email,
        subject: `Nueva consulta desde la web - ${nombre}`,
        text: `Nombre: ${nombre}\nEmpresa: ${empresa || ''}\nEmail: ${email}\nTeléfono: ${telefono || ''}\nTipo de embalaje: ${tipo_embalaje || ''}\n\nMensaje:\n${mensaje}`,
      }),
    });

    if (!response.ok) throw new Error(`Resend respondió ${response.status}`);

    res.writeHead(302, { Location: '/contacto.html?contacto=ok#formulario' });
    return res.end();
  } catch (err) {
    console.error('Error enviando email de contacto:', err);
    res.writeHead(302, { Location: '/contacto.html?contacto=error#formulario' });
    return res.end();
  }
}
