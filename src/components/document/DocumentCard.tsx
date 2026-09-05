import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Document } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { TypeBadge, StatusBadge, PriorityBadge, TagBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { openDocument } from '../../services/fileService';

interface DocumentCardProps {
  document: Document;
  onPress: () => void;
  onStatusChange?: (newStatus: Document['status']) => void;
  showActions?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPress,
  onStatusChange,
  showActions = true,
}) => {
  const { colors, isDark } = useTheme();

  const handleOpenSource = async () => {
    await openDocument(document.source);
  };

  const getSourceLabel = () => {
    switch (document.source.type) {
      case 'file_uri':
        return 'Local File';
      case 'google_drive':
        return 'Google Drive';
      case 'url':
        return 'Web Link / DOI';
      case 'physical':
        return 'Physical Copy';
      default:
        return 'Document';
    }
  };

  const getSourceIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (document.source.type) {
      case 'file_uri':
        return 'document-attach-outline';
      case 'google_drive':
        return 'logo-google';
      case 'url':
        return 'link-outline';
      case 'physical':
        return 'location-outline';
      default:
        return 'document-text-outline';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top Header: Type, Priority, Status */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <TypeBadge type={document.type} />
          {document.priority === 'high' && <PriorityBadge priority={document.priority} />}
        </View>
        <StatusBadge status={document.status} />
      </View>

      {/* Title */}
      <Text
        style={[styles.title, { color: colors.text }]}
        numberOfLines={2}
      >
        {document.title}
      </Text>

      {/* Metadata for Research Papers */}
      {document.type === 'research_paper' && (document.authors || document.year || document.venue) && (
        <View style={styles.metadataRow}>
          <Ionicons name="people-outline" size={13} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
            {document.authors ? `${document.authors}` : ''}
            {document.year ? ` • ${document.year}` : ''}
            {document.venue ? ` • ${document.venue}` : ''}
          </Text>
        </View>
      )}

      {/* Linked Project */}
      {document.linked_project && (
        <View style={styles.projectRow}>
          <Ionicons name="folder-outline" size={13} color={colors.primary} />
          <Text style={[styles.projectText, { color: colors.primary }]} numberOfLines={1}>
            {document.linked_project}
          </Text>
        </View>
      )}

      {/* Tags */}
      {document.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {document.tags.slice(0, 3).map((tag, idx) => (
            <TagBadge key={idx} tag={tag} />
          ))}
          {document.tags.length > 3 && (
            <Text style={[styles.moreTags, { color: colors.textMuted }]}>
              +{document.tags.length - 3}
            </Text>
          )}
        </View>
      )}

      {/* Reading Progress */}
      <View style={styles.progressSection}>
        <ProgressBar
          progress={document.progress}
          height={5}
          showPercentage
          label={
            document.current_page && document.total_pages
              ? `Page ${document.current_page} of ${document.total_pages}`
              : document.status === 'read'
              ? 'Finished'
              : document.status === 'in_progress'
              ? 'Reading Progress'
              : 'Not started'
          }
        />
      </View>

      {/* Bottom Actions Row */}
      {showActions && (
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleOpenSource}
            style={[styles.actionBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
          >
            <Ionicons name={getSourceIcon()} size={14} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>
              {getSourceLabel()}
            </Text>
          </TouchableOpacity>

          <View style={styles.statusButtons}>
            {document.status === 'to_read' && onStatusChange && (
              <TouchableOpacity
                onPress={() => onStatusChange('in_progress')}
                style={[styles.quickStatusBtn, { backgroundColor: colors.primaryLight }]}
              >
                <Ionicons name="play-outline" size={13} color={colors.primary} />
                <Text style={[styles.quickStatusText, { color: colors.primary }]}>
                  Start
                </Text>
              </TouchableOpacity>
            )}

            {document.status === 'in_progress' && onStatusChange && (
              <TouchableOpacity
                onPress={() => onStatusChange('read')}
                style={[styles.quickStatusBtn, { backgroundColor: colors.successLight }]}
              >
                <Ionicons name="checkmark-circle-outline" size={13} color={colors.success} />
                <Text style={[styles.quickStatusText, { color: colors.success }]}>
                  Mark Read
                </Text>
              </TouchableOpacity>
            )}

            {document.status === 'read' && document.rating && (
              <View style={styles.ratingRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < document.rating! ? 'star' : 'star-outline'}
                    size={13}
                    color="#F59E0B"
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    flex: 1,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  projectText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  moreTags: {
    fontSize: 11,
    marginLeft: 2,
  },
  progressSection: {
    marginVertical: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  quickStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
  },
});
