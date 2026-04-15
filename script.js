// ----------------------
// LOGIN / CADASTRO
// ----------------------
function mostrarCadastro() {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("cadastro-container").style.display = "block";
}

function mostrarLogin() {
  document.getElementById("login-container").style.display = "block";
  document.getElementById("cadastro-container").style.display = "none";
}

function cadastrar() {
  const usuario = document.getElementById("cad-usuario").value.trim();
  const senha = document.getElementById("cad-senha").value.trim();
  if(!usuario || !senha){ alert("Preencha todos os campos"); return; }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  if(usuarios.find(u => u.usuario === usuario)){ alert("Usuário já existe!"); return; }

  usuarios.push({usuario, senha});
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  alert("Cadastro feito com sucesso!");
  mostrarLogin();
}

function entrar() {
  const usuario = document.getElementById("login-usuario").value.trim();
  const senha = document.getElementById("login-senha").value.trim();
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioValido = usuarios.find(u => u.usuario === usuario && u.senha === senha);

  if(usuarioValido){
    localStorage.setItem("usuarioAtual", usuario);
    document.getElementById("login-container").style.display = "none";
    document.getElementById("cadastro-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    carregarPedidos();
    iniciarCicloAutomatico();
  } else { 
    alert("Usuário ou senha inválidos"); 
  }
}

function logout() {
  localStorage.removeItem("usuarioAtual");
  document.getElementById("app-container").style.display = "none";
  document.getElementById("login-container").style.display = "block";
}

// ----------------------
// PEDIDOS E STATUS
// ----------------------
function carregarPedidos() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
  const usuarioAtual = localStorage.getItem("usuarioAtual");
  const todosPedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const pedidos = todosPedidos.filter(p => p.usuario === usuarioAtual);

  pedidos.forEach((p) => {
    const div = document.createElement("div");
    div.className = "card";

    // Progresso contínuo e suave
    let progressPercent = Math.floor(((p.statusIndex + (p.tempoAtual / p.duracaoEtapa)) / (p.etapas.length -1)) * 100);
    progressPercent = Math.min(progressPercent, 100);

    div.innerHTML = `
      <p><strong>Nome:</strong> ${p.nome}</p>
      <p><strong>Serviço:</strong> ${p.servico.replace(/\+/g," + ")}</p>
      <p><strong>Máquina:</strong> ${p.maquina}</p>
      <p><strong>Status:</strong> ${p.status}</p>
      <div class="progress-bar"><div class="progress" style="width:${progressPercent}%">${progressPercent}%</div></div>
      ${p.statusIndex === 0 ? `<button onclick="removerPedido('${p.id}')">Excluir</button>` : ""}
    `;
    lista.appendChild(div);
  });
}

function adicionarPedido() {
  const nome = document.getElementById("nome-pedido").value.trim();
  const servico = document.getElementById("servico").value;
  const maquina = document.getElementById("maquina").value.trim();
  const usuarioAtual = localStorage.getItem("usuarioAtual");

  if(!nome || !maquina){ alert("Preencha nome e número da máquina!"); return; }

  let etapas = ["Em espera"];
  if(servico.includes("lavagem")) etapas.push("Lavando");
  if(servico.includes("secagem")) etapas.push("Secando");
  if(servico.includes("passar")) etapas.push("Passando");
  etapas.push("Finalizado");

  const todosPedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  todosPedidos.push({
    id: Date.now().toString(), // ID único
    usuario: usuarioAtual,
    nome,
    servico,
    maquina,
    etapas,
    statusIndex:0,
    status:"Em espera",
    tempoAtual:0,
    duracaoEtapa:10
  });

  localStorage.setItem("pedidos", JSON.stringify(todosPedidos));
  document.getElementById("nome-pedido").value = "";
  document.getElementById("maquina").value = "";
  document.getElementById("servico").value = "lavagem";
  carregarPedidos();
}

function removerPedido(id) {
  let todosPedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  todosPedidos = todosPedidos.filter(p => p.id !== id);
  localStorage.setItem("pedidos", JSON.stringify(todosPedidos));
  carregarPedidos();
}

// ----------------------
// CICLO AUTOMÁTICO COM PROGRESSO
// ----------------------
let cicloInterval;
function iniciarCicloAutomatico() {
  if(cicloInterval) clearInterval(cicloInterval);

  cicloInterval = setInterval(() => {
    let todosPedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    let mudou = false;

    todosPedidos.forEach(p => {
      if(p.status !== "Finalizado") {
        p.tempoAtual++;
        if(p.tempoAtual >= p.duracaoEtapa){
          p.statusIndex++;
          p.status = p.etapas[p.statusIndex];
          p.tempoAtual = 0;
          mudou = true;
        } else {
          mudou = true;
        }
      }
    });

    if(mudou) {
      localStorage.setItem("pedidos", JSON.stringify(todosPedidos));
      carregarPedidos();
    }
  }, 1000);
}

// ----------------------
// CARREGAMENTO AUTOMÁTICO AO ABRIR
// ----------------------
if(localStorage.getItem("usuarioAtual")){
  document.getElementById("login-container").style.display = "none";
  document.getElementById("cadastro-container").style.display = "none";
  document.getElementById("app-container").style.display = "block";
  carregarPedidos();
  iniciarCicloAutomatico();
}