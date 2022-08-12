import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      telephone: faker.phone.number("+251 91 ### ## ##"),
      password: faker.internet.password(),
    };

    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/default");
    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/first name/i).type(loginForm.firstName);
    cy.findByLabelText(/last name/i).type(loginForm.lastName);
    cy.findByLabelText(/telephone/i).type(loginForm.telephone);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();
  });

  it("should allow you to make a note", () => {
    const testNote = {
      title: faker.lorem.words(1),
      body: faker.lorem.sentences(1),
    };
    cy.login();
    cy.visitAndCheck("/default/notes");

    cy.findByRole("link", { name: /notes/i }).click();
    cy.findByText("No notes yet");

    cy.findByRole("link", { name: /\+ new note/i }).click();

    cy.findByRole("textbox", { name: /title/i }).type(testNote.title);
    cy.findByRole("textbox", { name: /body/i }).type(testNote.body);
    cy.findByRole("button", { name: /save/i }).click();

    cy.findByRole("button", { name: /delete/i }).click();

    cy.findByText("No notes yet");
  });
});
