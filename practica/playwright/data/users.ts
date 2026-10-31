export const users = {
    standard: {
        username: 'standard_user',
        password: process.env.SAUCE_PASSWORD!
    },
    locked: {
        username: 'locked_out_user',
        password: process.env.SAUCE_PASSWORD ?? throwError('SAUCE_PASSWORD environment variable is not set')
    }
};

function throwError(message: string): never {
    throw new Error(message);
}