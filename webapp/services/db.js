// connect to db

exports.getUser = ({ username, password }) => {
    // sql scripts to fetch user with username & password
    // user hardcoded for simplicity, store in a db for production applications
    if(username === 'admin' && password === 'password') {
    const user = { id: 1, username: 'admin', firstName: 'Test', lastName: 'User' };
    return user;
    } else {
        return null;
    }
}