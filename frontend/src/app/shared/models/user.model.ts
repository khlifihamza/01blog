export interface RegistrationRequest{
    username: String,
    email: String,
    password: String,
    confirmPassword: String
}

export interface ApiResponse{
    message: String
}

export interface LoginRequest{
    identifier: String,
    password: String,
}
