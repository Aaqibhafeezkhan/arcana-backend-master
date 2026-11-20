const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateRegistrationInput,
  validateLoginInput,
} = require("../utils/authValidation");

test("registration accepts valid fields", () => {
  assert.equal(
    validateRegistrationInput({ name: "Amina Yusuf", email: "amina@example.com", password: "secure123" }),
    null
  );
});

test("registration rejects missing, non-string, or blank names", () => {
  for (const name of [undefined, null, "", "   ", 42]) {
    assert.equal(
      validateRegistrationInput({ name, email: "amina@example.com", password: "secure123" }),
      "Name is required and must be a non-empty string"
    );
  }
});

test("registration rejects missing or malformed email addresses", () => {
  for (const email of [undefined, null, "", "   ", "not-an-email", "amina@", "@example.com"]) {
    assert.notEqual(
      validateRegistrationInput({ name: "Amina", email, password: "secure123" }),
      null
    );
  }
});

test("registration rejects missing and short passwords", () => {
  for (const password of [undefined, null, "", "   ", "short7"]) {
    assert.notEqual(
      validateRegistrationInput({ name: "Amina", email: "amina@example.com", password }),
      null
    );
  }
  assert.equal(
    validateRegistrationInput({ name: "Amina", email: "amina@example.com", password: "12345678" }),
    null
  );
});

test("login requires a non-empty identifier and password", () => {
  for (const identifier of [undefined, null, "", "   ", 123]) {
    assert.equal(
      validateLoginInput({ identifier, password: "secure123" }),
      "Identifier is required"
    );
  }

  for (const password of [undefined, null, "", "   "]) {
    assert.equal(
      validateLoginInput({ identifier: "amina@example.com", password }),
      "Password is required"
    );
  }

  assert.equal(
    validateLoginInput({ identifier: "amina@example.com", password: "x" }),
    null
  );
});
