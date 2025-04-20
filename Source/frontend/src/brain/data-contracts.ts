/** AIPersonalityConfig */
export interface AIPersonalityConfig {
  /**
   * Personality Types
   * 小安的人格類型設定
   */
  personality_types: PersonalityTypeConfig[];
  /**
   * Tones
   * 語氣風格設定
   */
  tones: ToneConfig[];
  /**
   * Communication Styles
   * 溝通風格偏好設定
   */
  communication_styles: CommunicationStyleConfig[];
  /**
   * Response Templates
   * 回應模板設定
   */
  response_templates: ResponseTemplate[];
}

/** AbuseCheckRequest */
export interface AbuseCheckRequest {
  /**
   * Message
   * 要檢查的訊息
   */
  message: string;
  /**
   * User Id
   * 用戶ID
   */
  user_id: string;
  /**
   * Channel
   * 渠道，如'line'或'web'
   * @default "web"
   */
  channel?: string;
}

/** AbuseConfig */
export interface AbuseConfig {
  /**
   * Enabled
   * 是否啟用惡意行為保護
   * @default true
   */
  enabled?: boolean;
  /**
   * Sensitive Words
   * 敏感詞列表
   */
  sensitive_words: string[];
  /**
   * Warn Threshold
   * 警告閾值
   * @default 1
   */
  warn_threshold?: number;
  /**
   * Block Durations
   * 違規次數對應的禁用時長(秒)
   */
  block_durations: Record<string, number>;
}

/** AbuseResponse */
export interface AbuseResponse {
  /**
   * Is Abusive
   * 訊息是否為惡意攻擊
   */
  is_abusive: boolean;
  /**
   * Action
   * 應採取的行動: none, warn, block
   * @default "none"
   */
  action?: string;
  /**
   * Block Duration
   * 禁用時長(秒)
   * @default 0
   */
  block_duration?: number;
  /**
   * Message
   * 回應訊息
   */
  message?: string | null;
  /**
   * Violation Count
   * 累計違規次數
   * @default 0
   */
  violation_count?: number;
}

/** AdviceSuggestion */
export interface AdviceSuggestion {
  /**
   * Title
   * Short title/header for the advice
   */
  title: string;
  /**
   * Description
   * Detailed description of the advice
   */
  description: string;
  /**
   * Priority
   * Priority level (1-3, with 1 being highest)
   * @default 1
   */
  priority?: number;
  /**
   * Action Link
   * Optional link for additional resources or actions
   */
  action_link?: string | null;
  /**
   * Action Text
   * Text for the action link
   */
  action_text?: string | null;
}

/** CommunicationStyleConfig */
export interface CommunicationStyleConfig {
  /**
   * Name
   * 溝通風格名稱
   */
  name: string;
  /**
   * Value
   * 溝通風格值 (0-1)
   */
  value: number;
  /**
   * Description
   * 溝通風格描述
   */
  description: string;
}

/** ConversationRequest */
export interface ConversationRequest {
  /**
   * Message
   * The user's message to analyze and respond to
   */
  message: string;
  /**
   * Chat History
   * Optional chat history for context
   */
  chat_history?: Record<string, string>[] | null;
  /**
   * User Id
   * User ID for tracking usage limits
   */
  user_id?: string | null;
}

/** ConversationResponse */
export interface ConversationResponse {
  /**
   * Response
   * The AI's response to the user
   */
  response: string;
  /**
   * Is Scam
   * Whether the message was detected as a potential scam
   * @default false
   */
  is_scam?: boolean;
  /**
   * Analysis
   * Analysis data if available
   */
  analysis?: Record<string, any> | null;
  /**
   * Scam Info
   * Scam information if detected
   */
  scam_info?: Record<string, any> | null;
  /**
   * Emotion Analysis
   * Emotional analysis of the message
   */
  emotion_analysis?: Record<string, any> | null;
}

/** EmergencyCheckRequest */
export interface EmergencyCheckRequest {
  /**
   * Message
   * 要檢查的訊息內容
   */
  message: string;
}

/** EmotionAnalysisRequest */
export interface EmotionAnalysisRequest {
  /**
   * Message
   * User's message to analyze for emotional content
   */
  message: string;
  /**
   * Chat History
   * Optional chat history for context
   */
  chat_history?: Record<string, string>[] | null;
  /**
   * User Id
   * User ID for tracking
   */
  user_id?: string | null;
}

