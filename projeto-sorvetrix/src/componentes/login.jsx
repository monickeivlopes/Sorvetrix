import '../style.css';
import Header from './header';

export default function Login() {
  const switchTo = (screen) => {
    console.log(`Trocar para tela: ${screen}`);
    // Aqui você pode colocar a lógica de navegação ou de troca de estado
  };

  return (
    <>
     <Header/>

      <section id="login" className="screen show">
        <div className="drip" style={{ top: '-20px' }}></div>
        <div className="layout" style={{ height: '100%' }}>
          <div
            className="left card"
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '42px',
                  fontWeight: 800,
                  color: 'var(--pink-strong)',
                }}
              >
                Bem-vindo(a)!
              </div>
              <p
                style={{
                  color: 'rgba(107,63,63,0.7)',
                  maxWidth: '420px',
                  margin: '12px auto',
                }}
              >
                Gerencie estoque, pedidos e relatórios da sua sorveteria com
                carinho. Faça login para continuar.
              </p>
              <div style={{ marginTop: '18px' }}>
                <button
                  className="btn"
                  onClick={() => switchTo('dashboard')}
                >
                  Entrar — Ver Dashboard
                </button>
              </div>
            </div>
          </div>

          <div
            className="right card"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '100%', maxWidth: '380px' }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '32px',
                  color: 'var(--brown)',
                  marginBottom: '12px',
                }}
              >
                Entrar
              </div>
              <label>E-mail</label>
              <input placeholder="seu@email.com" />
              <label style={{ marginTop: '10px' }}>Senha</label>
              <input type="password" placeholder="••••••••" />
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '18px',
                }}
              >
                <button className="btn" style={{ flex: 1 }}>
                  Entrar
                </button>
                <button className="ghost" style={{ flex: 1 }}>
                  Esqueci
                </button>
              </div>
              <div
                style={{
                  marginTop: '12px',
                  textAlign: 'center',
                  color: 'rgba(107,63,63,0.6)',
                }}
              >
                Feito com carinho e açúcar ♡
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
