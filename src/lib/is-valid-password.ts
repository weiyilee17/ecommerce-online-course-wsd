export async function isValidPassword(password: string, hasshedPassword: string) {
  return (await hashPassword(password)) === hasshedPassword;
}

async function hashPassword(password: string) {
  const arrayBuffer = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(password));

  return Buffer.from(arrayBuffer).toString('base64');
}
