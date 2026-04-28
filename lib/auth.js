
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers';
import prisma from '../db/prisma';

const JWT_SECRET=process.env.JWT_SECRET

export const hashedPassword = async (password)=>{
    return bcrypt.hash(password,10);
}

export const verifyPassword = async (password,hashedPassword)=>{
    return bcrypt.compare(password,hashedPassword);
}

export const generateJwtToken = (userId)=>{
    return jwt.sign(
        {userId},
        JWT_SECRET,
        {expiresIn:'7d'}
    )
}

export const verifyToken = (token)=>{
    return jwt.verify( token, JWT_SECRET)
}


export const getCurentUser = async ()=>{
try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token').value;
    if(!token){
        return null;
    }

    const decode = verifyToken(token);

    const userFromDb = await prisma.user.findUnique({
        where:{id:decode.userId},
    })

    if(!userFromDb){
        return null
    }

    const {password, ...user} = userFromDb
       return user

} catch (error) {
    console.log("error",error);
   return null
}

}

