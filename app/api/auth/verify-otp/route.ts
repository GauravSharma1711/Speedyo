
import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) { 
    try {
        const { email, otp } = await request.json(); 

        if (!email || !otp) {
            return NextResponse.json({
                success: false,
                message: "Email and OTP are required"
            }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                email,
            }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });             
        }

        const isCodeValid = user.verificationCode === otp;
        const isCodeNotExpired = new Date(user.verificationCodeExpiry!) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            await prisma.user.update({       
                where: { email },            
                data: {                      
                    isVerified: true,        
                    verificationCode: '',  
                  verificationCodeExpiry: new Date(0),
                }
            });



               // ── Activate guest slots now
            try {
                const guestPurchases = await prisma.guestPurchase.findMany({
                    where: {
                        guest_email: email,
                        status: "payment_completed",
                    },
                });
                if (guestPurchases.length > 0) {
                    const totalSlots = guestPurchases.reduce(
                        (sum, p) => sum + p.slots_purchased, 0
                    );
                    await prisma.$transaction(async (tx) => {
                        
                        await tx.user.update({
                            where: { email },
                            data: { user_type: "private_seller" },
                        });

                        
                        await tx.privateSellerSlots.upsert({
                            where: { userId: user.id },
                            update: { purchased: { increment: totalSlots } },
                            create: {
                                userId: user.id,
                                purchased: totalSlots,
                                used: 0,
                            },
                        });


                        await tx.guestPurchase.updateMany({
                            where: {
                                guest_email: email,
                                status: "payment_completed",
                            },
                            data: {
                                status: "activated",
                                activated_at: new Date(),
                                activated_for_user_id: user.id,
                            },
                        });
                    });
                }
            } catch (slotError) {
                console.error("Failed to activate guest slots:", slotError);
            }






            return NextResponse.json({
                success: true,
                message: "Account verified successfully"
            }, { status: 200 });

        } else if (!isCodeNotExpired) {
            return NextResponse.json({
                success: false,
                message: "Verification code has expired"
            }, { status: 400 });

        } else {
            return NextResponse.json({
                success: false,
                message: "Verification code is incorrect"
            }, { status: 400 });
        }

    } catch (error) {
        console.log("Error verifying otp", error);
        return NextResponse.json({
            success: false,
            message: "Error verifying otp"
        }, { status: 500 });
    }
}
