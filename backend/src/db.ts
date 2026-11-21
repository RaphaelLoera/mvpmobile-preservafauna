import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL não configurada");
}

const databaseUrl = new URL(connectionString);
databaseUrl.searchParams.delete("sslmode");

export const pool = new pg.Pool({
	connectionString: databaseUrl.toString(),
	ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" },
});

pool.on("error", (error) => {
	console.error("Erro inesperado no pool do PostgreSQL", error);
});
