import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { messagesAtom } from "@/lib/atoms/atoms";
import {
  ChatConversation,
  ChatConversationsResponse,
  ChatMessage,
  ChatMessagesResponse,
  ConversationFilters,
  CreateConversationRequest,
  EditMessageRequest,
  MessageFilters,
  PaginationMeta,
  SendMessageRequest,
  createConversationRequest,
  validateConversationRequest,
} from "@/lib/uitils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

// Updated API response types to match backend structure

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
  message?: string;
}

/**
 * Hook for fetching all conversations for the current user
 */
export const useGetConversations = (filters?: ConversationFilters) => {
  const setMessagesCount = useSetAtom(messagesAtom);
  const queryParams = filters
    ? {
        ...(filters.limit && { limit: filters.limit.toString() }),
        ...(filters.page && { page: filters.page.toString() }),
      }
    : undefined;

  const result = useQuery<ChatConversationsResponse>({
    queryKey: ["conversations", filters],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Messages_Conversations, {
        params: queryParams,
      });
      // console.log(response?.data.data)
      setMessagesCount(response?.data.data.filter((n: any) => !n.read).length);
      return response.data;
    },
  });

  return {
    ...result,
    conversations: result.data?.data || [],
    pagination: result.data?.pagination,
    hasNextPage: result.data?.pagination?.hasNext || false,
    hasPrevPage: result.data?.pagination?.hasPrev || false,
  };
};

/**
 * Hook for fetching a single conversation by ID
 */
export const useGetConversation = (conversationId: string) => {
  return useQuery<ApiResponse<ChatConversation>>({
    queryKey: ["conversation", conversationId],
    queryFn: () => api.get(ApiEndPoints.Single_Conversation(conversationId)),
    enabled: !!conversationId,
  });
};

/**
 * Hook for fetching messages in a conversation
 */
export const useGetConversationMessages = (
  conversationId: string,
  filters?: MessageFilters
) => {
  const queryParams = filters
    ? {
        ...(filters.limit && { limit: filters.limit.toString() }),
        ...(filters.page && { page: filters.page.toString() }),
      }
    : undefined;

  const result = useQuery<ChatMessagesResponse>({
    queryKey: ["conversation-messages", conversationId, filters],
    queryFn: async () => {
      const response = await api.get(
        ApiEndPoints.Conversation_Messages(conversationId),
        {
          params: queryParams,
        }
      );
      return response.data;
    },
    enabled: !!conversationId,
  });

  return {
    ...result,
    messages: result.data?.data || [],
    pagination: result.data?.pagination,
    hasNextPage: result.data?.pagination?.hasNext || false,
    hasPrevPage: result.data?.pagination?.hasPrev || false,
  };
};

/**
 * Hook for messaging operations (mutations)
 */
