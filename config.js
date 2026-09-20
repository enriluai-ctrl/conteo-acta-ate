const CONFIG = {
  apiBaseUrl: 'https://conteo-acta-google-mfovgjvtdq-uc.a.run.app',
};

function loginUrl() {
  return 'login.html';
}

function logoutUrl() {
  return 'login.html';
}

function token() {
  return sessionStorage.getItem('idToken') || '';
}

function _tokenExpirado() {
  const t = token();
  if (!t) return true;
  try {
    const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 < Date.now() + 30000;
  } catch (_) {
    return true;
  }
}

function api(path, opciones = {}) {
  if (_tokenExpirado()) {
    sessionStorage.removeItem('idToken');
    window.location = loginUrl();
    throw new Error('Sesión expirada, redirigiendo al login...');
  }
  return fetch(CONFIG.apiBaseUrl + path, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token(),
      ...(opciones.headers || {}),
    },
  }).then(async (r) => {
    if (r.status === 401) {
      sessionStorage.removeItem('idToken');
      window.location = loginUrl();
      throw new Error('sesion expirada');
    }
    const datos = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(datos.mensaje || `Error ${r.status}`);
    return datos;
  });
}
