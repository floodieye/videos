exports.register = async (req, res) => {
  try {
    // Ваша логика регистрации
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    // Ваша логика входа
    res.json({ message: "User logged in" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};