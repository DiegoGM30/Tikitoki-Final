export default () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
  
    if (user && user.token) {
        // For Node.js Express back-end
        return { 'Authorization': "Bearer " + user.token };
    } else {
        return {};
    }
}