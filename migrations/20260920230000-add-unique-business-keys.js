'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const duplicateChecks = [
      ['clientes', ['email']],
      ['clientes', ['nome', 'telefone']],
      ['veiculos', ['modelo', 'marca', 'ano', 'id_cliente']],
      ['mecanicos', ['email']],
      ['pecas', ['nome']],
      ['gerentes', ['email']]
    ];

    for (const [table, columns] of duplicateChecks) {
      const columnList = columns.map(column => `\`${column}\``).join(', ');
      const [duplicates] = await queryInterface.sequelize.query(
        `SELECT ${columnList}, COUNT(*) AS total FROM \`${table}\` GROUP BY ${columnList} HAVING COUNT(*) > 1 LIMIT 5`
      );

      if (duplicates.length > 0) {
        throw new Error(
          `Não foi possível criar a regra de duplicidade em ${table} (${columns.join(', ')}). ` +
          `Existem registros repetidos: ${JSON.stringify(duplicates)}`
        );
      }
    }

    await queryInterface.addIndex('clientes', ['email'], {
      unique: true,
      name: 'clientes_email_unique'
    });
    await queryInterface.addIndex('clientes', ['nome', 'telefone'], {
      unique: true,
      name: 'clientes_nome_telefone_unique'
    });
    await queryInterface.addIndex('veiculos', ['modelo', 'marca', 'ano', 'id_cliente'], {
      unique: true,
      name: 'veiculos_cliente_identidade_unique'
    });
    await queryInterface.addIndex('mecanicos', ['email'], {
      unique: true,
      name: 'mecanicos_email_unique'
    });
    await queryInterface.addIndex('pecas', ['nome'], {
      unique: true,
      name: 'pecas_nome_unique'
    });
    await queryInterface.addIndex('gerentes', ['email'], {
      unique: true,
      name: 'gerentes_email_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('gerentes', 'gerentes_email_unique');
    await queryInterface.removeIndex('pecas', 'pecas_nome_unique');
    await queryInterface.removeIndex('mecanicos', 'mecanicos_email_unique');
    await queryInterface.removeIndex('veiculos', 'veiculos_cliente_identidade_unique');
    await queryInterface.removeIndex('clientes', 'clientes_nome_telefone_unique');
    await queryInterface.removeIndex('clientes', 'clientes_email_unique');
  }
};
