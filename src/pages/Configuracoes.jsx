import { useState, useEffect } from 'react'
import { Trash2, RotateCcw, ShieldAlert, ArchiveRestore, Flame } from 'lucide-react'

function Configuracoes({ token }) {
  const [lixeira, setLixeira] = useState([])
  const [carregando, setCarregando] = useState(true)

  const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'

  const carregarLixeira = () => {
    setCarregando(true)
    fetch(apiUrl + '/produtos/lixeira', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setLixeira(data))
    .catch(err => console.log(err))
    .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregarLixeira()
  }, [token])

  const handleRestaurar = (id) => {
    fetch(apiUrl + `/produtos/${id}/restaurar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (res.ok) {
        alert("✅ Produto restaurado com sucesso!")
        carregarLixeira()
      }
    })
  }

  // NOVO: Hard Delete
  const handleApagarPermanente = (id, nome) => {
    if (!window.confirm(`⚠️ ATENÇÃO! Tem certeza que deseja apagar o produto "${nome}" PARA SEMPRE? Essa ação não pode ser desfeita.`)) return;

    fetch(apiUrl + `/produtos/${id}/permanente`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (res.ok) {
        alert("💥 Produto apagado permanentemente da base de dados!")
        carregarLixeira()
      } else {
        alert("❌ Erro ao apagar permanentemente.")
      }
    })
  }

  const handleResetFinanceiro = () => {
    // Trocamos o prompt() problemático pelo confirm()
    const confirmacao = window.confirm("⚠️ ZONA DE PERIGO!\nIsso vai apagar TODO o seu histórico de Vendas, Compras e Fluxo de Caixa.\n\nTem certeza absoluta que deseja ZERAR O SISTEMA?");
    
    if (confirmacao) {
      alert(`Enviando pedido para: ${apiUrl}/produtos/reset-financeiro`); 
      
      fetch(apiUrl + '/produtos/reset-financeiro', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) {
          alert("🚀 Histórico financeiro resetado com sucesso! Seus lucros voltaram a zero.")
          window.location.reload(); 
        } else {
          alert(`❌ O servidor rejeitou o pedido! Erro HTTP: ${res.status}`);
        }
      })
      .catch(err => {
        console.error("Erro detalhado:", err);
        alert(`❌ Erro de Rede! O React não alcançou o Java.\nMotivo: ${err.message}`);
      });
    } else {
      alert("Operação cancelada com segurança.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie preferências e itens arquivados.</p>
      </div>

      {/* BLOCO: LIXEIRA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
            <Trash2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Lixeira (Soft Delete)</h2>
            <p className="text-sm text-slate-500">Produtos inativados para preservar o histórico.</p>
          </div>
        </div>

        <div className="p-6">
          {carregando ? (
            <p className="text-slate-400 text-center py-4">Buscando itens inativos...</p>
          ) : lixeira.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <ShieldAlert size={40} className="mb-3 text-slate-300" />
              <p className="font-medium">A lixeira está vazia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lixeira.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-700">{p.nome}</p>
                    <p className="text-xs text-slate-400 uppercase">{p.categoria?.nome || 'Sem categoria'}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRestaurar(p.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 hover:text-blue-600 transition-colors"
                    >
                      <ArchiveRestore size={16} />
                      Restaurar
                    </button>

                    <button 
                      onClick={() => handleApagarPermanente(p.id, p.nome)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                      Apagar de Vez
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BLOCO: ZONA DE PERIGO (RESET FINANCEIRO) */}
      <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-200 flex items-center gap-3">
          <div className="p-2 bg-red-200 text-red-700 rounded-lg">
            <Flame size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-800">Zona de Perigo</h2>
            <p className="text-sm text-red-600/80">Ações irreversíveis que afetam o banco de dados.</p>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-red-800">Zerar Histórico Financeiro</h3>
            <p className="text-sm text-red-600 max-w-lg">
              Isso apaga todas as transações, compras, vendas e zera a aba Lucro. Seus produtos e quantidades em estoque não serão alterados.
            </p>
          </div>
          <button 
            onClick={handleResetFinanceiro}
            className="shrink-0 px-5 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm"
          >
            Resetar Financeiro
          </button>
        </div>
      </div>

    </div>
  )
}

export default Configuracoes