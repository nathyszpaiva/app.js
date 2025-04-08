document.addEventListener('DOMContentLoaded', function() {
    // Fazer uma requisição para buscar os responsáveis
    fetch('/api/responsaveis')
        .then(response => response.json())
        .then(data => {
            const selectResponsavel = document.getElementById('responsavel');
            selectResponsavel.innerHTML = ''; // Limpar o conteúdo atual do select

            if (data.success && data.responsaveis.length > 0) {
                data.responsaveis.forEach(responsavel => {
                    const option = document.createElement('option');
                    option.value = responsavel.id;
                    option.textContent = responsavel.nome;
                    selectResponsavel.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "Nenhum responsável disponível";
                selectResponsavel.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar responsáveis:', error);
            const selectResponsavel = document.getElementById('responsavel');
            selectResponsavel.innerHTML = '<option value="">Erro ao carregar responsáveis</option>';
        });
});
