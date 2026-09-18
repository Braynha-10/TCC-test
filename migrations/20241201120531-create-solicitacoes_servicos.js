'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('solicitacoes_servicos', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_mecanico: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'mecanicos',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            // id_cliente: {
            //     type: Sequelize.INTEGER,
            //     allowNull: false,
            //     references: {
            //         model: 'clientes',
            //         key: 'id'
            //     },
            //     onUpdate: 'CASCADE',
            //     onDelete: 'CASCADE'
            // },
            id_veiculo: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'veiculos',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            id_peca: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'pecas',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tipo_pagamento: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            desconto: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            id_catalogo: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'catalogos',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            descricao: {
                type: Sequelize.STRING,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('PENDENTE', 'APROVADO', 'RECUSADO'),
                defaultValue: 'PENDENTE'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('solicitacoes_servicos');
    }
};
