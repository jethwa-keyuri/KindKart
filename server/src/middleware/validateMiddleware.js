// Validates req.body against a Zod schema; returns 400 with error details on failure
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }

  req.body = result.data; // use the parsed (and defaulted) data
  next();
};
