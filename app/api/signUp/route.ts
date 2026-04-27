import { NextRequest, NextResponse } from "next/server";

import prisma from '../../../db/prisma'
import bcrypt from 'bcryptjs'


export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({
                error: "name, email and password are required"
            }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }       
        });

        if (existingUser) {        
            return NextResponse.json({
                success: false,
                message: "User with this email is already present"
            }, { status: 400 });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        await prisma.user.create({  
            data: {
                full_name: name,
                email,
                password: hashedPassword,
                verificationCode,
                verificationCodeExpiry: expiryDate
            }
        });

        return NextResponse.json({  
            success: true,
            message: "User registered successfully"
        }, { status: 201 });

    } catch (error) {
        console.error("Error registering user", error);
        return NextResponse.json({
            success: false,
            message: "Error registering user"
        }, { status: 500 });
    }
}

