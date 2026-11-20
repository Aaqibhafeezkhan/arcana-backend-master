const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegistrationInput = ({ name, email, password } = {}) => {
  if (typeof name !== "string" || name.trim().length === 0) {
    return "Name is required and must be a non-empty string";
  }

  if (typeof email !== "string" || email.trim().length === 0) {
    return "Email is required";
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Please provide a valid email address";
  }

  if (typeof password !== "string" || password.trim().length === 0) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  return null;
};

const validateLoginInput = ({ identifier, password } = {}) => {
  if (typeof identifier !== "string" || identifier.trim().length === 0) {
    return "Identifier is required";
  }

  if (typeof password !== "string" || password.trim().length === 0) {
    return "Password is required";
  }

  return null;
};

module.exports = { validateRegistrationInput, validateLoginInput };
