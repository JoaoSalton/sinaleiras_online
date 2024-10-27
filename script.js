// Inicialização do mapa
var map = L.map('map').setView([-28.26185, -52.41545], 13); // Centralizar o mapa

// Adicionar uma camada de tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Ícones para os estados dos semáforos
var iconeVerde = L.icon({
    iconUrl: 'green.png',
    iconSize: [25, 25], // Tamanho do ícone
    iconAnchor: [10, 20], // Ponto de ancoragem
});

var iconeVermelho = L.icon({
    iconUrl: 'red.png',
    iconSize: [25, 25], // Tamanho do ícone
    iconAnchor: [10, 10], // Ponto de ancoragem
});

// Ícone personalizado para a localização do usuário
var iconeUsuario = L.icon({
    iconUrl: 'car.png', // Substitua pelo caminho para o seu ícone
    iconSize: [30, 30], // Tamanho do ícone
    iconAnchor: [15, 30], // Ponto de ancoragem
});

// Modal
var modal = document.getElementById("modal");
var modalTitle = document.getElementById("modal-title");
var modalBody = document.getElementById("modal-body");
var span = document.getElementsByClassName("close")[0];

// Fecha o modal quando o usuário clica no "X"
span.onclick = function() {
    modal.style.display = "none";
}

// Fecha o modal quando o usuário clica fora do conteúdo do modal
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Função para obter o estado do semáforo baseado no horário atual
function obterEstadoSemaforo(horarioVerdeInicial, duracaoFechado, cicloTotal) {
    var agora = new Date();
    var horarioBrasilia = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

    var [horas, minutos, segundos] = horarioVerdeInicial.split(':').map(Number);
    var inicioSemaforo = new Date(horarioBrasilia);
    inicioSemaforo.setHours(horas, minutos, segundos);

    var tempoDecorrido = (horarioBrasilia - inicioSemaforo) / 1000; // Em segundos
    if (tempoDecorrido < 0) {
        tempoDecorrido += 86400; // Ajusta para o ciclo de 24 horas
    }

    var tempoNoCiclo = tempoDecorrido % cicloTotal;

    return {
        estado: tempoNoCiclo < duracaoFechado ? 'vermelho' : 'verde',
        tempoRestante: tempoNoCiclo < duracaoFechado ? duracaoFechado - tempoNoCiclo : cicloTotal - tempoNoCiclo // Tempo restante
    };
}

// Dados dos semáforos
var semaforos = [
    {
        localizacao: 'Benjamin x GenOsorio',
        coords: [-28.262403, -52.401465],
        horarioVerdeInicial: '08:55:12',
        duracaoFechado: 70,
        cicloTotal: 140
    },
    {
        localizacao: 'GenOsorio x FagundesReis',
        coords: [-28.262781, -52.402519],
        horarioVerdeInicial: '08:55:40',
        duracaoFechado: 70,
        cicloTotal: 140
    },
    {
        localizacao: 'GenOsorio x GenNeto',
        coords: [-28.26443, -52.405989],
        horarioVerdeInicial: '08:56:56',
        duracaoFechado: 50,
        cicloTotal: 100
    },
    {
        localizacao: 'Bento x GenOsorio',
        coords: [-28.26389, -52.40504],
        horarioVerdeInicial: '09:01:46',
        duracaoFechado: 70,
        cicloTotal: 140
    },
    {
        localizacao: 'cap. araujo, com uruguai',
        coords: [-28.26185, -52.41545],
        horarioVerdeInicial: '16:11:27',
        duracaoFechado: 88,
        cicloTotal: 118
    },
    {
        localizacao: 'Nasc Vargas e Rua Bento Gonçalves',
        coords: [-28.255773, -52.409877],
        horarioVerdeInicial: '14:33:49',
        duracaoFechado: 88,
        cicloTotal: 118
    },
    {
        localizacao: 'cap. araujo, av brasil',
        coords: [-28.26389, -52.41427],
        horarioVerdeInicial: '16:13:06',
        duracaoFechado: 88,
        cicloTotal: 118
    },
    {
        localizacao: 'cap araujo general osorio',
        coords: [-28.26724, -52.41222],
        horarioVerdeInicial: '16:14:53',
        duracaoFechado: 88,
        cicloTotal: 118
    },
    {
        localizacao: 'Av7 X CelChic',
        coords: [-28.265920, -52.406869],
        horarioVerdeInicial: '16:16:15',
        duracaoFechado: 88,
        cicloTotal: 118
    },
    {
        localizacao: 'uruguai benjammin',
        coords: [-28.256755, -52.404849],
        horarioVerdeInicial: '14:32:15',
        duracaoFechado: 88,
        cicloTotal: 118
    },
    {
        localizacao: 'Gen GUim x CelPel',
        coords: [-28.263903, -52.397264],
        horarioVerdeInicial: '14:32:15',
        duracaoFechado: 88,
        cicloTotal: 118
    },
    {
        localizacao: 'CelPel x genguim',
        coords: [-28.263809, -52.397339],
        horarioVerdeInicial: '14:32:15',
        duracaoFechado: 88,
        cicloTotal: 118
    },
];


