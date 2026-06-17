const request = require("supertest");

const { createServer, resetAccounts } = require("../../server");

describe("Tests d integration - API bancaire JavaScript", () => {
  beforeEach(() => {
    resetAccounts();
  });

  it("cree un compte avec un solde initial", async () => {
    const app = createServer();

    const response = await request(app)
      .post("/accounts")
      .send({
        full_name: "SHARIFATOU MALAI",
        phone_number: "699001122",
        email: "paul@example.com",
        initial_balance: 10000,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.full_name).toBe("SHARIFATOU MALAI");
    expect(response.body.phone_number).toBe("699001122");
    expect(response.body.balance).toBe(10000);
    expect(response.body.id).toBeTypeOf("string");
    expect(response.body.account_number).toMatch(/^ACC-\d{8}-[A-Z0-9]{8}$/);
  });

  it("refuse la creation si les champs obligatoires manquent", async () => {
    const app = createServer();

    const response = await request(app)
      .post("/accounts")
      .send({
        full_name: "SHARIFATOU MALAI",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      detail: "full_name et phone_number sont obligatoires.",
    });
  });

  it("retourne la liste vide des comptes au demarrage", async () => {
    const app = createServer();

    const response = await request(app).get("/accounts");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("retourne la liste des comptes apres creation", async () => {
    const app = createServer();

    await request(app)
      .post("/accounts")
      .send({
        full_name: "SHARIFATOU MALAI",
        phone_number: "699001122",
      });

    const response = await request(app).get("/accounts");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].full_name).toBe("SHARIFATOU MALAI");
    expect(response.body[0]).not.toHaveProperty("transactions");
  });

  it("effectue un depot sur un compte existant", async () => {
    const app = createServer();

    const created = await request(app)
      .post("/accounts")
      .send({
        full_name: "SHARIFATOU MALAI",
        phone_number: "699001122",
        initial_balance: 1000,
      });

    const response = await request(app)
      .post(`/accounts/${created.body.id}/deposit`)
      .send({
        amount: 2500,
        description: "Depot test",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.balance).toBe(3500);
    expect(response.body.transactions).toHaveLength(2);
    expect(response.body.transactions[1].transaction_type).toBe("deposit");
    expect(response.body.transactions[1].description).toBe("Depot test");
  });

  it("retourne le detail d un compte avec son historique", async () => {
    const app = createServer();

    const created = await request(app)
      .post("/accounts")
      .send({
        full_name: "SHARIFATOU MALAI",
        phone_number: "699001122",
        initial_balance: 1000,
      });

    await request(app)
      .post(`/accounts/${created.body.id}/deposit`)
      .send({
        amount: 500,
      });

    const response = await request(app)
      .get(`/accounts/${created.body.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(created.body.id);
    expect(response.body.balance).toBe(1500);
    expect(response.body.transactions).toHaveLength(2);
  });

  it("effectue un retrait valide", async () => {
    const app = createServer();

    const created = await request(app)
      .post("/accounts")
      .send({
        full_name: "SHARIFATOU MALAI",
        phone_number: "699001122",
        initial_balance: 3000,
      });

    const response = await request(app)
      .post(`/accounts/${created.body.id}/withdraw`)
      .send({
        amount: 1200,
        description: "Retrait test",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.balance).toBe(1800);
    expect(response.body.transactions).toHaveLength(2);
    expect(response.body.transactions[1].transaction_type).toBe("withdraw");
    expect(response.body.transactions[1].description).toBe("Retrait test");
  });

  it("refuse un retrait si le solde est insuffisant", async () => {
    const app = createServer();

    const created = await request(app)
      .post("/accounts")
      .send({
        full_name: "SHARIFATOU MALAI",
        phone_number: "699001122",
        initial_balance: 500,
      });

    const response = await request(app)
      .post(`/accounts/${created.body.id}/withdraw`)
      .send({
        amount: 1200,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      detail: "Solde insuffisant pour effectuer ce retrait.",
    });
  });

  it("retourne 404 pour un compte introuvable", async () => {
    const app = createServer();

    const response = await request(app)
      .get("/accounts/00000000-0000-0000-0000-000000000000");

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      detail: "Compte introuvable.",
    });
  });

  it("retourne l historique des transactions d un compte", async () => {
    const app = createServer();

    const created = await request(app)
      .post("/accounts")
      .send({
        full_name: "SHARIFATOU MALAI",
        phone_number: "699001122",
        initial_balance: 1000,
      });

    await request(app)
      .post(`/accounts/${created.body.id}/deposit`)
      .send({
        amount: 400,
      });

    await request(app)
      .post(`/accounts/${created.body.id}/withdraw`)
      .send({
        amount: 250,
      });

    const response = await request(app)
      .get(`/accounts/${created.body.id}/transactions`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body.map((tx) => tx.transaction_type)).toEqual([
      "deposit",
      "deposit",
      "withdraw",
    ]);
  });
});