/** EmotionAnalysisResponse */
export interface EmotionAnalysisResponse {
  /**
   * Primary Emotion
   * The primary emotion detected
   */
  primary_emotion: string;
  /**
   * Emotion Intensity
   * Intensity of the detected emotion (0.0-1.0)
   */
  emotion_intensity: number;
  /**
   * Secondary Emotions
   * Additional emotions detected
   * @default []
   */
  secondary_emotions?: string[];
  /**
   * Requires Immediate Support
   * Whether the user needs immediate emotional support
   * @default false
   */
  requires_immediate_support?: boolean;
  /**
   * Context Factors
   * Contextual factors affecting emotional state
   * @default []
   */
  context_factors?: string[];
  /**
   * Confidence
   * Confidence in the emotion analysis (0.0-1.0)
   */
  confidence: number;
}

/** EmotionalSupportMessage */
export interface EmotionalSupportMessage {
  /**
   * Id
   * Unique identifier for the message
   */
  id: string;
  /**
   * Message
   * The supportive message text
   */
  message: string;
  /**
   * Context
   * The context this message is suitable for
   */
  context: string;
}

/** EmotionalSupportRequest */
export interface EmotionalSupportRequest {
  /**
   * Emotional State
   * Current emotional state of the user (general, fear, anxiety, worry, overwhelmed, confused, etc)
   * @default "general"
   */
  emotional_state?: string;
  /**
   * Is Victim
   * Whether the user is already a victim of a scam
   * @default false
   */
  is_victim?: boolean;
  /**
   * Scam Type
   * Identifier for the scam type if known (fake_customer_service, investment_scam, romance_scam, etc)
   */
  scam_type?: string | null;
  /**
   * Needs Encouragement
   * Whether the user needs encouragement for taking action
   * @default false
   */
  needs_encouragement?: boolean;
  /**
   * Language
   * Language for the response (zh, en)
   * @default "zh"
   */
  language?: string;
  /**
   * Custom Context
   * Optional custom context for tailoring the emotional support
   */
  custom_context?: string | null;
}

/** EmotionalSupportResponse */
export interface EmotionalSupportResponse {
  /**
   * Primary
   * Primary emotional support message
   */
  primary: string;
  /**
   * Messages
   * List of supportive messages
   * @default []
   */
  messages?: EmotionalSupportMessage[];
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** ImageAnalysisRequest */
export interface ImageAnalysisRequest {
  /**
   * Image Url
   * URL of the image to analyze
   */
  image_url: string;
}

/** KeywordCategory */
export interface KeywordCategory {
  /**
   * Name
   * 關鍵詞類別名稱
   */
  name: string;
  /**
   * Keywords
   * 關鍵詞列表
   */
  keywords: string[];
  /**
   * Responses
   * 回應列表
   */
  responses: string[];
  /**
   * Threshold
   * 匹配閾值，默認為0.7（70%）
   * @default 0.7
   */
  threshold?: number;
}

/** KeywordMatchRequest */
export interface KeywordMatchRequest {
  /**
   * Message
   * 要匹配的訊息
   */
  message: string;
}

/** KeywordResponseConfig */
export interface KeywordResponseConfig {
  /**
   * Categories
   * 所有關鍵詞類別
   */
  categories: Record<string, KeywordCategory>;
  /**
   * Enabled
   * 啟用或禁用關鍵詞回應系統
   * @default true
   */
  enabled?: boolean;
}

/** LineCredentials */
export interface LineCredentials {
  /**
   * Channel Id
   * LINE Channel ID
   */
  channel_id: string;
  /**
   * Channel Secret
   * LINE Channel Secret
   */
  channel_secret: string;
  /**
   * Channel Access Token
   * LINE Channel Access Token
   */
  channel_access_token: string;
}

/** LineMessageRequest */
export interface LineMessageRequest {
  /**
   * User Id
   * Line user ID to send message to
   */
  user_id: string;
  /**
   * Message
   * Message text to send
   */
  message: string;
}

/** LineRelayEvent */
export interface LineRelayEvent {
  /** Type */
  type: string;
  /** Message */
  message?: Record<string, any> | null;
  /** Source */
  source?: Record<string, any> | null;
  /** Timestamp */
  timestamp?: number | null;
  /** Reply Token */
  reply_token?: string | null;
  /** User Id */
  user_id: string;
}

/** LineRelayRequest */
export interface LineRelayRequest {
  /**
   * Api Key
   * API key for authentication
   */
  api_key: string;
  /**
   * Events
   * LINE events from external webhook
   */
  events: LineRelayEvent[];
}

/** PersonalityTypeConfig */
export interface PersonalityTypeConfig {
  /**
   * Name
   * 人格類型名稱
   */
  name: string;
  /**
   * Weight
   * 人格類型權重 (0-1)
   */
  weight: number;
}

/** RelayResponse */
export interface RelayResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Responses */
  responses?: Record<string, any>[] | null;
}

