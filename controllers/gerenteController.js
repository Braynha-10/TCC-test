const { Mecanico, Peca, Servico, Veiculo, Pagamento, Catalogo, Gerente, Cliente, Solicitacoes_peca, Solicitacoes_servico, Estoque, sequelize } = require('../models');
const { get } = require('../routes/gerenteRoutes');
const { Op, Sequelize } = require("sequelize");
const PDFDocument = require('pdfkit');
const { listarSolitacoesPecas } = require('./mecanicoController');
const { setAlert } = require('../utils/alerts');




//Metodos Mecanico
const listarMecanicos = async (req, res) => {
    try {
        let { page = 1, search = "" } = req.query;
        page = Number(page);

        const limit = 10;
        const offset = (page - 1) * limit;

        const where = {};

        if (search.trim() !== "") {
            where[Op.or] = [
                { nome: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { telefone: { [Op.like]: `%${search}%` } },
                { especialidade: { [Op.like]: `%${search}%` } },
            ];
        }

        const { rows: mecanicos, count } = await Mecanico.findAndCountAll({
            where,
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.render("mecanico/listar", {
            mecanicos,
            currentPage: page,
            totalPages,
            search
        });

    } catch (error) {
        console.error("Erro ao listar mecanicos: ", error);
        res.status(500).json({ error: "Erro ao listar mecanicos" });
    }
};


const getEditarMecanico = async(req, res) => {
    const {id} = req.params;

    try{
        const mecanico = await Mecanico.findByPk(id);
        if(!mecanico){
            return res.status(404).send('Mecanico nao encontrado!');
        }
        
        res.render('mecanico/cadastro', {mecanico});
    } catch (error){
        console.error('Erro ao buscar mecanico: ', error);
        res.status(500).json({error: 'Erro ao buscar mecanico'});
    }
}

const atualizarMecanico = async(req,res) => {
    const {id} = req.params;
    const {nome, telefone, email, senha, salario, comissao, especialidade} = req.body;

    try {
        const mecanico = await Mecanico.findByPk(id);
        if (!mecanico) {
            Mecanico.create({nome, telefone, email, senha, salario, comissao, especialidade});
        }
        await mecanico.update({nome, telefone, email, senha, salario, comissao, especialidade});
        setAlert(req, res, 'success', 'Mecânico atualizado', 'As informações do mecânico foram atualizadas.');
        res.redirect('/gerente/painelGerente');
    } catch (error){
        console.error('Erro ao atualizar mecânico: ', error);
        setAlert(req, res, 'error', 'Não foi possível atualizar o mecânico', 'Tente novamente em instantes.');
        res.redirect('/gerente/painelGerente');
    }
}

const deletarMecanico = async (req, res) => {
    const {id} = req.params;
    try {
        Mecanico.destroy({where: {id: id}});
        setAlert(req, res, 'success', 'Mecânico excluído', 'O mecânico foi removido com sucesso.');
        res.redirect('/gerente/painelGerente');
    } catch (error) { 
        console.error('Erro ao deletar mecanico: ', error);
        setAlert(req, res, 'error', 'Não foi possível excluir o mecânico', 'Tente novamente em instantes.');
        res.redirect('/gerente/painelGerente');
    }
}


const cadastrarPeca = async (req, res) => {
    try {
        const { nome, descricao, preco, quantidade, capacidade } = req.body;

        // 1️⃣ Criar a Peça
        const novaPeca = await Peca.create({
            nome,
            descricao,
            preco
        });

        // 2️⃣ Criar o Estoque vinculado à Peça
        await Estoque.create({
            produtoId: novaPeca.id,   // ligação correta
            quantidade: Number(quantidade),
            capacidade: Number(capacidade)
        });

        setAlert(req, res, 'success', 'Peça cadastrada', 'A peça e seu estoque foram cadastrados com sucesso.');
        res.redirect("/gerente/pecas/listar");

    } catch (error) {
        console.error("Erro ao cadastrar peça:", error);
        setAlert(req, res, 'error', 'Não foi possível cadastrar a peça', 'Confira os dados e tente novamente.');
        res.redirect('/gerente/pecas/listar');
    }
};

const listarPeca = async (req, res) => {
    try {
        let { page = 1, search = "" } = req.query;
        page = Number(page);

        const limit = 10;
        const offset = (page - 1) * limit;

        const where = {};

        if (search.trim() !== "") {
            where[Op.or] = [
                { nome: { [Op.like]: `%${search}%` } },
                { descricao: { [Op.like]: `%${search}%` } },
                { preco: { [Op.like]: `%${search}%` } }
            ];
        }

        const { rows: pecas, count } = await Peca.findAndCountAll({
            where,
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.render("pecas/listar", {
            pecas,
            gerente: true,
            search,
            currentPage: page,
            totalPages
        });

    } catch (error) {
        console.error("Erro ao listar as pecas: ", error);
        res.status(500).json({ error: "Erro ao listar Pecas" });
    }
};


const getModificaPeca = async(req, res) => {
    const {id} = req.params;
    if(!id){
        return res.render('pecas/cadastro');
    }
    try{
        const peca = await Peca.findByPk(id);
        
        if(!peca){
            return res.status(404).send('Peca nao encontrada!');
        }
        console.log(peca.id)
        res.render('pecas/cadastro', {peca});
    } catch (error){
        console.error('Erro ao buscar peca: ', error);
        res.status(500).json({error: 'Erro ao buscar peca'});
    }
}

const modificaPeca = async(req,res) => {
    const {id} = req.params;
    const {nome, descricao, preco} = req.body;

    try {
        const peca = await Peca.findByPk(id);
        if (!peca) {
            res.status(404).json({error: "peca nao encontrada!"})
        }
        await peca.update({nome, descricao, preco});
        setAlert(req, res, 'success', 'Peça atualizada', 'As informações da peça foram atualizadas.');
        res.redirect('/gerente/painelGerente');
    } catch (error){
        console.error('Erro ao atualizar peca: ', error);
        setAlert(req, res, 'error', 'Não foi possível atualizar a peça', 'Tente novamente em instantes.');
        res.redirect('/gerente/painelGerente');
    }
}

const deletarPeca = async (req, res) => {
    const {id} = req.params;
    try {
        Peca.destroy({where: {id: id}});
        setAlert(req, res, 'success', 'Peça excluída', 'A peça foi removida com sucesso.');
        res.redirect('/gerente/painelGerente');
    } catch (error) { 
        console.error('Erro ao deletar peca: ', error);
        setAlert(req, res, 'error', 'Não foi possível excluir a peça', 'Tente novamente em instantes.');
        res.redirect('/gerente/painelGerente');
    }
}

const listarServico = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const search = req.query.search || "";

        const whereClause = {};

        if (search.trim() !== "") {
            whereClause[Op.or] = [
                { descricao: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
                { '$Mecanico.nome$': { [Op.like]: `%${search}%` } },
                { '$Veiculo.modelo$': { [Op.like]: `%${search}%` } },
                { '$Veiculo.Cliente.nome$': { [Op.like]: `%${search}%` } },
            ];
        }

        const { rows: servicos, count } = await Servico.findAndCountAll({
            where: whereClause,
            include: [
                { model: Veiculo, include: Cliente },
                { model: Catalogo },
                { model: Peca },
                { model: Pagamento },
                { model: Mecanico }
            ],
            limit,
            offset,
            order: [['id', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.render("servicos/listar", {
            servicos,
            search,
            page,
            totalPages
        });

    } catch (error) {
        console.error("Erro:", error);
        res.status(500).send("Erro ao listar serviços.");
    }
};



const ordemServico = async (req, res) => {
    try {
        const { id } = req.params;
        const tipo = req.query.tipo || "completo";  // completo | simples | financeiro

        // Busca o serviço e todas as relações necessárias
        const servico = await Servico.findOne({
            where: { id },
            include: [
                {
                    model: Veiculo,
                    include: Cliente
                },
                { model: Catalogo },
                { model: Peca },
                { model: Pagamento },
                { model: Mecanico },
            ]
        });

        if (!servico) {
            return res.status(404).send("Serviço não encontrado.");
        }

        const PDFDocument = require("pdfkit");
        const doc = new PDFDocument();

        // Cabeçalhos HTTP
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=servico_${id}_${tipo}.pdf`);

        doc.pipe(res);

        // =========================================
        // CABEÇALHO
        // =========================================
        doc.fontSize(20).text("Ordem de Serviço", { align: "center" });
        doc.fontSize(14).text(`Relatório: ${tipo.toUpperCase()}`, { align: "center" });
        doc.moveDown(2);

        // =========================================
        // DADOS BÁSICOS
        // =========================================
        doc.fontSize(16).text("Informações do Serviço", { underline: true });
        doc.moveDown();

        doc.fontSize(12).text(`ID do Serviço: ${servico.id}`);
        doc.text(`Descrição: ${servico.descricao}`);
        doc.text(`Status: ${servico.status}`);
        doc.moveDown();

        // =========================================
        // VEÍCULO E CLIENTE
        // =========================================
        if (tipo === "completo" || tipo === "simples") {
            doc.fontSize(16).text("Dados do Veículo e Cliente", { underline: true });
            doc.moveDown();

            doc.fontSize(12).text(`Veículo: ${servico.Veiculo.modelo} (${servico.Veiculo.marca})`);
            doc.text(`Ano: ${servico.Veiculo.ano}`);
            doc.text(`Cliente: ${servico.Veiculo.Cliente.nome}`);
            doc.text(`Telefone Cliente: ${servico.Veiculo.Cliente.telefone}`);
            doc.moveDown();
        }

        // =========================================
        // MECÂNICO
        // =========================================
        if (tipo === "completo" || tipo === "simples") {
            doc.fontSize(16).text("Informações do Mecânico", { underline: true });
            doc.moveDown();

            doc.fontSize(12).text(`Mecânico Responsável: ${servico.Mecanico.nome}`);
            doc.moveDown();
        }

        // =========================================
        // CATÁLOGO / SERVIÇO REALIZADO
        // =========================================
        if (tipo === "completo") {
            doc.fontSize(16).text("Informações do Serviço Realizado", { underline: true });
            doc.moveDown();

            doc.fontSize(12).text(`Serviço: ${servico.Catalogo.nome}`);
            doc.text(`Peça Utilizada: ${servico.Peca ? servico.Peca.nome : "Nenhuma peça registrada"}`);
            doc.moveDown();
        }

        // =========================================
        // FINANCEIRO
        // =========================================
        if (tipo === "completo" || tipo === "financeiro") {
            doc.fontSize(16).text("Informações de Pagamento", { underline: true });
            doc.moveDown();

            if (servico.Pagamento) {
                const tipoPg =
                    servico.Pagamento.tipo === 0 ? "Crédito" :
                    servico.Pagamento.tipo === 1 ? "Débito" :
                    "Dinheiro/Pix";

                doc.fontSize(12).text(`Tipo de Pagamento: ${tipoPg}`);
                doc.text(`Valor: R$ ${servico.Pagamento.valor.toFixed(2)}`);
            } else {
                doc.text("Nenhuma informação de pagamento registrada.");
            }

            doc.moveDown();
        }

        // Finaliza o PDF
        doc.end();

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        res.status(500).send("Erro ao gerar PDF.");
    }
};

const fechamentoGeral = async (req, res) => {
    try {
        const tipo = req.query.tipo || "completo";  
        const filtroMecanico = req.query.mecanico || null;
        const filtroData = req.query.data || null;
        const filtroMes = req.query.mes || null;

        const PDFDocument = require("pdfkit");
        const doc = new PDFDocument({ margin: 40 });

        // Cabeçalhos HTTP
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=fechamento_${tipo}.pdf`);

        doc.pipe(res);

        // ===============================
        // FILTRAGEM GLOBAL
        // ===============================

        let whereClause = {};

        const dataInicio = req.query.dataInicio || null;
        const dataFim = req.query.dataFim || null;

        if (dataInicio && dataFim) {
            whereClause.createdAt = {
                [Op.between]: [dataInicio + " 00:00:00", dataFim + " 23:59:59"]
            };
        }


        if (filtroMecanico) whereClause.id_mecanico = filtroMecanico;

        if (filtroData) whereClause.createdAt = filtroData;

        if (filtroMes) {
            whereClause.createdAt = {
                [Op.between]: [
                    `${filtroMes}-01`,
                    `${filtroMes}-31`
                ]
            };
        }

        // ===============================
        // BUSCAR TODOS SERVIÇOS
        // ===============================
        const servicos = await Servico.findAll({
            where: whereClause,
            include: [
                { model: Veiculo, include: Cliente },
                { model: Catalogo },
                { model: Peca },
                { model: Pagamento },
                { model: Mecanico },
            ],
            order: [["id", "ASC"]]
        });

        // ===============================
        // HEADER DO PDF
        // ===============================
        doc.fontSize(22).text("Fechamento Geral - Oficina", { align: "center" });
        doc.fontSize(14).text(`Relatório: ${tipo.toUpperCase()}`, { align: "center" });
        doc.moveDown();

        doc.fontSize(12).text(`Serviços encontrados: ${servicos.length}`);
        if (filtroMecanico) doc.text(`Filtrado por mecânico: ${filtroMecanico}`);
        if (filtroData) doc.text(`Filtrado pela data: ${filtroData}`);
        if (filtroMes) doc.text(`Filtrado pelo mês: ${filtroMes}`);
        doc.moveDown(2);

        // =================================
        // 1) RELATÓRIO COMPLETO
        // =================================
        if (tipo === "completo") {
            servicos.forEach(s => {
                doc.fontSize(14).text(`Serviço ID ${s.id}`, { underline: true });
                doc.moveDown(0.5);

                doc.fontSize(12).text(`Mecânico: ${s.Mecanico.nome}`);
                doc.text(`Cliente: ${s.Veiculo.Cliente.nome}`);
                doc.text(`Veículo: ${s.Veiculo.modelo}`);
                doc.text(`Serviço: ${s.Catalogo.nome}`);
                doc.text(`Peça: ${s.Peca ? s.Peca.nome : "Nenhuma"}`);
                doc.text(`Descrição: ${s.descricao}`);
                doc.text(`Status: ${s.status}`);

                if (s.Pagamento)
                    doc.text(`Pagamento: R$ ${s.Pagamento.valor.toFixed(2)}`);

                doc.moveDown(1.5);
            });
        }

        // =================================
        // 2) RELATÓRIO SIMPLES
        // =================================
        if (tipo === "simples") {
            servicos.forEach(s => {
                doc.text(
                    `#${s.id} - ${s.Catalogo.nome} | Mecânico: ${s.Mecanico.nome} | Cliente: ${s.Veiculo.Cliente.nome}`
                );
                doc.moveDown(0.5);
            });
        }

        // =================================
        // 3) FINANCEIRO
        // =================================
        if (tipo === "financeiro") {
            let total = 0;

            servicos.forEach(s => {
                if (s.Pagamento) {
                    total += s.Pagamento.valor;
                    doc.text(
                        `Serviço ${s.id} | Valor: R$ ${s.Pagamento.valor.toFixed(2)}`
                    );
                } else {
                    doc.text(`Serviço ${s.id} | Sem pagamento registrado`);
                }
                doc.moveDown(0.5);
            });

            doc.moveDown();
            doc.fontSize(16).text(`TOTAL GERAL: R$ ${total.toFixed(2)}`, {
                underline: true
            });
        }

        // =================================
        // 4) AGRUPADO POR MECÂNICO
        // =================================
        if (tipo === "por-mecanico") {
            const grupos = {};

            servicos.forEach(s => {
                const nome = s.Mecanico.nome;
                if (!grupos[nome]) grupos[nome] = [];
                grupos[nome].push(s);
            });

            for (const mecanico in grupos) {
                doc.fontSize(16).text(`Mecânico: ${mecanico}`, { underline: true });
                doc.moveDown(0.5);

                grupos[mecanico].forEach(s => {
                    doc.fontSize(12).text(
                        `Serviço ${s.id} | ${s.Catalogo.nome} | Cliente: ${s.Veiculo.Cliente.nome}`
                    );
                });

                doc.moveDown(1.5);
            }
        }

        // =================================
        // 5) RESUMO GERAL
        // =================================
        if (tipo === "resumo-geral") {
            let totalServicos = servicos.length;
            let totalPecas = servicos.filter(s => s.Peca).length;
            let totalFinanceiro = servicos
                .filter(s => s.Pagamento)
                .reduce((soma, s) => soma + s.Pagamento.valor, 0);

            doc.fontSize(16).text("Resumo Geral da Oficina", { underline: true });
            doc.moveDown();

            doc.fontSize(12).text(`Total de serviços: ${totalServicos}`);
            doc.text(`Serviços com peças: ${totalPecas}`);
            doc.text(`Total arrecadado: R$ ${totalFinanceiro.toFixed(2)}`);

            doc.moveDown(2);
        }

        doc.end();

    } catch (error) {
        console.error("Erro ao gerar fechamento geral:", error);
        res.status(500).send("Erro ao gerar relatório.");
    }
};


//Methods Gerente
const cadastrarGerente = async (req, res) => {
    const {nome, telefone, email, salario, senha} = req.body;
    try{
        const user = await Gerente.findOne({where: {email:email}});
        if(!user){
            await Gerente.create({nome, telefone, email, salario, senha});
            setAlert(req, res, 'success', 'Gerente cadastrado', 'O gerente foi cadastrado com sucesso.');
            res.redirect('/gerente/painelGerente');
        } else {
            setAlert(req, res, 'error', 'Gerente já cadastrado', 'Já existe um gerente com esse e-mail.');
            res.redirect('/gerente/gerentes/cadastro');
        }
    } catch (error){
        console.error('Erro ao cadastrar gerente: ', error);
        setAlert(req, res, 'error', 'Não foi possível cadastrar o gerente', 'Confira os dados e tente novamente.');
        res.redirect('/gerente/gerentes/cadastro');
    }
}

const deletarGerente = async (req, res) => {
    const {id} = req.params;
    try{
        Gerente.destroy({where: {id: id}})
        setAlert(req, res, 'success', 'Gerente excluído', 'O gerente foi removido com sucesso.');
        res.redirect('/gerente/painelGerente');
    } catch (error) { 
        console.error('Erro ao deletar gerente: ', error);
        setAlert(req, res, 'error', 'Não foi possível excluir o gerente', 'Tente novamente em instantes.');
        res.redirect('/gerente/painelGerente');
    }
}

const atualizarGerente = async(req,res) => {
    const {id} = req.params;
    const {nome, telefone, email, senha, salario} = req.body;

    try {
        const gerente = await Gerente.findByPk(id);
        if (!gerente) {
            res.status(404).json({error: "Gerente nao encontrado!"})
        }
        await gerente.update({nome, telefone, email, senha, salario});
        setAlert(req, res, 'success', 'Gerente atualizado', 'As informações do gerente foram atualizadas.');
        res.redirect('/gerente/painelGerente');
    } catch (error){
        console.error('Erro ao atualizar gerente: ', error);
        setAlert(req, res, 'error', 'Não foi possível atualizar o gerente', 'Tente novamente em instantes.');
        res.redirect('/gerente/painelGerente');
    }
}

const getEditarGerente = async(req, res) => {
    const {id} = req.params;
    if(!id){
        return res.render('gerente/cadastro');
    }
    try{
        const gerente = await Gerente.findByPk(id);
        
        if(!gerente){
            return res.status(404).send('Gerente nao encontrado!');
        }
        console.log(gerente.id)
        res.render('gerente/cadastro', {gerente});
    } catch (error){
        console.error('Erro ao buscar gerente: ', error);
        res.status(500).json({error: 'Erro ao buscar gerente'});
    }
}


const listarGerente = async (req, res) => {
    try{
        const gerentes = await Gerente.findAll();
        res.render("gerente/listar", {gerentes: gerentes});
    } catch(error) {
        console.error('Erro ao listar Gerentes: ', error);
        res.status(500).json({error: "Erro ao listar Gerentes"})
    }
}



// const processarSolicitacaoPeca = async (req, res) => {
//     const {solicitacaoId, status} = req.body;

//     const transaction = await sequelize.transaction();
//     const solicitacao = await Solicitacoes_peca.findByPk(solicitacaoId);
//     if (!solicitacao){
//         await transaction.rollback();
//         return res.status(404).send('Solicitacao nao encontrada!');
//     }

//     const statusNormalized = (status || '').toString().toUpperCase();

//     if (statusNormalized === "APROVADO") {
//         try {
//             const peca = await Peca.findOne({
//                 where: {
//                     nome: {
//                         [Op.like]: `%${solicitacao.nome}%`
//                     }
//                 }
//             });

//             if (peca){
//                 const pecaEstoque = await Estoque.findOne({
//                     where: { produtoId: peca.id },
//                     transaction
//                 });
//                 if(!pecaEstoque){
//                     await Estoque.create({
//                         produtoId: peca.id,
//                         capacidade: solicitacao.quantidade,
//                         quantidade: solicitacao.quantidade,
//                     }, { transaction });
//                 } else {
//                     if(pecaEstoque.quantidade >= pecaEstoque.capacidade) {
//                         await transaction.rollback();
//                         return res.status(400).send('Capacidade maxima preenchida!');
//                     }
//                     await pecaEstoque.aumentarQuantidade(solicitacao.quantidade);
//                 }
//             } else {
//                 const novaPeca = await Peca.create({
//                     nome: solicitacao.nome,
//                     descricao: solicitacao.descricao,
//                     preco: solicitacao.preco
//                 }, { transaction });

//                 await Estoque.create({
//                     produtoId: novaPeca.id,
//                     capacidade: solicitacao.quantidade,
//                     quantidade: solicitacao.quantidade,
//                 }, { transaction });
//             }

//             solicitacao.status = 'APROVADO';
//             await solicitacao.save({ transaction });

//             await transaction.commit();
//             return res.redirect("/gerente/pecas/solicitacoes");
//         } catch (error) {
//             await transaction.rollback();
//             return res.status(500).json({error: error.message});
//         }
//     } else {
//         try {
//             solicitacao.status = 'RECUSADO';
//             await solicitacao.save({ transaction });
//             await transaction.commit();
//             return res.redirect("/gerente/pecas/solicitacoes");
//         } catch (error) {
//             await transaction.rollback();
//             return res.status(500).json({error: error.message});
//         }
//     }
// };

const processarSolicitacaoPeca = async (req, res) => {
  try {
    const { solicitacaoId, status, quantidade } = req.body;

    const solicitacao = await Solicitacoes_peca.findByPk(solicitacaoId);

    if (!solicitacao) {
      return res.status(404).send("Solicitação não encontrada");
    }

    // RECUSAR
    if (status === "RECUSADO") {
      solicitacao.status = "RECUSADO";
      await solicitacao.save();
            setAlert(req, res, 'success', 'Solicitação recusada', 'A solicitação de peça foi recusada.');
      return res.redirect("/gerente/pecas/solicitacoes");
    }

    // ===== APROVAR =====
    let peca = await Peca.findOne({
      where: { nome: solicitacao.nome }
    });

    // SE A PEÇA NÃO EXISTE, CRIA
    if (!peca) {
      peca = await Peca.create({
        nome: solicitacao.nome,
        descricao: solicitacao.descricao,
        preco: solicitacao.preco
      });
    }

    // BUSCA OU CRIA ESTOQUE
    let estoque = await Estoque.findOne({
      where: { produtoId: peca.id }
    });

    if (!estoque) {
      estoque = await Estoque.create({
        produtoId: peca.id,
        quantidade: Number(quantidade),
        capacidade: Number(quantidade)
      });
    } else {
      await estoque.aumentarQuantidade(Number(quantidade));
    }

    solicitacao.status = "APROVADO";
    solicitacao.quantidade = quantidade;
    await solicitacao.save();
    setAlert(req, res, 'success', 'Solicitação aprovada', 'A solicitação de peça foi aprovada e o estoque foi atualizado.');

    return res.redirect("/gerente/pecas/solicitacoes");

  } catch (error) {
    console.error("Erro:", error.message);
        setAlert(req, res, 'error', 'Não foi possível processar a solicitação', 'Tente novamente em instantes.');
        return res.redirect("/gerente/pecas/solicitacoes");
  }
};


const listarSolicitacoesServicos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const search = req.query.search || "";

        let where = {};

        if (search) {
            where = {
                [Op.or]: [
                    // tabela principal
                    { descricao: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },

                    // tipo de pagamento convertido para texto
                    Sequelize.where(
                        Sequelize.literal(`
                            CASE 
                                WHEN tipo_pagamento = 0 THEN 'credito'
                                WHEN tipo_pagamento = 1 THEN 'debito'
                                WHEN tipo_pagamento = 2 THEN 'pix'
                                ELSE ''
                            END
                        `),
                        { [Op.like]: `%${search.toLowerCase()}%` }
                    ),

                    // associações
                    { "$Mecanico.nome$": { [Op.like]: `%${search}%` } },
                    { "$Veiculo.modelo$": { [Op.like]: `%${search}%` } },
                    { "$Veiculo.Cliente.nome$": { [Op.like]: `%${search}%` } },
                    { "$Peca.nome$": { [Op.like]: `%${search}%` } },
                    { "$Catalogo.nome$": { [Op.like]: `%${search}%` } },
                ],
            };
        }

        const { count, rows } = await Solicitacoes_servico.findAndCountAll({
            where,
            limit,
            offset,
            include: [
                { model: Veiculo, include: Cliente },
                { model: Catalogo },
                { model: Peca },
                { model: Mecanico },
            ],
        });

        res.render("servico/listaServicos", {
            Servico: rows,
            search,
            gerente: true,
            page,
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        console.error("Erro ao listar solicitações:", error);
        res.status(500).send("Erro ao listar solicitações");
    }
};


const processarSolicitacaoServicos = async (req, res) => {
  // aceita tanto solicitacaoId (frontend atual) quanto idServico (nome antigo)
  const idServico = req.body.idServico || req.body.solicitacaoId || req.body.id || req.params.id;
  let { status } = req.body;

  if (!idServico) {
    // Se for requisicao AJAX, retorne JSON; caso contrário mantenha comportamento antigo
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(400).json({ ok: false, message: 'id da solicitação ausente' });
    } else {
      return res.status(400).send('id da solicitação ausente');
    }
  }

  // Normaliza o status (case-insensitive)
  status = (status || '').toString().trim().toUpperCase();

  // Busca a solicitacao com includes (para usar dados depois)
  const transaction = await sequelize.transaction();
  try {
    const solicitacaoServico = await Solicitacoes_servico.findByPk(idServico, {
      include: [
        { model: Veiculo, include: Cliente },
        { model: Catalogo },
        { model: Peca },
        { model: Mecanico },
      ],
      transaction
    });

    if (!solicitacaoServico) {
      await transaction.rollback();
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ ok: false, message: 'Solicitação de Serviço não encontrada' });
      }
      return res.status(404).send('Solicitação de Serviço não encontrada');
    }

    if (status === 'APROVADO' || status === 'APROVA' || status === 'APROVAR') {
      // cria pagamento e servico dentro da transaction
      const valorPeca = solicitacaoServico.Peca ? parseFloat(solicitacaoServico.Peca.preco || 0) : 0;
      const valorServico = solicitacaoServico.Catalogo ? parseFloat(solicitacaoServico.Catalogo.preco || 0) : 0;
      const total = valorPeca + valorServico;

      const novoPagamento = await Pagamento.create({
        tipo: solicitacaoServico.tipo_pagamento,
        valor: total,
        desconto: solicitacaoServico.desconto || 0,
        id_cliente: solicitacaoServico.Veiculo ? solicitacaoServico.Veiculo.id_cliente : null,
        status: false,
      }, { transaction });

      const novoServico = await Servico.create({
        id_mecanico: solicitacaoServico.id_mecanico,
        id_veiculo: solicitacaoServico.id_veiculo,
        id_catalogo: solicitacaoServico.id_catalogo,
        id_peca: solicitacaoServico.id_peca || null,
        id_pagamento: novoPagamento.id,
        descricao: solicitacaoServico.descricao,
        status: 'Pendente',
      }, { transaction });

      // Se havia peça vinculada, reduz do estoque (usando transaction)
      if (solicitacaoServico.id_peca) {
        const pecaEstoque = await Estoque.findOne({
          where: { produtoId: solicitacaoServico.id_peca },
          transaction
        });

        if (!pecaEstoque) {
          await transaction.rollback();
          if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(404).json({ ok: false, message: 'Peça não encontrada no estoque' });
          }
          return res.status(404).send('Peça não encontrada no estoque');
        }

        // assumo que existe método reduzirQuantidade que aceita transaction
        if (typeof pecaEstoque.reduzirQuantidade === 'function') {
          await pecaEstoque.reduzirQuantidade({ transaction });
        } else {
          // fallback simples: decrementar quantidade e salvar
          pecaEstoque.quantidade = (pecaEstoque.quantidade || 0) - 1;
          if (pecaEstoque.quantidade < 0) pecaEstoque.quantidade = 0;
          await pecaEstoque.save({ transaction });
        }
      }

      solicitacaoServico.status = 'APROVADO';
      await solicitacaoServico.save({ transaction });

      await transaction.commit();

      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({ ok: true, message: 'Solicitação aprovada', novoServicoId: novoServico.id });
      } else {
                setAlert(req, res, 'success', 'Solicitação aprovada', 'A solicitação de serviço foi aprovada.');
        return res.redirect('/gerente/servicos/solicitacoes');
      }
    } else {
      // qualquer outro status => recusar
      solicitacaoServico.status = 'RECUSADO';
      await solicitacaoServico.save({ transaction });
      await transaction.commit();

      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({ ok: true, message: 'Solicitação recusada' });
      } else {
                setAlert(req, res, 'success', 'Solicitação recusada', 'A solicitação de serviço foi recusada.');
        return res.redirect('/gerente/servicos/solicitacoes');
      }
    }
  } catch (error) {
    console.error('processarSolicitacaoServicos error:', error);
    try { await transaction.rollback(); } catch (e) { /* ignore */ }

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ ok: false, message: error.message || 'Erro interno' });
    }
    setAlert(req, res, 'error', 'Não foi possível processar a solicitação', 'Tente novamente em instantes.');
    return res.redirect('/gerente/servicos/solicitacoes');
  }
};


