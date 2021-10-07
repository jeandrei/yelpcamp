/**
 * Aula 441
 * função que gera uma função para fazer o try catch
 * isso é complexo para tentar entender assista aula 436
 * com essa função na rota usamos assim
 * app.post('/campgrounds', catchAsync(async (req, res, next) => {   
 * e sempre que tiver um erro ela vai capturar o erro e passar para o next que vai
 * seguir com o código sem interromper segue para o próximo app.use
 * coloca em todos que tem async
 */

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}