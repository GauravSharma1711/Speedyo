import { NextRequest, NextResponse } from "next/server";

import prisma from '../../../../db/prisma'
import bcrypt from 'bcryptjs'

import { sendVerificationMail } from "@/helpers/sendVerificationMail";


export async function POST(request: NextRequest) {
    try {
        const {  email, password,confirmPassword } = await request.json();

        if ( !email || !password || !confirmPassword) {
            return NextResponse.json({
                error: "name, email and password and confirmPassword are required"
            }, { status: 400 });
        }

        const full_name = email.split("@")[0]

          if(password!==confirmPassword){
             return NextResponse.json({
                error: "Password and confirmPassword do not match"
            }, { status: 400 });
        }

 const existingVerifiedUser = await prisma.user.findFirst({
  where: {
    email,
    isVerified: true
  }
});
if(existingVerifiedUser){
    return NextResponse.json({
      success:false,
      message:"Username is already taken"
    },{status:400})
}

     const existingUserByEmail = await prisma.user.findUnique({where:{email}})


      const otp = Math.floor(100000 + Math.random() * 900000).toString();

if(existingUserByEmail){
    
    if(existingUserByEmail.isVerified){
         return NextResponse.json({
        success:false,
        message:"User already exist with this email"
    },{status:400})
    }else{
          const expiryDate  = new Date();
      expiryDate.setMinutes (expiryDate.getMinutes()+10)
         const hashedPassword = await bcrypt.hash(password,10);

       await prisma.user.update({
  where: { email },
  data: {
    password: hashedPassword,
    verificationCode: otp,
    verificationCodeExpiry: expiryDate,
  }
})
    }


  }else{
      const hashedPassword = await bcrypt.hash(password,10);
      const expiryDate  = new Date();
      expiryDate.setMinutes (expiryDate.getMinutes()+10)

    const newUser = await prisma.user.create({
  data: {
    email,
    full_name,
    verificationCode:otp,
     password: hashedPassword,
     verificationCodeExpiry: expiryDate,
     isVerified:false,
  },
});
 }


//  SEND VERIFICATION EMAIL
   const emailResponse =  await sendVerificationMail(full_name,email,otp);

   if(!emailResponse.success){
    return NextResponse.json({
        success:false,
        message:emailResponse.message
    },{status:500})
   }


     



   

        return NextResponse.json({  
            success: true,
            message: "User registered successfully",
             email: email 
        }, { status: 201 });

    } catch (error) {
        console.error("Error registering user", error);
        return NextResponse.json({
            success: false,
            message: "Error registering user"
        }, { status: 500 });
    }
}