/** ResponseTemplate */
export interface ResponseTemplate {
  /**
   * Name
   * 回應模板名稱
   */
  name: string;
  /**
   * Content
   * 回應模板內容
   */
  content: string;
}

/** ScamDetectionRequest */
export interface ScamDetectionRequest {
  /**
   * Text
   * Text to analyze for potential scams
   */
  text: string;
  /**
   * Language
   * Language of the text (auto, en, zh)
   * @default "auto"
   */
  language?: string | null;
}

/** ScamDetectionResponse */
export interface ScamDetectionResponse {
  /**
   * Is Scam
   * Whether the message appears to be a scam
   */
  is_scam: boolean;
  /**
   * Overall Confidence
   * Overall confidence score (0-1) that this is a scam
   */
  overall_confidence: number;
  /** Information about the identified scam type */
  scam_type?: ScamTypeInfo | null;
  /**
   * Indicators
   * List of detected scam indicators
   * @default []
   */
  indicators?: ScamIndicator[];
  /**
   * Analysis Summary
   * Summary of the analysis in natural language
   */
  analysis_summary: string;
}

/** ScamIndicator */
export interface ScamIndicator {
  /**
   * Name
   * Name of the indicator category
   */
  name: string;
  /**
   * Matches
   * Specific patterns matched
   */
  matches: string[];
  /**
   * Description
   * Description of why this is concerning
   */
  description: string;
}

/** ScamTypeInfo */
export interface ScamTypeInfo {
  /**
   * Id
   * Identifier for the scam type
   */
  id: string;
  /**
   * Name
   * Name of the scam type
   */
  name: string;
  /**
   * Description
   * Description of the scam type
   */
  description: string;
  /**
   * Confidence Score
   * Confidence score (0-1) of this being the correct classification
   */
  confidence_score: number;
  /**
   * Advice
   * Advice for handling this type of scam
   */
  advice: string[];
}

/** SpecialResponseConfig */
export interface SpecialResponseConfig {
  /**
   * Rules
   * List of special response rules
   */
  rules: SpecialResponseRule[];
  /**
   * System Enabled
   * Whether the special response system is enabled
   * @default true
   */
  system_enabled?: boolean;
  /**
   * Last Updated
   * When the configuration was last updated
   */
  last_updated: string;
}

/** SpecialResponseRule */
export interface SpecialResponseRule {
  /**
   * Id
   * Unique identifier for the rule
   */
  id: string;
  /**
   * Name
   * Name of the rule
   */
  name: string;
  /**
   * Description
   * Description of the rule and when it applies
   */
  description: string;
  /**
   * Patterns
   * Regex patterns to match for this situation
   */
  patterns: string[];
  /**
   * Response Templates
   * Response templates by language
   */
  response_templates: Record<string, string[]>;
  /**
   * Emergency Level
   * Emergency level for this situation
   * @default "low"
   */
  emergency_level?: string;
  /**
   * Action Type
   * Type of action recommended
   */
  action_type?: string | null;
  /**
   * Enabled
   * Whether this rule is enabled
   * @default true
   */
  enabled?: boolean;
}

/** SpecialSituationRequest */
export interface SpecialSituationRequest {
  /**
   * Text
   * User's message text to analyze
   */
  text: string;
  /**
   * User Id
   * User ID for context lookup
   */
  user_id?: string | null;
  /**
   * Is Group
   * Whether the message is from a group chat
   * @default false
   */
  is_group?: boolean;
  /**
   * Language
   * Preferred language for response (zh, en)
   * @default "zh"
   */
  language?: string;
}

/** SpecialSituationResponse */
export interface SpecialSituationResponse {
  /**
   * Situation Detected
   * Whether a special situation was detected
   */
  situation_detected: boolean;
  /**
   * Situation Type
   * Type of situation detected if any
   */
  situation_type?: string | null;
  /**
   * Response
   * Appropriate response for the situation
   */
  response?: string | null;
  /**
   * Emergency Level
   * Emergency level (none, low, medium, high)
   * @default "none"
   */
  emergency_level?: string;
  /**
   * Action Needed
   * Recommended actions if any
   */
  action_needed?: Record<string, any> | null;
}

/** TestConnectionResponse */
export interface TestConnectionResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Details */
  details?: Record<string, any> | null;
}

