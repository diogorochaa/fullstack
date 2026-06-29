import "./load-env.js";

const readEnv = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

export const env = {
  databaseUrl: readEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/kafka_lab?schema=public"),
  kafkaBrokers: readEnv("KAFKA_BROKERS", "localhost:9092")
    .split(",")
    .map((broker) => broker.trim())
    .filter(Boolean),
  apiPort: Number(readEnv("API_PORT", "3333"))
};
