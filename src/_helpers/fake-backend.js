// array no localstorage para usuários cadastrados
let users = JSON.parse(localStorage.getItem('users')) || [];
    
export function configureFakeBackend() {
    let realFetch = window.fetch;
    window.fetch = function (url, opts) {
        return new Promise((resolve, reject) => {
            // quebro o tempo limite para simular a chamada de API do servidor
            setTimeout(() => {

                // autenticação 
                if (url.endsWith('/users/authenticate') && opts.method === 'POST') {
                    // obtém parâmetros do post request
                    let params = JSON.parse(opts.body);

                    // descobre se algum usuário corresponde às credenciais de login
                    let filteredUsers = users.filter(user => {
                        return user.email === params.email && user.password === params.password;
                    });

                    if (filteredUsers.length) {
                        // se os detalhes de login forem válidos, retorne os detalhes do usuário e um fake jwt token
                        let user = filteredUsers[0];
                        let responseJson = {
                            id: user.id,
                            email: user.email,
                            tel: user.tel,
                            fullName: user.fullName,
                            cpf: user.cpf,
                            token: 'fake-jwt-token'
                        };
                        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(responseJson)) });
                    } else {
                        // senão retorne um erro
                        reject('Email ou senha esta incorreto');
                    }

                    return;
                }

                // obtém usuários
                if (url.endsWith('/users') && opts.method === 'GET') {
                    // verifica se há token de autenticação fake no cabeçalho e retorna os usuários, se válido, esta segurança é implementada no lado do servidor
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(users))});
                    } else {
                        // retorna erro 401 não autorizado se o token for nulo ou inválido
                        reject('Não autorizado!');
                    }

                    return;
                }

                // obtém usuário por id
                if (url.match(/\/users\/\d+$/) && opts.method === 'GET') {
                    // verifica se há token de autenticação fake no cabeçalho e retorna os usuários, se válido, esta segurança é implementada no lado do servidor
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        // Encontra usuário por id em users array
                        let urlParts = url.split('/');
                        let id = parseInt(urlParts[urlParts.length - 1]);
                        let matchedUsers = users.filter(user => { return user.id === id; });
                        let user = matchedUsers.length ? matchedUsers[0] : null;

                        // responde 200 OK com o usuário
                        resolve({ ok: true, text: () => JSON.stringify(user)});
                    } else {
                        // retorna erro 401 'não autorizado' se o token for nulo ou inválido
                        reject('Não autorizado');
                    }

                    return;
                }

                // cadastra o usuário
                if (url.endsWith('/users/register') && opts.method === 'POST') {
                    // obtém novo objeto de usuário do corpo da postagem
                    let newUser = JSON.parse(opts.body);

                    // validação
                    let duplicateUser = users.filter(user => { return user.email === newUser.email; }).length;
                    if (duplicateUser) {
                        reject('Email "' + newUser.email + '" ja esta em uso');
                        return;
                    }

                    // salva novo usuário
                    newUser.id = users.length ? Math.max(...users.map(user => user.id)) + 1 : 1;
                    users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(users));

                    // responde 200 OK
                    resolve({ ok: true, text: () => Promise.resolve() });

                    return;
                }

                // exclui o usuário
                if (url.match(/\/users\/\d+$/) && opts.method === 'DELETE') {
                    // verifica se há token de autenticação fake no cabeçalho e retorna os usuários, se válido, esta segurança é implementada no lado do servidor
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        // Encontra usuário por id em users array
                        let urlParts = url.split('/');
                        let id = parseInt(urlParts[urlParts.length - 1]);
                        for (let i = 0; i < users.length; i++) {
                            let user = users[i];
                            if (user.id === id) {
                                // delete user
                                users.splice(i, 1);
                                localStorage.setItem('users', JSON.stringify(users));
                                break;
                            }
                        }

                        // responde 200 OK
                        resolve({ ok: true, text: () => Promise.resolve() });
                    } else {
                        // retorna erro 401 'não autorizado' se o token for nulo ou inválido
                        reject('Não autorizado');
                    }

                    return;
                }

                // passa por qualquer solicitação não tratada acima
                realFetch(url, opts).then(response => resolve(response));

            }, 500);
        });
    }
}