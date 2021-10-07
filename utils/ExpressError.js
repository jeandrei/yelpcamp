/**
 * Aula 441
 * Classe para tratar erros de formulários
 */
class ExpressError extends Error{
    constructor(message, statusCode){
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;