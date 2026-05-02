const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function postJson(path, body) {
  console.log(`📤 Envoi à ${API_BASE_URL}${path}:`, body);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log(
      `📥 Réponse du serveur [${response.status}]:`,
      response.statusText,
    );

    const data = await response.json().catch(() => null);
    console.log("📦 Données reçues:", data);

    if (!response.ok) {
      // Si c'est une erreur de validation Pydantic, afficher les détails
      if (Array.isArray(data?.detail)) {
        const errors = data.detail
          .map((e) => `${e.loc.join(".")}: ${e.msg}`)
          .join(", ");
        throw new Error(errors);
      }
      throw new Error(
        data?.detail ||
          data?.message ||
          response.statusText ||
          "Erreur serveur",
      );
    }

    return data;
  } catch (error) {
    console.error("❌ Erreur API:", error);
    throw error;
  }
}

export async function registerUser(payload) {
  return postJson("/register", payload);
}

export async function loginUser(payload) {
  return postJson("/login", payload);
}
