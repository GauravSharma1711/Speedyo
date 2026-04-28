import * as React from 'react';

interface EmailTemplateProps {
  username: string;
}

export default function WelcomeEmail({ username }: EmailTemplateProps) {
  return (
    <div>
      <h1>Welcome, {username}!</h1>
    </div>
  );
}