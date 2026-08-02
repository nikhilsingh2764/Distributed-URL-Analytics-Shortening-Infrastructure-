export const accessTokenOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",   //protect against strict CSRF
    maxAge: 15 * 60 * 1000  //15 min

};


export const refreshTokenOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 15 * 24 * 60 * 60 * 1000 //15 days

};