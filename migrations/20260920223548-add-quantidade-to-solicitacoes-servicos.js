'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'solicitacoes_servicos',
      'quantidade',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    );

    await queryInterface.addColumn(
      'servicos',
      'quantidade',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('solicitacoes_servicos', 'quantidade');
    await queryInterface.removeColumn('servicos', 'quantidade');
  }
};
