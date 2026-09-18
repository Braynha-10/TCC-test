module.exports = (sequelize, DataTypes) => {
    const Peca = sequelize.define('Peca', {
        nome: DataTypes.STRING,
        descricao: DataTypes.STRING,
        preco: DataTypes.DOUBLE
    }, { tableName: 'pecas' });
    Peca.associate = function (models) {
        Peca.hasOne(models.Estoque, { foreignKey: "produtoId" });
    };
    return Peca;
};
 


