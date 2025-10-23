import '../style.css'

export default function Header(){
    return(
        <>
         <header>
        <div className="brand">
          <div className="logo">
            <img src="logo.png" alt="imagem" />
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '18px',
                color: 'var(--brown)',
              }}
            >
              Sorvetrix
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(107,63,63,0.7)',
              }}
            >
              Sistema de Gerenciamento — mockups
            </div>
          </div>
        </div>

        <nav id="nav">
          <button data-screen="dashboard">Dashboard</button>
          <button data-screen="stock">Estoque</button>
          <button data-screen="flavors">Sabores</button>
          <button data-screen="orders">Pedidos</button>
        </nav>
      </header>
        </>
    )
}