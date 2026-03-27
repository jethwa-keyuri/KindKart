import 'dotenv/config';

const config = {
  jwt: {
    secret: process.env.JWT_SECRET || "kindkart_super_secret_key_change_in_production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  bcrypt: {
    saltRounds: 10,
  },
};

export default config;
