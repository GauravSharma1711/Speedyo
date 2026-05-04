
import {resend} from '../lib/resend'

import VerificationEmail from '@/mailsTemplates/verificationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendVerificationMail(
    full_name:string,
    email:string,
    otp:string,
) {
    try {

await resend.emails.send({
    from:fromEmail,
    to:email,
    subject:'Verify your email for Speedyo',
    html: VerificationEmail({ full_name, otp }),

})

     return {success:true,message:"VerificationEmail send successfully"}
    } catch (error) {
        console.error("Error sending VerificationEmail",error)
return {success:false,message:"Failed to send VerificationEmail"}
        
    }
}