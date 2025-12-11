// Tipos auxiliares
export type Friend = {
    status: string;
    username: string;
    nick: string;
    rankingPosition: number;
    xp: number;
};

export type ChallengeProgress = {
    nameChallange: string;
    capFinish: number;
    xpObtido: number;
};

// Entidade User
export interface User {
    uid: string;
    username: string;
    nick: string;
    email: string;
    password?: string;
    imagePerfil: string; // mudei para opcional, thing
    createdAt: Date;
    lastLogin: Date;
    rankingPosition: number;
    xp: number;
    friends: Friend[];
    challenge_progress: ChallengeProgress[];
}
export type UserSignUp = Omit<User,
    "uid" | "createdAt" | "lastLogin">

export type UserSignUpWithoutDefaultValues = Omit<UserSignUp,
    "challenge_progress" | "friends" | "xp" | "rankingPosition">


export interface UserSignUpForm extends UserSignUpWithoutDefaultValues {
    password: string
    confirmPassword: string
}
