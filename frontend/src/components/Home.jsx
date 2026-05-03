export function Home({ user, onLogout }) {
  const userName = user.fullName || user.email || 'Utilisateur'

  return (
    <section className="home-page">
      <div className="home-card">
        <h2>Bienvenue, {userName} !</h2>
        <p>Tu es maintenant connecté(e). Voici tes informations :</p>

        <div className="home-info">
          {user.fullName && (
            <p>
              <strong>Nom :</strong> {user.fullName}
            </p>
          )}
          <p>
            <strong>Email :</strong> {user.email}
          </p>
        </div>

        <button type="button" onClick={onLogout}>
          Se déconnecter
        </button>
      </div>
    </section>
  )
}
