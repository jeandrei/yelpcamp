//middlewere para verificar se o usuário está logado aula 510
//se der um console.log(req.user) vai vim id, username e email do usuário
module.exports.isLoggedIn = (req, res, next) => {
    //console.log("REQ.USER...", req.user);
    if(!req.isAuthenticated()){
        //retornar para a página que o usuário tentou acessar antes do login
        //uso no routes/user.js/router.post
        //req.session.returnTo depois uso no app.js app.use((req, res, next) aula 514
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'you must be signed in first');
        return res.redirect('/login');
    } 
    next();
}