/** TextAnalysisRequest */
export interface TextAnalysisRequest {
  /** Text */
  text: string;
}

/** TextAnalysisResponse */
export interface TextAnalysisResponse {
  /** Is Scam */
  is_scam: boolean;
  /** Scam Info */
  scam_info?: Record<string, any> | null;
  /**
   * Matched Categories
   * @default []
   */
  matched_categories?: string[];
  /**
   * Confidence
   * @default 0
   */
  confidence?: number;
}

/** ToneConfig */
export interface ToneConfig {
  /**
   * Name
   * 語氣風格名稱
   */
  name: string;
  /**
   * Enabled
   * 是否啟用
   * @default true
   */
  enabled?: boolean;
  /**
   * Weight
   * 語氣風格權重 (0-1)
   */
  weight: number;
}

/** UsageConfig */
export interface UsageConfig {
  /**
   * Enabled
   * 是否啟用使用限制
   * @default true
   */
  enabled?: boolean;
  /**
   * Session Limit
   * 單一會話的最大請求數量
   * @default 20
   */
  session_limit?: number;
  /**
   * Session Token Limit
   * 單一會話的最大token數量
   * @default 10000
   */
  session_token_limit?: number;
  /**
   * Session Window
   * 會話窗口期(秒)
   * @default 3600
   */
  session_window?: number;
  /**
   * Session Cooldown
   * 會話冷卻時間(秒)
   * @default 600
   */
  session_cooldown?: number;
  /**
   * Global Hourly Limit
   * 全局每小時最大請求數量
   * @default 1000
   */
  global_hourly_limit?: number;
  /**
   * Global Daily Limit
   * 全局每日最大請求數量
   * @default 10000
   */
  global_daily_limit?: number;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** AdviceRequest */
export interface AppApisScamDetectorAdviceRequest {
  /**
   * Scam Type Id
   * Identifier for the scam type
   */
  scam_type_id: string;
  /**
   * Is Victim
   * Whether the user is already a victim of the scam
   * @default false
   */
  is_victim?: boolean;
  /**
   * Language
   * Language for the advice (zh, en)
   * @default "zh"
   */
  language?: string | null;
  /**
   * User Profile
   * Optional user profile information to personalize advice
   */
  user_profile?: Record<string, any> | null;
}

/** AdviceResponse */
export interface AppApisScamDetectorAdviceResponse {
  /** Information about the scam type */
  scam_type: ScamTypeInfo;
  /**
   * Is Victim
   * Whether the advice is for a victim
   */
  is_victim: boolean;
  /**
   * Immediate Steps
   * Immediate steps to take
   * @default []
   */
  immediate_steps?: AdviceSuggestion[];
  /**
   * Preventive Measures
   * Preventive measures for future protection
   * @default []
   */
  preventive_measures?: AdviceSuggestion[];
  /**
   * Support Resources
   * Support resources and contacts
   * @default []
   */
  support_resources?: AdviceSuggestion[];
  /**
   * Reassurance Message
   * A reassuring message to help the user feel supported
   */
  reassurance_message: string;
}

/** AdviceRequest */
export interface AppApisTextAnalysisAdviceRequest {
  /** Is Scam */
  is_scam: boolean;
  /** Scam Info */
  scam_info?: Record<string, any> | null;
}

/** AdviceResponse */
export interface AppApisTextAnalysisAdviceResponse {
  /** Response */
  response: string;
}

export type CheckHealthData = HealthResponse;

export type GetPersonalityConfigData = AIPersonalityConfig;

export type UpdatePersonalityConfigData = AIPersonalityConfig;

export type UpdatePersonalityConfigError = HTTPValidationError;

export interface HasEmergencyKeywordsParams {
  /** Message */
  message: string;
}

/** Response Has Emergency Keywords */
export type HasEmergencyKeywordsData = boolean;

export type HasEmergencyKeywordsError = HTTPValidationError;

export type HasEmergencyKeywordsEndpointData = any;

export type HasEmergencyKeywordsEndpointError = HTTPValidationError;

export type GetUsageConfigEndpointData = any;

export type UpdateUsageConfigData = any;

export type UpdateUsageConfigError = HTTPValidationError;

export interface ToggleUsageLimitsParams {
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
}

export type ToggleUsageLimitsData = any;

export type ToggleUsageLimitsError = HTTPValidationError;

export type GetUsageStatsData = any;

export interface GetUserStatsParams {
  /** User Id */
  userId: string;
}

export type GetUserStatsData = any;

export type GetUserStatsError = HTTPValidationError;

export interface ResetUserStatsParams {
  /** User Id */
  userId: string;
}

export type ResetUserStatsData = any;

export type ResetUserStatsError = HTTPValidationError;

export type GetTopUsersData = any;

export type GenerateUserIdData = any;

/** Request */
export type SetupApiKeyPayload = Record<string, any>;

export type SetupApiKeyData = any;

export type SetupApiKeyError = HTTPValidationError;

export type ProcessRelayEventsData = RelayResponse;

export type ProcessRelayEventsError = HTTPValidationError;

export type GenerateEmotionalSupportData = EmotionalSupportResponse;

export type GenerateEmotionalSupportError = HTTPValidationError;

export type MatchKeywordData = any;

export type MatchKeywordError = HTTPValidationError;

export type KeywordHealthCheckData = any;

export type GetConfigData = any;

export type UpdateConfigData = any;

export type UpdateConfigError = HTTPValidationError;

export interface ToggleSystemParams {
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
}

export type ToggleSystemData = any;

export type ToggleSystemError = HTTPValidationError;

export type AltWebhook2Data = any;

export type AltWebhookOptions2Data = any;

export type ExternalLineWebhookData = any;

export type ExternalLineWebhookOptionsData = any;

export type ExternalPingData = any;

/** Request */
export type ExternalSetupApiKeyPayload = Record<string, any>;

export type ExternalSetupApiKeyData = any;

export type ExternalSetupApiKeyError = HTTPValidationError;

export type SaveCredentialsData = any;

export type SaveCredentialsError = HTTPValidationError;

export type GetCredentialsData = any;

export type WebhookOptionsData = any;

export type WebhookData = any;

export type WebhookError = HTTPValidationError;

export type AltWebhookOptionsData = any;

export type AltWebhookData = any;

export type AltWebhookError = HTTPValidationError;

export type TestConnectionData = TestConnectionResponse;

export type SendMessageData = any;

export type SendMessageError = HTTPValidationError;

export type GetRecentUsersData = any;

export type CheckHealthResult = any;

export type EchoData = any;

export type GetHeadersData = any;

export type OpenEndpointData = any;

export type OpenPostData = any;

export type OpenOptionsData = any;

export type AnalyzeEmotionEndpointData = EmotionAnalysisResponse;

export type AnalyzeEmotionEndpointError = HTTPValidationError;

export type AiConversationChatData = ConversationResponse;

export type AiConversationChatError = HTTPValidationError;

export type CheckAbuseData = AbuseResponse;

export type CheckAbuseError = HTTPValidationError;

export type GetAbuseConfigEndpointData = any;

export type UpdateAbuseConfigData = any;

export type UpdateAbuseConfigError = HTTPValidationError;

export interface ToggleAbuseSystemParams {
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
}

export type ToggleAbuseSystemData = any;

export type ToggleAbuseSystemError = HTTPValidationError;

export interface GetUserStatusParams {
  /** User Id */
  userId: string;
}

export type GetUserStatusData = any;

export type GetUserStatusError = HTTPValidationError;

export interface ResetUserRecordParams {
  /** User Id */
  userId: string;
}

export type ResetUserRecordData = any;

export type ResetUserRecordError = HTTPValidationError;

export type DetectSituationData = SpecialSituationResponse;

export type DetectSituationError = HTTPValidationError;

export type GetSpecialResponseConfigData = SpecialResponseConfig;

export type UpdateSpecialResponseConfigData = SpecialResponseConfig;

export type UpdateSpecialResponseConfigError = HTTPValidationError;

export interface ToggleSystem2Params {
  /** Enabled */
  enabled: boolean;
}

/** Response Toggle System2 */
export type ToggleSystem2Data = Record<string, any>;

export type ToggleSystem2Error = HTTPValidationError;

export type AnalyzeText2Data = TextAnalysisResponse;

export type AnalyzeText2Error = HTTPValidationError;

export type GenerateAdvice2Data = AppApisTextAnalysisAdviceResponse;

export type GenerateAdvice2Error = HTTPValidationError;

export type AnalyzeScamTextData = ScamDetectionResponse;

export type AnalyzeScamTextError = HTTPValidationError;

export type AnalyzeImageEndpointData = ScamDetectionResponse;

export type AnalyzeImageEndpointError = HTTPValidationError;

export type GenerateAdviceData = AppApisScamDetectorAdviceResponse;

export type GenerateAdviceError = HTTPValidationError;

export type GetExamplesData = any;
