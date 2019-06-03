const {
  SOUND_FX_ENABLED,
  SCENE_FX_ENABLED,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_TOKEN,
  TWITCH_CLIENT_USERNAME,
  TWITCH_CLIENT_USER_ID,
  TWITCH_BOT_USERNAME,
  TWITCH_BOT_TOKEN
} = process.env;

const requireConfigMessage = 'REQUIRED CONFIGURATION WAS NOT PROVIDED';

export const isSoundFxEnabled: boolean =
  Boolean(SOUND_FX_ENABLED === 'true') ||
  false;

export const isSceneFxEnabled: boolean =
  Boolean(SCENE_FX_ENABLED === 'true') ||
  false;

export const twitchClientId: string =
  TWITCH_CLIENT_ID || requireConfigMessage;

export const twitchClientToken: string =
  TWITCH_CLIENT_TOKEN || requireConfigMessage;

export const twitchClientUsername: string =
  TWITCH_CLIENT_USERNAME || 'themichaeljolley';

export const twitchClientUserId: string =
  TWITCH_CLIENT_USER_ID || '279965339';

export const twitchBotUsername: string =
  TWITCH_BOT_USERNAME || 'b3_bot';

export const twitchBotToken: string =
  TWITCH_BOT_TOKEN || requireConfigMessage;