export interface RegistrationRequest{
    username: String,
    email: String,
    password: String,
    confirmPassword: String
}

export interface RegistrationResponse{
    message: String
}