const bcrypt = require('bcrypt');

async function hashPassword (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

async function unhashPasswordByInput(password_input, user_password) {
    const valid_password = await bcrypt.compare(password_input, user_password);
    return valid_password;
}

module.exports.hashPassword = hashPassword;
module.exports.unhashPassword = unhashPasswordByInput;