export const useMessages = () => {
  const queryClient = useQueryClient();

  /**
   * Create a new conversation
   */
  const createConversation = useMutation<
    ApiResponse<ChatConversation>,
    Error,
    CreateConversationRequest
  >({
    mutationFn: async (data) => {
      const res = await api.post(ApiEndPoints.Messages_Conversations, data)
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      return res?.data
    },
    onSuccess: () => {
      // Invalidate conversations list to refetch
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  /**
   * Send a message in a conversation
   */
  const sendMessage = useMutation<
    ApiResponse<ChatMessage>,
    Error,
    SendMessageRequest
  >({
    mutationFn: (data) => api.post(ApiEndPoints.Send_Message, data),
    onSuccess: (response, variables) => {
      // Invalidate conversation messages to refetch
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", variables.conversationId],
      });
      // Invalidate conversations list to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalidate specific conversation
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationId],
      });
    },
  });

  /**
   * Edit a message
   */
  const editMessage = useMutation<
    ApiResponse<ChatMessage>,
    Error,
    { messageId: string; data: EditMessageRequest }
  >({
    mutationFn: ({ messageId, data }) =>
      api.put(ApiEndPoints.Edit_Message(messageId), data),
    onSuccess: (response) => {
      const message = response.data;
      // Invalidate conversation messages to refetch
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", message.conversationId],
      });
    },
  });

  /**
   * Delete a message (soft delete by updating deletedAt field)
   */
  const deleteMessage = useMutation<
    ApiResponse<void>,
    Error,
    { messageId: string; conversationId: string }
  >({
    mutationFn: ({ messageId }) =>
      api.patch(ApiEndPoints.Edit_Message(messageId), {
        deletedAt: new Date().toISOString(),
      }),
    onSuccess: (response, variables) => {
      // Invalidate conversation messages to refetch
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", variables.conversationId],
      });
    },
  });

  /**
   * Mark a message as read
   */
  const markMessageAsRead = useMutation<
    ApiResponse<void>,
    Error,
    { messageId: string; conversationId: string }
  >({
    mutationFn: ({ messageId }) =>
      api.patch(ApiEndPoints.Mark_Message_Read(messageId)),
    onSuccess: (response, variables) => {
      // Invalidate conversation messages to refetch
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", variables.conversationId],
      });
      // Invalidate conversations list to update unread count
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalidate specific conversation
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationId],
      });
    },
  });

  /**
   * Mark a conversation as read
   */
  const markConversationAsRead = useMutation<
    ApiResponse<void>,
    Error,
    string // conversationId
  >({
    mutationFn: (conversationId) =>
      api.patch(ApiEndPoints.Mark_Conversation_Read(conversationId)),
    onSuccess: (response, conversationId) => {
      // Invalidate conversation messages to refetch
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", conversationId],
      });
      // Invalidate conversations list to update unread count
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalidate specific conversation
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    },
  });

  /**
   * Block a conversation
   */
  const blockConversation = useMutation<
    ApiResponse<void>,
    Error,
    string // conversationId
  >({
    mutationFn: (conversationId) =>
      api.patch(ApiEndPoints.Block_Conversation(conversationId)),
    onSuccess: (response, conversationId) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalidate specific conversation
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    },
  });

  /**
   * Unblock a conversation
   */
  const unblockConversation = useMutation<
    ApiResponse<void>,
    Error,
    string // conversationId
  >({
    mutationFn: (conversationId) =>
      api.patch(ApiEndPoints.Unblock_Conversation(conversationId)),
    onSuccess: (response, conversationId) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalidate specific conversation
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    },
  });

  return {
    createConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    markMessageAsRead,
    markConversationAsRead,
    blockConversation,
    unblockConversation,
  };
};

/**
 * Helper hook for creating conversations with validation
 *
 * @example
 * ```tsx
 * const { createConversation, isLoading } = useCreateConversation();
 *
 * // Create a direct message
 * const startDirectMessage = async (otherUserId: string) => {
 *   try {
 *     const conversation = await createConversation([currentUserId, otherUserId]);
 *     // Navigate to conversation or handle success
 *   } catch (error) {
 *     // Handle validation or API errors
 *   }
 * };
 *
 * // Create a group conversation
 * const startGroupChat = async (memberIds: string[], groupName: string) => {
 *   try {
 *     const conversation = await createConversation(memberIds, {
 *       isGroup: true,
 *       groupName,
 *       groupAdmin: currentUserId
 *     });
 *   } catch (error) {
 *     // Handle errors
 *   }
 * };
 * ```
 */
export const useCreateConversation = () => {
  const { createConversation } = useMessages();

  const createConversationWithValidation = (
    participants: string[],
    options?: {
      isGroup?: boolean;
      groupName?: string;
      groupDescription?: string;
      groupAdmin?: string;
    }
  ) => {
    const request = createConversationRequest(participants, options);
    const validationErrors = validateConversationRequest(request);

    if (validationErrors.length > 0) {
      return Promise.reject(new Error(validationErrors.join(", ")));
    }

    return createConversation.mutateAsync(request);
  };

  return {
    createConversation: createConversationWithValidation,
    isLoading: createConversation.isPending,
    error: createConversation.error,
  };
};