// Função para adicionar os semáforos no mapa
function adicionarSemaforos() {
    semaforos.forEach(function(semaforo) {
        // Calcular o estado inicial do semáforo
        var estadoInfo = obterEstadoSemaforo(
            semaforo.horarioVerdeInicial, 
            semaforo.duracaoFechado, 
            semaforo.cicloTotal
        );

        // Definir o ícone com base no estado inicial
        var iconeAtual = estadoInfo.estado === 'verde' ? iconeVerde : iconeVermelho;

        // Criar o marcador no mapa com o ícone correto
        var marcador = L.marker(semaforo.coords, { icon: iconeAtual }).addTo(map);

        // Adicionar contagem regressiva
        var contagemDiv = L.divIcon({
            className: 'contagem',
            html: `${estadoInfo.tempoRestante} seg`,
            iconSize: [50, 20],
        });

        // Criar o marcador de contagem com a mesma posição do semáforo
        var contagemMarker = L.marker(semaforo.coords, { icon: contagemDiv }).addTo(map);

        // Adicionar um popup com o nome da rua ou cruzamento
        marcador.bindPopup(`<b>${semaforo.localizacao}</b><br>Semáforo está: ${estadoInfo.estado}.<br>Tempo restante: ${estadoInfo.tempoRestante} segundos.`)
            .on('click', function() {
                // Exibir modal com informações detalhadas ao clicar no marcador
                modal.style.display = "block";
                modalTitle.innerText = semaforo.localizacao;
                modalBody.innerText = `Semáforo está: ${estadoInfo.estado}. Tempo restante: ${estadoInfo.tempoRestante} segundos.`;
            });

        // Atualizar a contagem e o ícone a cada segundo
        setInterval(function() {
            estadoInfo = obterEstadoSemaforo(
                semaforo.horarioVerdeInicial, 
                semaforo.duracaoFechado, 
                semaforo.cicloTotal
            );

            var tempoAtual = estadoInfo.tempoRestante;

            // Atualizar popup com o estado atual
            marcador.bindPopup(`<b>${semaforo.localizacao}</b><br>Semáforo está: ${estadoInfo.estado}.<br>Tempo restante: ${tempoAtual} segundos.`);

            // Atualizar o marcador de contagem
            contagemDiv.options.html = `${tempoAtual} seg`;
            contagemMarker.setIcon(contagemDiv); // Atualiza o marcador de contagem
            
            // Atualizar o ícone do semáforo com base no estado atual
            var novoIcone = estadoInfo.estado === 'verde' ? iconeVerde : iconeVermelho;
            marcador.setIcon(novoIcone); // Altera o ícone do semáforo
        }, 1000);
    });
}

// Adicionar os semáforos ao mapa
adicionarSemaforos();

// Função para adicionar a localização do usuário no mapa
function adicionarLocalizacaoUsuario() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userCoords = [position.coords.latitude, position.coords.longitude];

            // Adicionar marcador para a localização do usuário com ícone personalizado
            L.marker(userCoords, { icon: iconeUsuario }).addTo(map)
                .bindPopup('Você está aqui')
                .openPopup();

            // Centralizar o mapa na localização do usuário
            map.setView(userCoords, 13);
        }, function() {
            alert('Não foi possível obter sua localização.');
        });
    } else {
        alert('Geolocalização não é suportada por este navegador.');
    }
}

// Adicionar a localização do usuário ao mapa
adicionarLocalizacaoUsuario();
