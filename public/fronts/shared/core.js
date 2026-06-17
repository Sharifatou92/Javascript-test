const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(value) {
  return `${moneyFormatter.format(Number(value || 0))} XAF`;
}

export async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail || `Erreur HTTP ${response.status}`);
  }

  return data;
}

export function createStore() {
  return {
    accounts: [],
    selectedAccountId: "",
    selectedAccount: null,
  };
}

export async function refreshAccounts(store) {
  store.accounts = await api("/accounts");
  if (store.selectedAccountId) {
    const exists = store.accounts.some((account) => account.id === store.selectedAccountId);
    if (!exists) {
      store.selectedAccountId = "";
      store.selectedAccount = null;
    }
  }
  return store.accounts;
}

export async function loadAccount(store, accountId) {
  if (!accountId) {
    throw new Error("Identifiant de compte manquant.");
  }
  store.selectedAccountId = accountId;
  store.selectedAccount = await api(`/accounts/${accountId}`);
  return store.selectedAccount;
}

export function computeStats(accounts, selectedAccount) {
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
  const transactionCount = selectedAccount?.transactions?.length || 0;
  return {
    count: accounts.length,
    totalBalance,
    selectedLabel: selectedAccount ? selectedAccount.account_number : "Aucun",
    transactionCount,
  };
}

export async function createAccount(payload) {
  return api("/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function postTransaction(accountId, type, payload) {
  return api(`/accounts/${accountId}/${type}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
