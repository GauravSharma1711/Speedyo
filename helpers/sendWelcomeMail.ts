
import {resend} from '../lib/resend'

import WelcomeEmail from '@/mailsTemplates/welcome'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendWelcomeMail(
    email:string,
    username:string,
) {
    try {

await resend.emails.send({
    from:fromEmail,
    to:email,
    subject:'Speedyo Welcome Email',
    react: WelcomeEmail({username})

})

     return {success:true,message:"Welcome email send successfully"}
    } catch (error) {
        console.error("Error sending welcome email",error)
return {success:false,message:"Failed to send welcome email"}
        
    }
}