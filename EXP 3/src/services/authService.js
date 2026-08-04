const USERS_KEY = "securespace.users";
const SESSION_KEY = "securespace.session";
const defaults = [{ id: "admin-1", username: "admin", password: "1234", name: "Alex Morgan", email: "alex@securespace.demo", role: "Administrator", joinedAt: "2026-01-10T10:00:00.000Z" }];

const users = () => JSON.parse(localStorage.getItem(USERS_KEY) || JSON.stringify(defaults));
const saveUsers = (value) => localStorage.setItem(USERS_KEY, JSON.stringify(value));
const makeToken = (user) => window.btoa(JSON.stringify({ sub: user.id, username: user.username, role: user.role }));

export function register({ name, email, username, password }) {
  const all = users();
  if (all.some((user) => user.username.toLowerCase() === username.trim().toLowerCase())) return { error: "That username is already in use." };
  if (all.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())) return { error: "That email is already registered." };
  const user = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), username: username.trim(), password, role: "Member", joinedAt: new Date().toISOString() };
  saveUsers([...all, user]);
  return createSession(user, false);
}

function createSession(user, remember) {
  const safeUser = { ...user }; delete safeUser.password;
  const session = { token: makeToken(user), user: safeUser, expiresAt: Date.now() + (remember ? 30 * 86400000 : 3600000), activity: ["Signed in successfully", "Security settings verified", "Workspace access granted"] };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { session };
}

export function login(username, password, remember) {
  const user = users().find((item) => item.username.toLowerCase() === username.trim().toLowerCase() && item.password === password);
  return user ? createSession(user, remember) : { error: "The username or password is incorrect." };
}
export function resetPassword({ username, email, password }) {
  const all = users();
  const index = all.findIndex((user) => user.username.toLowerCase() === username.trim().toLowerCase() && user.email.toLowerCase() === email.trim().toLowerCase());
  if (index < 0) return { error: "We could not find an account with those details." };
  all[index] = { ...all[index], password };
  saveUsers(all);
  return { success: "Password updated. You can now sign in." };
}

export function getSession() {
  try { const session = JSON.parse(localStorage.getItem(SESSION_KEY)); if (!session || session.expiresAt < Date.now()) { localStorage.removeItem(SESSION_KEY); return null; } return session; } catch { return null; }
}
export function updateProfile(values) {
  const session = getSession(); if (!session) return { error: "Your session has expired." };
  const all = users(); const index = all.findIndex((user) => user.id === session.user.id);
  if (index < 0) return { error: "Account not found." };
  if (all.some((user) => user.id !== session.user.id && user.email.toLowerCase() === values.email.trim().toLowerCase())) return { error: "That email is already used by another account." };
  all[index] = { ...all[index], name: values.name.trim(), email: values.email.trim() }; saveUsers(all);
  const user = { ...all[index] }; delete user.password; const next = { ...session, user }; localStorage.setItem(SESSION_KEY, JSON.stringify(next)); return { session: next };
}
export function logout() { localStorage.removeItem(SESSION_KEY); }
