const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    //res.send(req.body);
    try{
        const { email, username, password } = req.body;
        const user = new User( {email, username });
        const registeredUser = await User.register(user, password);
        //após registrar efetuamos o login aula 513
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success','Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        }) 
    } catch (e){
        req.flash('error', e.message);
        res.redirect('register');
    }
    
}

module.exports.renderLogin =  (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    //se não tiver url para redirecionar redireciona para campgrounds
    //esse returnTo vem la da middlewere.js aula 514
    const redirectUrl = req.session.returnTo || '/campgrounds';
    //depois deletamos o returnTo da session para retornar para
    //onde o usuário tentou acessar sem login apenas uma vez
    //caso contrário toda vez irira retornar para lá
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}


module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}