const generateOtp = () => {

    return Math.floor(1000000 + Math.random()).toString();

};

export default generateOtp;