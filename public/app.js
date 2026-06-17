const state = {
  accounts: [],
  selectedAccountId: "",
  selectedAccount: null,
};

const accountListEl = document.getElementById("account-list");
const detailEl = document.getElementById("account-detail");
const transactionsEl = document.getElementById("transactions");
const statusEl = document.getElementById("status");

function setStatus(message, tone = "") {
  statusEl.className = `status ${tone}`.trim();
  statusEl.textContent = message || "";
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.erreur || `Erreur HTTP ${response.status}`);
  }

  return data;
}

function money(value) {
  return `${Number(value || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XAF`;
}

function renderStats() {
  const balances = state.accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
  document.getElementById("stat-count").textContent = String(state.accounts.length);
  document.getElementById("stat-balance").textContent = money(balances);
  document.getElementById("stat-selected").textContent = state.selectedAccount ? state.selectedAccount.account_number : "Aucun";
}

function renderAccounts() {
  if (!state.accounts.length) {
    accountListEl.innerHTML = '<div class="empty">Aucun compte charge pour le moment.</div>';
    return;
  }

  accountListEl.innerHTML = state.accounts.map((account) => `
    <article class="account-row">
      <div>
        <h4>${account.full_name}</h4>
        <p>${account.account_number}</p>
        <p>${account.phone_number}${account.email ? ` · ${account.email}` : ""}</p>
      </div>
      <div class="account-actions">
        <strong>${money(account.balance)}</strong>
        <button class="button" data-select="${account.id}">Ouvrir</button>
      </div>
    </article>
  `).join("");

  accountListEl.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById("selected-account-id").value = button.dataset.select;
      loadAccount(button.dataset.select);
    });
  });
}

function renderDetail() {
  if (!state.selectedAccount) {
    detailEl.innerHTML = '<div class="empty">Selectionne un compte pour afficher ses details.</div>';
    transactionsEl.innerHTML = '<div class="empty">Les transactions apparaitront ici.</div>';
    renderStats();
    return;
  }

  const account = state.selectedAccount;
  detailEl.innerHTML = `
    <div class="detail-block">
      <h4>${account.full_name}</h4>
      <p>${account.account_number}</p>
      <p>${account.phone_number}${account.email ? ` · ${account.email}` : ""}</p>
      <p>Solde actuel : <strong>${money(account.balance)}</strong></p>
      <p>Creation : ${new Date(account.created_at).toLocaleString("fr-FR")}</p>
    </div>
  `;

  if (!account.transactions?.length) {
    transactionsEl.innerHTML = '<div class="empty">Aucune transaction enregistree.</div>';
    renderStats();
    return;
  }

  transactionsEl.innerHTML = account.transactions.map((transaction) => `
    <div class="txn-block ${transaction.transaction_type === "withdraw" ? "withdraw" : ""}">
      <h4>${transaction.transaction_type}</h4>
      <p>Montant : ${money(transaction.amount)}</p>
      <p>Solde apres operation : ${money(transaction.balance_after)}</p>
      <p>${transaction.description || "Sans description"}</p>
      <p>${new Date(transaction.created_at).toLocaleString("fr-FR")}</p>
    </div>
  `).join("");

  renderStats();
}

async function refreshAccounts(preserveSelection = true) {
  state.accounts = await api("/accounts");
  renderAccounts();
  if (preserveSelection && state.selectedAccountId) {
    const exists = state.accounts.some((account) => account.id === state.selectedAccountId);
    if (exists) {
      await loadAccount(state.selectedAccountId, false);
      return;
    }
  }
  state.selectedAccountId = "";
  state.selectedAccount = null;
  renderDetail();
}

async function loadAccount(accountId, showStatus = true) {
  if (!accountId) {
    setStatus("Entre un identifiant de compte.", "error");
    return;
  }
  state.selectedAccountId = accountId;
  state.selectedAccount = await api(`/accounts/${accountId}`);
  renderDetail();
  if (showStatus) {
    setStatus("Compte charge.", "success");
  }
}

document.getElementById("create-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);

  try {
    setStatus("Creation du compte...");
    const payload = {
      full_name: form.get("full_name"),
      phone_number: form.get("phone_number"),
      email: form.get("email") || undefined,
      initial_balance: form.get("initial_balance") || 0,
    };
    const created = await api("/accounts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    event.currentTarget.reset();
    await refreshAccounts(false);
    document.getElementById("selected-account-id").value = created.id;
    await loadAccount(created.id, false);
    setStatus("Compte cree avec succes.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

document.getElementById("selected-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await loadAccount(document.getElementById("selected-account-id").value);
  } catch (error) {
    setStatus(error.message, "error");
  }
});

document.getElementById("deposit-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    setStatus("Depot en cours...");
    await api(`/accounts/${form.get("account_id")}/deposit`, {
      method: "POST",
      body: JSON.stringify({
        amount: form.get("amount"),
        description: form.get("description"),
      }),
    });
    await refreshAccounts();
    setStatus("Depot enregistre.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

document.getElementById("withdraw-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    setStatus("Retrait en cours...");
    await api(`/accounts/${form.get("account_id")}/withdraw`, {
      method: "POST",
      body: JSON.stringify({
        amount: form.get("amount"),
        description: form.get("description"),
      }),
    });
    await refreshAccounts();
    setStatus("Retrait enregistre.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

document.getElementById("refresh-button").addEventListener("click", async () => {
  try {
    setStatus("Synchronisation...");
    await refreshAccounts();
    setStatus("Liste actualisee.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

refreshAccounts(false).catch((error) => setStatus(error.message, "error"));
