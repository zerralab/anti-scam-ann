import {
  AIPersonalityConfig,
  AbuseCheckRequest,
  AbuseConfig,
  AiConversationChatData,
  AltWebhook2Data,
  AltWebhookData,
  AltWebhookOptions2Data,
  AltWebhookOptionsData,
  AnalyzeEmotionEndpointData,
  AnalyzeImageEndpointData,
  AnalyzeScamTextData,
  AnalyzeText2Data,
  AppApisScamDetectorAdviceRequest,
  AppApisTextAnalysisAdviceRequest,
  CheckAbuseData,
  CheckHealthData,
  CheckHealthResult,
  ConversationRequest,
  DetectSituationData,
  EchoData,
  EmergencyCheckRequest,
  EmotionAnalysisRequest,
  EmotionalSupportRequest,
  ExternalLineWebhookData,
  ExternalLineWebhookOptionsData,
  ExternalPingData,
  ExternalSetupApiKeyData,
  ExternalSetupApiKeyPayload,
  GenerateAdvice2Data,
  GenerateAdviceData,
  GenerateEmotionalSupportData,
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
  GetUserStatusData,
  HasEmergencyKeywordsData,
  HasEmergencyKeywordsEndpointData,
  ImageAnalysisRequest,
  KeywordHealthCheckData,
  KeywordMatchRequest,
  KeywordResponseConfig,
  LineCredentials,
  LineMessageRequest,
  LineRelayRequest,
  MatchKeywordData,
  OpenEndpointData,
  OpenOptionsData,
  OpenPostData,
  ProcessRelayEventsData,
  ResetUserRecordData,
  ResetUserStatsData,
  SaveCredentialsData,
  ScamDetectionRequest,
  SendMessageData,
  SetupApiKeyData,
  SetupApiKeyPayload,
  SpecialResponseConfig,
  SpecialSituationRequest,
  TestConnectionData,
  TextAnalysisRequest,
  ToggleAbuseSystemData,
  ToggleSystem2Data,
  ToggleSystemData,
  ToggleUsageLimitsData,
  UpdateAbuseConfigData,
  UpdateConfigData,
  UpdatePersonalityConfigData,
  UpdateSpecialResponseConfigData,
  UpdateUsageConfigData,
  UsageConfig,
  WebhookData,
  WebhookOptionsData,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description 獲取当前的AI人格設定
   * @tags ai-personality, dbtn/module:ai_personality
   * @name get_personality_config
   * @summary Get Personality Config
   * @request GET:/routes/ai-personality/config
   */
  export namespace get_personality_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPersonalityConfigData;
  }

  /**
   * @description 更新AI人格設定
   * @tags ai-personality, dbtn/module:ai_personality
   * @name update_personality_config
   * @summary Update Personality Config
   * @request POST:/routes/ai-personality/config
   */
  export namespace update_personality_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AIPersonalityConfig;
    export type RequestHeaders = {};
    export type ResponseBody = UpdatePersonalityConfigData;
  }

  /**
   * @description 檢查使用者是否達到使用限制
   * @tags usage-limits, dbtn/module:usage_limits
   * @name has_emergency_keywords
   * @summary 檢查使用限制
   * @request POST:/routes/usage-limits/check
   */
  export namespace has_emergency_keywords {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Message */
      message: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = HasEmergencyKeywordsData;
  }

  /**
   * @description 檢查訊息是否包含緊急關鍵詞，允許繞過限制
   * @tags usage-limits, dbtn/module:usage_limits
   * @name has_emergency_keywords_endpoint
   * @summary 檢查是否包含緊急關鍵詞
   * @request POST:/routes/usage-limits/has-emergency-keywords
   */
  export namespace has_emergency_keywords_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = EmergencyCheckRequest;
    export type RequestHeaders = {};
    export type ResponseBody = HasEmergencyKeywordsEndpointData;
  }

  /**
   * @description 獲取當前的使用限制配置
   * @tags usage-limits, dbtn/module:usage_limits
   * @name get_usage_config_endpoint
   * @summary 獲取使用限制配置
   * @request GET:/routes/usage-limits/config
   */
  export namespace get_usage_config_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUsageConfigEndpointData;
  }

  /**
   * @description 更新使用限制配置
   * @tags usage-limits, dbtn/module:usage_limits
   * @name update_usage_config
   * @summary 更新使用限制配置
   * @request POST:/routes/usage-limits/config
   */
  export namespace update_usage_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UsageConfig;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUsageConfigData;
  }

  /**
   * @description 啟用或禁用使用限制功能
   * @tags usage-limits, dbtn/module:usage_limits
   * @name toggle_usage_limits
   * @summary 開關使用限制功能
   * @request POST:/routes/usage-limits/toggle
   */
  export namespace toggle_usage_limits {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Enabled
       * @default true
       */
      enabled?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ToggleUsageLimitsData;
  }

  /**
   * @description 獲取全局使用統計
   * @tags usage-limits, dbtn/module:usage_limits
   * @name get_usage_stats
   * @summary 獲取使用統計
   * @request GET:/routes/usage-limits/stats
   */
  export namespace get_usage_stats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUsageStatsData;
  }

  /**
   * @description 獲取特定使用者的使用統計
   * @tags usage-limits, dbtn/module:usage_limits
   * @name get_user_stats
   * @summary 獲取使用者使用統計
   * @request GET:/routes/usage-limits/user/{user_id}
   */
  export namespace get_user_stats {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserStatsData;
  }

  /**
   * @description 重置特定使用者的使用記錄
   * @tags usage-limits, dbtn/module:usage_limits
   * @name reset_user_stats
   * @summary 重置使用者使用記錄
   * @request DELETE:/routes/usage-limits/reset/{user_id}
   */
  export namespace reset_user_stats {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResetUserStatsData;
  }

  /**
   * @description 按總請求數排序獲取前10名用戶的使用統計
   * @tags usage-limits, dbtn/module:usage_limits
   * @name get_top_users
   * @summary 獲取使用量前10名用戶
   * @request GET:/routes/usage-limits/top-users
   */
  export namespace get_top_users {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTopUsersData;
  }

  /**
   * @description 生成一個唯一的臨時使用者ID
   * @tags usage-limits, dbtn/module:usage_limits
   * @name generate_user_id
   * @summary 生成臨時使用者ID
   * @request GET:/routes/usage-limits/generate-id
   */
  export namespace generate_user_id {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateUserIdData;
  }

  /**
   * @description 為外部webhook設置API密鑰
   * @tags line-relay, dbtn/module:line_relay
   * @name setup_api_key
   * @summary 設置中繼API密鑰
   * @request POST:/routes/line-relay/setup-key
   */
  export namespace setup_api_key {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SetupApiKeyPayload;
    export type RequestHeaders = {};
    export type ResponseBody = SetupApiKeyData;
  }

  /**
   * @description 處理從外部webhook轉發的LINE事件
   * @tags line-relay, dbtn/module:line_relay
   * @name process_relay_events
   * @summary 處理中繼事件
   * @request POST:/routes/line-relay/events
   */
  export namespace process_relay_events {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LineRelayRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ProcessRelayEventsData;
  }

  /**
   * @description Generate supportive emotional responses based on user's emotional state and context
   * @tags emotional-support, dbtn/module:emotional_support
   * @name generate_emotional_support
   * @summary Generate Emotional Support Messages
   * @request POST:/routes/emotional-support/generate
   */
  export namespace generate_emotional_support {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = EmotionalSupportRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateEmotionalSupportData;
  }

  /**
   * @description 檢查訊息是否匹配關鍵詞並返回預設回覆
   * @tags keyword-responses, dbtn/module:keyword_responses
   * @name match_keyword
   * @summary 匹配關鍵詞回覆
   * @request POST:/routes/keyword-responses/match
   */
  export namespace match_keyword {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = KeywordMatchRequest;
    export type RequestHeaders = {};
    export type ResponseBody = MatchKeywordData;
  }

  /**
   * @description 簡單檢查關鍵詞系統的健康狀態
   * @tags keyword-responses, dbtn/module:keyword_responses
   * @name keyword_health_check
   * @summary 檢查關鍵詞系統狀態
   * @request GET:/routes/keyword-responses/health-check
   */
  export namespace keyword_health_check {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = KeywordHealthCheckData;
  }

  /**
   * @description 獲取當前的關鍵詞回覆系統配置
   * @tags keyword-responses, dbtn/module:keyword_responses
   * @name get_config
   * @summary 獲取關鍵詞配置
   * @request GET:/routes/keyword-responses/config
   */
  export namespace get_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetConfigData;
  }

  /**
   * @description 更新關鍵詞回覆系統配置
   * @tags keyword-responses, dbtn/module:keyword_responses
   * @name update_config
   * @summary 更新關鍵詞配置
   * @request POST:/routes/keyword-responses/config
   */
  export namespace update_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = KeywordResponseConfig;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateConfigData;
  }

  /**
   * @description 啟用或禁用關鍵詞回覆系統
   * @tags keyword-responses, dbtn/module:keyword_responses
   * @name toggle_system
   * @summary 切換關鍵詞系統啟用狀態
   * @request POST:/routes/keyword-responses/toggle
   */
  export namespace toggle_system {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Enabled
       * @default true
       */
      enabled?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ToggleSystemData;
  }

  /**
   * @description Alternative webhook with simpler path for external services
   * @tags webhook, dbtn/module:alt_webhook
   * @name alt_webhook2
   * @summary Alt Webhook2
   * @request POST:/routes/alt
   */
  export namespace alt_webhook2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = AltWebhook2Data;
  }

  /**
   * @description Handle CORS preflight requests
   * @tags webhook, dbtn/module:alt_webhook
   * @name alt_webhook_options2
   * @summary Alt Webhook Options2
   * @request OPTIONS:/routes/alt
   */
  export namespace alt_webhook_options2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = AltWebhookOptions2Data;
  }

  /**
   * @description 外部LINE Webhook中繼端點，允許其他服務轉發LINE事件
   * @tags external-relay, dbtn/module:external_relay
   * @name external_line_webhook
   * @summary External Line Webhook
   * @request POST:/routes/webhook/line
   */
  export namespace external_line_webhook {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ExternalLineWebhookData;
  }

  /**
   * @description 處理外部LINE Webhook中繼端點的CORS預檢請求
   * @tags external-relay, dbtn/module:external_relay
   * @name external_line_webhook_options
   * @summary External Line Webhook Options
   * @request OPTIONS:/routes/webhook/line
   */
  export namespace external_line_webhook_options {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ExternalLineWebhookOptionsData;
  }

  /**
   * @description 測試連線狀態的端點
   * @tags external-relay, dbtn/module:external_relay
   * @name external_ping
   * @summary External Ping
   * @request GET:/routes/ping
   */
  export namespace external_ping {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ExternalPingData;
  }

  /**
   * @description 設置用於外部webhook中繼的API密鑰
   * @tags external-relay, dbtn/module:external_relay
   * @name external_setup_api_key
   * @summary External Setup Api Key
   * @request POST:/routes/setup-key
   */
  export namespace external_setup_api_key {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ExternalSetupApiKeyPayload;
    export type RequestHeaders = {};
    export type ResponseBody = ExternalSetupApiKeyData;
  }

  /**
   * @description Save LINE bot credentials to the secrets storage
   * @tags line-bot, dbtn/module:line_bot
   * @name save_credentials
   * @summary Save Credentials
   * @request POST:/routes/line-bot/save-credentials
   */
  export namespace save_credentials {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LineCredentials;
    export type RequestHeaders = {};
    export type ResponseBody = SaveCredentialsData;
  }

  /**
   * @description Check if LINE credentials are configured
   * @tags line-bot, dbtn/module:line_bot
   * @name get_credentials
   * @summary Get Credentials
   * @request GET:/routes/line-bot/credentials
   */
  export namespace get_credentials {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCredentialsData;
  }

  /**
   * No description
   * @tags line-bot, dbtn/module:line_bot
   * @name webhook_options
   * @summary Webhook Options
   * @request OPTIONS:/routes/line-bot/webhook
   */
  export namespace webhook_options {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = WebhookOptionsData;
  }

  /**
   * @description Handle LINE webhook calls. This endpoint is called by LINE when events occur (messages, follows, etc.)
   * @tags line-bot, dbtn/module:line_bot
   * @name webhook
   * @summary Webhook
   * @request POST:/routes/line-bot/webhook
   */
  export namespace webhook {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {
      /** X-Line-Signature */
      "x-line-signature"?: string | null;
    };
    export type ResponseBody = WebhookData;
  }

  /**
   * No description
   * @tags line-bot, dbtn/module:line_bot
   * @name alt_webhook_options
   * @summary Alt Webhook Options
   * @request OPTIONS:/routes/line-bot/alt-webhook
   */
  export namespace alt_webhook_options {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = AltWebhookOptionsData;
  }

  /**
   * @description Alternative webhook endpoint for LINE integration
   * @tags line-bot, dbtn/module:line_bot
   * @name alt_webhook
   * @summary Alternative Webhook
   * @request POST:/routes/line-bot/alt-webhook
   */
  export namespace alt_webhook {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {
      /** X-Line-Signature */
      "x-line-signature"?: string | null;
    };
    export type ResponseBody = AltWebhookData;
  }

  /**
   * @description Test the connection to LINE Messaging API using stored credentials
   * @tags line-bot, dbtn/module:line_bot
   * @name test_connection
   * @summary Test Connection
   * @request POST:/routes/line-bot/test-connection
   */
  export namespace test_connection {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TestConnectionData;
  }

  /**
   * @description Send a test message to a specific user
   * @tags line-bot, dbtn/module:line_bot
   * @name send_message
   * @summary Send Message
   * @request POST:/routes/line-bot/send-message
   */
  export namespace send_message {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LineMessageRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SendMessageData;
  }

  /**
   * @description Get a list of recent LINE users who have interacted with the bot
   * @tags line-bot, dbtn/module:line_bot
   * @name get_recent_users
   * @summary Get Recent Users
   * @request GET:/routes/line-bot/recent-users
   */
  export namespace get_recent_users {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRecentUsersData;
  }

  /**
   * @description 檢查API應用程序的健康狀態
   * @tags test, dbtn/module:test_endpoint
   * @name check_health
   * @summary Check Health
   * @request GET:/routes/
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthResult;
  }

  /**
   * @description 接收並回過請求體，用於測試POST請求
   * @tags test, dbtn/module:test_endpoint
   * @name echo
   * @summary Echo
   * @request POST:/routes/echo
   */
  export namespace echo {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = EchoData;
  }

  /**
   * @description 返回請求的全部頭信息，用於調試
   * @tags test, dbtn/module:test_endpoint
   * @name get_headers
   * @summary Get Headers
   * @request GET:/routes/headers
   */
  export namespace get_headers {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetHeadersData;
  }

  /**
   * @description 開放的測試端點，允許跨域請求
   * @tags test, dbtn/module:test_endpoint
   * @name open_endpoint
   * @summary Open Endpoint
   * @request GET:/routes/open
   */
  export namespace open_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = OpenEndpointData;
  }

  /**
   * @description 開放的POST測試端點，允許跨域請求
   * @tags test, dbtn/module:test_endpoint
   * @name open_post
   * @summary Open Post
   * @request POST:/routes/open
   */
  export namespace open_post {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = OpenPostData;
  }

  /**
   * @description 返回CORS頭，允許跨域請求
   * @tags test, dbtn/module:test_endpoint
   * @name open_options
   * @summary Open Options
   * @request OPTIONS:/routes/open
   */
  export namespace open_options {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = OpenOptionsData;
  }

  /**
   * @description Analyze the emotional content of a user message
   * @tags emotion-analysis, dbtn/module:emotion_analysis
   * @name analyze_emotion_endpoint
   * @summary Analyze Emotional Content
   * @request POST:/routes/emotion-analysis/analyze
   */
  export namespace analyze_emotion_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = EmotionAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeEmotionEndpointData;
  }

  /**
   * @description Process a message with Claude and return an intelligent, empathetic response
   * @tags ai-conversation, dbtn/module:ai_conversation
   * @name ai_conversation_chat
   * @summary AI Conversation Chat
   * @request POST:/routes/ai-conversation/chat
   */
  export namespace ai_conversation_chat {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ConversationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AiConversationChatData;
  }

  /**
   * @description 檢查訊息是否為惡意攻擊，並返回應採取的行動
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name check_abuse
   * @summary 檢查訊息是否含惡意內容
   * @request POST:/routes/abuse-protection/check
   */
  export namespace check_abuse {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AbuseCheckRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CheckAbuseData;
  }

  /**
   * @description 獲取當前的惡意行為保護配置
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name get_abuse_config_endpoint
   * @summary 獲取惡意行為保護配置
   * @request GET:/routes/abuse-protection/config
   */
  export namespace get_abuse_config_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAbuseConfigEndpointData;
  }

  /**
   * @description 更新惡意行為保護配置
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name update_abuse_config
   * @summary 更新惡意行為保護配置
   * @request POST:/routes/abuse-protection/config
   */
  export namespace update_abuse_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AbuseConfig;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateAbuseConfigData;
  }

  /**
   * @description 啟用或禁用惡意行為保護
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name toggle_abuse_system
   * @summary 啟用或禁用惡意行為保護
   * @request POST:/routes/abuse-protection/toggle
   */
  export namespace toggle_abuse_system {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Enabled
       * @default true
       */
      enabled?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ToggleAbuseSystemData;
  }

  /**
   * @description 獲取特定用戶的惡意行為狀態
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name get_user_status
   * @summary 獲取用戶惡意行為狀態
   * @request GET:/routes/abuse-protection/user-status/{user_id}
   */
  export namespace get_user_status {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserStatusData;
  }

  /**
   * @description 重置特定用戶的惡意行為記錄
   * @tags abuse-protection, dbtn/module:abuse_protection
   * @name reset_user_record
   * @summary 重置用戶惡意行為記錄
   * @request DELETE:/routes/abuse-protection/reset/{user_id}
   */
  export namespace reset_user_record {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResetUserRecordData;
  }

  /**
   * @description Analyze text for special situations like suicide crisis, scam victimization, etc.
   * @tags special-response, dbtn/module:special_response
   * @name detect_situation
   * @summary Detect Special Situations
   * @request POST:/routes/special-response/detect
   */
  export namespace detect_situation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SpecialSituationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = DetectSituationData;
  }

  /**
   * @description Get the current configuration for special response rules
   * @tags special-response, dbtn/module:special_response
   * @name get_special_response_config
   * @summary Get Special Response Configuration
   * @request GET:/routes/special-response/config
   */
  export namespace get_special_response_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSpecialResponseConfigData;
  }

  /**
   * @description Update the configuration for special response rules
   * @tags special-response, dbtn/module:special_response
   * @name update_special_response_config
   * @summary Update Special Response Configuration
   * @request POST:/routes/special-response/config
   */
  export namespace update_special_response_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SpecialResponseConfig;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateSpecialResponseConfigData;
  }

  /**
   * @description Enable or disable the entire special response system
   * @tags special-response, dbtn/module:special_response
   * @name toggle_system2
   * @summary Toggle Special Response System
   * @request POST:/routes/special-response/toggle
   */
  export namespace toggle_system2 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Enabled */
      enabled: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ToggleSystem2Data;
  }

  /**
   * @description Analyze text for potential scam indicators
   * @tags text-analysis, dbtn/module:text_analysis
   * @name analyze_text2
   * @summary Analyze Text2
   * @request POST:/routes/text-analysis/analyze
   */
  export namespace analyze_text2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TextAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeText2Data;
  }

  /**
   * @description Generate advice response based on scam analysis
   * @tags text-analysis, dbtn/module:text_analysis
   * @name generate_advice2
   * @summary Generate Advice2
   * @request POST:/routes/text-analysis/generate-advice
   */
  export namespace generate_advice2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisTextAnalysisAdviceRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateAdvice2Data;
  }

  /**
   * @description Analyze text for potential scam indicators
   * @tags scam-detector, dbtn/module:scam_detector
   * @name analyze_scam_text
   * @summary Analyze Text
   * @request POST:/routes/scam-detector/analyze-text
   */
  export namespace analyze_scam_text {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ScamDetectionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeScamTextData;
  }

  /**
   * @description Analyze an image for potential scam indicators (placeholder)
   * @tags scam-detector, dbtn/module:scam_detector
   * @name analyze_image_endpoint
   * @summary Analyze Image
   * @request POST:/routes/scam-detector/analyze-image
   */
  export namespace analyze_image_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ImageAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeImageEndpointData;
  }

  /**
   * @description Generate personalized advice based on scam type and victim status
   * @tags scam-detector, dbtn/module:scam_detector
   * @name generate_advice
   * @summary Generate Personalized Advice
   * @request POST:/routes/scam-detector/generate-advice
   */
  export namespace generate_advice {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisScamDetectorAdviceRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateAdviceData;
  }

  /**
   * @description Get example scam messages for testing
   * @tags scam-detector, dbtn/module:scam_detector
   * @name get_examples
   * @summary Get Examples
   * @request GET:/routes/scam-detector/examples
   */
  export namespace get_examples {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetExamplesData;
  }
}
