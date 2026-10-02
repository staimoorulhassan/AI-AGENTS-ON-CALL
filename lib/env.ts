const DEFAULT_SIP_SERVER = 'sip.suii.us:5060';

export function getRuntimeConfig() {
  const sipServer = process.env.SIP_SERVER?.trim() || DEFAULT_SIP_SERVER;
  const sipUsername = process.env.SIP_USERNAME?.trim() || '';
  const sipPassword = process.env.SIP_PASSWORD?.trim() || '';

  const vapiPublicKey = process.env.VAPI_PUBLIC_KEY?.trim() || '';
  const vapiPrivateKey = process.env.VAPI_PRIVATE_KEY?.trim() || '';
  const vapiAssistantId = process.env.VAPI_ASSISTANT_ID?.trim() || '';
  const vapiCliKey = process.env.VAPI_CLI_KEY?.trim() || '';

  return {
    sipServer,
    sipUsername,
    sipPassword,
    vapiPublicKey,
    vapiPrivateKey,
    vapiAssistantId,
    vapiCliKey,
    callerId: '',
  };
}

export function hasRequiredVapiEnv() {
  const cfg = getRuntimeConfig();
  return Boolean(
    cfg.vapiPublicKey &&
      cfg.vapiPrivateKey &&
      cfg.vapiAssistantId &&
      cfg.vapiCliKey,
  );
}

export function maskAssistantId(value: string) {
  if (!value) return '';
  if (value.length <= 8) return 'configured';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