exports.listarSolitacoesPecas = async (req, res) => {
    try {
        let { page = 1, search = "" } = req.query;
        page = Number(page);
        const limit = 10;
        const offset = (page - 1) * limit;

        // Filtro de busca
        const where = {};
        if (search.trim() !== "") {
            where.nome = { [Op.like]: `%${search}%` };
        }

        // Consulta com paginação
        const { rows: pecas, count } = await Solicitacoes_peca.findAndCountAll({
            where,
            limit,
            offset,
            include: [{ model: Mecanico }]
        });

        const totalPages = Math.ceil(count / limit);

        res.render("peca/listaPeca", {
            pecas,
            gerente: req.session.gerente || false,
            mecanico: req.session.mecanico || false,
            currentPage: page,
            totalPages,
            search
        });

    } catch (error) {
        console.error("Erro ao listar as solicitações de peças:", error);
        res.status(500).send("Erro ao listar as solicitações de peças");
    }
}

exports.alterarSolicitacaoPeca = async (req, res) => {
  try {
    console.log('POST /gerente/pecas/solicitacoes body:', req.body);
    const { solicitacaoId, status } = req.body;
    if (!solicitacaoId) return res.status(400).send('solicitacaoId ausente');

    // Exemplo usando Sequelize
    const { Solicitacoes_peca } = require('../models');
    const peca = await Solicitacoes_peca.findByPk(solicitacaoId);
    if (!peca) return res.status(404).send('Solicitação não encontrada');

    const novoStatus = (status || '').toUpperCase();
    if (!['APROVADO','REJEITADO'].includes(novoStatus)) return res.status(400).send('Status inválido');

    peca.status = novoStatus;
    await peca.save();

    return res.redirect('back'); // ou rota correta
  } catch (err) {
    console.error(err);
    return res.status(500).send('Erro interno');
  }
};


module.exports = {
    listarMecanicos, 
    atualizarMecanico, 
    getEditarMecanico, 
    deletarMecanico, 
    cadastrarPeca, 
    listarPeca, 
    getModificaPeca,
    modificaPeca,
    deletarPeca,
    listarServico, 
    listarGerente, 
    cadastrarGerente, 
    atualizarGerente, 
    getEditarGerente, 
    deletarGerente,
    processarSolicitacaoPeca,
    listarSolicitacoesServicos,
    processarSolicitacaoServicos,
    ordemServico,
    fechamentoGeral,
    listarSolitacoesPecas,
};