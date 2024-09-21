/* eslint-disable */

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email, password
            }
        });

        const jwtString = JSON.stringify(res.data.token);

        document.cookie = `jwt=${jwtString}`;

        if (res.status === 200) {        
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
        
    } catch (error) {
        console.log(error);
    }
}
