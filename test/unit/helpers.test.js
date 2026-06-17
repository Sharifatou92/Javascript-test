const {
  round,
  generateAccountNumber,
  accountSummary,
  accountDetails,
  findAccount,
  resetAccounts,
  accounts,
} = require("../../server");

describe("Tests unitaires - fonctions utilitaires", () => {
  beforeEach(() => {
    resetAccounts();
  });

  it("arrondit un montant a deux decimales", () => {
    expect(round(1250.456)).toBe(1250.46);
    expect(round("12.994")).toBe(12.99);
  });

  it("genere un numero de compte au bon format", () => {
    const accountNumber = generateAccountNumber();

    expect(accountNumber).toMatch(/^ACC-\d{8}-[A-Z0-9]{8}$/);
  });

  it("retourne un resume de compte sans transactions", () => {
    const account = {
      id: "acc-1",
      account_number: "ACC-20260610-ABCDEFGH",
      full_name: "SHARIFATOU MALAI",
      phone_number: "699001122",
      email: "paul@example.com",
      balance: 5000,
      created_at: "2026-06-10T00:00:00.000Z",
      transactions: [{ transaction_type: "deposit" }],
    };

    expect(accountSummary(account)).toEqual({
      id: "acc-1",
      account_number: "ACC-20260610-ABCDEFGH",
      full_name: "SHARIFATOU MALAI",
      phone_number: "699001122",
      email: "paul@example.com",
      balance: 5000,
      created_at: "2026-06-10T00:00:00.000Z",
    });
  });

  it("retourne le detail d un compte avec transactions", () => {
    const account = {
      id: "acc-1",
      account_number: "ACC-20260610-ABCDEFGH",
      full_name: "SHARIFATOU MALAI",
      phone_number: "699001122",
      email: null,
      balance: 5000,
      created_at: "2026-06-10T00:00:00.000Z",
      transactions: [{ transaction_type: "deposit", amount: 5000 }],
    };

    expect(accountDetails(account)).toEqual({
      id: "acc-1",
      account_number: "ACC-20260610-ABCDEFGH",
      full_name: "SHARIFATOU MALAI",
      phone_number: "699001122",
      email: null,
      balance: 5000,
      created_at: "2026-06-10T00:00:00.000Z",
      transactions: [{ transaction_type: "deposit", amount: 5000 }],
    });
  });

  it("retrouve un compte par son identifiant", () => {
    accounts.push(
      { id: "acc-1", full_name: "Compte 1" },
      { id: "acc-2", full_name: "Compte 2" },
    );

    expect(findAccount("acc-2")).toEqual({
      id: "acc-2",
      full_name: "Compte 2",
    });
    expect(findAccount("absent")).toBeUndefined();
  });
});
