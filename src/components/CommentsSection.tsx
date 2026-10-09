import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { UserComment } from "@/src/types/CommentData";

type CommentsSectionProps = {
  comments: UserComment[];
  isLoadingComments: boolean;
  commentText: string;
  onChangeCommentText: (text: string) => void;
  onAddComment: () => void;
  isLoadingAddComment: boolean;
};

export default function CommentsSection({
  comments,
  isLoadingComments,
  commentText,
  onChangeCommentText,
  onAddComment,
  isLoadingAddComment,
}: CommentsSectionProps) {
  return (
    <View className="border-t border-primary/30 px-5 pt-4 pb-6 bg-backgroundAlt">
      <Text className="text-sm font-semibold text-text mb-3">Kommentarer</Text>

      {isLoadingComments ? (
        <ActivityIndicator size="small" color="#2F2E2C" />
      ) : (
        <View className="max-h-64">
          {comments.length === 0 ? (
            <Text className="text-xs text-text/70">
              Ingen kommentarer ennå.
            </Text>
          ) : (
            comments.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center bg-background rounded-2xl px-3 py-2 mb-2 border border-primary/20"
              >
                <View className="flex-1 mr-3">
                  <Text className="text-xs font-semibold text-text">
                    {item.author}
                  </Text>
                  <Text className="text-xs text-text/80 mt-0.5">
                    {item.comment}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      <View className="flex-row items-center mt-4">
        <TextInput
          value={commentText}
          onChangeText={onChangeCommentText}
          placeholder="Skriv en kommentar…"
          placeholderTextColor="#A5B5B3"
          className="flex-1 border border-primary/30 rounded-full px-4 py-2 mr-2 text-text text-xs bg-background"
        />
        <Pressable
          onPress={onAddComment}
          className="bg-primary px-4 py-2 rounded-full"
        >
          {isLoadingAddComment ? (
            <ActivityIndicator size="small" color="#ECE3DE" />
          ) : (
            <Text className="text-xs font-semibold text-textOnPrimary">
              Post
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
