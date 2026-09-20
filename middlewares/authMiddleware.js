const authMiddleware = (req, res, next) => {
    if (!req.session.mecanico) {
        if (req.accepts('html')) {
            return res.status(401).render('errorPage', {
                statusCode: 401,
                message: 'Faça login como mecânico para acessar este recurso.',
                loginPath: '/login/mecanico'
            });
        }
        return res.status(401).json({ error: 'Acesso negado para mecanico. Por favor, faça login.' });
    }
    // else if (!req.session.gerente) {
    //     res.render("errorPage");
    //     return
    //     // res.status(401).json({ message: 'Acesso negado para gerente. Por favor, faça login.' });
    // }
    next();
};

const authMiddlewareGerente = (req, res, next) => {
    if (!req.session.gerente) {
        if (req.accepts('html')) {
            return res.status(401).render('errorPage', {
                statusCode: 401,
                message: 'Faça login como gerente para acessar este recurso.',
                loginPath: '/login/gerente'
            });
        }
        return res.status(401).json({ error: 'Acesso negado para gerente. Por favor, faça login.' });
    }
    next();
};

module.exports = {
    authMiddleware, 
    authMiddlewareGerente
};