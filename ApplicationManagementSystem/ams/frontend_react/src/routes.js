export const ROUTES = {
  root: '/',
  login: '/login',
  register: '/register',
  admin: '/admin',
  client: '/client',
  formBuilder: '/form-builder',
  applyForm: '/apply/:formId',
};

export const getDefaultRouteByRole = (role) => {
  const normalizedRole = (role || '').toLowerCase();
  return normalizedRole === 'admin' ? ROUTES.admin : ROUTES.client;
};
