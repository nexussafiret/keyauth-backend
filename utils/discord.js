import fetch from 'node-fetch';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export async function sendDiscordNotification(data) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('⚠️  Discord webhook not configured');
    return;
  }

  try {
    const embed = {
      embeds: [{
        title: data.title || 'KeyAuth Notification',
        description: data.description,
        color: data.color || 3447003, // Blue
        fields: data.fields || [],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'KeyAuth License System'
        }
      }]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(embed)
    });

    if (response.ok) {
      console.log('✅ Discord notification sent');
    } else {
      console.log('❌ Failed to send Discord notification');
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}

export async function logLicenseCreation(license, userName) {
  await sendDiscordNotification({
    title: '🔑 New License Created',
    description: `A new license has been generated`,
    color: 5763719, // Green
    fields: [
      { name: 'License Key', value: `\`${license.key}\``, inline: false },
      { name: 'Created By', value: userName, inline: true },
      { name: 'Duration', value: license.duration || 'Lifetime', inline: true },
      { name: 'Status', value: license.status, inline: true },
      { name: 'Note', value: license.note || 'No note', inline: false }
    ]
  });
}

export async function logLicenseVerification(license, result) {
  await sendDiscordNotification({
    title: result.valid ? '✅ License Verified' : '❌ License Verification Failed',
    description: result.message,
    color: result.valid ? 5763719 : 15158332, // Green or Red
    fields: [
      { name: 'License Key', value: `\`${license}\``, inline: false },
      { name: 'Status', value: result.valid ? 'Valid' : 'Invalid', inline: true }
    ]
  });
}

export async function logUserRegistration(user) {
  await sendDiscordNotification({
    title: '👤 New User Registered',
    description: `A new user has signed up`,
    color: 3447003, // Blue
    fields: [
      { name: 'Name', value: user.name, inline: true },
      { name: 'Email', value: user.email, inline: true },
      { name: 'Account ID', value: user.id, inline: false }
    ]
  });
}
