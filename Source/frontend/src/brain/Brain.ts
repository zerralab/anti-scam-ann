import {
  AIPersonalityConfig,
  AbuseCheckRequest,
  AbuseConfig,
  AiConversationChatData,
  AiConversationChatError,
  AltWebhook2Data,
  AltWebhookData,
  AltWebhookError,
  AltWebhookOptions2Data,
  AltWebhookOptionsData,
  AnalyzeEmotionEndpointData,
  AnalyzeEmotionEndpointError,
  AnalyzeImageEndpointData,
  AnalyzeImageEndpointError,
  AnalyzeScamTextData,
  AnalyzeScamTextError,
  AnalyzeText2Data,
  AnalyzeText2Error,
  AppApisScamDetectorAdviceRequest,
  AppApisTextAnalysisAdviceRequest,
  CheckAbuseData,
  CheckAbuseError,
  CheckHealthData,
  CheckHealthResult,
  ConversationRequest,
  DetectSituationData,
  DetectSituationError,
  EchoData,
  EmergencyCheckRequest,
  EmotionAnalysisRequest,
  EmotionalSupportRequest,
  ExternalLineWebhookData,
  ExternalLineWebhookOptionsData,
  ExternalPingData,
  ExternalSetupApiKeyData,
  ExternalSetupApiKeyError,
  ExternalSetupApiKeyPayload,
  GenerateAdvice2Data,
  GenerateAdvice2Error,
  GenerateAdviceData,
  GenerateAdviceError,
  GenerateEmotionalSupportData,
  GenerateEmotionalSupportError,
  GenerateUserIdData,
  GetAbuseConfigEndpointData,
  GetConfigData,
  GetCredentialsData,
  GetExamplesData,
  GetHeadersData,
  GetPersonalityConfigData,
  GetRecentUsersData,
  GetSpecialResponseConfigData,
  GetTopUsersData,
  GetUsageConfigEndpointData,
  GetUsageStatsData,
  GetUserStatsData,
  GetUserStatsError,
  GetUserStatsParams,
  GetUserStatusData,
  GetUserStatusError,
  GetUserStatusParams,
  HasEmergencyKeywordsData,
  HasEmergencyKeywordsEndpointData,
  HasEmergencyKeywordsEndpointError,
  HasEmergencyKeywordsError,
  HasEmergencyKeywordsParams,
  ImageAnalysisRequest,
  KeywordHealthCheckData,
  KeywordMatchRequest,
  KeywordResponseConfig,
  LineCredentials,
  LineMessageRequest,
  LineRelayRequest,
  MatchKeywordData,
  MatchKeywordError,
  OpenEndpointData,
  OpenOptionsData,
  OpenPostData,
  ProcessRelayEventsData,
  ProcessRelayEventsError,
  ResetUserRecordData,
  ResetUserRecordError,
  ResetUserRecordParams,
  ResetUserStatsData,
  ResetUserStatsError,
  ResetUserStatsParams,
  SaveCredentialsData,
  SaveCredentialsError,
  ScamDetectionRequest,
  SendMessageData,
  SendMessageError,
  SetupApiKeyData,
  SetupApiKeyError,
  SetupApiKeyPayload,
  SpecialResponseConfig,
  SpecialSituationRequest,
  TestConnectionData,
  TextAnalysisRequest,
  ToggleAbuseSystemData,
  ToggleAbuseSystemError,
  ToggleAbuseSystemParams,
  ToggleSystem2Data,
  ToggleSystem2Error,
  ToggleSystem2Params,
  ToggleSystemData,
  ToggleSystemError,
  ToggleSystemParams,
  ToggleUsageLimitsData,
  ToggleUsageLimitsError,
  ToggleUsageLimitsParams,
  UpdateAbuseConfigData,
  UpdateAbuseConfigError,
  UpdateConfigData,
  UpdateConfigError,
  UpdatePersonalityConfigData,
  UpdatePersonalityConfigError,
  UpdateSpecialResponseConfigData,
  UpdateSpecialResponseConfigError,
  UpdateUsageConfigData,
  UpdateUsageConfigError,
  UsageConfig,
  WebhookData,
  WebhookError,
  WebhookOptionsData,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description 獲取当前的AI人格設定
   *
   * @tags ai-personality, dbtn/module:ai_personality
   * @name get_personality_config
   * @summary Get Personality Config
   * @request GET:/routes/ai-personality/config
   */
  get_personality_config = (params: RequestParams = {}) =>
    this.request<GetPersonalityConfigData, void>({
      path: `/routes/ai-personality/config`,
      method: "GET",
      ...params,
    });

  /**
   * @description 更新AI人格設定
   *
   * @tags ai-personality, dbtn/module:ai_personality
   * @name update_personality_config
   * @summary Update Personality Config
   * @request POST:/routes/ai-personality/config
   */
  update_personality_config = (data: AIPersonalityConfig, params: RequestParams = {}) =>
    this.request<UpdatePersonalityConfigData, UpdatePersonalityConfigError>({
      path: `/routes/ai-personality/config`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 檢查使用者是否達到使用限制
   *
   * @tags usage-limits, dbtn/module:usage_limits
   * @name has_emergency_keywords
   * @summary 檢查使用限制
   * @request POST:/routes/usage-limits/check
   */
  has_emergency_keywords = (query: HasEmergencyKeywordsParams, params: RequestParams = {}) =>
    this.request<HasEmergencyKeywordsData, HasEmergencyKeywordsError>({
      path: `/routes/usage-limits/check`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description 檢查訊息是否包含緊急關鍵詞，允許繞過限制
   *
   * @tags usage-limits, dbtn/module:usage_limits
   * @name has_emergency_keywords_endpoint
   * @summary 檢查是否包含緊急關鍵詞
   * @request POST:/routes/usage-limits/has-emergency-keywords
   */
  has_emergency_keywords_endpoint = (data: EmergencyCheckRequest, params: RequestParams = {}) =>
    this.request<HasEmergencyKeywordsEndpointData, HasEmergencyKeywordsEndpointError>({
      path: `/routes/usage-limits/has-emergency-keywords`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 獲取當前的使用限制配置
   *
   * @tags usage-limits, dbtn/module:usage_limits
   * @name get_usage_config_endpoint
   * @summary 獲取使用限制配置
   * @request GET:/routes/usage-limits/config
   */
  get_usage_config_endpoint = (params: RequestParams = {}) =>
    this.request<GetUsageConfigEndpointData, void>({
      path: `/routes/usage-limits/config`,
      method: "GET",
      ...params,
    });

  /**
   * @description 更新使用限制配置
   *
   * @tags usage-limits, dbtn/module:usage_limits
   * @name update_usage_config
   * @summary 更新使用限制配置
   * @request POST:/routes/usage-limits/config
   */
  update_usage_config = (data: UsageConfig, params: RequestParams = {}) =>
    this.request<UpdateUsageConfigData, UpdateUsageConfigError>({
      path: `/routes/usage-limits/config`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 啟用或禁用使用限制功能
   *
   * @tags usage-limits, dbtn/module:usage_limits
   * @name toggle_usage_limits
   * @summary 開關使用限制功能
   * @request POST:/routes/usage-limits/toggle
   */
  toggle_usage_limits = (query: ToggleUsageLimitsParams, params: RequestParams = {}) =>
    this.request<ToggleUsageLimitsData, ToggleUsageLimitsError>({
      path: `/routes/usage-limits/toggle`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description 獲取全局使用統計
   *
   * @tags usage-limits, dbtn/module:usage_limits
   * @name get_usage_stats
   * @summary 獲取使用統計
   * @request GET:/routes/usage-limits/stats
   */
  get_usage_stats = (params: RequestParams = {}) =>
    this.request<GetUsageStatsData, void>({
      path: `/routes/usage-limits/stats`,
      method: "GET",
      ...params,
    });

  /**
   * @description 獲取特定使用者的使用統計
   *
   * @tags usage-limits, dbtn/module:usage_limits
   * @name get_user_stats
   * @summary 獲取使用者使用統計
   * @request GET:/routes/usage-limits/user/{user_id}
   */
  get_user_stats = ({ userId, ...query }: GetUserStatsParams, params: RequestParams = {}) =>
    this.request<GetUserStatsData, GetUserStatsError>({
      path: `/routes/usage-limits/user/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description 重置特定使用者的使用記錄
   *
   * @tags usage-limits, dbtn/module:usage_limits
   * @name reset_user_stats
   * @summary 重置使用者使用記錄
   * @request DELETE:/routes/usage-limits/reset/{user_id}
   */
  reset_user_stats = ({ userId, ...query }: ResetUserStatsParams, params: RequestParams = {}) =>
    this.request<ResetUserStatsData, ResetUserStatsError>({
      path: `/routes/usage-limits/reset/${userId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description 按總請求數排序獲取前10名用戶的使用統計
   *
   * @tags usage-limits, dbtn/module:usage_limits
   * @name get_top_users
   * @summary 獲取使用量前10名用戶
   * @request GET:/routes/usage-limits/top-users
   */
  get_top_users = (params: RequestParams = {}) =>
    this.request<GetTopUsersData, void>({
      path: `/routes/usage-limits/top-users`,
      method: "GET",
      ...params,
    });

  /**
   * @description 生成一個唯一的臨時使用者ID
   *
   * @tags usage-limits, dbtn/module:usage_limits
   * @name generate_user_id
   * @summary 生成臨時使用者ID
   * @request GET:/routes/usage-limits/generate-id
   */
  generate_user_id = (params: RequestParams = {}) =>
    this.request<GenerateUserIdData, void>({
      path: `/routes/usage-limits/generate-id`,
      method: "GET",
      ...params,
    });

  /**
   * @description 為外部webhook設置API密鑰
   *
   * @tags line-relay, dbtn/module:line_relay
   * @name setup_api_key
   * @summary 設置中繼API密鑰
   * @request POST:/routes/line-relay/setup-key
   */
  setup_api_key = (data: SetupApiKeyPayload, params: RequestParams = {}) =>
    this.request<SetupApiKeyData, SetupApiKeyError>({
      path: `/routes/line-relay/setup-key`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 處理從外部webhook轉發的LINE事件
   *
   * @tags line-relay, dbtn/module:line_relay
   * @name process_relay_events
   * @summary 處理中繼事件
   * @request POST:/routes/line-relay/events
   */
  process_relay_events = (data: LineRelayRequest, params: RequestParams = {}) =>
    this.request<ProcessRelayEventsData, ProcessRelayEventsError>({
      path: `/routes/line-relay/events`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate supportive emotional responses based on user's emotional state and context
   *
   * @tags emotional-support, dbtn/module:emotional_support
   * @name generate_emotional_support
   * @summary Generate Emotional Support Messages
   * @request POST:/routes/emotional-support/generate
   */
  generate_emotional_support = (data: EmotionalSupportRequest, params: RequestParams = {}) =>
    this.request<GenerateEmotionalSupportData, GenerateEmotionalSupportError>({
      path: `/routes/emotional-support/generate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 檢查訊息是否匹配關鍵詞並返回預設回覆
   *
   * @tags keyword-responses, dbtn/module:keyword_responses
   * @name match_keyword
   * @summary 匹配關鍵詞回覆
   * @request POST:/routes/keyword-responses/match
   */
  match_keyword = (data: KeywordMatchRequest, params: RequestParams = {}) =>
    this.request<MatchKeywordData, MatchKeywordError>({
      path: `/routes/keyword-responses/match`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 簡單檢查關鍵詞系統的健康狀態
   *
   * @tags keyword-responses, dbtn/module:keyword_responses
   * @name keyword_health_check
   * @summary 檢查關鍵詞系統狀態
   * @request GET:/routes/keyword-responses/health-check
   */
  keyword_health_check = (params: RequestParams = {}) =>
    this.request<KeywordHealthCheckData, void>({
      path: `/routes/keyword-responses/health-check`,
      method: "GET",
      ...params,
    });

  /**
   * @description 獲取當前的關鍵詞回覆系統配置
   *
   * @tags keyword-responses, dbtn/module:keyword_responses
   * @name get_config
   * @summary 獲取關鍵詞配置
   * @request GET:/routes/keyword-responses/config
   */
  get_config = (params: RequestParams = {}) =>
    this.request<GetConfigData, void>({
      path: `/routes/keyword-responses/config`,
      method: "GET",
      ...params,
    });

  /**
   * @description 更新關鍵詞回覆系統配置
   *
   * @tags keyword-responses, dbtn/module:keyword_responses
   * @name update_config
   * @summary 更新關鍵詞配置
   * @request POST:/routes/keyword-responses/config
   */
  update_config = (data: KeywordResponseConfig, params: RequestParams = {}) =>
    this.request<UpdateConfigData, UpdateConfigError>({
      path: `/routes/keyword-responses/config`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 啟用或禁用關鍵詞回覆系統
   *
   * @tags keyword-responses, dbtn/module:keyword_responses
   * @name toggle_system
   * @summary 切換關鍵詞系統啟用狀態
   * @request POST:/routes/keyword-responses/toggle
   */
  toggle_system = (query: ToggleSystemParams, params: RequestParams = {}) =>
    this.request<ToggleSystemData, ToggleSystemError>({
      path: `/routes/keyword-responses/toggle`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Alternative webhook with simpler path for external services
   *
   * @tags webhook, dbtn/module:alt_webhook
   * @name alt_webhook2
   * @summary Alt Webhook2
   * @request POST:/routes/alt
   */
  alt_webhook2 = (params: RequestParams = {}) =>
    this.request<AltWebhook2Data, void>({
      path: `/routes/alt`,
      method: "POST",
      ...params,
    });

  /**
   * @description Handle CORS preflight requests
   *
   * @tags webhook, dbtn/module:alt_webhook
   * @name alt_webhook_options2
   * @summary Alt Webhook Options2
   * @request OPTIONS:/routes/alt
   */
  alt_webhook_options2 = (params: RequestParams = {}) =>
    this.request<AltWebhookOptions2Data, void>({
      path: `/routes/alt`,
      method: "OPTIONS",
      ...params,
    });

  /**
   * @description 外部LINE Webhook中繼端點，允許其他服務轉發LINE事件
   *
   * @tags external-relay, dbtn/module:external_relay
   * @name external_line_webhook
   * @summary External Line Webhook
   * @request POST:/routes/webhook/line
   */
  external_line_webhook = (params: RequestParams = {}) =>
    this.request<ExternalLineWebhookData, void>({
      path: `/routes/webhook/line`,
      method: "POST",
      ...params,
    });

  /**
   * @description 處理外部LINE Webhook中繼端點的CORS預檢請求
   *
   * @tags external-relay, dbtn/module:external_relay
   * @name external_line_webhook_options
   * @summary External Line Webhook Options
   * @request OPTIONS:/routes/webhook/line
   */
  external_line_webhook_options = (params: RequestParams = {}) =>
    this.request<ExternalLineWebhookOptionsData, void>({
      path: `/routes/webhook/line`,
      method: "OPTIONS",
      ...params,
    });

  /**
   * @description 測試連線狀態的端點
   *
   * @tags external-relay, dbtn/module:external_relay
   * @name external_ping
   * @summary External Ping
   * @request GET:/routes/ping
   */
  external_ping = (params: RequestParams = {}) =>
    this.request<ExternalPingData, void>({
      path: `/routes/ping`,
      method: "GET",
      ...params,
    });

  /**
   * @description 設置用於外部webhook中繼的API密鑰
   *
   * @tags external-relay, dbtn/module:external_relay
   * @name external_setup_api_key
   * @summary External Setup Api Key
   * @request POST:/routes/setup-key
   */
  external_setup_api_key = (data: ExternalSetupApiKeyPayload, params: RequestParams = {}) =>
    this.request<ExternalSetupApiKeyData, ExternalSetupApiKeyError>({
      path: `/routes/setup-key`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Save LINE bot credentials to the secrets storage
   *
   * @tags line-bot, dbtn/module:line_bot
   * @name save_credentials
   * @summary Save Credentials
   * @request POST:/routes/line-bot/save-credentials
   */
  save_credentials = (data: LineCredentials, params: RequestParams = {}) =>
    this.request<SaveCredentialsData, SaveCredentialsError>({
      path: `/routes/line-bot/save-credentials`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Check if LINE credentials are configured
   *
   * @tags line-bot, dbtn/module:line_bot
   * @name get_credentials
   * @summary Get Credentials
   * @request GET:/routes/line-bot/credentials
   */
  get_credentials = (params: RequestParams = {}) =>
    this.request<GetCredentialsData, void>({
      path: `/routes/line-bot/credentials`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags line-bot, dbtn/module:line_bot
   * @name webhook_options
   * @summary Webhook Options
   * @request OPTIONS:/routes/line-bot/webhook
   */
  webhook_options = (params: RequestParams = {}) =>
    this.request<WebhookOptionsData, void>({
      path: `/routes/line-bot/webhook`,
      method: "OPTIONS",
      ...params,
    });

  /**
   * @description Handle LINE webhook calls. This endpoint is called by LINE when events occur (messages, follows, etc.)
   *
   * @tags line-bot, dbtn/module:line_bot
   * @name webhook
   * @summary Webhook
   * @request POST:/routes/line-bot/webhook
   */
  webhook = (params: RequestParams = {}) =>
    this.request<WebhookData, WebhookError>({
      path: `/routes/line-bot/webhook`,
      method: "POST",
      ...params,
    });

  /**
   * No description
   *
   * @tags line-bot, dbtn/module:line_bot
   * @name alt_webhook_options
   * @summary Alt Webhook Options
   * @request OPTIONS:/routes/line-bot/alt-webhook
   */
  alt_webhook_options = (params: RequestParams = {}) =>
    this.request<AltWebhookOptionsData, void>({
      path: `/routes/line-bot/alt-webhook`,
      method: "OPTIONS",
      ...params,
    });

  /**
   * @description Alternative webhook endpoint for LINE integration
   *
   * @tags line-bot, dbtn/module:line_bot
   * @name alt_webhook
   * @summary Alternative Webhook
   * @request POST:/routes/line-bot/alt-webhook
   */
  alt_webhook = (params: RequestParams = {}) =>
    this.request<AltWebhookData, AltWebhookError>({
      path: `/routes/line-bot/alt-webhook`,
      method: "POST",
      ...params,
    });

  /**
   * @description Test the connection to LINE Messaging API using stored credentials
   *
   * @tags line-bot, dbtn/module:line_bot
   * @name test_connection
   * @summary Test Connection
   * @request POST:/routes/line-bot/test-connection
   */
  test_connection = (params: RequestParams = {}) =>
    this.request<TestConnectionData, void>({
      path: `/routes/line-bot/test-connection`,
      method: "POST",
      ...params,
    });

  /**
   * @description Send a test message to a specific user
   *
   * @tags line-bot, dbtn/module:line_bot
   * @name send_message
   * @summary Send Message
   * @request POST:/routes/line-bot/send-message
   */
  send_message = (data: LineMessageRequest, params: RequestParams = {}) =>
    this.request<SendMessageData, SendMessageError>({
      path: `/routes/line-bot/send-message`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a list of recent LINE users who have interacted with the bot
   *
   * @tags line-bot, dbtn/module:line_bot
   * @name get_recent_users
   * @summary Get Recent Users
   * @request GET:/routes/line-bot/recent-users
   */
  get_recent_users = (params: RequestParams = {}) =>
    this.request<GetRecentUsersData, void>({
      path: `/routes/line-bot/recent-users`,
      method: "GET",
      ...params,
    });

  /**
   * @description 檢查API應用程序的健康狀態
   *
   * @tags test, dbtn/module:test_endpoint
   * @name check_health
   * @summary Check Health
   * @request GET:/routes/
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthResult, void>({
      path: `/routes/`,
      method: "GET",
      ...params,
    });

  /**
   * @description 接收並回過請求體，用於測試POST請求
   *
   * @tags test, dbtn/module:test_endpoint
   * @name echo
   * @summary Echo
   * @request POST:/routes/echo
   */
  echo = (params: RequestParams = {}) =>
    this.request<EchoData, void>({
      path: `/routes/echo`,
      method: "POST",
      ...params,
    });

  /**
   * @description 返回請求的全部頭信息，用於調試
   *
   * @tags test, dbtn/module:test_endpoint
   * @name get_headers
   * @summary Get Headers
   * @request GET:/routes/headers
   */
  get_headers = (params: RequestParams = {}) =>
    this.request<GetHeadersData, void>({
      path: `/routes/headers`,
      method: "GET",
      ...params,
    });

  /**
   * @description 開放的測試端點，允許跨域請求
   *
   * @tags test, dbtn/module:test_endpoint
   * @name open_endpoint
   * @summary Open Endpoint
   * @request GET:/routes/open
   */
  open_endpoint = (params: RequestParams = {}) =>
    this.request<OpenEndpointData, void>({
      path: `/routes/open`,
      method: "GET",
      ...params,
    });

  /**
   * @description 開放的POST測試端點，允許跨域請求
   *
   * @tags test, dbtn/module:test_endpoint
   * @name open_post
   * @summary Open Post
   * @request POST:/routes/open
   */
  open_post = (params: RequestParams = {}) =>
    this.request<OpenPostData, void>({
      path: `/routes/open`,
      method: "POST",
      ...params,
    });

  /**
   * @description 返回CORS頭，允許跨域請求
   *
   * @tags test, dbtn/module:test_endpoint
   * @name open_options
   * @summary Open Options
   * @request OPTIONS:/routes/open
   */
  open_options = (params: RequestParams = {}) =>
    this.request<OpenOptionsData, void>({
      path: `/routes/open`,
      method: "OPTIONS",
      ...params,
    });

  /**
   * @description Analyze the emotional content of a user message
   *
   * @tags emotion-analysis, dbtn/module:emotion_analysis
   * @name analyze_emotion_endpoint
   * @summary Analyze Emotional Content
   * @request POST:/routes/emotion-analysis/analyze
   */
  analyze_emotion_endpoint = (data: EmotionAnalysisRequest, params: RequestParams = {}) =>
    this.request<AnalyzeEmotionEndpointData, AnalyzeEmotionEndpointError>({
      path: `/routes/emotion-analysis/analyze`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Process a message with Claude and return an intelligent, empathetic response
   *
   * @tags ai-conversation, dbtn/module:ai_conversation
   * @name ai_conversation_chat
   * @summary AI Conversation Chat
   * @request POST:/routes/ai-conversation/chat
   */
  ai_conversation_chat = (data: ConversationRequest, params: RequestParams = {}) =>
    this.request<AiConversationChatData, AiConversationChatError>({
      path: `/routes/ai-conversation/chat`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 檢查訊息是否為惡意攻擊，並返回應採取的行動
   *
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name check_abuse
   * @summary 檢查訊息是否含惡意內容
   * @request POST:/routes/abuse-protection/check
   */
  check_abuse = (data: AbuseCheckRequest, params: RequestParams = {}) =>
    this.request<CheckAbuseData, CheckAbuseError>({
      path: `/routes/abuse-protection/check`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 獲取當前的惡意行為保護配置
   *
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name get_abuse_config_endpoint
   * @summary 獲取惡意行為保護配置
   * @request GET:/routes/abuse-protection/config
   */
  get_abuse_config_endpoint = (params: RequestParams = {}) =>
    this.request<GetAbuseConfigEndpointData, void>({
      path: `/routes/abuse-protection/config`,
      method: "GET",
      ...params,
    });

  /**
   * @description 更新惡意行為保護配置
   *
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name update_abuse_config
   * @summary 更新惡意行為保護配置
   * @request POST:/routes/abuse-protection/config
   */
  update_abuse_config = (data: AbuseConfig, params: RequestParams = {}) =>
    this.request<UpdateAbuseConfigData, UpdateAbuseConfigError>({
      path: `/routes/abuse-protection/config`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 啟用或禁用惡意行為保護
   *
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name toggle_abuse_system
   * @summary 啟用或禁用惡意行為保護
   * @request POST:/routes/abuse-protection/toggle
   */
  toggle_abuse_system = (query: ToggleAbuseSystemParams, params: RequestParams = {}) =>
    this.request<ToggleAbuseSystemData, ToggleAbuseSystemError>({
      path: `/routes/abuse-protection/toggle`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description 獲取特定用戶的惡意行為狀態
   *
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name get_user_status
   * @summary 獲取用戶惡意行為狀態
   * @request GET:/routes/abuse-protection/user-status/{user_id}
   */
  get_user_status = ({ userId, ...query }: GetUserStatusParams, params: RequestParams = {}) =>
    this.request<GetUserStatusData, GetUserStatusError>({
      path: `/routes/abuse-protection/user-status/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description 重置特定用戶的惡意行為記錄
   *
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name reset_user_record
   * @summary 重置用戶惡意行為記錄
   * @request DELETE:/routes/abuse-protection/reset/{user_id}
   */
  reset_user_record = ({ userId, ...query }: ResetUserRecordParams, params: RequestParams = {}) =>
    this.request<ResetUserRecordData, ResetUserRecordError>({
      path: `/routes/abuse-protection/reset/${userId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Analyze text for special situations like suicide crisis, scam victimization, etc.
   *
   * @tags special-response, dbtn/module:special_response
   * @name detect_situation
   * @summary Detect Special Situations
   * @request POST:/routes/special-response/detect
   */
  detect_situation = (data: SpecialSituationRequest, params: RequestParams = {}) =>
    this.request<DetectSituationData, DetectSituationError>({
      path: `/routes/special-response/detect`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the current configuration for special response rules
   *
   * @tags special-response, dbtn/module:special_response
   * @name get_special_response_config
   * @summary Get Special Response Configuration
   * @request GET:/routes/special-response/config
   */
  get_special_response_config = (params: RequestParams = {}) =>
    this.request<GetSpecialResponseConfigData, void>({
      path: `/routes/special-response/config`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update the configuration for special response rules
   *
   * @tags special-response, dbtn/module:special_response
   * @name update_special_response_config
   * @summary Update Special Response Configuration
   * @request POST:/routes/special-response/config
   */
  update_special_response_config = (data: SpecialResponseConfig, params: RequestParams = {}) =>
    this.request<UpdateSpecialResponseConfigData, UpdateSpecialResponseConfigError>({
      path: `/routes/special-response/config`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Enable or disable the entire special response system
   *
   * @tags special-response, dbtn/module:special_response
   * @name toggle_system2
   * @summary Toggle Special Response System
   * @request POST:/routes/special-response/toggle
   */
  toggle_system2 = (query: ToggleSystem2Params, params: RequestParams = {}) =>
    this.request<ToggleSystem2Data, ToggleSystem2Error>({
      path: `/routes/special-response/toggle`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Analyze text for potential scam indicators
   *
   * @tags text-analysis, dbtn/module:text_analysis
   * @name analyze_text2
   * @summary Analyze Text2
   * @request POST:/routes/text-analysis/analyze
   */
  analyze_text2 = (data: TextAnalysisRequest, params: RequestParams = {}) =>
    this.request<AnalyzeText2Data, AnalyzeText2Error>({
      path: `/routes/text-analysis/analyze`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate advice response based on scam analysis
   *
   * @tags text-analysis, dbtn/module:text_analysis
   * @name generate_advice2
   * @summary Generate Advice2
   * @request POST:/routes/text-analysis/generate-advice
   */
  generate_advice2 = (data: AppApisTextAnalysisAdviceRequest, params: RequestParams = {}) =>
    this.request<GenerateAdvice2Data, GenerateAdvice2Error>({
      path: `/routes/text-analysis/generate-advice`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Analyze text for potential scam indicators
   *
   * @tags scam-detector, dbtn/module:scam_detector
   * @name analyze_scam_text
   * @summary Analyze Text
   * @request POST:/routes/scam-detector/analyze-text
   */
  analyze_scam_text = (data: ScamDetectionRequest, params: RequestParams = {}) =>
    this.request<AnalyzeScamTextData, AnalyzeScamTextError>({
      path: `/routes/scam-detector/analyze-text`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Analyze an image for potential scam indicators (placeholder)
   *
   * @tags scam-detector, dbtn/module:scam_detector
   * @name analyze_image_endpoint
   * @summary Analyze Image
   * @request POST:/routes/scam-detector/analyze-image
   */
  analyze_image_endpoint = (data: ImageAnalysisRequest, params: RequestParams = {}) =>
    this.request<AnalyzeImageEndpointData, AnalyzeImageEndpointError>({
      path: `/routes/scam-detector/analyze-image`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate personalized advice based on scam type and victim status
   *
   * @tags scam-detector, dbtn/module:scam_detector
   * @name generate_advice
   * @summary Generate Personalized Advice
   * @request POST:/routes/scam-detector/generate-advice
   */
  generate_advice = (data: AppApisScamDetectorAdviceRequest, params: RequestParams = {}) =>
    this.request<GenerateAdviceData, GenerateAdviceError>({
      path: `/routes/scam-detector/generate-advice`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get example scam messages for testing
   *
   * @tags scam-detector, dbtn/module:scam_detector
   * @name get_examples
   * @summary Get Examples
   * @request GET:/routes/scam-detector/examples
   */
  get_examples = (params: RequestParams = {}) =>
    this.request<GetExamplesData, void>({
      path: `/routes/scam-detector/examples`,
      method: "GET",
      ...params,
    });
}
