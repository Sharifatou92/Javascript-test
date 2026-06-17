const STORAGE_KEY = "banking_front_session_v1";

const profiles = {
  bootstrap: {
    front: "bootstrap",
    displayName: "Sharifatou Malai",
    role: "Operations Console",
    username: "sharifatou",
    password: "Sharifa304",
    loginPath: "/bootstrap/login",
    appPath: "/bootstrap",
  },
  workbench: {
    front: "workbench",
    displayName: "Thierry Martin",
    role: "Treasury Workbench",
    username: "thierry",
    password: "Thierry304",
    loginPath: "/workbench/login",
    appPath: "/workbench",
  },
  portfolio: {
    front: "portfolio",
    displayName: "Paul Koa",
    role: "Client Portfolio",
    username: "paulkoa",
    password: "Paul304",
    loginPath: "/portfolio/login",
    appPath: "/portfolio",
  },
};

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function setSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function redirectTo(path) {
  window.location.replace(path);
}

function ensureLoggedOutFront(front) {
  const session = getSession();
  if (session?.front === front) {
    redirectTo(profiles[front].appPath);
  }
}

function requireAuth(front) {
  const session = getSession();
  if (!session || session.front !== front) {
    redirectTo(profiles[front].loginPath);
    return null;
  }
  return session;
}

function login(front, username, password) {
  const profile = profiles[front];
  if (!profile) {
    throw new Error("Front inconnu.");
  }
  if (username !== profile.username || password !== profile.password) {
    throw new Error("Identifiants invalides.");
  }

  const session = {
    front: profile.front,
    displayName: profile.displayName,
    role: profile.role,
    username: profile.username,
    loggedAt: new Date().toISOString(),
  };

  setSession(session);
  return session;
}

function logout(front) {
  clearSession();
  redirectTo(profiles[front]?.loginPath || "/");
}

function wireLogin(front, { formId = "login-form", statusId = "login-status" } = {}) {
  ensureLoggedOutFront(front);
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    try {
      login(front, String(data.get("username") || "").trim(), String(data.get("password") || ""));
      if (status) {
        status.textContent = "Connexion validee. Redirection...";
      }
      redirectTo(profiles[front].appPath);
    } catch (error) {
      if (status) {
        status.textContent = error.message;
      }
    }
  });
}

function mountSession(front, {
  nameId = "session-name",
  roleId = "session-role",
  badgeId = "session-badge",
  logoutId = "logout-button",
} = {}) {
  const session = requireAuth(front);
  if (!session) {
    return null;
  }

  const nameEl = document.getElementById(nameId);
  const roleEl = document.getElementById(roleId);
  const badgeEl = document.getElementById(badgeId);
  const logoutEl = document.getElementById(logoutId);

  if (nameEl) nameEl.textContent = session.displayName;
  if (roleEl) roleEl.textContent = session.role;
  if (badgeEl) badgeEl.textContent = `${session.displayName} · session locale`;
  if (logoutEl) logoutEl.addEventListener("click", () => logout(front));

  return session;
}

export {
  mountSession,
  wireLogin,
};
