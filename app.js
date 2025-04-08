const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;


// Middleware para servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));


// Middleware para processar dados enviados via formulário (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
// Middleware para processar JSON
app.use(express.json());


// Rota para exibir o formulário de cadastro de responsável (responsavel.html)
app.get('/responsaveis', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Responsavel.html'));
});


app.get('/tarefas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Tarefa.html'));
});


app.get('/listartarefas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ListarTarefa.html'));
});


// Rota GET para buscar os responsáveis e retornar em JSON
app.get('/api/responsaveis', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'responsaveis.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo de responsáveis:', err);
            return res.status(500).json({ success: false, message: 'Erro ao obter responsáveis.' });
        }


        try {
            const responsaveis = JSON.parse(data);
            return res.status(200).json({ success: true, responsaveis });
        } catch (parseError) {
            console.error('Erro ao fazer o parsing do JSON:', parseError);
            return res.status(500).json({ success: false, message: 'Erro ao processar os responsáveis.' });
        }
    });
});


app.get('/api/tarefas', (req, res) => {
    const tarefasFilePath = path.join(__dirname, 'data', 'tarefas.json');


    fs.readFile(tarefasFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo de tarefas:', err);
            return res.status(500).json({ success: false, message: 'Erro ao processar as tarefas.' });
        }


        let tarefas = [];
        try {
            if (data) {
                tarefas = JSON.parse(data);
            }
        } catch (parseError) {
            console.error('Erro ao fazer o parsing do arquivo de tarefas:', parseError);
            return res.status(500).json({ success: false, message: 'Erro ao processar as tarefas.' });
        }


        return res.status(200).json({ success: true, tarefas });
    });
});


// Rota POST para cadastrar um responsável e salvar no arquivo JSON
app.post('/Cadresponsaveis', (req, res) => {
    const { nome, email } = req.body;


    if (!nome) {
        return res.status(400).json({ success: false, message: 'Nome do responsável é obrigatório.' });
    }


    const filePath = path.join(__dirname, 'data', 'responsaveis.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo JSON:', err);
            return res.status(500).json({ success: false, message: 'Erro ao processar o cadastro.' });
        }


        const responsaveis = JSON.parse(data);


        const novoResponsavel = {
            id: responsaveis.length + 1,
            nome: nome,
            email: email || '' // Se o email não for fornecido, será uma string vazia
        };


        responsaveis.push(novoResponsavel);


        fs.writeFile(filePath, JSON.stringify(responsaveis, null, 2), (err) => {
            if (err) {
                console.error('Erro ao escrever no arquivo JSON:', err);
                return res.status(500).json({ success: false, message: 'Erro ao salvar o responsável.' });
            }


            return res.status(200).json({ success: true, message: 'Responsável cadastrado com sucesso!' });
        });
    });
});


// Rota POST para cadastrar uma nova tarefa
app.post('/tarefas', (req, res) => {
    const { nome, descricao, data_entrega, responsavel_id, status } = req.body;


    if (!nome || !descricao || !data_entrega || !responsavel_id) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }


    const responsaveisFilePath = path.join(__dirname, 'data', 'responsaveis.json');


    fs.readFile(responsaveisFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo de responsáveis:', err);
            return res.status(500).json({ success: false, message: 'Erro ao processar os responsáveis.' });
        }


        let responsaveis;
        try {
            responsaveis = JSON.parse(data);
        } catch (parseError) {
            console.error('Erro ao fazer o parsing do JSON de responsáveis:', parseError);
            return res.status(500).json({ success: false, message: 'Erro ao processar os responsáveis.' });
        }


        const responsavel = responsaveis.find(r => r.id === parseInt(responsavel_id, 10));
        if (!responsavel) {
            return res.status(400).json({ success: false, message: 'Responsável não encontrado.' });
        }


        const tarefasFilePath = path.join(__dirname, 'data', 'tarefas.json');


        fs.readFile(tarefasFilePath, 'utf8', (err, data) => {
            let tarefas = [];
            if (!err && data) {
                try {
                    tarefas = JSON.parse(data);
                } catch (parseError) {
                    console.error('Erro ao fazer o parsing do JSON de tarefas:', parseError);
                    return res.status(500).json({ success: false, message: 'Erro ao processar as tarefas.' });
                }
            }


            const novaTarefa = {
                id: tarefas.length + 1,
                nome,
                descricao,
                data_entrega,
                responsavel: responsavel.nome,
                status: status || 'incompleta'
            };


            tarefas.push(novaTarefa);


            fs.writeFile(tarefasFilePath, JSON.stringify(tarefas, null, 2), (err) => {
                if (err) {
                    console.error('Erro ao salvar a tarefa:', err);
                    return res.status(500).json({ success: false, message: 'Erro ao salvar a tarefa.' });
                }


                return res.status(200).json({ success: true, message: 'Tarefa cadastrada com sucesso!' });
            });
        });
    });
});


// Rota PUT para editar uma tarefa existente
app.put('/api/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const { nome, descricao, data_entrega, responsavel, status } = req.body;


    const tarefasFilePath = path.join(__dirname, 'data', 'tarefas.json');


    fs.readFile(tarefasFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo de tarefas:', err);
            return res.status(500).json({ success: false, message: 'Erro ao processar as tarefas.' });
        }


        let tarefas = [];
        try {
            if (data) {
                tarefas = JSON.parse(data);
            }
        } catch (parseError) {
            console.error('Erro ao fazer o parsing do arquivo de tarefas:', parseError);
            return res.status(500).json({ success: false, message: 'Erro ao processar as tarefas.' });
        }


        const tarefaIndex = tarefas.findIndex(tarefa => tarefa.id === parseInt(id, 10));
        if (tarefaIndex === -1) {
            return res.status(404).json({ success: false, message: 'Tarefa não encontrada.' });
        }


        // Atualizar os dados da tarefa
        tarefas[tarefaIndex] = {
            ...tarefas[tarefaIndex],
            nome,
            descricao,
            data_entrega,
            responsavel,
            status
        };


        // Salvar as alterações no arquivo JSON
        fs.writeFile(tarefasFilePath, JSON.stringify(tarefas, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar a tarefa atualizada:', err);
                return res.status(500).json({ success: false, message: 'Erro ao salvar a tarefa atualizada.' });
            }


            return res.status(200).json({ success: true, message: 'Tarefa atualizada com sucesso!' });
        });
    });
});


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
